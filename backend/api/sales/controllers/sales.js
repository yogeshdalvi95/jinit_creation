"use strict";
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");
const { find } = require("../../orders/controllers/orders");
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
    const count = await strapi.query("sales").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("sales").find(query);

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
      .query("sales")
      .findOne({ id: id }, ["party", "sale_ready_material.ready_material"]);

    ctx.send(sale_data);
  },

  async create(ctx) {
    const { id, state, readyMaterials, party } = ctx.request.body;
    const {
      date,
      bill_no,
      is_gst_bill,
      cgst,
      sgst,
      add_cost,
      total_price_of_ready_material,
      total_price_without_gst,
      total_price,
    } = state;

    let saleData = {
      bill_no: bill_no,
      date: utils.getDateInYYYYMMDD(new Date(date)),
      is_gst_bill: is_gst_bill,
      total_price_of_ready_material: total_price_of_ready_material,
      total_price_with_add_cost: total_price_without_gst,
      add_cost: add_cost,
      total_price: total_price,
      sgst: sgst,
      cgst: cgst,
      party: party,
      sale_ready_material: getReadyMaterialForSale(readyMaterials),
    };

    await bookshelf.transaction(async (t) => {
      if (id) {
        await strapi
          .query("sales")
          .update({ id: id }, saleData, { patch: true, transacting: t });
      } else {
        await strapi
          .query("sales")
          .create(saleData, { transacting: t })
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });
      }
      await utils.asyncForEach(readyMaterials, async (rm) => {
        let { ready_material, quantity, quantity_to_add_deduct } = rm;
        let ready_material_data = await strapi
          .query("ready-material")
          .findOne({ id: ready_material.id });
        let ready_material_quantity = ready_material_data.total_quantity;
        let quantityToDeduct = 0;
        if (id) {
          quantityToDeduct = parseFloat(quantity_to_add_deduct);
        } else {
          quantityToDeduct = parseFloat(quantity);
        }
        let final_quantity =
          parseFloat(ready_material_quantity) - quantityToDeduct;
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

  async getExcelSheetForExport(ctx) {
    let { fromDate, toDate } = ctx.request.query;
    let data = await strapi.query("sales").find({
      date_gte: fromDate,
      date_lte: toDate,
    });

    let dataArr = [];
    for (let d of data) {
      dataArr.push({
        "Bill Date": new Date(d.date),
        "Bill No.": d.bill_no,
        "Is Gst Bill": d.is_gst_bill,
        CGST: d.cgst,
        SGST: d.sgst,
        "Total Price of ready material without add. cost": utils.roundNumberTo2digit(
          d.total_price_of_ready_material
        ),
        "Add. Cost": utils.roundNumberTo2digit(d.add_cost),
        "Total Price": utils.roundNumberTo2digit(d.total_price),
      });
    }
    let buffer = utils.utilityFunctionForGettingBytesExcelData(
      dataArr,
      `Sale Data`
    );

    ctx.send(buffer);
  },
};

const getReadyMaterialForSale = (arr) => {
  let finalArr = [];
  for (var s of arr) {
    let {
      ready_material,
      quantity,
      price_per_unit,
      total_price,
      isDeleted,
      isCannotDelete,
    } = s;
    if (isCannotDelete) {
      if (!isDeleted) {
        finalArr.push({
          ready_material: ready_material.id,
          quantity: quantity,
          total_price: total_price,
          price_per_unit: price_per_unit,
        });
      }
    } else {
      finalArr.push({
        ready_material: ready_material.id,
        quantity: quantity,
        total_price: total_price,
        price_per_unit: price_per_unit,
      });
    }
  }
  return finalArr;
};
