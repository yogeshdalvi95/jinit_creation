"use strict";
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");
const _ = require("lodash");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async calculateDesignsLatestMaterialPrice(designId) {
    const designData = await strapi.query("designs").findOne({
      id: designId,
    });

    let finalDesignData = {};
    await bookshelf.transaction(async (t) => {
      /** For common */
      const designAndMaterial = await strapi
        .query("designs-and-materials")
        .find(
          {
            design: designId,
            isRawMaterial: true,
            isColor: false,
          },
          ["raw_material"]
        );

      let materialPrice = 0;
      await utils.asyncForEach(designAndMaterial, async (currObj) => {
        let total_price =
          utils.validateNumber(currObj?.raw_material?.costing) *
          utils.validateNumber(currObj.quantity);

        materialPrice = materialPrice + total_price;

        await strapi.query("designs-and-materials").update(
          { id: currObj.id },
          {
            total_price: total_price,
          },
          {
            patch: true,
            transacting: t,
          }
        );
      });

      finalDesignData = await strapi.query("designs").update(
        { id: designId },
        {
          material_price: materialPrice,
        },
        {
          patch: true,
          transacting: t,
        }
      );

      await utils.asyncForEach(designData.colors, async (c) => {
        let colorId = c.id;

        /** For individual color */
        const colorMaterial = await strapi.query("designs-and-materials").find(
          {
            design: designId,
            isRawMaterial: true,
            isColor: true,
            color: colorId,
          },
          ["raw_material"]
        );

        let colorPrice = 0;
        await utils.asyncForEach(colorMaterial, async (currObj) => {
          let total_price =
            utils.validateNumber(currObj?.raw_material?.costing) *
            utils.validateNumber(currObj.quantity);

          colorPrice = colorPrice + total_price;

          await strapi.query("designs-and-materials").update(
            { id: currObj.id },
            {
              total_price: total_price,
            },
            {
              patch: true,
              transacting: t,
            }
          );
        });

        await strapi.query("design-color-price").update(
          { design: designId, color: colorId },
          {
            color_price: colorPrice,
          },
          {
            patch: true,
            transacting: t,
          }
        );
      });
    });
    return finalDesignData;
  },
};
