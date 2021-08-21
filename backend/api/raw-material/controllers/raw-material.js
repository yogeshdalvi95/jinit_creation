"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const utils = require("../../../config/utils.js");
const _ = require("lodash");
const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  async find(ctx) {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let _limit = 10;
    let _start = 0;

    _limit = pageSize;
    _start = (page - 1) * _limit;

    /**getting count */
    const count = await strapi.query("raw-material").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("raw-material").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async getRawMaterialNameForAutoComplete(ctx) {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let _limit = 30;
    let _start = 0;

    _limit = pageSize;
    _start = (page - 1) * _limit;

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("raw-material").find(query, []);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
    };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const checkIfPresentInPurchases = await strapi
      .query("individual-kachha-purchase")
      .findOne({ raw_material: id });

    const checkIfPresentInReadyMaterial = await strapi
      .query("raw-material-and-quantity-for-ready-material")
      .findOne({ raw_material: id });

    const checkIfPresentInMonthlySheet = await strapi
      .query("monthly-sheet")
      .findOne({ raw_material: id });

    if (
      !checkIfPresentInPurchases &&
      !checkIfPresentInReadyMaterial &&
      !checkIfPresentInMonthlySheet
    ) {
      await strapi.query("raw-material").delete({ id: id });
      ctx.send(200);
    } else {
      return ctx.badRequest(null, "");
    }
  },
};
