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
    const count = await strapi.query("purchase-payments").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("purchase-payments").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async update(ctx) {
    const {
      amount,
      seller,
      payment_date,
      payment_type,
      comment,
      pakka_ledger,
      kachha_ledger,
    } = ctx.request.body;

    const { id } = ctx.params;

    let notes = "";
    if (comment) {
      notes = comment;
    } else {
      if (payment_type === "bank_transfer") {
        notes = "Bank Transfer";
      } else {
        notes = "Cash";
      }
    }

    await bookshelf
      .transaction(async (t) => {
        await strapi
          .query("purchase-payments")
          .update(
            { id: id },
            {
              ...ctx.request.body,
              payment_date: utils.getDateInYYYYMMDD(new Date(payment_date)),
              comment: notes,
            },
            { patch: true, transacting: t }
          )
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });

        let correspondingPurchasePaymentTxnData = await strapi
          .query("purchase-payment-transaction")
          .findOne({
            purchase_payment: id,
            is_payment: true,
            is_purchase: false,
            is_goods_return: false,
          });

        let purchasePaymentTransaction = {
          purchase: null,
          purchase_payment: id,
          goods_return: null,
          seller: seller,
          transaction_date: utils.getDateInYYYYMMDD(new Date(payment_date)),
          month: new Date(payment_date).getMonth() + 1,
          year: new Date(payment_date).getFullYear(),
          comment: notes,
          transaction_amount: validateNumber(amount),
          is_purchase: false,
          is_payment: true,
          is_goods_return: false,
          kachha_ledger: kachha_ledger,
          pakka_ledger: pakka_ledger,
        };

        if (correspondingPurchasePaymentTxnData) {
          await strapi
            .query("purchase-payment-transaction")
            .update(
              { id: correspondingPurchasePaymentTxnData.id },
              purchasePaymentTransaction,
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
            .create(purchasePaymentTransaction, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
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
  },

  async create(ctx) {
    const {
      amount,
      seller,
      payment_date,
      payment_type,
      comment,
      pakka_ledger,
      kachha_ledger,
    } = ctx.request.body;

    let notes = "";
    if (comment) {
      notes = comment;
    } else {
      if (payment_type === "bank_transfer") {
        notes = "Bank Transfer";
      } else {
        notes = "Cash";
      }
    }

    await bookshelf
      .transaction(async (t) => {
        let newPayment = await strapi
          .query("purchase-payments")
          .create(
            {
              ...ctx.request.body,
              payment_date: utils.getDateInYYYYMMDD(new Date(payment_date)),
              comment: notes,
            },
            { transacting: t }
          )
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });

        let purchasePaymentTransaction = {
          purchase: null,
          purchase_payment: newPayment.id,
          goods_return: null,
          seller: seller,
          transaction_date: utils.getDateInYYYYMMDD(new Date(payment_date)),
          month: new Date(payment_date).getMonth() + 1,
          year: new Date(payment_date).getFullYear(),
          comment: notes,
          transaction_amount: validateNumber(amount),
          is_purchase: false,
          is_payment: true,
          is_goods_return: false,
          kachha_ledger: kachha_ledger,
          pakka_ledger: pakka_ledger,
        };

        await strapi
          .query("purchase-payment-transaction")
          .create(purchasePaymentTransaction, { transacting: t })
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });
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
    const purchaseData = await strapi.query("purchase-payments").findOne(
      {
        id: id,
      },
      []
    );
    const { payment_date, seller } = purchaseData;
    await bookshelf
      .transaction(async (t) => {
        await strapi.query("purchase-payment-transaction").delete(
          {
            purchase_payment: id,
          },
          {
            patch: true,
            transacting: t,
          }
        );
        await strapi.query("purchase-payments").delete(
          {
            id: id,
          },
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
};
