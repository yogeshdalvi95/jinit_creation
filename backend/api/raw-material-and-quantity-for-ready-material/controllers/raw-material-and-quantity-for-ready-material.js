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

    console.log("query ", query);
    if (
      query.hasOwnProperty("ready_material") &&
      query.ready_material !== "null"
    ) {
      /**getting count */
      const count = await strapi
        .query("raw-material-and-quantity-for-ready-material")
        .count(query);

      query["_limit"] = _limit;
      query["_start"] = _start;

      const data = await strapi
        .query("raw-material-and-quantity-for-ready-material")
        .find(query, [
          "raw_material",
          "raw_material.department",
          "raw_material.unit",
        ]);

      return {
        data: data, // your data array
        page: page, // current page number
        pageSize: pageSize,
        totalCount: count, // total row number
      };
    } else {
      return {
        data: [], // your data array
        page: page, // current page number
        pageSize: pageSize,
        totalCount: 0, // total row number
      };
    }
  },

  async updateQuantity(ctx) {
    const {
      id,
      newQuantity,
      oldQuantity,
      costPerPiece,
      ready_material,
    } = ctx.request.body;
    /** Subtract old quantity */
    const readyMaterialData = await strapi.query("ready-material").findOne({
      id: ready_material,
    });
    let oldCost = parseFloat(readyMaterialData.final_cost);
    let oldValueToSubtract = parseFloat(oldQuantity) * parseFloat(costPerPiece);
    let newCost = oldCost - oldValueToSubtract;
    let newValueToAdd = parseFloat(newQuantity) * parseFloat(costPerPiece);
    newCost = newCost + newValueToAdd;
    let data = null;
    await bookshelf.transaction(async (t) => {
      data = await strapi
        .query("ready-material")
        .update(
          { id: ready_material },
          {
            final_cost: newCost,
          },
          { transacting: t, patch: true }
        )
        .then((model) => model)
        .catch((err) => {
          console.log(err);
          throw 500;
        });

      await strapi
        .query("raw-material-and-quantity-for-ready-material")
        .update(
          { id: id },
          {
            quantity: newQuantity,
          },
          { transacting: t, patch: true }
        )
        .then((model) => model)
        .catch((err) => {
          console.log(err);
          throw 500;
        });
    });
    ctx.send(data);
  },

  async addRawMaterialToReadyMaterial(ctx) {
    const { id, quantity, costPerPiece } = ctx.request.body;
    console.log("ctx.request.body ", id, quantity);
  },

  async deleteRawMaterialFromReadyMaterial(ctx) {
    const { id, quantity, costPerPiece, ready_material } = ctx.request.body;
    const readyMaterialData = await strapi.query("ready-material").findOne({
      id: ready_material,
    });
    let oldCost = parseFloat(readyMaterialData.final_cost);
    let oldValueToSubtract = parseFloat(quantity) * parseFloat(costPerPiece);
    let newCost = oldCost - oldValueToSubtract;
    console.log(newCost);
    let data = null;
    await bookshelf.transaction(async (t) => {
      data = await strapi
        .query("ready-material")
        .update(
          { id: ready_material },
          {
            final_cost: newCost,
          },
          { transacting: t, patch: true }
        )
        .then((model) => model)
        .catch((err) => {
          console.log(err);
          throw 500;
        });

      await strapi
        .query("raw-material-and-quantity-for-ready-material")
        .delete({ id: id }, { transacting: t })
        .then((model) => model)
        .catch((err) => {
          console.log(err);
          throw 500;
        });
    });
    ctx.send(data);
  },
};
