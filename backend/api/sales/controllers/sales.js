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

    let sale_ready_material = [];
    await utils.asyncForEach(sale_data.sale_ready_material, async (el) => {
      let designColorPrice = await strapi
        .query("design-color-price")
        .findOne({ design: el.design.id, color: el.color.id });
      el.color_price = designColorPrice;
      sale_ready_material.push(el);
    });

    sale_data.sale_ready_material = sale_ready_material;

    ctx.send(sale_data);
  },

  async create(ctx) {
    const { id, state, designAndColor, party } = ctx.request.body;
    const {
      date,
      bill_no,
      is_gst_bill,
      cgst,
      sgst,
      add_cost,
      total_price_of_design,
      total_price_without_gst,
      total_price,
    } = state;

    let transaction_amount = utils.validateNumber(total_price);

    /** Create sale data */
    let data = {
      bill_no: bill_no,
      date: utils.getDateInYYYYMMDD(new Date(date)),
      is_gst_bill: is_gst_bill,
      total_price_of_design: total_price_of_design,
      total_price_with_add_cost: total_price_without_gst,
      add_cost: add_cost,
      total_price: transaction_amount,
      sgst: sgst,
      cgst: cgst,
      party: party,
      // sale_ready_material: getReadyMaterialForSale(designAndColor),
    };

    await bookshelf
      .transaction(async (t) => {
        let saleData = null;
        let saleId = null;

        if (id) {
          saleData = await strapi
            .query("sales")
            .update({ id: id }, data, { patch: true, transacting: t });

          saleId = id;
          let saleTxnData = await strapi
            .query("sale-payment-transaction")
            .findOne({
              sale: saleId,
              is_sale: true,
            });

          if (saleTxnData) {
          }
        } else {
          /** While creating a sale */

          /** Check if date for creating sale falls within the current month */
          let isDateValid = false;
          isDateValid = utils.checkIfDateFallsInCurrentMonth(date);
          if (!isDateValid) {
            throw 500;
          }

          /** Create sale date */
          let data = {
            bill_no: bill_no,
            date: utils.getDateInYYYYMMDD(new Date(date)),
            is_gst_bill: is_gst_bill,
            total_price_of_design: total_price_of_design,
            total_price_with_add_cost: total_price_without_gst,
            add_cost: add_cost,
            total_price: transaction_amount,
            sgst: sgst,
            cgst: cgst,
            party: party,
            // sale_ready_material: getReadyMaterialForSale(designAndColor),
          };

          /** Create sale */
          saleData = await strapi
            .query("sales")
            .create(data, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });

          saleId = saleData.id;

          /** Fill transaction details */
          let saleTxnData = {
            sale: saleId,
            sale_payment: null,
            sale_return: null,
            party: party,
            transaction_date: data.date,
            comment: "",
            transaction_amount: transaction_amount,
            is_sale: true,
            is_payment: false,
            is_sale_return: false,
          };

          /** Create a sale txn */
          await strapi
            .query("sale-payment-transaction")
            .create(saleTxnData, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });

          /** Check Sale Monthly Balance */
          let saleDate = new Date();
          let saleMonth = saleDate.getMonth() + 1;
          let saleYear = saleDate.getFullYear();

          let getSaleMonthlyBalance = await strapi
            .query("monthly-sale-balance")
            .findOne({
              month: saleMonth,
              year: saleYear,
            });
          let opening_balance = 0;
          let closing_balance = 0;
          // if (getSaleMonthlyBalance) {
          //   /** If current moonth data is present */
          //   opening_balance = utils.validateNumber(
          //     getSaleMonthlyBalance.opening_balance
          //   );
          //   closing_balance = closing_balance;
          // }else {
          //   /** If current month balance is not present check previous month balanc */
          //   let previousMonthBalance = await strapi

          //   let monthlySaleBalanceData = await strapi
          //   .query("monthly-sale-balance")
          //   .create(saleTxnData, { transacting: t })
          //   .then((model) => model)
          //   .catch((err) => {
          //     console.log(err);
          //     throw 500;
          //   });
          // }
        }

        /** Done adding entries in the sale payment transaction */
        let designAndColorData = await getReadyMaterialForSale(
          designAndColor,
          saleId,
          t
        );

        saleData = await strapi.query("sales").update(
          { id: saleId },
          {
            sale_ready_material: designAndColorData,
          },
          { patch: true, transacting: t }
        );
      })
      .then((res) => {
        ctx.send(200);
      })
      .catch((err) => {
        console.log("err ", err);
        return ctx.badRequest(null, "Error");
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
        "Total Price of ready material without add. cost":
          utils.roundNumberTo2digit(d.total_price_of_design),
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

const getReadyMaterialForSale = async (object, saleId, t) => {
  let dataToSend = [];
  let designColorArray = Object.keys(object);
  if (
    Object.prototype.toString.call(designColorArray) === "[object Array]" &&
    designColorArray.length
  ) {
    await utils.asyncForEach(designColorArray, async (el) => {
      let colorArray = object[el].allColors;
      if (
        Object.prototype.toString.call(colorArray) === "[object Array]" &&
        colorArray.length
      ) {
        await utils.asyncForEach(colorArray, async (el1) => {
          /** Get Data from each color */
          let { design, color, quantity, quantity_to_add_deduct } = el1;
          /** get design color data */
          let designColorData = await strapi
            .query("design-color-price")
            .findOne({ design: design, color: color });

          /** get color stock */
          let designColorQuantity = utils.validateNumber(designColorData.stock);
          let quantityToDeduct = 0;

          if (saleId) {
            quantityToDeduct = utils.validateNumber(quantity_to_add_deduct);
          } else {
            quantityToDeduct = utils.validateNumber(quantity);
          }
          /** Final quantity */
          let final_quantity = designColorQuantity - quantityToDeduct;
          /** Update quantity */
          await strapi.query("design-color-price").update(
            { id: designColorData.id },
            {
              stock: final_quantity,
            },
            { patch: true, transacting: t }
          );

          /** final data */
          dataToSend.push({
            design: el1.design,
            sale: saleId,
            color: el1.color,
            quantity: utils.validateNumber(el1.quantity),
            total_price: utils.validateNumber(el1.total_price),
            price_per_unit: utils.validateNumber(el1.price_per_unit),
          });
        });
      }
    });
    return dataToSend;
  } else {
    return [];
  }
};
