"use strict";
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");
const {
  noDataImg,
  generatePDF,
  getDateInMMDDYYYY,
  base64_encode,
} = require("../../../config/utils");
var path = require("path");
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
    const count = await strapi.query("orders").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("orders").find(query);

    let dataToSend = [];
    await utils.asyncForEach(data, async (el) => {
      const orderRatio = await strapi.query("order-ratios").find({
        order: el.id,
      });
      let ratioData = {};
      orderRatio.forEach((r) => {
        if (r.plating) {
          ratioData[r.plating.name] = {
            ...ratioData[r.plating.name],
            [r.color.name]: {
              quantity: utils.validateNumber(r.quantity),
              quantity_completed: utils.validateNumber(r.quantity_completed),
            },
          };
        } else {
          ratioData["NA"] = {
            ...ratioData["NA"],
            [r.color.name]: {
              quantity: utils.validateNumber(r.quantity),
              quantity_completed: utils.validateNumber(r.quantity_completed),
            },
          };
        }
      });
      dataToSend.push({
        ...el,
        orderRatio: orderRatio,
        ratioData: ratioData,
      });
    });

    return {
      data: dataToSend, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    let orderData = await strapi.query("orders").findOne({
      id: id,
    });

    let designId = orderData.design.id;
    let designData = await strapi.query("designs").findOne({
      id: designId,
    });

    let orderRatio = await strapi.query("order-ratios").find(
      {
        order: id,
      },
      ["color", "plating"]
    );

    orderRatio = orderRatio.map((el) => {
      return {
        ...el,
        color: el.color.id,
        colorData: el.color,
        plating: el.plating ? el.plating.id : null,
        platingData: el.plating,
        design: el.design,
        quantity: el.quantity,
        quantityCompleted: el.quantity_completed,
        order: el.order,
      };
    });

    orderData = {
      ...orderData,
      design: designData,
      ratio: orderRatio,
    };
    ctx.send(orderData);
  },

  async create(ctx) {
    const { ratio, design, completed_quantity, order_id, party } =
      ctx.request.body;
    let body = ctx.request.body;

    if (order_id) {
      const checkIfOrderIdExist = await strapi.query("orders").find({
        order_id: order_id,
      });
      if (checkIfOrderIdExist.length) {
        return ctx.badRequest(null, "Order id already exist");
      }
    }

    const designData = await strapi.query("designs").findOne({
      id: design,
    });

    const checkDesignPartiesRelationShip = await strapi
      .query("design-parties-relationship")
      .findOne({
        design: design,
        party: party,
      });

    if (!checkDesignPartiesRelationShip) {
      await strapi
        .query("design-parties-relationship")
        .create({
          design: design,
          party: party,
        })
        .then((model) => model)
        .catch((err) => {
          console.log(err);
          throw 500;
        });
    }

    let newOrder = {};

    await bookshelf
      .transaction(async (t) => {
        if (designData) {
          newOrder = await strapi
            .query("orders")
            .create(body, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });

          if (designData.colors && designData.colors.length) {
            const designColorsData = await strapi
              .query("design-color-price")
              .find({
                design: design,
              });
            if (designColorsData && designColorsData.length) {
              /** Check previous quantites of color and update with the current one */
              let colorData = {};
              let whiteColorId = null;
              let colorPresent = [];
              designColorsData.forEach((el) => {
                if (el.color.id && el.color.name) {
                  colorData = {
                    ...colorData,
                    [el.color.id]: {
                      id: el.id,
                      color: el.color.id,
                      colorName: el.color.name,
                      oldStock: utils.validateNumber(el.stock),
                    },
                  };
                  if (el.color.name.toLowerCase() === utils.whiteColorID) {
                    whiteColorId = el.color.id;
                  } else {
                    colorPresent.push(el.color.id);
                  }
                }
              });

              let isAtleastOneColorPresent = colorPresent.length ? true : false;

              await utils.asyncForEach(ratio, async (el) => {
                let colorInRatio = el.color;
                if (
                  colorInRatio === whiteColorId ||
                  colorPresent.includes(colorInRatio)
                ) {
                  await updateStock(
                    el,
                    colorInRatio,
                    colorData,
                    t,
                    design,
                    newOrder,
                    false
                  );
                } else {
                  /** For colors not present */
                  /** Main Logic goes here */
                  let newQuantity = utils.validateNumber(el.quantityCompleted);
                  let colorPrice = 0;

                  if (
                    isAtleastOneColorPresent &&
                    el.colorData &&
                    el.colorData.name &&
                    el.colorData.name.toLowerCase() !== utils.whiteColorID
                  ) {
                    /** Need to add a condition */
                    /** Present Color takes
                     *  one color from existing
                     *  color to make a new design
                     **/
                    let presentColor = colorPresent[0];

                    const designMaterial = await strapi
                      .query("designs-and-materials")
                      .find(
                        {
                          design: design,
                          isRawMaterial: true,
                          isColor: true,
                          color: presentColor,
                        },
                        ["raw_material"]
                      );

                    /** Check which all raw materials are required to make this design if present add else create new */
                    await utils.asyncForEach(designMaterial, async (dm) => {
                      let rawMaterialData = dm.raw_material;
                      let size = rawMaterialData.size;
                      let department = rawMaterialData.department;
                      let unit = rawMaterialData.unit;
                      let is_die = rawMaterialData.is_die;
                      let category = rawMaterialData.category;
                      let color = rawMaterialData.color;

                      let rawMaterial = null;
                      let totolMaterialCostInvolved = 0;

                      if (color && color === presentColor) {
                        const searchRawMaterial = await strapi
                          .query("raw-material")
                          .findOne({
                            size: size,
                            department: department,
                            unit: unit,
                            is_die: is_die,
                            color: colorInRatio,
                            category: category,
                          });

                        if (searchRawMaterial) {
                          totolMaterialCostInvolved =
                            utils.validateNumber(dm.quantity) *
                            utils.validateNumber(searchRawMaterial.costing);
                          colorPrice = colorPrice + totolMaterialCostInvolved;
                          rawMaterial = searchRawMaterial;
                        } else {
                          /** Create a new similar entry */
                          totolMaterialCostInvolved =
                            utils.validateNumber(dm.quantity) *
                            utils.validateNumber(rawMaterialData.costing);
                          colorPrice = colorPrice + totolMaterialCostInvolved;

                          rawMaterial = await strapi
                            .query("raw-material")
                            .create(
                              {
                                ...rawMaterialData,
                                color: colorInRatio,
                                balance: 0,
                              },
                              {
                                transacting: t,
                              }
                            )
                            .then((model) => model)
                            .catch((err) => {
                              console.log(err);
                            });
                        }
                      } else {
                        rawMaterial = rawMaterialData;
                        totolMaterialCostInvolved = rawMaterialData.total_price;
                        colorPrice = colorPrice + totolMaterialCostInvolved;
                      }

                      await strapi
                        .query("designs-and-materials")
                        .create(
                          {
                            raw_material: rawMaterial.id,
                            ready_material: null,
                            design: design,
                            color: colorInRatio,
                            quantity: dm.quantity,
                            total_price: totolMaterialCostInvolved,
                            isRawMaterial: true,
                            isColor: true,
                          },
                          {
                            transacting: t,
                          }
                        )
                        .then((model) => model)
                        .catch((err) => {
                          console.log(err);
                        });
                    });
                  }

                  const designColorPriceData = await strapi
                    .query("design-color-price")
                    .create(
                      {
                        design: design,
                        color: colorInRatio,
                        color_price: colorPrice,
                        stock: newQuantity,
                      },
                      {
                        transacting: t,
                      }
                    )
                    .then((model) => model)
                    .catch((err) => {
                      console.log(err);
                    });

                  await strapi
                    .query("order-ratios")
                    .create(
                      {
                        design: design,
                        color: colorInRatio,
                        quantity: el.quantity,
                        quantity_completed: el.quantityCompleted,
                        order: newOrder.id,
                        plating: el.plating,
                      },
                      { transacting: t }
                    )
                    .then((model) => model)
                    .catch((err) => {
                      console.log(err);
                      throw 500;
                    });

                  if (el.colorData.name.toLowerCase() === utils.whiteColorID) {
                    whiteColorId = colorInRatio;
                  } else {
                    if (!colorPresent.includes(colorInRatio)) {
                      colorPresent.push(colorInRatio);
                    }
                  }

                  if (!colorData[colorInRatio]) {
                    colorData[colorInRatio] = {
                      id: designColorPriceData.id,
                      color: colorInRatio,
                      colorName: el.colorData.name,
                      oldStock: utils.validateNumber(newQuantity),
                    };
                  }
                }
              });

              if (whiteColorId) {
                colorPresent.push(whiteColorId);
              }

              await strapi.query("designs").update(
                { id: design },
                {
                  colors: colorPresent,
                },
                {
                  patch: true,
                  transacting: t,
                }
              );
            }
          } else {
            let newQuantity = utils.validateNumber(completed_quantity);
            let oldQuantity = utils.validateNumber(designData.stock);
            newQuantity = newQuantity + oldQuantity;
            await strapi
              .query("designs")
              .update(
                { id: design },
                {
                  stock: newQuantity,
                },
                { transacting: t, patch: true }
              )
              .then((model) => model)
              .catch((err) => {
                console.log(err);
                throw 500;
              });
          }
        } else {
          return ctx.badRequest(null, "Error");
        }
      })
      .then((res) => {
        ctx.send(newOrder);
      })
      .catch((err) => {
        console.log("err ", err);
        return ctx.badRequest(null, "Error");
      });
  },

  async update(ctx) {
    const { order_id, ratio } = ctx.request.body;
    const { id } = ctx.params;

    if (order_id) {
      const checkIfOrderIdExist = await strapi.query("orders").find({
        order_id: order_id,
      });
      if (checkIfOrderIdExist && checkIfOrderIdExist.length === 1) {
        if (order_id) {
          if (order_id !== checkIfOrderIdExist[0].order_id) {
            return ctx.badRequest({
              isOrderError: true,
              error: "Order Id already used",
            });
          }
        } else {
          return ctx.badRequest({
            isOrderError: false,
            error: "Error",
          });
        }
      }
    }

    const orderData = await strapi.query("orders").findOne({
      id: id,
    });
    const designId = orderData.design.id;

    let body = ctx.request.body;

    await bookshelf.transaction(async (t) => {
      await strapi
        .query("orders")
        .update({ id: id }, body, { transacting: t, patch: true })
        .then((model) => model)
        .catch((err) => {
          console.log(err);
          throw 500;
        });

      /** What if we got a new ratio */
      const designColorsData = await strapi.query("design-color-price").find({
        design: designId,
      });

      if (designColorsData && designColorsData.length) {
        /** Check previous quantites of color and update with the current one */
        let colorData = {};
        let whiteColorId = null;
        let colorPresent = [];
        designColorsData.forEach((dcData) => {
          if (dcData.color.id && dcData.color.name) {
            colorData = {
              ...colorData,
              [dcData.color.id]: {
                id: dcData.id,
                color: dcData.color.id,
                colorName: dcData.color.name,
                oldStock: utils.validateNumber(dcData.stock),
              },
            };
            if (dcData.color.name.toLowerCase() === utils.whiteColorID) {
              whiteColorId = dcData.color.id;
            } else {
              colorPresent.push(dcData.color.id);
            }
          }
        });
        let isAtleastOneColorPresent = colorPresent.length ? true : false;

        await utils.asyncForEach(ratio, async (el) => {
          if (el.id) {
            /** Find the order ratios */
            let orderRatio = await strapi.query("order-ratios").findOne(
              {
                id: el.id,
              },
              []
            );

            /** Quantity completed */
            let quantityCompleted = utils.validateNumber(el.quantityCompleted);
            let previousCompleted = utils.validateNumber(
              orderRatio.quantity_completed
            );
            /** Stock */
            let stockAvailable = colorData[el.color].oldStock;
            /**
             *  Suppose previous completed = 3
             *  so previous stock = previus stock (7) + 3 = suppose 10
             *  quantityCompleted = 5
             *  previousCompleted = 3
             *  extra completed = 2
             *  so deduct extra 2
             *
             */

            /** (5 - 3 => 2)  this means add 2 in stocks as more quantity is completed
             *
             * or (1 - 3 => -2 this means subsctract -2 from stocks as quantity completed has be revised)
             */
            let quantity_to_add_deduct = quantityCompleted - previousCompleted;
            let newStock = stockAvailable + quantity_to_add_deduct;
            colorData[el.color].oldStock = newStock;

            /** Update design */
            await strapi
              .query("design-color-price")
              .update(
                { id: colorData[el.color].id },
                {
                  stock: newStock,
                },
                { patch: true, transacting: t }
              )
              .then((model) => model)
              .catch((err) => {
                console.log(err);
                throw 500;
              });

            await strapi
              .query("order-ratios")
              .update(
                { id: orderRatio.id },
                {
                  quantity: el.quantity,
                  quantity_completed: quantityCompleted,
                },
                { patch: true, transacting: t }
              )
              .then((model) => model)
              .catch((err) => {
                console.log(err);
                throw 500;
              });
          } else {
            let colorInRatio = el.color;
            if (
              colorInRatio === whiteColorId ||
              colorPresent.includes(colorInRatio)
            ) {
              await updateStock(
                el,
                colorInRatio,
                colorData,
                t,
                designId,
                {
                  id: id,
                },
                false
              );
            } else {
              /** For colors not present */
              /** Main Logic goes here */
              let newQuantity = utils.validateNumber(el.quantityCompleted);
              let colorPrice = 0;

              if (
                isAtleastOneColorPresent &&
                el.colorData &&
                el.colorData.name &&
                el.colorData.name.toLowerCase() !== utils.whiteColorID
              ) {
                /** Need to add a condition */
                /** Present Color takes
                 *  one color from existing
                 *  color to make a new design
                 **/
                let presentColor = colorPresent[0];

                const designMaterial = await strapi
                  .query("designs-and-materials")
                  .find(
                    {
                      design: designId,
                      isRawMaterial: true,
                      isColor: true,
                      color: presentColor,
                    },
                    ["raw_material"]
                  );

                /** Check which all raw materials are required to make this design if present add else create new */
                await utils.asyncForEach(designMaterial, async (dm) => {
                  let rawMaterialData = dm.raw_material;
                  let size = rawMaterialData.size;
                  let department = rawMaterialData.department;
                  let unit = rawMaterialData.unit;
                  let is_die = rawMaterialData.is_die;
                  let category = rawMaterialData.category;
                  let color = rawMaterialData.color;

                  let rawMaterial = null;
                  let totolMaterialCostInvolved = 0;

                  if (color && color === presentColor) {
                    const searchRawMaterial = await strapi
                      .query("raw-material")
                      .findOne({
                        size: size,
                        department: department,
                        unit: unit,
                        is_die: is_die,
                        color: colorInRatio,
                        category: category,
                      });

                    if (searchRawMaterial) {
                      totolMaterialCostInvolved =
                        utils.validateNumber(dm.quantity) *
                        utils.validateNumber(searchRawMaterial.costing);
                      colorPrice = colorPrice + totolMaterialCostInvolved;
                      rawMaterial = searchRawMaterial;
                    } else {
                      /** Create a new similar entry */
                      totolMaterialCostInvolved =
                        utils.validateNumber(dm.quantity) *
                        utils.validateNumber(rawMaterialData.costing);
                      colorPrice = colorPrice + totolMaterialCostInvolved;

                      rawMaterial = await strapi
                        .query("raw-material")
                        .create(
                          {
                            ...rawMaterialData,
                            color: colorInRatio,
                            balance: 0,
                          },
                          {
                            transacting: t,
                          }
                        )
                        .then((model) => model)
                        .catch((err) => {
                          console.log(err);
                        });
                    }
                  } else {
                    rawMaterial = rawMaterialData;
                    totolMaterialCostInvolved =
                      utils.validateNumber(dm.quantity) *
                      utils.validateNumber(rawMaterialData.costing);
                    colorPrice = colorPrice + totolMaterialCostInvolved;
                  }

                  await strapi
                    .query("designs-and-materials")
                    .create(
                      {
                        raw_material: rawMaterial.id,
                        ready_material: null,
                        design: designId,
                        color: colorInRatio,
                        quantity: dm.quantity,
                        total_price: totolMaterialCostInvolved,
                        isRawMaterial: true,
                        isColor: true,
                      },
                      {
                        transacting: t,
                      }
                    )
                    .then((model) => model)
                    .catch((err) => {
                      console.log(err);
                    });
                });
              }

              const designColorPriceData = await strapi
                .query("design-color-price")
                .create(
                  {
                    design: designId,
                    color: colorInRatio,
                    color_price: colorPrice,
                    stock: newQuantity,
                  },
                  {
                    transacting: t,
                  }
                )
                .then((model) => model)
                .catch((err) => {
                  console.log(err);
                });

              await strapi
                .query("order-ratios")
                .create(
                  {
                    design: designId,
                    color: colorInRatio,
                    quantity: el.quantity,
                    quantity_completed: el.quantityCompleted,
                    order: id,
                    plating: el.plating,
                  },
                  { transacting: t }
                )
                .then((model) => model)
                .catch((err) => {
                  console.log(err);
                  throw 500;
                });

              if (el.colorData.name.toLowerCase() === utils.whiteColorID) {
                whiteColorId = colorInRatio;
              } else {
                if (!colorPresent.includes(colorInRatio)) {
                  colorPresent.push(colorInRatio);
                }
              }

              if (!colorData[colorInRatio]) {
                colorData[colorInRatio] = {
                  id: designColorPriceData.id,
                  color: colorInRatio,
                  colorName: el.colorData.name,
                  oldStock: utils.validateNumber(newQuantity),
                };
              }
            }
          }
        });

        if (whiteColorId) {
          colorPresent.push(whiteColorId);
        }

        await strapi.query("designs").update(
          { id: designId },
          {
            colors: colorPresent,
          },
          {
            patch: true,
            transacting: t,
          }
        );
      }
    });
    ctx.send(200);
  },

  async check_availibility(ctx) {
    let { id } = ctx.params;

    let finalRawMaterialJson = {};
    const ratio = await strapi.query("order-ratios").find(
      {
        order: id,
      },
      []
    );

    finalRawMaterialJson = await getRawMaterialAvailibilityPerOrder(
      finalRawMaterialJson,
      ratio,
      ctx
    );

    let arrOfMaterialKeys = Object.keys(finalRawMaterialJson);
    let jsonArray = [];

    arrOfMaterialKeys.forEach((d) => {
      jsonArray.push(finalRawMaterialJson[d]);
    });

    let buffer = utils.utilityFunctionForGettingBytesExcelData(
      jsonArray,
      `Raw Material Availibility`
    );

    /**
    * ratio = ratio.map((r) => {
      return {
        quantity: r.quantity,
        quantity_completed: r.quantityCompleted,
        color: r.color,
        name: r.colorData.name,
      };
    });
      
      const dataToSend = await getRawMaterialAvailibility(
      design,
      ratio,
      total_quantity,
      completed_quantity,
      remaining_quantity,
      buffer_quantity,
      ctx
    );
    **/

    ctx.send(buffer);
  },

  async check_all_order_availibility(ctx) {
    const { query } = utils.getRequestParams(ctx.request.query);
    const data = await strapi.query("orders").find(query);
    let finalRawMaterialJson = {};

    await utils.asyncForEach(data, async (order) => {
      const ratio = await strapi.query("order-ratios").find(
        {
          order: order.id,
        },
        []
      );
      finalRawMaterialJson = await getRawMaterialAvailibilityPerOrder(
        finalRawMaterialJson,
        ratio,
        ctx
      );
    });

    let arrOfMaterialKeys = Object.keys(finalRawMaterialJson);
    let jsonArray = [];
    let jsonArray2 = [];
    arrOfMaterialKeys.forEach((d) => {
      if (finalRawMaterialJson[d]["Difference"] < 0) {
        jsonArray2.push({
          Name: finalRawMaterialJson[d].Name,
          Category: finalRawMaterialJson[d].Category,
          "Is Die?": finalRawMaterialJson[d]["Is Die?"],
          Unit: finalRawMaterialJson[d].Unit,
          Size: finalRawMaterialJson[d].Size,
          "Current Balance": finalRawMaterialJson[d]["Current Balance"],
          /** Quantity requires for making remaining order */
          "Total Required": finalRawMaterialJson[d]["Total Required"],
          "Total need to order": finalRawMaterialJson[d].Difference,
        });
      }
      jsonArray.push(finalRawMaterialJson[d]);
    });

    let buffer = utils.utilityFunctionForGettingBytesExcelDataForMultipleSheets(
      {
        "All Raw Materials": jsonArray,
        "Raw Material Needed To Purchase": jsonArray2,
      }
    );

    /**
    * ratio = ratio.map((r) => {
      return {
        quantity: r.quantity,
        quantity_completed: r.quantityCompleted,
        color: r.color,
        name: r.colorData.name,
      };
    });
      
      const dataToSend = await getRawMaterialAvailibility(
      design,
      ratio,
      total_quantity,
      completed_quantity,
      remaining_quantity,
      buffer_quantity,
      ctx
    );
    **/

    ctx.send(buffer);
  },

  async getDepartmentSheet(ctx) {
    const { id } = ctx.params;
    let output = await getDepartmentSheetDetails(id);
    ctx.send(output);
  },

  async createUpdateDepartmentSheet(ctx) {
    const { order_id, platting, remark, departmentColorList } =
      ctx.request.body;

    const department_order_sheet = await strapi
      .query("department-order-sheet")
      .findOne({
        order: order_id,
      });
    await bookshelf.transaction(async (t) => {
      let department_order_sheet_id = null;
      if (department_order_sheet) {
        department_order_sheet_id = department_order_sheet.id;
        await strapi
          .query("department-order-sheet")
          .update(
            { id: department_order_sheet_id },
            {
              remark: remark,
              platting: platting,
            },
            { transacting: t, patch: true }
          )
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });

        await strapi
          .query("department-sheet-with-color")
          .delete(
            { department_order_sheet: department_order_sheet_id },
            { transacting: t, patch: true }
          );
      } else {
        const department_sheet_new_entry = await strapi
          .query("department-order-sheet")
          .create(
            {
              order: order_id,
              remark: remark,
              platting: platting,
            },
            { transacting: t }
          )
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });

        department_order_sheet_id = department_sheet_new_entry.id;
      }

      await utils.asyncForEach(departmentColorList, async (dcl) => {
        let department = dcl.department.id;
        let in_date =
          dcl.in_date && dcl.in_date !== ""
            ? utils.getDateInYYYYMMDD(new Date(dcl.in_date))
            : null;
        let out_date =
          dcl.out_date && dcl.out_date !== ""
            ? utils.getDateInYYYYMMDD(new Date(dcl.out_date))
            : null;

        let departmentsColor = dcl.departmentsColor;
        let count = 0;
        let department_and_color = departmentsColor.map((dc) => {
          return {
            color: dc.color.id,
            value: dc.value,
          };
        });

        await strapi
          .query("department-sheet-with-color")
          .create(
            {
              in_date: in_date,
              out_date: out_date,
              department: department,
              department_color: department_and_color,
              department_order_sheet: department_order_sheet_id,
            },
            { transacting: t }
          )
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });
      });
    });

    ctx.send(200);
  },

  async downloadOrder(ctx) {
    const orderData = await strapi.query("orders").find(ctx.request.body);

    let finalData = [];
    if (orderData.length) {
      await utils.asyncForEach(orderData, async (order) => {
        const ratio = await strapi.query("order-ratios").find({
          order: order.id,
        });
        if (ratio.length) {
          let ratioData = {};
          ratio.forEach((r) => {
            if (r.plating) {
              ratioData[r.plating.name] = {
                ...ratioData[r.plating.name],
                [r.color.name]: {
                  quantity: utils.validateNumber(r.quantity),
                  quantity_completed: utils.validateNumber(
                    r.quantity_completed
                  ),
                },
              };
            } else {
              ratioData["NA"] = {
                ...ratioData["NA"],
                [r.color.name]: {
                  quantity: utils.validateNumber(r.quantity),
                  quantity_completed: utils.validateNumber(
                    r.quantity_completed
                  ),
                },
              };
            }
          });

          let output = "";
          let platingKeys = Object.keys(ratioData);
          let na_keys = [];
          if (ratioData["NA"]) {
            na_keys = Object.keys(ratioData["NA"]);
            if (na_keys && na_keys.length) {
              na_keys.forEach((na_key) => {
                let temp =
                  utils.validateNumber(
                    ratioData["NA"][na_key]["quantity_completed"]
                  ) +
                  "/" +
                  utils.validateNumber(ratioData["NA"][na_key]["quantity"]);
                output = output + `${na_key}: ${temp}` + "\n";
              });
            }
          }

          platingKeys.forEach((p_key) => {
            if (p_key !== "NA") {
              output = output + "-----------\n" + `PLATING: ${p_key}` + "\n";
              let ratioKeys = Object.keys(ratioData[p_key]);
              ratioKeys.forEach((el) => {
                let temp =
                  utils.validateNumber(
                    ratioData[p_key][el]["quantity_completed"]
                  ) +
                  "/" +
                  utils.validateNumber(ratioData[p_key][el]["quantity"]);
                output = output + `${el}: ${temp}` + "\n";
              });
            }
          });

          let isImagePresent =
            order.design &&
            order.design.images &&
            order.design.images.length &&
            order.design.images[0].url;

          let image = noDataImg;
          if (isImagePresent)
            image =
              "data:image/png;base64," +
              base64_encode(
                path.resolve(__dirname, `./../../../public${isImagePresent}`)
              );

          finalData.push({
            orderId: order.order_id,
            design: order.design?.material_no,
            image: image,
            partyName: order.party?.party_name,
            ratio: output,
            isImagePresent: isImagePresent,
          });
        }
      });
    }
    let html = "";
    if (finalData.length) {
      html =
        html +
        `
        <br>
        <table class="table">
            <thead>
            <tr>
              <th class="th leftAlignText">Order Id</th>
              <th colspan = "3" class="th leftAlignText">Design</th>
              <th colspan = "5" class="th leftAlignText">Image</th>
              <th colspan = "5" class="th leftAlignText">Ratio</th>
            </tr>
        </thead>
        <tbody>
        `;

      finalData.forEach((fd) => {
        html =
          html +
          `
            <tr>
              <td class="td leftAlignText">${fd.orderId}</td>
              <td colspan = "3" class="td leftAlignText whiteSpacePre">${
                fd.design
              }</td>
              <th colspan = "5" class="th leftAlignText">
                <div>
                  <img
                    alt="ready_material_photo"
                    src=${fd.image}
                    class=${
                      fd.isImagePresent ? "uploadImage" : "defaultNoImage"
                    }
                  />
                </div>
              </th>
              <td colspan = "5" class="td leftAlignText whiteSpacePre">${
                fd.ratio
              }</td>
            </tr>
        `;
      });
      html =
        html +
        `
          </body>
        </table>
      `;
    } else {
      html = `<img
        src='${noDataImg}'
        class="center"
        alt="No data"
      />`;
    }

    try {
      let buffer = await generatePDF("Orders", html);
      ctx.send(buffer);
    } catch (err) {
      throw err;
    }
  },

  async downloadOrderSheet(ctx) {
    const { id } = ctx.request.body;
    const orderData = await strapi
      .query("orders")
      .findOne({ id: id }, ["party"]);
    let html = "";
    if (orderData) {
      const designData = await strapi.query("designs").findOne({
        id: orderData.design,
      });

      const ratio = await strapi.query("order-ratios").find({
        order: id,
      });
      const departments = await strapi.query("department").find();

      const department_order_sheet = await strapi
        .query("department-order-sheet")
        .findOne({
          order: id,
        });

      let department_order_sheet_with_color = [];
      if (department_order_sheet) {
        department_order_sheet_with_color = await strapi
          .query("department-sheet-with-color")
          .find(
            {
              department_order_sheet: department_order_sheet.id,
            },
            []
          );
      }

      const generateDepartmentDateTable = () => {
        let data = "";
        departments.forEach((d) => {
          let date = "-----";
          for (let i = 0; i < department_order_sheet_with_color.length; i++) {
            if (department_order_sheet_with_color[i].department === d.id) {
              date = department_order_sheet_with_color[i].in_date
                ? getDateInMMDDYYYY(
                    department_order_sheet_with_color[i].in_date
                  )
                : "-----";
            } else {
              break;
            }
          }
          data =
            data +
            `<tr> 
                <td>${d.name}</td>
                <td>${date}</td>
              </tr>`;
        });
        return data;
      };

      const generateTbodyForRatio = () => {
        let data = `<br>
                    <br>
                    <table>
                      <th>Ratio with Plating</th>
                        <tr>`;
        if (ratio.length) {
          let ratioData = {};
          ratio.forEach((r) => {
            if (r.plating) {
              ratioData[r.plating.name] = {
                ...ratioData[r.plating.name],
                [r.color.name]: {
                  quantity: utils.validateNumber(r.quantity),
                  quantity_completed: utils.validateNumber(
                    r.quantity_completed
                  ),
                },
              };
            } else {
              ratioData["NA"] = {
                ...ratioData["NA"],
                [r.color.name]: {
                  quantity: utils.validateNumber(r.quantity),
                  quantity_completed: utils.validateNumber(
                    r.quantity_completed
                  ),
                },
              };
            }
          });

          let output = "";
          let platingKeys = Object.keys(ratioData);
          let na_keys = [];
          if (ratioData["NA"]) {
            na_keys = Object.keys(ratioData["NA"]);
            if (na_keys && na_keys.length) {
              na_keys.forEach((na_key) => {
                let temp =
                  utils.validateNumber(
                    ratioData["NA"][na_key]["quantity_completed"]
                  ) +
                  "/" +
                  utils.validateNumber(ratioData["NA"][na_key]["quantity"]);
                output = output + `${na_key}: ${temp}` + "\n";
              });
            }
          }

          platingKeys.forEach((p_key) => {
            if (p_key !== "NA") {
              output =
                output +
                "---------------------------------\n" +
                `PLATING: ${p_key}` +
                "\n";
              let ratioKeys = Object.keys(ratioData[p_key]);
              ratioKeys.forEach((el) => {
                let temp =
                  utils.validateNumber(
                    ratioData[p_key][el]["quantity_completed"]
                  ) +
                  "/" +
                  utils.validateNumber(ratioData[p_key][el]["quantity"]);
                output = output + `${el}: ${temp}` + "\n";
              });
            }
          });
          data =
            data + `<td class="td leftAlignText whiteSpacePre">${output}</td>`;
        }
        data = data + ` </tr></table>`;
        return data;
      };

      const generateTBodyForDesign = () => {
        let data = "";
        let image = noDataImg;
        if (
          designData.images &&
          designData.images.length &&
          designData.images[0].url
        ) {
          image =
            "data:image/png;base64," +
            base64_encode(
              path.resolve(
                __dirname,
                `./../../../public${designData.images[0].url}`
              )
            );
        }
        data =
          data +
          `<div class="row">
            <div class="column">
              <table>
                <tr>
                  <th>Order Date</th>
                  <td>${getDateInMMDDYYYY(orderData.date)}
                  </td>
                </tr>
                <tr>
                  <th>Order No</th>
                  <td>${orderData.order_id}</td>
                </tr>
                <tr>
                  <th>NL No</th>
                  <td>${designData.material_no}</td>
                </tr>
                <tr>
                  <th>Order Quantity</th>
                  <td>${orderData.quantity}</td>
                </tr>
                <tr>
                  <td rowspan = "10" colspan = "2" style= "align-content : center;" >
                    <img
                    src='${image}'
                    class="center"
                    alt="No data"
                    />
                  </td>
                </tr>
              </table>
            </div>
            <div class="column1">
              <table>
                <tr>
                  <th>Department Name</th>
                  <th>Date</th>
                </tr>
                ${generateDepartmentDateTable()}
              </table>
            </div>
          </div>
          `;

        return data;
      };

      html = html + generateTBodyForDesign() + generateTbodyForRatio();
    } else {
      html = `<img
        src='${noDataImg}'
        class="center"
        alt="No data"
      />`;
    }
    let buffer = await generatePDF("Order Sheet", html);
    ctx.send(buffer);
  },

  async delete(ctx) {
    const { orderId, colorId, designId, platingId } = ctx.params;

    if (orderId) {
      const orderData = await strapi.query("orders").findOne({
        id: orderId,
      });

      if (!orderData) {
        return ctx.badRequest(null, "Order doesn't exist");
      } else {
        try {
          await bookshelf.transaction(async (t) => {
            await deleteIndividualRatioInfoFromOrder(
              orderId,
              designId,
              colorId,
              platingId,
              t
            );
          });
          ctx.send(200);
        } catch (error) {
          return ctx.badRequest(null, "Issue deleting order data");
        }
      }
    }
  },

  async deleteFullOrder(ctx) {
    const { orderId } = ctx.params;
    const orderRatios = await strapi.query("order-ratios").find({
      order: orderId,
    });

    try {
      await bookshelf.transaction(async (t) => {
        await utils.asyncForEach(orderRatios, async (or) => {
          await deleteIndividualRatioInfoFromOrder(
            orderId,
            or.design.id,
            or.color.id,
            or.plating ? or.plating.id : null,
            t
          );
        });
        await strapi.query("orders").delete(
          {
            id: orderId,
          },
          {
            patch: true,
            transacting: t,
          }
        );
      });
      ctx.send(200);
    } catch (error) {
      return ctx.badRequest(null, "Issue deleting order");
    }
  },
};

