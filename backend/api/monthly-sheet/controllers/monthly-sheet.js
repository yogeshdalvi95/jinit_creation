"use strict";
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");
const {
  validateNumber,
  getDateInMMDDYYYY,
  getMonth,
  generatePDF,
  noDataImg,
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
    const count = await strapi.query("monthly-sheet").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi
      .query("monthly-sheet")
      .find(query, [
        "raw_material",
        "raw_material.category",
        "raw_material.department",
        "raw_material.color",
      ]);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async getTodaysData(ctx) {},

  async getByMonth(ctx) {},

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

  async downloadMonthlyData(ctx) {
    const { month, year, downloadBy } = ctx.request.body;
    const primarySegregationBy = await strapi.query(downloadBy).find();
    // if (primarySegregationBy && primarySegregationBy.length) {
    //   await utils.asyncForEach(primarySegregationBy, async (pS) => {
    //     let secondarySegregationModelName = ''
    //     if(downloadBy === 'department') {
    //       secondarySegregationModelName = 'category'
    //     } else {
    //       secondarySegregationModelName = 'department'
    //     }
    //     const secondarySegregationBy = await strapi.query(secondarySegregationModelName).find();
    //     if (primarySegregationBy && primarySegregationBy.length) {

    //     }
    //   });
    // } else {
    //   return ctx.badRequest(null, `No ${downloadBy} found`);
    // }
    const monthData = await strapi.query("monthly-sheet").find(
      {
        month: month,
        year: year,
      },
      ["raw_material", "raw_material.department", "raw_material.category"]
    );

    let html = "";
    html =
      html +
      ` <p class="p centerAlignedText lessBottomMargin lessTopMargin">for</p>
        <p class="p centerAlignedText moreBottomMargin lessTopMargin"><b>${getMonth(
          month - 1
        )} ${year}</b>
        </p>
        `;
    if (monthData && monthData.length) {
      html =
        html +
        `<table class="table">
          <thead>
          <tr>
            <th class="th leftAlignText withBackGroundHeader">Raw Material Name</th>
            <th class="th leftAlignText withBackGroundHeader">1</th>
            <th class="th leftAlignText withBackGroundHeader">2</th>
            <th class="th leftAlignText withBackGroundHeader">3</th>
            <th class="th leftAlignText withBackGroundHeader">4</th>
            <th class="th leftAlignText withBackGroundHeader">5</th>
            <th class="th leftAlignText withBackGroundHeader">6</th>
            <th class="th leftAlignText withBackGroundHeader">7</th>
            <th class="th leftAlignText withBackGroundHeader">8</th>
            <th class="th leftAlignText withBackGroundHeader">9</th>
            <th class="th leftAlignText withBackGroundHeader">10</th>
            <th class="th leftAlignText withBackGroundHeader">11</th>
            <th class="th leftAlignText withBackGroundHeader">12</th>
            <th class="th leftAlignText withBackGroundHeader">13</th>
            <th class="th leftAlignText withBackGroundHeader">14</th>
            <th class="th leftAlignText withBackGroundHeader">15</th>
            <th class="th leftAlignText withBackGroundHeader">16</th>
            <th class="th leftAlignText withBackGroundHeader">17</th>
            <th class="th leftAlignText withBackGroundHeader">18</th>
            <th class="th leftAlignText withBackGroundHeader">19</th>
            <th class="th leftAlignText withBackGroundHeader">20</th>
            <th class="th leftAlignText withBackGroundHeader">21</th>
            <th class="th leftAlignText withBackGroundHeader">22</th>
            <th class="th leftAlignText withBackGroundHeader">23</th>
            <th class="th leftAlignText withBackGroundHeader">24</th>
            <th class="th leftAlignText withBackGroundHeader">25</th>
            <th class="th leftAlignText withBackGroundHeader">26</th>
            <th class="th leftAlignText withBackGroundHeader">27</th>
            <th class="th leftAlignText withBackGroundHeader">28</th>
            <th class="th leftAlignText withBackGroundHeader">29</th>
            <th class="th leftAlignText withBackGroundHeader">30</th>
            <th class="th leftAlignText withBackGroundHeader">31</th>
            <th class="th leftAlignText withBackGroundHeader">Total</th>
          </tr>
        </thead>
        <tbody>`;
      monthData.forEach((el) => {
        html =
          html +
          `<tr>
            <td class="td leftAlignText">${el.raw_material.name}</td>
            ${
              el.day_1
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_1}</td>`
                : `<td class="td leftAlignText noWrap">0</td>`
            } 
            ${
              el.day_2
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_2}</td>`
                : `<td class="td leftAlignText noWrap">0</td>`
            } 
            ${
              el.day_3
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_3}</td>`
                : `<td class="td leftAlignText noWrap">0</td>`
            } 
            ${
              el.day_4
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_4}</td>`
                : `<td class="td leftAlignText noWrap">0</td>`
            } 
            ${
              el.day_5
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_5}</td>`
                : `<td class="td leftAlignText noWrap">0</td>`
            } 
            ${
              el.day_6
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_6}</td>`
                : `<td class="td leftAlignText noWrap">0</td>`
            } 
            ${
              el.day_7
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_7}</td>`
                : `<td class="td leftAlignText noWrap">0</td>`
            } 
            ${
              el.day_8
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_8}</td>`
                : `<td class="td leftAlignText noWrap">0</td>`
            } 
            ${
              el.day_9
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_9}</td>`
                : `<td class="td leftAlignText noWrap">0</td>`
            } 
            ${
              el.day_10
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_10}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_11
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_11}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_12
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_12}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_13
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_13}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_14
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_14}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_15
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_15}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_16
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_16}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_17
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_17}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_18
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_18}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_19
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_19}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_20
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_20}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_21
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_21}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_22
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_22}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_23
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_23}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_24
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_24}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_25
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_25}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_26
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_26}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_27
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_27}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_28
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_28}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_29
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_29}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_30
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_30}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.day_31
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.day_31}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
            ${
              el.total
                ? `<td class="td leftAlignText noWrap withYellowColor">${el.total}</td> `
                : `<td class="td leftAlignText noWrap">0</td> `
            } 
          </tr>`;
      });
      html = html + `</tbody></table>`;
    } else {
      html =
        html +
        `<img
      src='${noDataImg}'
      class="center"
      alt="No data"
    />`;
    }

    try {
      let buffer = await generatePDF("Daily Usage Data", html, true, "A3");
      ctx.send(buffer);
    } catch (err) {
      console.log("error => ", err);
      throw err;
    }
  },
};
