"use strict";
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");
const { validateNumber, isEmptyString } = require("../../../config/utils");
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
        .query("individual-purchase")
        .find({ purchase: id }, [
          "raw_material",
          "raw_material.department",
          "raw_material.category",
          "raw_material.color",
        ]);
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
    const {
      purchases,
      individual_purchase,
      kachhaPurchase,
      pakkaPurchase,
    } = ctx.request.body;
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
      invoice_number,
      igst_percent,
      bill_no,
    } = purchases;

    if (id) {
      await bookshelf
        .transaction(async (t) => {
          let purchaseData = {
            date: utils.getDateInYYYYMMDD(new Date(date)),
            seller: seller,
            cgst_percent: cgst_percent,
            sgst_percent: sgst_percent,
            igst_percent: igst_percent,
            notes: notes,
            total_amt_with_tax: total_amt_with_tax,
            total_amt_without_tax: total_amt_without_tax,
            invoice_number: invoice_number,
            bill_no: bill_no,
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
                date: utils.getDateInYYYYMMDD(new Date(date)),
                seller: seller,
              };
              await strapi
                .query("individual-purchase")
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
                date: utils.getDateInYYYYMMDD(new Date(date)),
                seller: seller,
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
          let comment = `Purchase of amount ${utils.convertNumber(
            total_amt_with_tax,
            true
          )} done for ${
            type_of_bill === "Pakka"
              ? "Invoice no: " + invoice_number
              : "Bill no: " + bill_no
          }`;
          let purchaseData = {
            type_of_bill: type_of_bill,
            date: utils.getDateInYYYYMMDD(new Date(date)),
            cgst_percent: cgst_percent,
            sgst_percent: sgst_percent,
            igst_percent: igst_percent,
            gst_no: gst_no,
            notes: notes,
            seller: seller,
            total_amt_with_tax: total_amt_with_tax,
            total_amt_without_tax: total_amt_without_tax,
            invoice_number: invoice_number,
            bill_no: bill_no,
            history: [
              {
                comment: comment,
              },
            ],
          };

          let newPurchase = await strapi
            .query("purchases")
            .create(purchaseData, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });

          await utils.asyncForEach(individual_purchase, async (Ip) => {
            let purchaseCost = validateNumber(Ip.purchase_cost);
            let purchaseQuantity = validateNumber(Ip.purchase_quantity);
            let totalPurchaseQuantity = validateNumber(Ip.total_purchase_cost);
            let are_raw_material_clubbed = false;
            let isNamePresent =
              Ip.name && !isEmptyString(Ip.name) && !Ip.raw_material;

            if (type_of_bill === "Pakka" && isNamePresent) {
              are_raw_material_clubbed = true;
            }
            let individualPurchase = {
              purchase: newPurchase.id,
              seller: seller,
              date: utils.getDateInYYYYMMDD(new Date(date)),
              are_raw_material_clubbed: are_raw_material_clubbed,
              is_kachha_purchase: type_of_bill === "Kachha" ? true : false,
              purchase_quantity: purchaseQuantity,
              purchase_cost: purchaseCost,
              total_purchase_cost: totalPurchaseQuantity,
            };

            if (isNamePresent) {
              individualPurchase = {
                ...individualPurchase,
                name: Ip.name,
                raw_material: null,
              };
            } else {
              individualPurchase = {
                ...individualPurchase,
                name: null,
                raw_material: Ip.raw_material.id,
              };
            }

            /** Kachha purchase */
            await strapi
              .query("individual-purchase")
              .create(individualPurchase, { transacting: t })
              .then((model) => model)
              .catch((err) => {
                console.log(err);
                throw 500;
              });

            /** Take old data of raw material*/
            let raw_material_data = await strapi
              .query("raw-material")
              .findOne({ id: Ip.raw_material.id });
            /** Check if the value is number or ot */
            let currentBalance = validateNumber(raw_material_data.balance);
            /** Add value */
            let finalValue = currentBalance + purchaseQuantity;
            /** Update new balance */
            await strapi.query("raw-material").update(
              { id: Ip.raw_material.id },
              {
                balance: finalValue,
              },
              { patch: true, transacting: t }
            );

            /** Update the closing balance of raw material */
            let currentMonth = new Date().getMonth() + 1;
            let currentYear = new Date().getFullYear();

            let isCurrentMonthEntryPresent = await strapi
              .query("monthly-sheet")
              .findOne({
                raw_material: Ip.raw_material.id,
                month: currentMonth,
                year: currentYear,
              });

            if (isCurrentMonthEntryPresent) {
              let newClosingBalance =
                purchaseQuantity +
                validateNumber(isCurrentMonthEntryPresent.closing_balance);

              await strapi.query("monthly-sheet").update(
                { id: isCurrentMonthEntryPresent.id },
                {
                  closing_balance: newClosingBalance,
                },
                { patch: true, transacting: t }
              );
            }
            /** ---------------------------------------- */
            /** Now we have to make entries in transaction */

            let purchasePaymentTransaction = {
              purchase: newPurchase.id,
              purchase_payment: null,
              goods_return: null,
              seller: seller,
              transaction_date: utils.getDateInYYYYMMDD(new Date(date)),
              month: new Date(date).getMonth() + 1,
              year: new Date(date).getFullYear(),
              comment: comment,
              transaction_amount: validateNumber(total_amt_with_tax),
              is_purchase: true,
              is_payment: false,
              is_goods_return: false,
              kachha_ledger: type_of_bill === "Kachha" ? true : false,
              pakka_ledger: type_of_bill === "Pakka" ? true : false,
            };

            await strapi
              .query("purchase-payment-transaction")
              .create(purchasePaymentTransaction, { transacting: t })
              .then((model) => model)
              .catch((err) => {
                console.log(err);
                throw 500;
              });
          });
        })
        .then((res) => {
          updateLedger(date, seller);
          ctx.send(200);
        })
        .catch((err) => {
          console.log(err);
          ctx.throw(500);
        });
    }
  },

  async ledger(ctx) {
    const { query } = ctx.request.query;
  },
};

