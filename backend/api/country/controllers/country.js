"use strict";
const fs = require("fs");
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    fs.readFile(
      "/Users/ydalvi/Documents/Personal/jinit_creation/backend/api/country/controllers/cities.json",
      "utf8",
      async (error, data) => {
        if (error) {
          console.log(error);
          return;
        }
        const countries = JSON.parse(data);
        let count = 0;
        await bookshelf.transaction(async (t) => {
          await utils.asyncForEach(countries, async (d) => {
            let country = await strapi
              .query("country")
              .findOne({ country_name: d.country_name });
            let state = await strapi
              .query("state")
              .findOne({ state_name: d.state_name });
            let newJson = {
              city_name: d.name,
              country: country && country.id ? country.id : null,
              state: state && state.id ? state.id : null,
            };
            await strapi
              .query("city")
              .create(newJson, { transacting: t })
              .then((model) => {
                count = count + 1;
                console.log(`${count} Added entry for ${newJson.city_name}`);
              })
              .catch((err) => {
                console.log(err);
                throw 500;
              });
          });
          console.log("Done");
        });
      }
    );
  },
  async createState(ctx) {},
  async createCity(ctx) {},
};
