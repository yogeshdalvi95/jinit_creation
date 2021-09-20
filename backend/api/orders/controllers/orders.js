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
    const count = await strapi.query("orders").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("orders").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async create(ctx) {
    const { completed_quantity, ready_material } = ctx.request.body;
    let body = ctx.request.body;
    let ready_material_data = await strapi
      .query("ready-material")
      .findOne({ id: ready_material });

    if (ready_material_data) {
      await bookshelf.transaction(async (t) => {
        await strapi
          .query("orders")
          .create(body, { transacting: t })
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });

        let oldQuantity = parseFloat(ready_material_data.total_quantity);
        oldQuantity = isNaN(oldQuantity) ? 0 : oldQuantity;
        let quantityToAdd = parseFloat(completed_quantity);
        quantityToAdd = isNaN(quantityToAdd) ? 0 : quantityToAdd;
        let quantity = oldQuantity + quantityToAdd;

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

  async update(ctx) {
    const {
      completed_quantity,
      ready_material,
      previous_completed,
    } = ctx.request.body;
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
    console.log(parseCompletedValue, parsePreviousCompletedValue);
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
        console.log(diff, oldQuantity, quantity);

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

          console.log("rmrmrmrmmrmrm", rm);
          //console.log(raw_material_with_color);

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
              total_required_quantity_for_order: total_required_quantity_for_order,
              raw_material_balance: raw_material_balance,
              total_remaining_ready_material: parseFloat(remaining_quantity),
            };
          });

          dataToSend = {
            ...dataToSend,
            [r.name]: raw_material_with_color,
          };
        }
      });
    });

    const raw_material_details_without_color_to_send = raw_material_details_without_color.map(
      (r) => {
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
      }
    );

    dataToSend = {
      ...dataToSend,
      raw_material_without_color: raw_material_details_without_color_to_send,
    };

    ctx.send(dataToSend);
  },
};