async function updateLedger(dateFrom, seller) {
  await bookshelf.transaction(async (t) => {
    let dateToCheckFrom = new Date(dateFrom);

    /** Lets check if the date is current date */

    let diffOfMonths =
      utils.getMonthDifference(dateToCheckFrom, new Date()) + 1;
    let monthDiffArray = Array.from(
      { length: diffOfMonths },
      (v, i) => diffOfMonths - i - 1
    );

    let previousKachhaClosingBalance = 0;
    let previousPakkaClosingBalance = 0;

    console.log("monthDiffArray ", monthDiffArray);
    console.log("dateFrom ", dateFrom);
    console.log("diffOfMonths ", diffOfMonths);

    await utils.asyncForEach(monthDiffArray, async (m_no) => {
      let getMiddleDate = new Date(new Date().setDate(15));
      let correspondingDate = new Date(
        getMiddleDate.setMonth(getMiddleDate.getMonth() - m_no)
      );
      let correspondingMonth = correspondingDate.getMonth() + 1;
      let correspondingYear = correspondingDate.getFullYear();
      let kachhaLedgerId = null;
      let pakkaLedgerId = null;

      let commonData = {
        seller: seller,
        month: correspondingMonth,
        year: correspondingYear,
        date: utils.getDateInYYYYMMDD(new Date(correspondingDate)),
      };

      let kachhaBalanceData = {
        ...commonData,
        opening_balance: 0,
        closing_balance: 0,
        purchase_type: "Kachha",
      };

      let pakkaBalanceData = {
        ...commonData,
        opening_balance: 0,
        closing_balance: 0,
        purchase_type: "Pakka",
      };

      /** If its not the 1st entry
       *  In this case we have to check kachha and pakka closing balance calculated in previous interation.
       */
      let isValueSetForKachhaBalance = false;
      let isValueSetForPakkaBalance = false;
      if (diffOfMonths - 1 !== m_no) {
        if (previousKachhaClosingBalance) {
          kachhaBalanceData = {
            ...kachhaBalanceData,
            opening_balance: validateNumber(previousKachhaClosingBalance),
            closing_balance: validateNumber(previousKachhaClosingBalance),
          };
          isValueSetForKachhaBalance = true;
        }
        if (previousPakkaClosingBalance) {
          pakkaBalanceData = {
            ...pakkaBalanceData,
            opening_balance: validateNumber(previousPakkaClosingBalance),
            closing_balance: validateNumber(previousPakkaClosingBalance),
          };
          isValueSetForPakkaBalance = true;
        }
      }

      /** Get months closing balance for both ledger */

      let getMonthlyPurchaseBalance = await strapi
        .query("monthly-purchase-balance")
        .find({
          month: correspondingMonth,
          year: correspondingYear,
          seller: seller,
        });

      if (getMonthlyPurchaseBalance && getMonthlyPurchaseBalance.length) {
        getMonthlyPurchaseBalance.forEach((el) => {
          let balance = {
            opening_balance: validateNumber(el.opening_balance),
            closing_balance: validateNumber(el.opening_balance),
          };
          if (el.purchase_type === "Pakka") {
            pakkaLedgerId = el.id;
            if (!isValueSetForPakkaBalance) {
              pakkaBalanceData = {
                ...pakkaBalanceData,
                ...balance,
              };
            }
          } else {
            kachhaLedgerId = el.id;
            if (!isValueSetForKachhaBalance) {
              kachhaBalanceData = {
                ...kachhaBalanceData,
                ...balance,
              };
            }
          }
        });
      }

      /** ------- */

      let getAllTransactions = await strapi
        .query("purchase-payment-transaction")
        .find({
          month: correspondingMonth,
          year: correspondingYear,
          seller: seller,
        });

      getAllTransactions.forEach((el) => {
        let num = validateNumber(el.transaction_amount);
        if (el.is_payment || el.is_goods_return) {
          num = -num;
        }
        if (el.kachha_ledger) {
          kachhaBalanceData = {
            ...kachhaBalanceData,
            closing_balance: kachhaBalanceData.closing_balance + num,
          };
        }
        if (el.pakka_ledger) {
          pakkaBalanceData = {
            ...pakkaBalanceData,
            closing_balance: pakkaBalanceData.closing_balance + num,
          };
        }
      });

      console.log("getAllTransactions ", getAllTransactions);
      console.log("kachhaBalanceData ", kachhaBalanceData);
      console.log("pakkaBalanceData ", pakkaBalanceData);

      previousKachhaClosingBalance = kachhaBalanceData.closing_balance;
      previousPakkaClosingBalance = pakkaBalanceData.closing_balance;

      /** For Kachha ledger */
      if (kachhaLedgerId) {
        await strapi.query("monthly-purchase-balance").update(
          { id: kachhaLedgerId },
          {
            opening_balance: kachhaBalanceData.opening_balance,
            closing_balance: kachhaBalanceData.closing_balance,
          },
          { patch: true, transacting: t }
        );
      } else {
        if (kachhaBalanceData.closing_balance) {
          await strapi
            .query("monthly-purchase-balance")
            .create(kachhaBalanceData, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });
        }
      }

      /** For Pakka ledger */
      if (pakkaLedgerId) {
        await strapi.query("monthly-purchase-balance").update(
          { id: pakkaLedgerId },
          {
            opening_balance: pakkaBalanceData.opening_balance,
            closing_balance: pakkaBalanceData.closing_balance,
          },
          { patch: true, transacting: t }
        );
      } else {
        if (pakkaBalanceData.closing_balance) {
          await strapi
            .query("monthly-purchase-balance")
            .create(pakkaBalanceData, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });
        }
      }
    });
  });
}
