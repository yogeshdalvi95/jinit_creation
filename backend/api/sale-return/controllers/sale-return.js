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
    const count = await strapi.query("sale-return").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("sale-return").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    let sale_data = await strapi
      .query("sale-return")
      .findOne({ id: id }, ["party", "sale_return_component.ready_material"]);

    ctx.send(sale_data);
  },

  async create(ctx) {
    const { id, state, readyMaterials, party } = ctx.request.body;
    const { date, add_cost, total_price_of_design, total_price, notes } = state;

    let saleData = {
      date: utils.getDateInYYYYMMDD(new Date(date)),
      total_price_of_design: total_price_of_design,
      add_cost: add_cost,
      total_price: total_price,
      party: party,
      notes: notes,
      sale_return_component: getReadyMaterialForSale(readyMaterials),
    };

    await bookshelf.transaction(async (t) => {
      if (id) {
        await strapi
          .query("sale-return")
          .update({ id: id }, saleData, { patch: true, transacting: t });
      } else {
        await strapi
          .query("sale-return")
          .create(saleData, { transacting: t })
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });
      }
      await utils.asyncForEach(readyMaterials, async (rm) => {
        let { ready_material, quantity } = rm;
        let ready_material_data = await strapi
          .query("ready-material")
          .findOne({ id: ready_material.id });
        let ready_material_quantity = ready_material_data.total_quantity;
        let quantityToAddBack = 0;
        if (id) {
          quantityToAddBack = parseFloat(quantity_to_add_deduct);
        } else {
          quantityToAddBack = parseFloat(quantity);
        }
        let final_quantity =
          parseFloat(ready_material_quantity) + quantityToAddBack;
        await strapi.query("ready-material").update(
          { id: ready_material.id },
          {
            total_quantity: final_quantity,
          },
          { patch: true, transacting: t }
        );
      });
      ctx.send(200);
    });
  },
};

const getReadyMaterialForSale = (arr) => {
  let finalArr = [];
  for (var s of arr) {
    let { ready_material, quantity, total_price, isDeleted, isCannotDelete } =
      s;
    if (isCannotDelete) {
      if (!isDeleted) {
        finalArr.push({
          ready_material: ready_material.id,
          quantity: quantity,
          total_price: total_price,
        });
      }
    } else {
      finalArr.push({
        ready_material: ready_material.id,
        quantity: quantity,
        total_price: total_price,
      });
    }
  }
  return finalArr;
};
