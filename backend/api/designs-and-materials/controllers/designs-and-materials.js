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
    const count = await strapi.query("designs-and-materials").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("designs-and-materials").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async getSelectedRawMaterials(ctx) {
    const { design, isColor, isRawMaterial } = ctx.request.query;

    let query = {};
    if (isRawMaterial) {
      query = {
        ...query,
        ready_material: {
          $null: true,
        },
      };
    } else {
      query = {
        ...query,
        raw_material: {
          $null: true,
        },
      };
    }
    if (!isColor) {
      query = {
        ...query,
        color: {
          $null: true,
        },
      };
    }
    const data = await strapi.db.query("api::designs-and-material").find(
      {
        where: query,
      },
      ["id"]
    );
  },
};
