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
    const count = await strapi.query("party").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("party").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async check_duplicate_party(ctx) {
    const { isEdit, editId, party_name, gst_no } = ctx.request.query;
    let error = {};
    let isNameAvailable = await strapi
      .query("party")
      .findOne({ party_name: party_name });

    if (isEdit === "true") {
      if (isNameAvailable && editId != isNameAvailable.id) {
        error = {
          ...error,
          party_name: ["Party name already exist"],
        };
      }
    } else {
      if (isNameAvailable) {
        error = {
          ...error,
          party_name: ["Party name already exist"],
        };
      }
    }

    if (!utils.isEmptyString(gst_no)) {
      let isGstNoAvailable = await strapi
        .query("party")
        .findOne({ gst_no: gst_no });

      if (isEdit === "true") {
        if (isGstNoAvailable && editId != isGstNoAvailable.id) {
          error = {
            ...error,
            gst_no: ["Gst number already exist"],
          };
        }
      } else {
        if (isGstNoAvailable) {
          error = {
            ...error,
            gst_no: ["Gst number already exist"],
          };
        }
      }
    }

    ctx.send(error);
  },
};
