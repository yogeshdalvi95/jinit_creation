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

  async getSelectedData(ctx) {
    const { id } = ctx.request.query;
    const monthData = await strapi.query("monthly-sheet").findOne({
      id: id,
    });
    let data = [];
    if (monthData) {
      let getCurrentBalance = await strapi.query("raw-material").findOne({
        id: monthData.raw_material.id,
      });
      let currentBalance = 0;
      if (!isNaN(parseFloat(getCurrentBalance.balance))) {
        currentBalance = parseFloat(getCurrentBalance.balance);
      }

      let currentMonth = new Date().getMonth() + 1;
      let currentYear = new Date().getFullYear();

      let year = parseInt(monthData.year);
      let month = parseInt(monthData.month);

      let daysInMonth = utils.daysInMonth(month, year);
      let arr = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      arr.map((d, key) => {
        let count = monthData[`day_${d}`];
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
      return ctx.send({
        data: data,
        currentMonth: new Date(year, month - 1, 1),
        openingBalance: parseFloat(monthData.opening_balance),
        finalBalance: currentBalance,
        total: parseFloat(monthData.total),
        month: month,
        year: year,
        isEditable:
          year === currentYear && month === currentMonth ? true : false,
      });
    } else {
      return ctx.badRequest(null, "Error");
    }
  },

  async getLatestEntries(ctx) {
    const { raw_material } = ctx.request.query;
    const isDataPresent = await strapi.query("monthly-sheet").findOne({
      raw_material: raw_material,
      _sort: "id:desc",
    });

    let currentMonth = new Date().getMonth() + 1;
    let currentYear = new Date().getFullYear();
    let data = [];
    /** Current balance of raw material */
    let getCurrentBalance = await strapi.query("raw-material").findOne({
      id: raw_material,
    });
    let currentBalance = 0;
    if (!isNaN(parseFloat(getCurrentBalance.balance))) {
      currentBalance = parseFloat(getCurrentBalance.balance);
    }

    let obj = {
      data: data,
      currentMonth: new Date(currentYear, currentMonth - 1, 1),
      openingBalance: currentBalance,
      finalBalance: currentBalance,
      total: 0,
      month: currentMonth,
      year: currentYear,
      isEditable: true,
    };

    if (isDataPresent) {
      let year = parseInt(isDataPresent.year);
      let month = parseInt(isDataPresent.month);
      if (year === currentYear && month === currentMonth) {
        let daysInMonth = utils.daysInMonth(month, year);
        let arr = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        arr.map((d, key) => {
          let count = isDataPresent[`day_${d}`];
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
        return ctx.send({
          data: data,
          currentMonth: new Date(year, month - 1, 1),
          openingBalance: parseFloat(isDataPresent.opening_balance),
          finalBalance: currentBalance,
          total: parseFloat(isDataPresent.total),
          month: month,
          year: year,
          isEditable: true,
        });
      } else {
        return ctx.send(obj);
      }
    } else {
      return ctx.send(obj);
    }
  },

  async addUpdateEntries(ctx) {
    const {
      newValue,
      isDeduct,
      date,
      raw_material,
      isEdit,
      diff,
    } = ctx.request.body;
    let year = new Date(date).getFullYear();
    let month = new Date(date).getMonth() + 1;
    let day = new Date(date).getDate();
    let data = [];

    let getCurrentBalance = await strapi.query("raw-material").findOne({
      id: raw_material,
    });
    let currentBalance = 0;
    if (!isNaN(parseFloat(getCurrentBalance.balance))) {
      currentBalance = parseFloat(getCurrentBalance.balance);
    }

    if (!isNaN(parseFloat(newValue))) {
      let newBalance = 0;
      let value = parseFloat(newValue);
      let valueToAddDeduct = value;
      if (isEdit) {
        valueToAddDeduct = parseFloat(diff);
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
            let dayCount = 0;
            if (!isNaN(parseFloat(isDataPresent[`day_${d}`]))) {
              dayCount = parseFloat(isDataPresent[`day_${d}`]);
            }
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
    } else {
      return ctx.badRequest(null, "Invalid value");
    }
  },
};
