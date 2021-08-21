"use strict";
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");
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
    const count = await strapi.query("individual-kachha-purchase").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi
      .query("individual-kachha-purchase")
      .find(query, [
        "raw_material",
        "raw_material.unit",
        "raw_material.department",
        "raw_material.color",
        "raw_material.category",
        "seller",
        "purchase",
      ]);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },
};
