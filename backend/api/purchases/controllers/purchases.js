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
    const count = await strapi.query("purchases").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("purchases").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async create(ctx) {
    const body = ctx.request.body;
    const { quantity, raw_material } = ctx.request.body;
    await bookshelf.transaction(async (t) => {
      let raw_material_data = await strapi.query("raw-material").findOne({
        id: raw_material,
      });

      let finalbalance =
        parseFloat(raw_material_data.balance ? raw_material_data.balance : 0) +
        parseFloat(quantity);
      await strapi
        .query("purchases")
        .create(body, { transacting: t })
        .then((model) => model)
        .catch((err) => {
          console.log(err);
          throw 500;
        });

      await strapi
        .query("raw-material")
        .update(
          { id: raw_material },
          { balance: finalbalance.toFixed(2) },
          { patch: true, transacting: t }
        )
        .then((model) => model)
        .catch((err) => {
          console.log(err);
          throw 500;
        });
    });
    ctx.send(200);
  },
};
