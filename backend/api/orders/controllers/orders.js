"use strict";
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");
const { convertNumber } = require("../../../config/utils");

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

    await bookshelf
      .transaction(async (t) => {
        if (designData) {
          const newOrder = await strapi
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
              designColorsData.forEach((el) => {
                colorData = {
                  ...colorData,
                  [el.color.id]: {
                    id: el.id,
                    oldStock: utils.validateNumber(el.stock),
                  },
                };
              });

              await utils.asyncForEach(ratio, async (el) => {
                console.log(el);
                let newQuantity = utils.validateNumber(el.quantityCompleted);
                let oldQuantity = colorData[el.color].oldStock;
                newQuantity = newQuantity + oldQuantity;
                await strapi
                  .query("design-color-price")
                  .update(
                    { id: colorData[el.color].id },
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
                      color: el.color,
                      quantity: el.quantity,
                      quantity_completed: el.quantityCompleted,
                      order: newOrder.id,
                      total_price: 0,
                    },
                    { transacting: t }
                  )
                  .then((model) => model)
                  .catch((err) => {
                    console.log(err);
                    throw 500;
                  });
              });
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
        ctx.send(200);
      })
      .catch((err) => {
        console.log("err ", err);
        return ctx.badRequest(null, "Error");
      });
  },

  async update(ctx) {
    const { completed_quantity, ready_material, previous_completed } =
      ctx.request.body;
    const { id } = ctx.params;
    let body = ctx.request.body;
    let ready_material_data = await strapi
      .query("ready-material")
      .findOne({ id: ready_material });

    let parseCompletedValue = parseFloat(completed_quantity);
    let parsePreviousCompletedValue = parseFloat(previous_completed);
    parseCompletedValue = isNaN(parseCompletedValue) ? 0 : parseCompletedValue;
    parsePreviousCompletedValue = isNaN(parsePreviousCompletedValue)
      ? 0
      : parsePreviousCompletedValue;
    let diff = parseCompletedValue - parsePreviousCompletedValue;

    if (ready_material_data) {
      await bookshelf.transaction(async (t) => {
        await strapi
          .query("orders")
          .update({ id: id }, body, { transacting: t, patch: true })
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });
        let oldQuantity = parseFloat(ready_material_data.total_quantity);
        oldQuantity = isNaN(oldQuantity) ? 0 : oldQuantity;
        let quantity = oldQuantity + diff;

        await strapi
          .query("ready-material")
          .update(
            { id: ready_material },
            {
              total_quantity: quantity,
            },
            { transacting: t, patch: true }
          )
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });
      });
    } else {
      throw 500;
    }
    ctx.send(200);
  },

  async check_availibility(ctx) {
    let {
      design,
      ratio,
      remaining_quantity,
      buffer_quantity,
      total_quantity,
      completed_quantity,
    } = ctx.request.body;

    /**
      design: d.design,
      color: d.color?.id,
      colorName: d.color?.name,
      quantity: 0,
      quantityCompleted: 0,
      order: null,
      designPrice: designPrice.toFixed(2),
     */

    ratio = ratio.map((r) => {
      return {
        quantity: r.quantity,
        quantity_completed: r.quantityCompleted,
        color: r.color,
        name: r.colorName,
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

    ctx.send(dataToSend);
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
  const ratio = orderDetail.ratio;
  const colorList = ratio.map((r) => {
    if (r.color) {
      let color = r.color;
      return {
        id: color.id,
        name: color.name,
      };
    }
  });

  const department_order_sheet = await strapi
    .query("department-order-sheet")
    .findOne({
      order: id,
    });

  output = {
    ...output,
    order_id: id,
    nl_no: orderDetail.ready_material
      ? orderDetail.ready_material.material_no
      : "",
    quantity: orderDetail.quantity,
    order_date: orderDetail.date,
    order_no: orderDetail.order_id,
    colorList: colorList,
    departmentList: departmentList,
  };
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
