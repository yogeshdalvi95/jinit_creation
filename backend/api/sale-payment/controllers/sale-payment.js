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
    const count = await strapi.query("sale-payment").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("sale-payment").find(query);

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
      party,
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
          .query("sale-payment")
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

        let correspondingSalePaymentTxnData = await strapi
          .query("sale-payment-transaction")
          .findOne({
            sale_payment: id,
            is_payment: true,
            is_sale: false,
            is_sale_return: false,
          });

        let salePaymentTransaction = {
          sale: null,
          sale_payment: id,
          goods_return: null,
          party: party,
          transaction_date: utils.getDateInYYYYMMDD(new Date(payment_date)),
          month: new Date(payment_date).getMonth() + 1,
          year: new Date(payment_date).getFullYear(),
          comment: notes,
          transaction_amount: validateNumber(amount),
          is_sale: false,
          is_payment: true,
          is_sale_return: false,
          kachha_ledger: kachha_ledger,
          pakka_ledger: pakka_ledger,
        };

        if (correspondingSalePaymentTxnData) {
          await strapi
            .query("sale-payment-transaction")
            .update(
              { id: correspondingSalePaymentTxnData.id },
              salePaymentTransaction,
              { patch: true, transacting: t }
            )
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });
        } else {
          await strapi
            .query("sale-payment-transaction")
            .create(salePaymentTransaction, { transacting: t })
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
      party,
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
          .query("sale-payment")
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

        let salePaymentTransaction = {
          sale: null,
          sale_payment: newPayment.id,
          goods_return: null,
          party: party,
          transaction_date: utils.getDateInYYYYMMDD(new Date(payment_date)),
          month: new Date(payment_date).getMonth() + 1,
          year: new Date(payment_date).getFullYear(),
          comment: notes,
          transaction_amount: validateNumber(amount),
          is_sale: false,
          is_payment: true,
          is_sale_return: false,
          kachha_ledger: kachha_ledger,
          pakka_ledger: pakka_ledger,
        };

        await strapi
          .query("sale-payment-transaction")
          .create(salePaymentTransaction, { transacting: t })
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
    const saleData = await strapi.query("sale-payment").findOne(
      {
        id: id,
      },
      []
    );
    const { payment_date, party } = saleData;
    await bookshelf
      .transaction(async (t) => {
        await strapi.query("sale-payment-transaction").delete(
          {
            sale_payment: id,
          },
          {
            patch: true,
            transacting: t,
          }
        );
        await strapi.query("sale-payment").delete(
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
