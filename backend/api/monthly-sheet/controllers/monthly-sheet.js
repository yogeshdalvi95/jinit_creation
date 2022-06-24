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
    const count = await strapi.query("monthly-sheet").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("monthly-sheet").find(query);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async getTodaysData(ctx) {
    
  },
  
  async getByMonth(ctx) {

  },

  async getMonthlyData(ctx) {
    const { raw_material, month, year } = ctx.request.query;
    const monthData = await strapi.query("monthly-sheet").findOne({
      raw_material: raw_material,
      month: month,
      year: year,
    });

    let rawMaterialData = await strapi.query("raw-material").findOne({
      id: raw_material,
    });

    let obj = {
      data: [],
      currentMonth: new Date(year, month - 1, 1),
      total: 0,
      month: parseInt(month),
      year: parseInt(year),
      isEditable: true,
      finalBalance: validateNumber(rawMaterialData.balance),
    };

    let arr = Array.from({ length: 31 }, (_, i) => i + 1);
    if (monthData) {
      let data = [];
      let total = 0;
      arr.map((d, key) => {
        let count = validateNumber(monthData[`day_${d}`]);
        if (count) {
          let temp = {
            id: key,
            title: count,
            start: new Date(year, month - 1, d),
            end: new Date(year, month - 1, d),
          };
          data.push(temp);
        }
        total = count + total;
      });
      obj = {
        ...obj,
        data: data,
        total: total,
      };
    }
    ctx.send(obj);
  },

  async addUpdateEntries(ctx) {
    const { newValue, isDeduct, date, raw_material, isEdit, diff } =
      ctx.request.body;
    let year = new Date(date).getFullYear();
    let month = new Date(date).getMonth() + 1;
    let day = new Date(date).getDate();
    let data = [];

    let getCurrentBalance = await strapi.query("raw-material").findOne({
      id: raw_material,
    });
    let currentBalance = validateNumber(getCurrentBalance.balance);

    let value = validateNumber(newValue);
    let newBalance = 0;
    let valueToAddDeduct = value;

    /** If its edit than we should either add or suv\ */
    if (isEdit) {
      valueToAddDeduct = validateNumber(diff);
    }

    if (isDeduct) {
      newBalance = currentBalance - valueToAddDeduct;
    } else {
      newBalance = currentBalance + valueToAddDeduct;
    }

    if (newBalance < 0) {
      return ctx.badRequest(null, "Balance cannot be negative");
    }

    let total = 0;
    let monthlySheetValue = null;
    const isDataPresent = await strapi.query("monthly-sheet").findOne({
      raw_material: raw_material,
      month: `${month}`,
      year: `${year}`,
    });

    let objToUpdate = {
      raw_material: raw_material,
      month: `${month}`,
      year: `${year}`,
      total: 0.0,
      [`day_${day}`]: 0,
    };

    await bookshelf.transaction(async (t) => {
      if (isDataPresent) {
        let daysInMonth = utils.daysInMonth(month, year);
        let arr = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        arr.map((d, key) => {
          let dayCount = validateNumber(isDataPresent[`day_${d}`]);
          let count = 0;
          /** Check if the day is not the day in loop */
          if (d !== day) {
            total = total + dayCount;
            count = dayCount;
          } else {
            if (!isEdit) {
              value = value + dayCount;
            }
            total = total + value;
            count = value;
          }
          if (count) {
            let obj = {
              id: key,
              title: count,
              start: new Date(year, month - 1, d),
              end: new Date(year, month - 1, d),
            };
            data.push(obj);
          }
        });
        /** Calculate value */
        objToUpdate = {
          total: total,
          [`day_${day}`]: value,
        };

        if (validateNumber(total)) {
          monthlySheetValue = await strapi
            .query("monthly-sheet")
            .update({ id: isDataPresent.id }, objToUpdate, {
              transacting: t,
              patch: true,
            })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
              throw 500;
            });
        } else {
          await strapi.query("monthly-sheet").delete(
            { id: isDataPresent.id },
            {
              transacting: t,
              patch: true,
            }
          );
        }
      } else {
        total = value;
        objToUpdate = {
          ...objToUpdate,
          opening_balance: currentBalance,
          total: total,
          [`day_${day}`]: value,
        };

        monthlySheetValue = await strapi
          .query("monthly-sheet")
          .create(objToUpdate, { transacting: t })
          .then((model) => model)
          .catch((err) => {
            console.log(err);
            throw 500;
          });

        if (value) {
          let obj = {
            id: 1,
            title: value,
            start: new Date(year, month - 1, day),
            end: new Date(year, month - 1, day),
          };
          data.push(obj);
        }
      }

      /** Update new balance in raw material */
      await strapi
        .query("raw-material")
        .update(
          { id: raw_material },
          { balance: newBalance },
          {
            transacting: t,
            patch: true,
          }
        )
        .then((model) => model)
        .catch((err) => {
          console.log(err);
          throw 500;
        });
    });
    ctx.send({
      data: data,
      total: total,
      finalBalance: newBalance,
    });
  },
};
