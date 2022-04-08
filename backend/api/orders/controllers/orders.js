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
      dataToSend.push({
        ...el,
        orderRatio: orderRatio,
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
      ["color"]
    );

    orderRatio = orderRatio.map((el) => {
      return {
        ...el,
        color: el.color.id,
        colorData: el.color,
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
    const { ratio, design, completed_quantity, order_id } = ctx.request.body;
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
            if (designColorsData.length) {
              /** Check previous quantites of color and update with the current One */
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
                  if (el.color.name.toLowerCase() === "white") {
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
                    newOrder
                  );
                } else {
                  /** For colors not present */
                  /** Main Logic goes here */
                  let newQuantity = utils.validateNumber(el.quantityCompleted);
                  colorPresent.push(colorInRatio);

                  if (isAtleastOneColorPresent) {
                    /** Present Color takes
                     *  one color from existing
                     *  color to make a new design
                     **/
                    let presentColor = colorPresent[0];
                    let colorPrice = 0;

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
                        totolMaterialCostInvolved = rawMaterialData.total_pricd;
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

                    await strapi
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
                        },
                        { transacting: t }
                      )
                      .then((model) => model)
                      .catch((err) => {
                        console.log(err);
                        throw 500;
                      });
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

      await utils.asyncForEach(ratio, async (el) => {
        let orderRatio = await strapi.query("order-ratios").findOne(
          {
            design: designId,
            order: id,
            color: el.color,
          },
          []
        );

        let designPrice = await strapi.query("design-color-price").findOne(
          {
            design: designId,
            color: el.color,
          },
          []
        );

        /** Quantity completed */
        let quantityCompleted = utils.validateNumber(el.quantityCompleted);
        let previousCompleted = utils.validateNumber(
          orderRatio.quantity_completed
        );
        /** Stock */
        let stockAvailable = utils.validateNumber(designPrice.stock);

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

        /** Update design */
        await strapi
          .query("design-color-price")
          .update(
            { id: designPrice.id },
            {
              stock: newStock,
            },
            { transacting: t, patch: true }
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
              quantity_completed: quantityCompleted,
            },
            { transacting: t, patch: true }
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
        "Raw Material Availibility": jsonArray,
        "Need to purchase": jsonArray2,
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

  async check_availibility1(ctx) {
    const { ready_material, ratio, remaining_quantity } = ctx.request.body;
    const raw_material_details_without_color = await strapi
      .query("raw-material-and-quantity-for-ready-material")
      .find(
        {
          ready_material: ready_material,
          isColorDependent: false,
        },
        [
          "ready_material",
          "raw_material",
          "raw_material.department",
          "raw_material.unit",
          "raw_material.color",
          "raw_material.category",
        ]
      );

    const raw_material_details_with_color = await strapi
      .query("raw-material-and-quantity-for-ready-material")
      .find(
        {
          ready_material: ready_material,
          isColorDependent: true,
        },
        [
          "ready_material",
          "raw_material",
          "raw_material.department",
          "raw_material.unit",
          "raw_material.color",
          "raw_material.category",
        ]
      );
    let dataToSend = {
      raw_material_without_color: [],
    };
    await utils.asyncForEach(ratio, async (r) => {
      dataToSend = {
        ...dataToSend,
        [r.name]: [],
      };
      let color = r.color;
      let remaining_quantity =
        parseFloat(r.quantity) - parseFloat(r.quantity_completed);
      await utils.asyncForEach(raw_material_details_with_color, async (rm) => {
        if (
          rm.raw_material &&
          rm.raw_material.department &&
          rm.raw_material.category
        ) {
          let raw_material_with_color = await strapi
            .query("raw-material")
            .find({
              department: rm.raw_material.department.id,
              category: rm.raw_material.category.id,
              size: rm.raw_material.size,
              color: color,
            });

          raw_material_with_color = raw_material_with_color.map((rmc) => {
            let raw_material_balance = parseFloat(rmc.balance);
            let required_quantity_pp = parseFloat(rm.quantity);
            let total_required_quantity_for_order =
              required_quantity_pp * parseFloat(remaining_quantity);
            let total_remaining_raw_material =
              raw_material_balance - total_required_quantity_for_order;
            return {
              ...rmc,
              total_remaining_raw_material: total_remaining_raw_material,
              quantity_per_ready_material: required_quantity_pp,
              total_required_quantity_for_order:
                total_required_quantity_for_order,
              raw_material_balance: raw_material_balance,
              total_remaining_ready_material: parseFloat(remaining_quantity),
            };
          });
          dataToSend = {
            ...dataToSend,
            [r.name]: [...dataToSend[r.name], ...raw_material_with_color],
          };
        }
      });
    });

    const raw_material_details_without_color_to_send =
      raw_material_details_without_color.map((r) => {
        let raw_material_balance = parseFloat(
          r.raw_material ? r.raw_material.balance : 0
        );
        let required_quantity_pp = parseFloat(r.quantity);
        let total_required_quantity_for_order =
          required_quantity_pp * parseFloat(remaining_quantity);
        let total_remaining_raw_material =
          raw_material_balance - total_required_quantity_for_order;
        return {
          ...r.raw_material,
          total_remaining_raw_material: total_remaining_raw_material,
          quantity_per_ready_material: required_quantity_pp,
          total_required_quantity_for_order: total_required_quantity_for_order,
          raw_material_balance: raw_material_balance,
          total_remaining_ready_material: parseFloat(remaining_quantity),
        };
      });

    dataToSend = {
      ...dataToSend,
      raw_material_without_color: raw_material_details_without_color_to_send,
    };

    ctx.send(dataToSend);
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
          let output = "";
          ratio.forEach((el, index) => {
            const temp =
              el.color?.name +
              ": " +
              utils.validateNumber(el.quantity_completed) +
              "/" +
              utils.validateNumber(el.quantity);
            if (index === 0) {
              output = output + temp;
            } else {
              output = output + ", " + temp;
            }
          });

          finalData.push({
            orderId: order.order_id,
            design: order.design?.material_no,
            partyName: order.party?.party_name,
            ratio: output,
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
              <th colspan = "2" class="th leftAlignText">Order Id</th>
              <th colspan = "2" class="th leftAlignText">Design</th>
              <th colspan = "4" class="th leftAlignText">Party Name</th>
              <th colspan = "6" class="th leftAlignText">Ratio</th>
            </tr>
        </thead>
        <tbody>
        `;

      finalData.forEach((fd) => {
        html =
          html +
          `
            <tr>
              <td colspan = "2" class="td leftAlignText">${fd.orderId}</td>
              <td colspan = "2" class="td leftAlignText">${fd.design}</td>
              <td colspan = "4" class="td leftAlignText">${fd.partyName}</td>
              <td colspan = "6" class="td leftAlignText">${fd.ratio}</td>
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
                      <tr>`;
        ratio.forEach((r) => {
          data = data + ` <th>${r.color.name}</th>`;
        });
        data = data + `</tr>`;
        ratio.forEach((r) => {
          data = data + `<td>${r.quantity_completed} / ${r.quantity} </td>`;
        });
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
                  <td rowspan = "20" colspan = "2" style= "align-content : center;" >
                    <img
                    src='${image}'
                    class="center"
                    alt="No data"
                    height="15rem"
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
};

const getRawMaterialAvailibilityPerOrder = async (
  finalRawMaterialJson,
  ratio,
  ctx
) => {
  await utils.asyncForEach(ratio, async (or) => {
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

    if (designMaterial.length) {
      designMaterial.forEach((dM) => {
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

          if (
            finalRawMaterialJson.hasOwnProperty(rawMaterialId) &&
            finalRawMaterialJson.rawMaterialId
          ) {
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
  newOrder
) => {
  /** No logic just calculate the stocks */
  let newQuantity = utils.validateNumber(el.quantityCompleted);
  let oldQuantity = colorData[colorInRatio].oldStock;
  newQuantity = newQuantity + oldQuantity;
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
  await strapi
    .query("order-ratios")
    .create(
      {
        design: design,
        color: colorInRatio,
        quantity: el.quantity,
        quantity_completed: el.quantityCompleted,
        order: newOrder.id,
      },
      { transacting: t }
    )
    .then((model) => model)
    .catch((err) => {
      console.log(err);
      throw 500;
    });
};
