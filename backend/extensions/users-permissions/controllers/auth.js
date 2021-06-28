"use strict";
const _ = require("lodash");
const utils = require("../../../config/utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
module.exports = {
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
