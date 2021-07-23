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

  async findOne(ctx) {
    const { id } = ctx.params;
    let purchase_detail = await strapi.query("purchases").findOne({ id: id });
    let individualPurchase = [];
    if (purchase_detail.type_of_bill === "Kachha") {
      individualPurchase = await strapi
        .query("individual-kachha-purchase")
        .find({ purchase: id }, ["raw_material", "raw_material.department"]);
    } else {
      individualPurchase = await strapi
        .query("individual-pakka-purchase")
        .find({ purchase: id });
    }
    ctx.send({
      purchase: purchase_detail,
      individualPurchase: individualPurchase,
    });
  },

  async create(ctx) {
    const { purchases, kachhaPurchase, pakkaPurchase } = ctx.request.body;
    const {
      id,
      seller,
      type_of_bill,
      cgst_percent,
      sgst_percent,
      gst_no,
      total_amt_with_tax,
      total_amt_without_tax,
      notes,
      date,
    } = purchases;

    if (id) {
      await bookshelf
        .transaction(async (t) => {
          let purchaseData = {
            cgst_percent: cgst_percent,
            sgst_percent: sgst_percent,
            notes: notes,
            total_amt_with_tax: total_amt_with_tax,
            total_amt_without_tax: total_amt_without_tax,
          };

          await strapi
            .query("purchases")
            .update({ id: id }, purchaseData, { transacting: t, patch: true })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });
          if (type_of_bill === "Kachha") {
            await utils.asyncForEach(kachhaPurchase, async (Ip) => {
              let individualPurchase = {
                purchase_cost: Ip.purchase_cost,
                total_purchase_cost: Ip.total_purchase_cost,
              };
              await strapi
                .query("individual-kachha-purchase")
                .update({ id: Ip.id }, individualPurchase, {
                  transacting: t,
                  patch: true,
                })
                .then((model) => model)
                .catch((err) => {
                  console.log(err);
                  throw 500;
                });
            });
          } else {
            await utils.asyncForEach(pakkaPurchase, async (Ip) => {
              let individualPurchase = {
                purchase_cost: Ip.purchase_cost,
                total_purchase_cost: Ip.total_purchase_cost,
                name: Ip.name,
              };
              await strapi
                .query("individual-pakka-purchase")
                .update({ id: Ip.id }, individualPurchase, {
                  transacting: t,
                  patch: true,
                })
                .then((model) => model)
                .catch((err) => {
                  console.log(err);
                  throw 500;
                });
            });
          }
        })
        .then((res) => {
          ctx.send(200);
        })
        .catch((err) => {
          console.log(err);
          ctx.throw(500);
        });
    } else {
      await bookshelf
        .transaction(async (t) => {
          let purchaseData = {
            type_of_bill: type_of_bill,
            date: utils.getDateInYYYYMMDD(new Date(date)),
            cgst_percent: cgst_percent,
            sgst_percent: sgst_percent,
            gst_no: gst_no,
            notes: notes,
            seller: seller,
            total_amt_with_tax: total_amt_with_tax,
            total_amt_without_tax: total_amt_without_tax,
          };

          let newPurchase = await strapi
            .query("purchases")
            .create(purchaseData, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });
          if (type_of_bill === "Kachha") {
            await utils.asyncForEach(kachhaPurchase, async (Ip) => {
              let individualPurchase = {
                purchase: newPurchase.id,
                purchase_cost: Ip.purchase_cost,
                purchase_quantity: Ip.purchase_quantity,
                total_purchase_cost: Ip.total_purchase_cost,
                raw_material: Ip.raw_material,
              };
              await strapi
                .query("individual-kachha-purchase")
                .create(individualPurchase, { transacting: t })
                .then((model) => model)
                .catch((err) => {
                  console.log(err);
                  throw 500;
                });

              /** Steps only if the bill is kachha bill */
              /** Take old data of raw material*/
              let raw_material_data = await strapi
                .query("raw-material")
                .findOne({ id: Ip.raw_material });
              /** Check if the value is number or ot */
              let val = isNaN(parseFloat(raw_material_data.balance))
                ? 0
                : parseFloat(raw_material_data.balance);
              /** Add value */
              let finalValue = val + parseFloat(Ip.purchase_quantity);
              /** Update new balance */
              await strapi.query("raw-material").update(
                { id: Ip.raw_material },
                {
                  balance: utils.convertNumber(finalValue.toFixed(2)),
                },
                { patch: true, transacting: t }
              );
            });
          } else {
            await utils.asyncForEach(pakkaPurchase, async (Ip) => {
              let individualPurchase = {
                purchase: newPurchase.id,
                purchase_cost: Ip.purchase_cost,
                purchase_quantity: Ip.purchase_quantity,
                total_purchase_cost: Ip.total_purchase_cost,
                name: Ip.name,
              };
              await strapi
                .query("individual-pakka-purchase")
                .create(individualPurchase, { transacting: t })
                .then((model) => model)
                .catch((err) => {
                  console.log(err);
                  throw 500;
                });
            });
          }
        })
        .then((res) => {
          ctx.send(200);
        })
        .catch((err) => {
          console.log(err);
          ctx.throw(500);
        });
    }
  },
};
