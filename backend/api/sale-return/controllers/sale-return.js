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
    const count = await strapi.query("sale-return").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("sale-return").find(query);

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
      .query("sale-return")
      .findOne({ id: id }, ["party", "sale"]);

    if (sale_data.sale) {
      let individual_sale_ready_material = await strapi
        .query("individual-sale-ready-material")
        .find({
          sale: sale_data.sale.id,
        });

      let sale_ready_material = [];
      if (
        individual_sale_ready_material &&
        individual_sale_ready_material.length
      ) {
        await utils.asyncForEach(individual_sale_ready_material, async (el) => {
          console.log("el => ", el);
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
    }

    ctx.send(sale_data);
  },

  async create(ctx) {
    const { id, state, designAndColor } = ctx.request.body;
    const {
      date,
      kachha_ledger,
      pakka_ledger,
      total_price,
      notes,
      sale,
      sale_return_no,
      saleDate,
      saleBillNo,
      party,
    } = state;

    let transaction_amount = utils.validateNumber(total_price);

    let data = {
      date: utils.getDateInYYYYMMDD(new Date(date)),
      notes: notes,
      total_price: transaction_amount,
      kachha_ledger: kachha_ledger,
      pakka_ledger: pakka_ledger,
      sale: sale,
      sale_return_no: sale_return_no,
      party: party,
    };

    await bookshelf
      .transaction(async (t) => {
        let saleReturnData = null;
        let saleReturnId = null;
        if (id) {
          saleReturnData = await strapi
            .query("sale-return")
            .update({ id: id }, data, {
              patch: true,
              transacting: t,
            });

          saleReturnId = id;
        } else {
          saleReturnData = await strapi
            .query("sale-return")
            .create(data, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });

          saleReturnId = saleReturnData.id;
        }

        let salePaymentTransaction = {
          sale: null,
          sale_payment: null,
          sale_return: saleReturnId,
          party: party,
          transaction_date: utils.getDateInYYYYMMDD(new Date(date)),
          month: new Date(date).getMonth() + 1,
          year: new Date(date).getFullYear(),
          comment: "Sale Return for Sale " + saleBillNo,
          transaction_amount: transaction_amount,
          is_sale: false,
          is_payment: false,
          is_sale_return: true,
          kachha_ledger: kachha_ledger,
          pakka_ledger: pakka_ledger,
        };

        let saleReturnTxnId = await strapi
          .query("sale-payment-transaction")
          .findOne({
            sale_return: saleReturnId,
          });

        if (saleReturnTxnId) {
          await strapi
            .query("sale-payment-transaction")
            .update({ id: saleReturnTxnId.id }, salePaymentTransaction, {
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

        let designColorArray = Object.keys(designAndColor);
        if (
          Object.prototype.toString.call(designColorArray) ===
            "[object Array]" &&
          designColorArray.length
        ) {
          await utils.asyncForEach(designColorArray, async (el) => {
            if (designAndColor[el].is_ready_material) {
              let colorArray = designAndColor[el].allColors;
              if (
                Object.prototype.toString.call(colorArray) ===
                  "[object Array]" &&
                colorArray.length
              ) {
                await utils.asyncForEach(colorArray, async (el1) => {
                  let { design, color, quantity_to_add_deduct, id } = el1;
                  /** get design color data */
                  let designColorData = await strapi
                    .query("design-color-price")
                    .findOne({ design: design, color: color });

                  /** get color stock */
                  let designColorQuantity = utils.validateNumber(
                    designColorData.stock
                  );
                  let quantityToDeduct = 0;
                  quantityToDeduct = utils.validateNumber(
                    quantity_to_add_deduct
                  );
                  /** Final quantity */
                  let final_quantity = designColorQuantity + quantityToDeduct;
                  /** Update quantity */
                  await strapi.query("design-color-price").update(
                    { id: designColorData.id },
                    {
                      stock: final_quantity,
                    },
                    { patch: true, transacting: t }
                  );

                  await strapi.query("individual-sale-ready-material").update(
                    { id: id },
                    {
                      returned_quantity: utils.validateNumber(
                        el1.returned_quantity
                      ),
                      return_total_price: utils.validateNumber(
                        el1.return_total_price
                      ),
                      return_price_per_unit: utils.validateNumber(
                        el1.return_price_per_unit
                      ),
                    },
                    { patch: true, transacting: t }
                  );
                });
              }
            }
          });
        }
      })
      .then((res) => {
        ctx.send(200);
      })
      .catch((err) => {
        console.log("err ", err);
        return ctx.badRequest(null, "Error");
      });
  },
};

const getReadyMaterialForSale = (arr) => {
  let finalArr = [];
  for (var s of arr) {
    let { ready_material, quantity, total_price, isDeleted, isCannotDelete } =
      s;
    if (isCannotDelete) {
      if (!isDeleted) {
        finalArr.push({
          ready_material: ready_material.id,
          quantity: quantity,
          total_price: total_price,
        });
      }
    } else {
      finalArr.push({
        ready_material: ready_material.id,
        quantity: quantity,
        total_price: total_price,
      });
    }
  }
  return finalArr;
};