const deleteIndividualRatioInfoFromOrder = async (
  orderId,
  designId,
  colorId,
  platingId,
  t
) => {
  /** get corresponding order details */
  let orderRatios = await strapi.query("order-ratios").findOne({
    order: orderId,
    design: designId,
    color: colorId,
    plating: platingId,
  });

  if (orderRatios) {
    let completedQuantity = utils.validateNumber(
      orderRatios.quantity_completed
    );
    const designColorPrice = await strapi.query("design-color-price").findOne({
      design: designId,
      color: colorId,
    });
    if (designColorPrice) {
      const colorStock = utils.validateNumber(designColorPrice.stock);
      const newStock = utils.validateNumber(colorStock - completedQuantity);
      await strapi
        .query("design-color-price")
        .update(
          { id: designColorPrice.id },
          {
            stock: newStock,
          },
          { transacting: t, patch: true }
        )
        .then((model) => model)
        .catch((err) => {
          console.log(err);
          throw new Error("some error");
        });

      /** Delete data from order ratios */
      await strapi.query("order-ratios").delete(
        {
          id: orderRatios.id,
        },
        {
          patch: true,
          transacting: t,
        }
      );
    } else {
      throw new Error("some error");
    }
  } else {
    throw new Error("No order data found");
  }
};

const getRawMaterialAvailibilityPerOrder = async (
  finalRawMaterialJson,
  ratio,
  ctx
) => {
  await utils.asyncForEach(ratio, async (or) => {
    console.log(
      "------------------------------------------------------------------------------------------"
    );
    let totalQuantity = utils.validateNumber(or.quantity);
    let quantityCompleted = utils.validateNumber(or.quantity_completed);
    let remainingQuantity = totalQuantity - quantityCompleted;

    const designMaterial = await strapi.query("designs-and-materials").find(
      {
        design: or.design,
        color: or.color,
        isRawMaterial: true,
        isColor: true,
      },
      [
        "raw_material",
        "raw_material.category",
        "raw_material.department",
        "raw_material.unit",
        "ready_material",
      ]
    );

    const designMaterialWithoutColor = await strapi
      .query("designs-and-materials")
      .find(
        {
          design: or.design,
          isRawMaterial: true,
          isColor: false,
        },
        [
          "raw_material",
          "raw_material.category",
          "raw_material.department",
          "raw_material.unit",
          "ready_material",
        ]
      );

    const concatedArray = designMaterial.concat(designMaterialWithoutColor);

    if (concatedArray.length) {
      concatedArray.forEach((dM) => {
        let rawMaterialId = dM?.raw_material?.id;
        if (rawMaterialId) {
          /** Quantity requires for making single piece of design */
          let quantityRequiredPerPieceOfDesign = utils.validateNumber(
            dM.quantity
          );
          /** Price of single raw material */
          let ppp = utils.validateNumber(dM?.raw_material?.costing);
          /** Balance */
          let rawMaterialBalance = utils.validateNumber(
            dM?.raw_material?.balance
          );
          /** Total raw material required for remaining quantity
           *  Quantity for single piece  *  remaining quantity
           */
          let totalMaterialsRequiredForRemainingQuantity =
            quantityRequiredPerPieceOfDesign * remainingQuantity;
          let totalMaterialsUsedForCompletedQuantity =
            quantityRequiredPerPieceOfDesign * quantityCompleted;
          let costofRawMaterialRequiredForOrderCompletion =
            totalMaterialsRequiredForRemainingQuantity * ppp;
          let costofRawMaterialUsedForCompletedQuantity =
            totalMaterialsUsedForCompletedQuantity * ppp;
          let difference =
            rawMaterialBalance - totalMaterialsRequiredForRemainingQuantity;

          let rawMaterialData = {
            Name: dM?.raw_material?.name,
            Category: dM.raw_material?.category?.name,
            "Is Die?": dM?.raw_material?.is_die,
            Unit: dM?.raw_material?.unit?.name,
            Size: dM?.raw_material?.size,
            "Current Balance": rawMaterialBalance,
            /** Quantity requires for making remaining order */
            "Total Required": totalMaterialsRequiredForRemainingQuantity,
            Difference: difference,
            /** Quantity required for making completed order */
            "Total Used": totalMaterialsUsedForCompletedQuantity,
            /** Price of single raw material */
            "Costing (Rs:-)": ppp,
            /** Cost of raw material for completing order */
            "Cost for order completion (Rs:-)":
              costofRawMaterialRequiredForOrderCompletion,
            /** Cost of raw material required for completed order */
            "Cost incurred for completed orders (Rs:-)":
              costofRawMaterialUsedForCompletedQuantity,
          };

          if (finalRawMaterialJson.hasOwnProperty(rawMaterialId)) {
            console.log(
              "------------------------------------------------------------------------------------------"
            );
            let temp1 = finalRawMaterialJson[rawMaterialId]["Total Required"];
            let temp2 = finalRawMaterialJson[rawMaterialId]["Total Used"];
            let temp3 =
              finalRawMaterialJson[rawMaterialId][
                "Cost for order completion (Rs:-)"
              ];
            let temp4 =
              finalRawMaterialJson[rawMaterialId][
                "Cost incurred for completed orders (Rs:-)"
              ];
            let temp5 = finalRawMaterialJson[rawMaterialId]["Difference"];
            console.log(
              "------------------------------------------------------------------------------------------"
            );

            finalRawMaterialJson = {
              ...finalRawMaterialJson,
              [rawMaterialId]: {
                ...finalRawMaterialJson[rawMaterialId],
                ["Total Required"]:
                  temp1 + totalMaterialsRequiredForRemainingQuantity,
                ["Total Used"]: temp2 + totalMaterialsUsedForCompletedQuantity,
                ["Cost for order completion (Rs:-)"]:
                  temp3 + costofRawMaterialRequiredForOrderCompletion,
                ["Cost incurred for completed orders (Rs:-)"]:
                  temp4 + costofRawMaterialUsedForCompletedQuantity,
                Difference: temp5 + difference,
              },
            };
          } else {
            finalRawMaterialJson = {
              ...finalRawMaterialJson,
              [rawMaterialId]: {
                ...rawMaterialData,
              },
            };
          }
        }
      });
    }
  });
  return finalRawMaterialJson;
};

