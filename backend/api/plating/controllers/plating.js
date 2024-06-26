"use strict";
const utils = require("../../../config/utils");
const _ = require("lodash");

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
    const count = await strapi.query("plating").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi
      .query("plating")
      .find(query)
      .then((res) => res.map((r) => _.omit(r, ["created_by", "updated_by"])));

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },
};
