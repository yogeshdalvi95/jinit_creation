"use strict";
const utils = require("../../../config/utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let _limit = 10;
    let _start = 0;

    _limit = pageSize;
    _start = (page - 1) * _limit;

    /**getting count */
    const count = await strapi.query("seller").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("seller").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async check_duplicate_seller(ctx) {
    const { isEdit, editId, seller_name, gst_no } = ctx.request.query;
    let error = {};
    let isNameAvailable = await strapi
      .query("seller")
      .findOne({ seller_name: seller_name });

    let isGstNoAvailable = await strapi
      .query("seller")
      .findOne({ gst_no: gst_no });

    console.log(isGstNoAvailable, isNameAvailable, editId);

    if (isEdit === "true") {
      if (isNameAvailable && editId != isNameAvailable.id) {
        error = {
          ...error,
          seller_name: ["Seller name already exist"],
        };
      }

      if (isGstNoAvailable && editId != isGstNoAvailable.id) {
        error = {
          ...error,
          gst_no: ["Gst number already exist"],
        };
      }
    } else {
      if (isNameAvailable) {
        error = {
          ...error,
          seller_name: ["Seller name already exist"],
        };
      }
      if (isGstNoAvailable) {
        error = {
          ...error,
          gst_no: ["Gst number already exist"],
        };
      }
    }
    console.log("error ", error);
    ctx.send(error);
  },
};