const getRawMaterialAvailibility = async (
  designId,
  orderRatio,
  total_quantity,
  completed_quantity,
  remaining_quantity,
  buffer_quantity,
  ctx
) => {
  let totalQuantity = isNaN(parseFloat(total_quantity))
    ? 0
    : parseFloat(total_quantity);
  let completedQuantity = isNaN(parseFloat(completed_quantity))
    ? 0
    : parseFloat(completed_quantity);
  /** Remaining design quantites to make */
  let remainingQuantity = isNaN(parseFloat(remaining_quantity))
    ? 0
    : parseFloat(remaining_quantity);
  let bufferQuantity = isNaN(parseFloat(buffer_quantity))
    ? 0
    : parseFloat(buffer_quantity);

  let finalDataToSend = {
    total_quantity: totalQuantity,
    quantity_completed: completedQuantity,
    remaining_quantity: remainingQuantity,
    buffer_quantity: bufferQuantity,
    rawMaterials: [],
    isColorPresent: false,
  };

  if (orderRatio.length) {
    finalDataToSend = {
      ...finalDataToSend,
      isColorPresent: true,
      orderRatios: {},
    };

    await utils.asyncForEach(orderRatio, async (or) => {
      /** General calculation for single ratio */
      let totalQuantity = utils.validateNumber(or.quantity);
      let quantityCompleted = utils.validateNumber(or.quantity_completed);
      let remainingQuantity = totalQuantity - quantityCompleted;

      const designMaterial = await strapi.query("designs-and-materials").find(
        {
          design: designId,
          color: or.color,
          isRawMaterial: true,
          isColor: true,
        },
        [
          "raw_material",
          "raw_material.category",
          "raw_material.department",
          "raw_material.unit",
          "ready_material",
        ]
      );

      if (designMaterial.length) {
        designMaterial.forEach((dM) => {
          /** Quantity requires for making single piece of design */
          let quantityRequiredPerPieceOfDesign = utils.validateNumber(
            dM.quantity
          );
          /** Price of single raw material */
          let ppp = utils.validateNumber(dM?.raw_material?.costing);
          /** Cost of raw material for making single design */
          let costOfRawMaterialPerDesign =
            quantityRequiredPerPieceOfDesign * ppp;
          /** Balance */
          let rawMaterialBalance = utils.validateNumber(
            dM?.raw_material?.balance
          );
          /** Total raw material required for remaining quantity
           *  Quantity for single piece  *  remaining quantity
           */
          let totalMaterialsRequiredForRemainingQuantity =
            quantityRequiredPerPieceOfDesign * remainingQuantity;

          let rawMaterialData = {
            id: dM?.raw_material?.id,
            name: dM?.raw_material?.name,
            currentBalance: rawMaterialBalance,
            category: dM.raw_material?.category?.name,
            unit: dM?.raw_material?.unit?.name,
            isDie: dM?.raw_material?.is_die,
            size: dM?.raw_material?.size,
            /** Price of single raw material */
            ppp: ppp,
            /** Quantity requires for making single piece of design */
            quantityRequiredPerPieceOfDesign: quantityRequiredPerPieceOfDesign,
            /** Cost of raw material for making single design */
            costOfRawMaterialPerDesign: costOfRawMaterialPerDesign,
          };
        });
      } else {
      }
    });

    orderRatio.forEach((or) => {
      let totalQuantity = isNaN(parseFloat(or.quantity))
        ? 0
        : parseFloat(or.quantity);
      let quantityCompleted = isNaN(parseFloat(or.quantity_completed))
        ? 0
        : parseFloat(or.quantity_completed);
      let remaining_quantity = totalQuantity - quantityCompleted;
      finalDataToSend = {
        ...finalDataToSend,
        orderRatios: {
          ...finalDataToSend.orderRatios,
          [or.color]: {
            name: or.name,
            total_quantity: totalQuantity,
            quantity_completed: quantityCompleted,
            remaining_quantity: remaining_quantity,
            rawMaterials: [],
          },
        },
      };
    });
  }

  const designMaterial = await strapi.query("designs-and-materials").find(
    {
      design: designId,
    },
    [
      "raw_material",
      "raw_material.category",
      "raw_material.department",
      "raw_material.unit",
      "ready_material",
    ]
  );

  designMaterial.forEach((dM) => {
    let quantityRequiredPerPieceOfDesign = utils.validateNumber(dM.quantity);
    let rawMaterialBalance = utils.validateNumber(dM.raw_material?.balance);
    let totalMaterialsRequiredForRemainingQuantity = 0;
    let remainingRawMaterial = 0;
    let ppp = utils.validateNumber(dM.raw_material?.costing);
    let costOfRawMaterialPerDesign = quantityRequiredPerPieceOfDesign * ppp;

    let rawMaterialData = {
      id: dM.raw_material?.id,
      name: dM.raw_material?.name,
      currentBalance: rawMaterialBalance,
      category: dM.raw_material?.category?.name,
      unit: dM.raw_material?.unit?.name,
      isDie: dM.raw_material?.is_die,
      size: dM.raw_material?.size,
      ppp: utils.validateNumber(dM.raw_material?.costing),
      costOfRawMaterialPerDesign: costOfRawMaterialPerDesign,
      quantityRequiredPerPieceOfDesign: quantityRequiredPerPieceOfDesign,
    };

    if (dM.isColor && dM.color) {
      /** Remaining design quantites to make */
      let remainingQuantity = utils.validateNumber(
        finalDataToSend.orderRatios[dM.color].remaining_quantity
      );
      /** Total Raw Materials Required ===  */
      totalMaterialsRequiredForRemainingQuantity =
        quantityRequiredPerPieceOfDesign * remainingQuantity;
      let totalApproxPriceRequiredToBuyPendingRawMaterial = 0;
      remainingRawMaterial =
        rawMaterialBalance - totalMaterialsRequiredForRemainingQuantity;
      if (remainingRawMaterial < 0) {
        totalApproxPriceRequiredToBuyPendingRawMaterial =
          ppp * remainingRawMaterial;
      }

      /** Push final Data */
      finalDataToSend.orderRatios[dM.color].rawMaterials.push({
        ...rawMaterialData,
        totalMaterialsRequiredForRemainingQuantity:
          totalMaterialsRequiredForRemainingQuantity,
        remainingRawMaterialBalanceAfterOrder: remainingRawMaterial,
        /** Price required to purchase raw materials not present */
        totalApproxPriceRequiredToBuyPendingRawMaterial:
          totalApproxPriceRequiredToBuyPendingRawMaterial,
        totalRawMaterialPriceRequiredToMakeRemainingDesigns:
          remainingQuantity * costOfRawMaterialPerDesign,
      });
    } else {
      totalMaterialsRequiredForRemainingQuantity =
        quantityRequiredPerPieceOfDesign * remainingQuantity;
      remainingRawMaterial =
        rawMaterialBalance - totalMaterialsRequiredForRemainingQuantity;
      let totalApproxPriceRequiredToBuyPendingRawMaterial = 0;
      if (remainingRawMaterial < 0) {
        totalApproxPriceRequiredToBuyPendingRawMaterial =
          ppp * remainingRawMaterial;
      }
      /** Push final Data */
      finalDataToSend.rawMaterials.push({
        ...rawMaterialData,
        totalMaterialsRequiredForRemainingQuantity:
          totalMaterialsRequiredForRemainingQuantity,
        remainingRawMaterialBalanceAfterOrder: remainingRawMaterial,
        /** Price required to purchase raw materials not present */
        totalApproxPriceRequiredToBuyPendingRawMaterial:
          totalApproxPriceRequiredToBuyPendingRawMaterial,
        totalRawMaterialPriceRequiredToMakeRemainingDesigns:
          remainingQuantity * costOfRawMaterialPerDesign,
      });
    }
  });

  return finalDataToSend;
};

