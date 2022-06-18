"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const _ = require("lodash");
const utils = require("../../../config/utils");
const { sanitizeEntity } = require("strapi-utils");

const emailRegExp =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const formatError = (error) => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];

module.exports = {
  async callback(ctx) {
    console.log("hererererererere");
    const provider = ctx.params.provider || "local";
    const params = ctx.request.body;

    const store = await strapi.store({
      environment: "",
      type: "plugin",
      name: "users-permissions",
    });

    if (provider === "local") {
      if (!_.get(await store.get({ key: "grant" }), "email.enabled")) {
        return ctx.badRequest(null, "This provider is disabled.");
      }

      // The identifier is required.
      if (!params.identifier) {
        return ctx.badRequest(
          null,
          formatError({
            id: "Auth.form.error.email.provide",
            message: "Please provide your username or your e-mail.",
          })
        );
      }

      // The password is required.
      if (!params.password) {
        return ctx.badRequest(
          null,
          formatError({
            id: "Auth.form.error.password.provide",
            message: "Please provide your password.",
          })
        );
      }

      const query = { provider };

      // Check if the provided identifier is an email or not.
      const isEmail = emailRegExp.test(params.identifier);

      // Set the identifier to the appropriate query field.
      if (isEmail) {
        query.email = params.identifier.toLowerCase();
      } else {
        query.username = params.identifier;
      }

      // Check if the user exists.
      const user = await strapi
        .query("user", "users-permissions")
        .findOne(query);

      if (!user) {
        return ctx.badRequest(
          null,
          formatError({
            id: "Auth.form.error.invalid",
            message: "Identifier or password invalid.",
          })
        );
      }

      if (
        _.get(await store.get({ key: "advanced" }), "email_confirmation") &&
        user.confirmed !== true
      ) {
        return ctx.badRequest(
          null,
          formatError({
            id: "Auth.form.error.confirmed",
            message: "Your account email is not confirmed",
          })
        );
      }

      if (user.blocked === true) {
        return ctx.badRequest(
          null,
          formatError({
            id: "Auth.form.error.blocked",
            message: "Your account has been blocked by an administrator",
          })
        );
      }

      // The user never authenticated with the `local` provider.
      if (!user.password) {
        return ctx.badRequest(
          null,
          formatError({
            id: "Auth.form.error.password.local",
            message:
              "This user never set a local password, please login with the provider used during account creation.",
          })
        );
      }

      const validPassword = await strapi.plugins[
        "users-permissions"
      ].services.user.validatePassword(params.password, user.password);

      if (!validPassword) {
        return ctx.badRequest(
          null,
          formatError({
            id: "Auth.form.error.invalid",
            message: "Identifier or password invalid.",
          })
        );
      } else {
        let token = await strapi.plugins[
          "users-permissions"
        ].services.jwt.issue({
          id: user.id,
        });

        await strapi.query("active-users").delete({
          user: user.id,
        });

        await strapi.query("active-users").create({
          user: user.id,
          token: token,
        });

        ctx.send({
          jwt: token,
          user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
            model: strapi.query("user", "users-permissions").model,
          }),
        });
      }
    } else {
      if (!_.get(await store.get({ key: "grant" }), [provider, "enabled"])) {
        return ctx.badRequest(
          null,
          formatError({
            id: "provider.disabled",
            message: "This provider is disabled.",
          })
        );
      }

      // Connect the user with the third-party provider.
      let user;
      let error;
      try {
        [user, error] = await strapi.plugins[
          "users-permissions"
        ].services.providers.connect(provider, ctx.query);
      } catch ([user, error]) {
        return ctx.badRequest(null, error === "array" ? error[0] : error);
      }

      if (!user) {
        return ctx.badRequest(null, error === "array" ? error[0] : error);
      }

      let token = await strapi.plugins["users-permissions"].services.jwt.issue({
        id: user.id,
      });

      await strapi.query("active-users").create({
        user: user.id,
        token: token,
      });

      ctx.send({
        jwt: token,
        user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
          model: strapi.query("user", "users-permissions").model,
        }),
      });
    }
  },

  async getAllAdmins(ctx) {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let _limit = 10;
    let _start = 0;

    _limit = pageSize;
    _start = (page - 1) * _limit;

    const role = await strapi
      .query("role", "users-permissions")
      .findOne({ name: "Admin" }, []);

    query["role"] = role.id;

    /**getting count */
    const count = await strapi.query("user", "users-permissions").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("user", "users-permissions").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async getAllStaff(ctx) {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let _limit = 10;
    let _start = 0;

    _limit = pageSize;
    _start = (page - 1) * _limit;

    const role = await strapi
      .query("role", "users-permissions")
      .findOne({ name: "Staff" }, []);

    query["role"] = role.id;

    /**getting count */
    const count = await strapi.query("user", "users-permissions").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("user", "users-permissions").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },
};
