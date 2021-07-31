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
    const count = await strapi.query("goods-return").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("goods-return").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async create(ctx) {
    const { raw_material, seller, quantity, notes, date } = ctx.request.body;
    await bookshelf.transaction(async (t) => {
      let data = {
        raw_material: raw_material,
        quantity: quantity,
        seller: seller,
        date: new Date(date),
        notes: notes,
      };
      await strapi
        .query("goods-return")
        .create(data, { transacting: t })
        .then((model) => model)
        .catch((err) => {
          console.log(err);
          throw 500;
        });

      let quantityToDeduct = parseFloat(quantity);
      let raw_material_data = await strapi
        .query("raw-material")
        .findOne({ id: raw_material });
      let val = isNaN(parseFloat(raw_material_data.balance))
        ? 0
        : parseFloat(raw_material_data.balance);
      let finalBalance = 0;
      if (val >= quantityToDeduct) {
        finalBalance = val - quantityToDeduct;
        await strapi.query("raw-material").update(
          { id: raw_material },
          {
            balance: utils.convertNumber(finalBalance.toFixed(2)),
          },
          { patch: true, transacting: t }
        );

        ctx.send(200);
      } else {
        return ctx.badRequest(null, "Invalid value");
      }
    });
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    let purchase_detail = await strapi
      .query("goods-return")
      .findOne({ id: id });
    let raw_material_id = purchase_detail.raw_material
      ? purchase_detail.raw_material.id
      : null;
    let raw_material_data = await strapi
      .query("raw-material")
      .findOne({ id: raw_material_id });
    purchase_detail = {
      ...purchase_detail,
      raw_material: raw_material_data,
    };
    ctx.send(purchase_detail);
  },
};