const getDepartmentSheetDetails = async (id) => {
  let output = {};

  const departments = await strapi.query("department").find();
  const departmentList = departments.map((r) => {
    return {
      id: r.id,
      name: r.name,
    };
  });

  const orderDetail = await strapi.query("orders").findOne({
    id: id,
  });

  const orderRatio = await strapi.query("order-ratios").find({
    order: id,
  });

  const ratio = orderRatio;
  const colorList = ratio.map((r) => {
    if (r.color) {
      let color = r.color;
      return {
        id: color.id,
        name: color.name,
        quantity: r.quantity,
        quantityCompleted: r.quantity_completed,
      };
    }
  });

  output = {
    ...output,
    order_id: id,
    nl_no: orderDetail?.design?.material_no
      ? orderDetail.design.material_no
      : "----",
    quantity: orderDetail.quantity,
    order_date: orderDetail.date,
    order_no: orderDetail.order_id,
    colorList: colorList,
    departmentList: departmentList,
  };

  const department_order_sheet = await strapi
    .query("department-order-sheet")
    .findOne({
      order: id,
    });

  if (department_order_sheet) {
    const department_order_sheet_with_color = await strapi
      .query("department-sheet-with-color")
      .find({
        department_order_sheet: department_order_sheet.id,
      });

    const departmentColorList = department_order_sheet_with_color.map((i) => {
      const department_color = colorList.map((c) => {
        let colorName = c.name;
        let isColorFound = 0;
        let dataToSend = {};
        for (let dc = 0; dc < i.department_color.length; dc++) {
          if (
            i.department_color[dc].color &&
            i.department_color[dc].color.name === colorName
          ) {
            dataToSend = {
              color: c,
              value: i.department_color[dc].value,
            };
            isColorFound = 1;
            break;
          }
        }
        if (!isColorFound) {
          dataToSend = {
            color: c,
            value: 0,
          };
        }
        return dataToSend;
      });

      return {
        department: i.department,
        departmentsColor: department_color,
        in_date: i.in_date,
        out_date: i.out_date,
      };
    });
    output = {
      ...output,
      platting: department_order_sheet.platting,
      remark: department_order_sheet.remark,
      departmentColorList: departmentColorList,
    };
  } else {
    const departmentColorList = departmentList.map((d) => {
      let singleDepartmentColor = colorList.map((c) => {
        return {
          color: c,
          value: 0,
        };
      });
      return {
        department: d,
        departmentsColor: singleDepartmentColor,
        in_date: null,
        out_date: null,
      };
    });
    output = {
      ...output,
      platting: "",
      remark: "",
      departmentColorList: departmentColorList,
    };
  }

  return output;
};

