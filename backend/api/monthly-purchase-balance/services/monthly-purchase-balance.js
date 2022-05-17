"use strict";
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");
const _ = require("lodash");
const { validateNumber } = require("../../../config/utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async updateLedger(dateFrom, seller) {
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
          await strapi
            .query("monthly-purchase-balance")
            .create(kachhaBalanceData, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });
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
          await strapi
            .query("monthly-purchase-balance")
            .create(pakkaBalanceData, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });
        }
      });
    });
  },
};
