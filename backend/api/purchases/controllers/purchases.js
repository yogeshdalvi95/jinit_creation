"use strict";
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");
const {
  validateNumber,
  isEmptyString,
  getMonth,
  convertNumber,
  getDateInMMDDYYYY,
  noDataImg,
  generatePDF,
  getMonthDifference,
} = require("../../../config/utils");
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
    const individualPurchase = await strapi
      .query("individual-purchase")
      .find({ purchase: id }, [
        "raw_material",
        "raw_material.department",
        "raw_material.category",
        "raw_material.color",
        "raw_material.unit",
      ]);
    ctx.send({
      purchase: purchase_detail,
      individualPurchase: individualPurchase,
    });
  },

  async create(ctx) {
    const { purchases, individual_purchase } = ctx.request.body;
    const {
      id,
      seller,
      type_of_bill,
      cgst_percent,
      sgst_percent,
      total_amt_with_tax,
      total_amt_without_tax,
      notes,
      date,
      invoice_number,
      igst_percent,
      bill_no,
    } = purchases;

    let comment = notes;
    if (isEmptyString(comment)) {
      if (type_of_bill === "Pakka") {
        comment = `Purchase ${
          igst_percent
            ? `IGST ${igst_percent}%`
            : `CGST ${cgst_percent}% SGST ${sgst_percent}%`
        }`;
      } else {
        comment = `Purchase`;
      }
    }

    if (id) {
      await bookshelf
        .transaction(async (t) => {
          let purchaseData = {
            type_of_bill: type_of_bill,
            date: utils.getDateInYYYYMMDD(new Date(date)),
            cgst_percent: cgst_percent,
            sgst_percent: sgst_percent,
            igst_percent: igst_percent,
            notes: comment,
            seller: seller,
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

          let alreadyPresentIndividualPurchase = await strapi
            .query("individual-purchase")
            .find({
              purchase: id,
            });

          let temp1 = alreadyPresentIndividualPurchase.map((r) => r.id);
          let temp2 = [];
          await utils.asyncForEach(individual_purchase, async (Ip) => {
            if (Ip.id) {
              temp2.push(Ip.id);
              await updateIndividualPurchaseData(Ip, seller, date, t);
            } else {
              await addIndividualPurchaseData(Ip, id, seller, date, t);
            }
          });

          let deletedArrays = temp1.filter((x) => !temp2.includes(x));
          if (deletedArrays.length) {
            await utils.asyncForEach(deletedArrays, async (Ip) => {
              await deleteIndividualPurchaseData(Ip, t);
            });
          }

          let purchasePaymentTransaction = {
            purchase: id,
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

          let purchasePaymentTxnId = await strapi
            .query("purchase-payment-transaction")
            .findOne({
              purchase: id,
            });

          if (purchasePaymentTxnId) {
            await strapi
              .query("purchase-payment-transaction")
              .update(
                { id: purchasePaymentTxnId.id },
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
    } else {
      await bookshelf
        .transaction(async (t) => {
          let purchaseData = {
            type_of_bill: type_of_bill,
            date: utils.getDateInYYYYMMDD(new Date(date)),
            cgst_percent: cgst_percent,
            sgst_percent: sgst_percent,
            igst_percent: igst_percent,
            notes: comment,
            seller: seller,
            total_amt_with_tax: total_amt_with_tax,
            total_amt_without_tax: total_amt_without_tax,
            invoice_number: invoice_number,
            bill_no: bill_no,
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
            await addIndividualPurchaseData(
              Ip,
              newPurchase.id,
              seller,
              date,
              t
            );
          });
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

  async ledger(ctx) {
    const { date_gte, sellerId } = ctx.request.query;
    await strapi.services["monthly-purchase-balance"].updateLedger(
      date_gte,
      sellerId
    );
    let data = await generateLedger(ctx.request.query);
    ctx.send(data);
  },

  async downloadledger(ctx) {
    const { date_gte, date_lte, sellerId } = ctx.request.body;
    console.log("ctx.request.body => ", ctx.request.body);
    await strapi.services["monthly-purchase-balance"].updateLedger(
      date_gte,
      sellerId
    );
    console.log("Here 1");
    let data = await generateLedger(ctx.request.body);
    console.log("data => ", data);
    let html = "";
    let monthYearObject = [];
    let dateToCheckFrom = new Date(date_gte);
    let dateToCheckTo = new Date(date_lte);
    let diffOfMonths = getMonthDifference(dateToCheckFrom, dateToCheckTo) + 1;

    let monthDiffArray = Array.from({ length: diffOfMonths }, (v, i) => i);

    monthDiffArray.forEach((m_no) => {
      let getMiddleDate = new Date(dateToCheckFrom.setDate(15));
      let correspondingDate = new Date(
        getMiddleDate.setMonth(getMiddleDate.getMonth() + m_no)
      );
      let correspondingMonth = correspondingDate.getMonth() + 1;
      let correspondingYear = correspondingDate.getFullYear();
      let key = `${getMonth(correspondingMonth - 1)}, ${correspondingYear}`;
      monthYearObject.push(key);
    });

    const sellerInfo = await strapi.query("seller").findOne({
      id: sellerId,
    });

    html =
      html +
      ` 
        <p class="p centerAlignedText lessBottomMargin lessTopMargin">for</p>
        <h1 class="h1">${sellerInfo?.seller_name}</h1>
        <p class="p centerAlignedText lessBottomMargin lessTopMargin">${
          sellerInfo?.seller_address
        }</p>
        <p class="p centerAlignedText lessBottomMargin lessTopMargin">Mob:- ${
          sellerInfo?.phone
        }</p>
        <p class="p centerAlignedText moreBottomMargin lessTopMargin"><b>${getDateInMMDDYYYY(
          date_gte
        )} - ${getDateInMMDDYYYY(date_lte)}</b>
        </p>
        <table class="table">
            <thead>
            <tr>
              <th class="th leftAlignText withBackGroundHeader">Date</th>
              <th class="th leftAlignText withBackGroundHeader">Particulars</th>
              <th class="th leftAlignText withBackGroundHeader">Type</th>
              <th class="th leftAlignText withBackGroundHeader">Bill/Invoice No</th>
              <th class="th leftAlignText withBackGroundHeader">Debit</th>
              <th class="th leftAlignText withBackGroundHeader">Credit</th>
            </tr>
        </thead>
        <tbody>
        `;

    if (monthYearObject && monthYearObject.length) {
      monthYearObject.forEach((monthYear) => {
        html =
          html +
          ` <tr>
              <th colspan = "6" class="th centerAlignText withGreyBackGround">${monthYear}</th>
            </tr>
            <tr>
              <th class="th leftAlignText">----</th>
              <th class="th leftAlignText">Opening Balance</th>
              <th class="th leftAlignText">----</th>
              <th class="th leftAlignText">----</th>
              ${
                data[monthYear]?.opening_balance?.finalOpeningBalance > 0
                  ? `
                    <th class="th leftAlignText noWrap withYellowColor">${convertNumber(
                      Math.abs(
                        data[monthYear]?.opening_balance?.finalOpeningBalance
                      ),
                      true
                    )}</th>  
                    <th class="th leftAlignText">---</th>  
                  `
                  : data[monthYear]?.opening_balance?.finalOpeningBalance < 0
                  ? ` 
                      <th class="th leftAlignText">---</th>
                      <th class="th leftAlignText noWrap withYellowColor">${convertNumber(
                        Math.abs(
                          data[monthYear]?.opening_balance?.finalOpeningBalance
                        ),
                        true
                      )}</th>
                    `
                  : `<th class="th leftAlignText">${convertNumber(0, true)}</th>
                    <th class="th leftAlignText">${convertNumber(0, true)}</th>
                        `
              }
            </tr> `;

        if (
          data[monthYear] &&
          data[monthYear].data &&
          data[monthYear].data.length
        ) {
          data[monthYear].data.forEach((l) => {
            html =
              html +
              ` <tr>
                  <td class="td leftAlignText noWrap">${l.date}</td>
                  <td class="td leftAlignText">${l.particulars}</td>
                  <td class="td leftAlignText">${l.type}</td>
                  <td class="td leftAlignText">${l.bill_invoice_no}</td>
                  <td class="td leftAlignText noWrap">${l.debit}</td>
                  <td class="td leftAlignText noWrap">${l.credit}</td>
                </tr> `;
          });
        }
        html =
          html +
          ` <tr>
              <th class="th leftAlignText">----</th>
              <th class="th leftAlignText">Closing Balance</th>
              <th class="th leftAlignText">----</th>
              <th class="th leftAlignText">----</th>
              ${
                data[monthYear]?.closing_balance?.finalClosing > 0
                  ? `
                  <th class="th leftAlignText">---</th>    
                  <th class="th leftAlignText noWrap withYellowColor">${convertNumber(
                    Math.abs(data[monthYear]?.closing_balance?.finalClosing),
                    true
                  )}</th>  
                    
                  `
                  : data[monthYear]?.closing_balance?.finalClosing < 0
                  ? ` 
                      <th class="th leftAlignText noWrap withYellowColor">${convertNumber(
                        Math.abs(
                          data[monthYear]?.closing_balance?.finalClosing
                        ),
                        true
                      )}</th>
                      <th class="th leftAlignText">---</th>
                    `
                  : `<th class="th leftAlignText">${convertNumber(0, true)}</th>
                    <th class="th leftAlignText">${convertNumber(0, true)}</th>
                        `
              }
            </tr>
            <tr>
              <th class="th leftAlignText">----</th>
              <th class="th leftAlignText">Total</th>
              <th class="th leftAlignText">----</th>
              <th class="th leftAlignText">----</th>
              <th class="th leftAlignText noWrap">${convertNumber(
                data[monthYear]?.totalDebit,
                true
              )}</th>
              <th class="th leftAlignText noWrap">${convertNumber(
                data[monthYear]?.totalCredit,
                true
              )}</th>
            </tr>`;
      });
    } else {
      html = `<img
      src='${noDataImg}'
      class="center"
      alt="No data"
    />`;
    }

    try {
      let buffer = await generatePDF("Purchase Ledger", html);
      ctx.send(buffer);
    } catch (err) {
      console.log("error => ", err);
      throw err;
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;

    let purchaseData = await strapi.query("purchases").find(
      {
        id: id,
      },
      []
    );

    let individualPurchaseData = await strapi
      .query("individual-purchase")
      .find({
        purchase: id,
      });

    await bookshelf
      .transaction(async (t) => {
        await utils.asyncForEach(individualPurchaseData, async (Ip) => {
          await deleteIndividualPurchaseData(Ip.id, t);
        });

        await strapi.query("purchase-payment-transaction").delete(
          { purchase: id },
          {
            patch: true,
            transacting: t,
          }
        );

        await strapi.query("purchases").delete(
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
};

async function updateIndividualPurchaseData(Ip, seller, date, t) {
  let rawMaterialId = Ip.raw_material;
  let purchaseCost = validateNumber(Ip.purchase_cost);
  let purchaseQuantity = validateNumber(Ip.purchase_quantity);
  let totalPurchaseCost = validateNumber(Ip.total_purchase_cost);

  let individualPurchaseObj = {
    seller: seller,
    date: utils.getDateInYYYYMMDD(new Date(date)),
    purchase_quantity: purchaseQuantity,
    purchase_cost: purchaseCost,
    total_purchase_cost: totalPurchaseCost,
  };

  if (Ip.is_raw_material) {
    let individualPurchase = await strapi.query("individual-purchase").findOne({
      id: Ip.id,
    });
    const previousCount = validateNumber(individualPurchase.purchase_quantity);
    const diffOfCount = purchaseQuantity - previousCount;

    let raw_material_data = await strapi
      .query("raw-material")
      .findOne({ id: rawMaterialId });

    let currentBalance = validateNumber(raw_material_data.balance);
    let finalValue = currentBalance + diffOfCount;
    await strapi.query("raw-material").update(
      { id: rawMaterialId },
      {
        balance: finalValue,
      },
      { patch: true, transacting: t }
    );
  }

  await strapi
    .query("individual-purchase")
    .update({ id: Ip.id }, individualPurchaseObj, {
      patch: true,
      transacting: t,
    });
}

async function deleteIndividualPurchaseData(Ip_id, t) {
  let Ip = await strapi.query("individual-purchase").findOne(
    {
      id: Ip_id,
    },
    []
  );
  if (Ip.is_raw_material) {
    let rawMaterialId = Ip.raw_material;
    const previousCount = validateNumber(Ip.purchase_quantity);
    let raw_material_data = await strapi
      .query("raw-material")
      .findOne({ id: rawMaterialId }, []);

    let currentBalance = validateNumber(raw_material_data.balance);
    let finalValue = currentBalance - previousCount;
    await strapi.query("raw-material").update(
      { id: rawMaterialId },
      {
        balance: finalValue,
      },
      { patch: true, transacting: t }
    );
  }

  await strapi.query("individual-purchase").delete(
    { id: Ip_id },
    {
      patch: true,
      transacting: t,
    }
  );
}

/** Function only  used for adding individual purchase */
async function addIndividualPurchaseData(Ip, purchaseId, seller, date, t) {
  let rawMaterialId = Ip.raw_material;
  let purchaseCost = validateNumber(Ip.purchase_cost);
  let purchaseQuantity = validateNumber(Ip.purchase_quantity);
  let totalPurchaseCost = validateNumber(Ip.total_purchase_cost);
  let are_raw_material_clubbed = Ip.are_raw_material_clubbed;
  let is_raw_material = Ip.is_raw_material;
  let individualPurchase = {
    purchase: purchaseId,
    seller: seller,
    date: utils.getDateInYYYYMMDD(new Date(date)),
    are_raw_material_clubbed: are_raw_material_clubbed,
    is_raw_material: is_raw_material,
    purchase_quantity: purchaseQuantity,
    purchase_cost: purchaseCost,
    total_purchase_cost: totalPurchaseCost,
  };

  if (are_raw_material_clubbed) {
    individualPurchase = {
      ...individualPurchase,
      name: Ip.name,
      raw_material: null,
    };
  } else {
    individualPurchase = {
      ...individualPurchase,
      name: null,
      raw_material: rawMaterialId,
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

  /** If raw material already present then update its quantity */
  if (is_raw_material) {
    let raw_material_data = await strapi
      .query("raw-material")
      .findOne({ id: rawMaterialId });

    let currentBalance = validateNumber(raw_material_data.balance);
    let finalValue = currentBalance + purchaseQuantity;
    await strapi.query("raw-material").update(
      { id: rawMaterialId },
      {
        balance: finalValue,
      },
      { patch: true, transacting: t }
    );

    // let currentMonth = new Date().getMonth() + 1;
    // let currentYear = new Date().getFullYear();

    // let isCurrentMonthEntryPresent = await strapi.query("monthly-sheet").findOne({
    //   raw_material: rawMaterialId,
    //   month: currentMonth,
    //   year: currentYear,
    // });

    // if (isCurrentMonthEntryPresent) {
    //   let newClosingBalance =
    //     purchaseQuantity +
    //     validateNumber(isCurrentMonthEntryPresent.closing_balance);

    //   await strapi.query("monthly-sheet").update(
    //     { id: isCurrentMonthEntryPresent.id },
    //     {
    //       closing_balance: newClosingBalance,
    //     },
    //     { patch: true, transacting: t }
    //   );
    // }
  }
}

async function generateLedger(params) {
  const { type_of_bill, date_gte, date_lte, sellerId } = params;
  let dateToCheckFrom = new Date(date_gte);
  let dateToCheckTo = new Date(date_lte);

  let diffOfMonths = getMonthDifference(dateToCheckFrom, dateToCheckTo) + 1;

  let monthDiffArray = Array.from({ length: diffOfMonths }, (v, i) => i);

  let data = {};
  await utils.asyncForEach(monthDiffArray, async (m_no) => {
    let getMiddleDate = new Date(dateToCheckFrom.setDate(15));
    let correspondingDate = new Date(
      getMiddleDate.setMonth(getMiddleDate.getMonth() + m_no)
    );
    let correspondingMonth = correspondingDate.getMonth() + 1;
    let correspondingYear = correspondingDate.getFullYear();
    let isOpeningBalanceEditable = false;
    let purchasePaymentTransaction = await strapi
      .query("purchase-payment-transaction")
      .find({
        month: correspondingMonth,
        year: correspondingYear,
        seller: sellerId,
      });

    let getMonthlyPurchaseBalance = await strapi
      .query("monthly-purchase-balance")
      .findOne({
        month: correspondingMonth,
        year: correspondingYear,
        seller: sellerId,
        purchase_type: type_of_bill,
      });

    let monthName = getMonth(correspondingMonth - 1);

    /** Openingbalance and closing balance calculation */
    let opening_balance = validateNumber(
      getMonthlyPurchaseBalance?.opening_balance
    );

    let debitOpeningBalance = 0;
    let creditOpeningBalance = 0;

    if (opening_balance && opening_balance < 0) {
      debitOpeningBalance = Math.abs(opening_balance);
    } else if (opening_balance && opening_balance > 0) {
      creditOpeningBalance = Math.abs(opening_balance);
    }

    let totalCredit = creditOpeningBalance;
    let totalDebit = debitOpeningBalance;

    let txnData = [];
    purchasePaymentTransaction.forEach((pt) => {
      if (
        (type_of_bill === "Kachha" && pt.kachha_ledger) ||
        (type_of_bill === "Pakka" && pt.pakka_ledger)
      ) {
        let type = "-----";
        let amount = convertNumber(pt.transaction_amount, true);
        let bill_invoice_no = "-----";
        let credit = "---";
        let debit = "---";
        let id = null;
        if (pt.is_purchase) {
          type = "Purchase";
          bill_invoice_no = pt.purchase.bill_no;
          credit = amount;
          totalCredit = totalCredit + pt.transaction_amount;
          id = pt.purchase.id;
        } else if (pt.is_payment) {
          type = "Payment";
          debit = amount;
          totalDebit = totalDebit + pt.transaction_amount;
          id = pt.purchase_payment.id;
        } else if (pt.is_goods_return) {
          type = "Goods return";
          debit = amount;
          totalDebit = totalDebit + pt.transaction_amount;
          id = pt.goods_return.id;
        }

        txnData.push({
          date: getDateInMMDDYYYY(new Date(pt.transaction_date)),
          particulars: pt.comment,
          type: type,
          bill_invoice_no: bill_invoice_no,
          credit: credit,
          debit: debit,
          id: id,
        });
      }
    });
    let netTotalCredit = totalCredit;
    let netTotalDebit = totalDebit;
    if (totalDebit - totalCredit > 0) {
      netTotalCredit = totalCredit + Math.abs(totalDebit - totalCredit);
    } else {
      netTotalDebit = totalDebit + Math.abs(totalDebit - totalCredit);
    }
    data = {
      ...data,
      [`${monthName}, ${correspondingYear}`]: {
        opening_balance: {
          credit: creditOpeningBalance,
          debit: debitOpeningBalance,
          finalOpeningBalance: debitOpeningBalance - creditOpeningBalance,
        },
        closing_balance: {
          credit: totalCredit,
          debit: totalDebit,
          finalClosing: totalDebit - totalCredit,
        },
        totalCredit: netTotalCredit,
        totalDebit: netTotalDebit,
        data: [...txnData],
        isOpeningBalanceEditable: isOpeningBalanceEditable,
      },
    };
  });
  return data;
}