const updateStock = async (
  el,
  colorInRatio,
  colorData,
  t,
  design,
  order,
  updateOrderRatio
) => {
  /** No logic just calculate the stocks */
  let newQuantity = utils.validateNumber(el.quantityCompleted);
  let oldQuantity = colorData[colorInRatio].oldStock;
  newQuantity = newQuantity + oldQuantity;
  /** Update oldStock in json */
  await strapi
    .query("design-color-price")
    .update(
      { id: colorData[colorInRatio].id },
      {
        stock: newQuantity,
      },
      { transacting: t, patch: true }
    )
    .then((model) => model)
    .catch((err) => {
      console.log(err);
      throw 500;
    });

  if (updateOrderRatio) {
    let orderRatio = await strapi.query("order-ratios").findOne(
      {
        id: el.id,
      },
      []
    );

    await strapi
      .query("order-ratios")
      .update(
        { id: orderRatio.id },
        {
          quantity: el.quantity,
          quantity_completed: el.quantityCompleted,
        },
        { transacting: t }
      )
      .then((model) => model)
      .catch((err) => {
        console.log(err);
        throw 500;
      });
  } else {
    await strapi
      .query("order-ratios")
      .create(
        {
          design: design,
          color: colorInRatio,
          plating: el.plating,
          quantity: el.quantity,
          quantity_completed: el.quantityCompleted,
          order: order.id,
        },
        { transacting: t }
      )
      .then((model) => model)
      .catch((err) => {
        console.log(err);
        throw 500;
      });
  }

  colorData[colorInRatio].oldStock = newQuantity;
};
