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
    const count = await strapi.query("ready-material").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("ready-material").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  // async findOne(ctx) {
  //   const { id } = ctx.params;
  //   let data = await strapi.query("ready-material").findOne({ id: id });
  //   if (data) {
  //     const rawMaterialDetail = await strapi
  //       .query("raw-material-and-quantity-for-ready-material")
  //       .find({ ready_material: data.id }, [
  //         "raw_material",
  //         "raw_material",
  //         "raw_material.department",
  //         "raw_material.unit",
  //       ]);
  //     data = {
  //       ...data,
  //       raw_material_detail: rawMaterialDetail,
  //     };
  //     ctx.send(data);
  //   } else {
  //     ctx.throw(500);
  //   }
  // },
};
