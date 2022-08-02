"use strict";
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");
const { validateNumber } = require("../../../config/utils");
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
    const {
      raw_material,
      seller,
      quantity,
      notes,
      date,
      total_price,
      kachha_ledger,
      pakka_ledger,
      price_per_piece,
      purchase,
      isPurchasePresent,
    } = ctx.request.body;
    await bookshelf
      .transaction(async (t) => {
        let data = {
          raw_material: raw_material,
          quantity: quantity,
          seller: seller,
          date: new Date(date),
          notes: notes,
          total_price: total_price,
          kachha_ledger: kachha_ledger,
          pakka_ledger: pakka_ledger,
          price_per_piece: price_per_piece,
          purchase: purchase,
          isPurchasePresent: isPurchasePresent,
        };

        let goodsReturn = await strapi
          .query("goods-return")
          .create(data, { transacting: t })
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });

        let quantityToDeduct = validateNumber(quantity);
        let raw_material_data = await strapi
          .query("raw-material")
          .findOne({ id: raw_material });
        let rawMaterialBalance = validateNumber(raw_material_data.balance);
        let finalBalance = 0;
        if (rawMaterialBalance >= quantityToDeduct) {
          finalBalance = rawMaterialBalance - quantityToDeduct;
          await strapi.query("raw-material").update(
            { id: raw_material },
            {
              balance: validateNumber(finalBalance),
            },
            { patch: true, transacting: t }
          );

          let purchasePaymentGoodsReturnTransaction = {
            purchase: null,
            purchase_payment: null,
            goods_return: goodsReturn.id,
            seller: seller,
            transaction_date: utils.getDateInYYYYMMDD(new Date(date)),
            month: new Date(date).getMonth() + 1,
            year: new Date(date).getFullYear(),
            comment: "GR",
            transaction_amount: validateNumber(total_price),
            is_purchase: false,
            is_payment: false,
            is_goods_return: true,
            kachha_ledger: kachha_ledger,
            pakka_ledger: pakka_ledger,
          };

          await strapi
            .query("purchase-payment-transaction")
            .create(purchasePaymentGoodsReturnTransaction, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });
        } else {
          return ctx.badRequest(null, "Invalid value");
        }
      })
      .then((res) => {
        ctx.send(200);
      })
      .catch((err) => {
        console.log(err);
        ctx.throw(500);
      });
  },

  async update(ctx) {
    const {
      raw_material,
      seller,
      quantity,
      notes,
      date,
      total_price,
      kachha_ledger,
      pakka_ledger,
      price_per_piece,
      purchase,
      isPurchasePresent,
    } = ctx.request.body;

    const { id } = ctx.params;

    const goodsReturnData = await strapi.query("goods-return").findOne({
      id: id,
    });

    await bookshelf
      .transaction(async (t) => {
        let data = {
          raw_material: raw_material,
          quantity: quantity,
          seller: seller,
          date: new Date(date),
          notes: notes,
          total_price: total_price,
          kachha_ledger: kachha_ledger,
          pakka_ledger: pakka_ledger,
          price_per_piece: price_per_piece,
          purchase: purchase,
          isPurchasePresent: isPurchasePresent,
        };

        await strapi
          .query("goods-return")
          .update({ id: id }, data, { transacting: t, patch: true })
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });

        /** New quantity to deduct */
        let quantityToDeduct = validateNumber(quantity);
        /** previous deducted value */
        let previousDeductedQuantity = validateNumber(goodsReturnData.quantity);
        /** Get old value data */
        let raw_material_data = await strapi
          .query("raw-material")
          .findOne({ id: raw_material });
        let rawMaterialBalance = validateNumber(raw_material_data.balance);
        let temp = rawMaterialBalance + previousDeductedQuantity;
        let finalBalance = 0;

        if (temp >= quantityToDeduct) {
          finalBalance = temp - quantityToDeduct;
          await strapi.query("raw-material").update(
            { id: raw_material },
            {
              balance: validateNumber(finalBalance),
            },
            { patch: true, transacting: t }
          );

          let purchasePaymentGoodsReturnTransaction = {
            purchase: null,
            purchase_payment: null,
            goods_return: id,
            seller: seller,
            transaction_date: utils.getDateInYYYYMMDD(new Date(date)),
            month: new Date(date).getMonth() + 1,
            year: new Date(date).getFullYear(),
            comment: "GR",
            transaction_amount: validateNumber(total_price),
            is_purchase: false,
            is_payment: false,
            is_goods_return: true,
            kachha_ledger: kachha_ledger,
            pakka_ledger: pakka_ledger,
          };

          let purchasePaymentTxnId = await strapi
            .query("purchase-payment-transaction")
            .findOne({
              goods_return: id,
            });

          if (purchasePaymentTxnId) {
            await strapi
              .query("purchase-payment-transaction")
              .update(
                { id: purchasePaymentTxnId.id },
                purchasePaymentGoodsReturnTransaction,
                { patch: true, transacting: t }
              )
              .then((model) => model)
              .catch((err) => {
                console.log(err);
                throw 500;
              });
          } else {
            await strapi
              .query("purchase-payment-transaction")
              .create(purchasePaymentGoodsReturnTransaction, { transacting: t })
              .then((model) => model)
              .catch((err) => {
                console.log(err);
                throw 500;
              });
          }
        } else {
          return ctx.badRequest(null, "Invalid value");
        }
      })
      .then((res) => {
        ctx.send(200);
      })
      .catch((err) => {
        console.log(err);
        ctx.throw(500);
      });
  },

  async delete(ctx) {
    const { id } = ctx.params;
    let goodsReturnDetail = await strapi
      .query("goods-return")
      .findOne({ id: id }, []);

    let quantityToAddBack = validateNumber(goodsReturnDetail.quantity);
    let rawMaterial = goodsReturnDetail.raw_material;
    let raw_material_data = await strapi
      .query("raw-material")
      .findOne({ id: rawMaterial });
    let rawMaterialBalance = validateNumber(raw_material_data.balance);
    let finalBalance = rawMaterialBalance + quantityToAddBack;
    await bookshelf
      .transaction(async (t) => {
        await strapi.query("raw-material").update(
          { id: rawMaterial },
          {
            balance: validateNumber(finalBalance),
          },
          { patch: true, transacting: t }
        );

        await strapi.query("purchase-payment-transaction").delete(
          { goods_return: id },
          {
            patch: true,
            transacting: t,
          }
        );

        await strapi.query("goods-return").delete(
          { id: id },
          {
            patch: true,
            transacting: t,
          }
        );
      })
      .then((res) => {
        ctx.send(200);
      })
      .catch((err) => {
        console.log(err);
        ctx.throw(500);
      });
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    console.log("id => ", id);
    let goodsReturnDetail = await strapi
      .query("goods-return")
      .findOne({ id: id }, [
        "raw_material",
        "raw_material.department",
        "raw_material.unit",
        "raw_material.color",
        "raw_material.category",
        "seller",
      ]);
    ctx.send(goodsReturnDetail);
  },
};
