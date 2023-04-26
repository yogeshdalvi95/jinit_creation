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
    console.log("Data => ", ctx.request.query);
    const { check } = ctx.request.query;
    if (check) {
      let is_sale_return_data_present = await strapi
        .query("sale-return")
        .findOne({ sale: id }, []);
      if (is_sale_return_data_present) {
        return ctx.badRequest(null, {
          reason: -1,
          saleReturnData: is_sale_return_data_present,
        });
      }
    }
    let sale_data = await strapi.query("sales").findOne({ id: id }, ["party"]);
    let individual_sale_ready_material = await strapi
      .query("individual-sale-ready-material")
      .find({
        sale: id,
      });

    let sale_ready_material = [];
    if (
      individual_sale_ready_material &&
      individual_sale_ready_material.length
    ) {
      await utils.asyncForEach(individual_sale_ready_material, async (el) => {
        if (el) {
          if (el.is_ready_material) {
            if (el.design && el.design.id) {
              let design = await strapi.query("designs").findOne({
                id: el.design.id,
              });
              let designColorPrice = await strapi
                .query("design-color-price")
                .findOne({ design: el.design.id, color: el.color.id });
              el.color_price = designColorPrice;
              sale_ready_material.push(el);
            }
          } else {
            sale_ready_material.push(el);
          }
        }
      });
    }

    sale_data.sale_ready_material = sale_ready_material;

    ctx.send(sale_data);
  },

  async create(ctx) {
    const { id, state, designAndColor, party } = ctx.request.body;
    const {
      date,
      bill_no,
      type_of_bill,
      cgst,
      sgst,
      igst,
      add_cost,
      total_price_of_all_design,
      total_price_without_gst,
      total_price,
    } = state;

    let transaction_amount = utils.validateNumber(total_price);

    /** Create sale data */
    let data = {
      bill_no: bill_no,
      date: utils.getDateInYYYYMMDD(new Date(date)),
      type_of_bill: type_of_bill,
      total_price_of_all_design: total_price_of_all_design,
      total_price_with_add_cost: total_price_without_gst,
      add_cost: add_cost,
      total_price: transaction_amount,
      sgst: sgst,
      cgst: cgst,
      igst: igst,
      party: party,
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
        } else {
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
        }

        let comment = "";
        if (type_of_bill === "Pakka") {
          comment = `Sale ${
            igst ? `IGST ${igst}%` : `CGST ${cgst}% SGST ${sgst}%`
          }`;
        } else {
          comment = `Sale`;
        }

        let salePaymentTransaction = {
          sale: saleId,
          sale_payment: null,
          sale_return: null,
          party: party,
          transaction_date: utils.getDateInYYYYMMDD(new Date(date)),
          month: new Date(date).getMonth() + 1,
          year: new Date(date).getFullYear(),
          comment: comment,
          transaction_amount: validateNumber(total_price),
          is_sale: true,
          is_payment: false,
          is_sale_return: false,
          kachha_ledger: type_of_bill === "Kachha" ? true : false,
          pakka_ledger: type_of_bill === "Pakka" ? true : false,
        };

        let salePaymentTxnId = await strapi
          .query("sale-payment-transaction")
          .findOne({
            sale: saleId,
          });

        if (salePaymentTxnId) {
          await strapi
            .query("sale-payment-transaction")
            .update({ id: salePaymentTxnId.id }, salePaymentTransaction, {
              patch: true,
              transacting: t,
            })
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

        /** Done adding entries in the sale payment transaction */
        await getReadyMaterialForSale(designAndColor, saleId, t, party);
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
          utils.roundNumberTo2digit(d.total_price_of_all_design),
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

  async ledger(ctx) {
    const { date_gte, partyId } = ctx.request.query;
    await strapi.services["monthly-sale-balance"].updateLedger(
      date_gte,
      partyId
    );
    let data = await generateLedger(ctx.request.query);
    ctx.send(data);
  },

  async downloadledger(ctx) {
    const { date_gte, date_lte, partyId } = ctx.request.body;
    console.log("ctx.request.body => ", ctx.request.body);
    await strapi.services["monthly-sale-balance"].updateLedger(
      date_gte,
      partyId
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

    const partyInfo = await strapi.query("party").findOne({
      id: partyId,
    });

    html =
      html +
      ` 
        <p class="p centerAlignedText lessBottomMargin lessTopMargin">for</p>
        <h1 class="h1">${partyInfo?.party_name}</h1>
        <p class="p centerAlignedText lessBottomMargin lessTopMargin">${
          partyInfo?.party_address
        }</p>
        <p class="p centerAlignedText lessBottomMargin lessTopMargin">Mob:- ${
          partyInfo?.phone
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
                data[monthYear]?.opening_balance?.finalOpeningBalance < 0
                  ? `
                  <th class="th leftAlignText">---</th>  
                    <th class="th leftAlignText noWrap withYellowColor">${convertNumber(
                      Math.abs(
                        data[monthYear]?.opening_balance?.finalOpeningBalance
                      ),
                      true
                    )}</th>  
                  `
                  : data[monthYear]?.opening_balance?.finalOpeningBalance > 0
                  ? ` 
                      <th class="th leftAlignText noWrap withYellowColor">-${convertNumber(
                        Math.abs(
                          data[monthYear]?.opening_balance?.finalOpeningBalance
                        ),
                        true
                      )}</th>
                      <th class="th leftAlignText">---</th>
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
              <th class="th leftAlignText">Total</th>
              <th class="th leftAlignText">----</th>
              <th class="th leftAlignText">----</th>
              <th class="th leftAlignText noWrap">${convertNumber(
                data[monthYear]?.closing_balance?.debit,
                true
              )}</th>
              <th class="th leftAlignText noWrap">${convertNumber(
                data[monthYear]?.closing_balance?.credit,
                true
              )}</th>
            </tr>
            <tr>
              <th class="th leftAlignText">----</th>
              <th class="th leftAlignText">Closing Balance</th>
              <th class="th leftAlignText">----</th>
              <th class="th leftAlignText">----</th>
              ${
                data[monthYear]?.closing_balance?.finalClosing < 0
                  ? `
                  <th class="th leftAlignText">---</th>    
                  <th class="th leftAlignText noWrap withYellowColor">${convertNumber(
                    Math.abs(data[monthYear]?.closing_balance?.finalClosing),
                    true
                  )}</th>    
                  `
                  : data[monthYear]?.closing_balance?.finalClosing > 0
                  ? ` 
                      <th class="th leftAlignText noWrap withYellowColor">-${convertNumber(
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
      let buffer = await generatePDF("Sale Ledger", html);
      ctx.send(buffer);
    } catch (err) {
      console.log("error => ", err);
      throw err;
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;
    let saleReturnData = await strapi.query("sale-return").findOne(
      {
        sale: id,
      },
      []
    );

    if (saleReturnData) {
      return ctx.badRequest(null, {
        status: -1,
        data: saleReturnData,
      });
    } else {
      let individual_sale_ready_material = await strapi
        .query("individual-sale-ready-material")
        .find({
          sale: id,
        });

      await bookshelf
        .transaction(async (t) => {
          if (
            individual_sale_ready_material &&
            individual_sale_ready_material.length
          ) {
            await utils.asyncForEach(
              individual_sale_ready_material,
              async (d) => {
                await deleteSaleData(d, t);
              }
            );
          }

          await strapi.query("individual-sale-ready-material").delete(
            { sale: id },
            {
              patch: true,
              transacting: t,
            }
          );

          await strapi.query("sale-payment-transaction").delete(
            { sale: id },
            {
              patch: true,
              transacting: t,
            }
          );

          await strapi.query("sales").delete(
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
    }
  },
};

const deleteSaleData = async (object, t) => {
  if (object.is_ready_material) {
    let design = object.design?.id ? object.design.id : null;
    let color = object.color?.id ? object.color.id : null;
    const previousCount = validateNumber(object.quantity);

    let designColorData = await strapi
      .query("design-color-price")
      .findOne({ design: design, color: color });

    /** get color stock */
    let designColorQuantity = utils.validateNumber(designColorData.stock);

    let newBalance = designColorQuantity + previousCount;
    await strapi.query("design-color-price").update(
      { id: designColorData.id },
      {
        stock: newBalance,
      },
      { patch: true, transacting: t }
    );
  }
};

const getReadyMaterialForSale = async (object, saleId, t, party) => {
  let dataToSend = [];
  let designColorArray = Object.keys(object);
  if (
    Object.prototype.toString.call(designColorArray) === "[object Array]" &&
    designColorArray.length
  ) {
    await utils.asyncForEach(designColorArray, async (el) => {
      if (object[el].is_ready_material) {
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
            let designColorQuantity = utils.validateNumber(
              designColorData.stock
            );
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
              id: el1.id ? el1.id : null,
              design: el1.design,
              sale: saleId,
              color: el1.color,
              name: "",
              quantity: utils.validateNumber(el1.quantity),
              total_price: utils.validateNumber(el1.total_price),
              price_per_unit: utils.validateNumber(el1.price_per_unit),
              returned_quantity: utils.validateNumber(el1.returned_quantity),
              return_total_price: utils.validateNumber(el1.return_total_price),
              return_price_per_unit: utils.validateNumber(
                el1.return_price_per_unit
              ),
              party: party,
              is_ready_material: true,
              are_ready_materials_clubbed: false,
            });
          });
        }
      } else {
        /** final data */
        dataToSend.push({
          id: object[el].id ? object[el].id : null,
          design: null,
          sale: saleId,
          color: null,
          name: object[el].name,
          quantity: utils.validateNumber(object[el].quantity),
          total_price: utils.validateNumber(object[el].total_price),
          price_per_unit: utils.validateNumber(object[el].price_per_unit),
          returned_quantity: utils.validateNumber(object[el].returned_quantity),
          return_total_price: utils.validateNumber(
            object[el].return_total_price
          ),
          return_price_per_unit: utils.validateNumber(
            object[el].return_price_per_unit
          ),
          party: party,
          is_ready_material: false,
          are_ready_materials_clubbed: true,
        });
      }
    });
    await utils.asyncForEach(dataToSend, async (d) => {
      if (d.id) {
        await strapi
          .query("individual-sale-ready-material")
          .update({ id: d.id }, d, { patch: true, transacting: t });
      } else {
        delete d.id;
        d = {
          ...d,
          return_price_per_unit: d.price_per_unit,
        };
        await strapi
          .query("individual-sale-ready-material")
          .create(d, { transacting: t })
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });
      }
    });
  }
};

async function generateLedger(params) {
  const { type_of_bill, date_gte, date_lte, partyId } = params;
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

    let salePaymentTransaction = await strapi
      .query("sale-payment-transaction")
      .find({
        month: correspondingMonth,
        year: correspondingYear,
        party: partyId,
      });

    let getMonthlyPurchaseBalance = await strapi
      .query("monthly-sale-balance")
      .findOne({
        month: correspondingMonth,
        year: correspondingYear,
        party: partyId,
        sale_type: type_of_bill,
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
    salePaymentTransaction.forEach((pt) => {
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
        if (pt.is_sale) {
          type = "Sale";
          bill_invoice_no = pt.sale.bill_no;
          debit = amount;
          totalDebit = totalDebit + pt.transaction_amount;
          id = pt.sale.id;
        } else if (pt.is_payment) {
          type = "Payment";
          credit = amount;
          totalCredit = totalCredit + pt.transaction_amount;
          id = pt.sale_payment.id;
        } else if (pt.is_sale_return) {
          type = "Sale return";
          credit = amount;
          totalCredit = totalCredit + pt.transaction_amount;
          id = pt.sale_return.id;
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
    if (totalDebit - totalCredit < 0) {
      netTotalDebit = totalDebit + Math.abs(totalDebit - totalCredit);
    } else {
      netTotalCredit = totalCredit + Math.abs(totalDebit - totalCredit);
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
      },
    };
  });
  return data;
}
