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
    const count = await strapi.query("designs-and-materials").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi
      .query("designs-and-materials")
      .find(query, [
        "raw_material",
        "raw_material.department",
        "raw_material.unit",
        "raw_material.color",
        "raw_material.category",
        "ready_material",
        "design",
      ]);

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async create(ctx) {
    const { total_price, design, color } = ctx.request.body;
    await bookshelf.transaction(async (t) => {
      await strapi
        .query("designs-and-materials")
        .create(ctx.request.body, { transacting: t })
        .then((model) => model)
        .catch((err) => {
          console.log(err);
          throw 500;
        });

      let designData = await strapi.query("designs").findOne({
        id: design,
      });

      let designColorData = await strapi.query("design-color-price").findOne(
        {
          design: design,
          color: color,
        },
        []
      );

      /** Check if color available and update price for color */
      if (color) {
        let newColorPrice = 0;
        newColorPrice = isNaN(parseFloat(designColorData.color_price))
          ? 0
          : parseFloat(designColorData.color_price);
        newColorPrice = newColorPrice + parseFloat(total_price);

        await strapi.query("design-color-price").update(
          { design: design, color: color },
          {
            color_price: newColorPrice,
          },
          { patch: true, transacting: t }
        );
      } else {
        let designMaterialPrice = isNaN(parseFloat(designData?.material_price))
          ? 0
          : parseFloat(designData.material_price);

        designMaterialPrice = designMaterialPrice + parseFloat(total_price);
        await strapi.query("designs").update(
          { id: design },
          {
            material_price: designMaterialPrice,
          },
          { patch: true, transacting: t }
        );
      }
    });
    ctx.send(200);
  },

  async update(ctx) {
    const { total_price } = ctx.request.body;
    const { id } = ctx.params;
    await bookshelf
      .transaction(async (t) => {
        let designMaterialData = await strapi
          .query("designs-and-materials")
          .findOne({
            id: id,
          });

        let designId = designMaterialData?.design?.id;

        let designData = await strapi.query("designs").findOne({
          id: designId,
        });

        let oldPriceOfDesignMaterial = isNaN(
          parseFloat(designMaterialData?.total_price)
        )
          ? 0
          : parseFloat(designMaterialData.total_price);

        if (designMaterialData.isColor) {
          if (designMaterialData.color) {
            let colorObject = designMaterialData.color;
            let colorId =
              typeof colorObject === "object" ? colorObject.id : colorObject;

            let designColorPrice = await strapi
              .query("design-color-price")
              .findOne(
                {
                  design: designId,
                  color: colorId,
                },
                []
              );

            if (designColorPrice) {
              let oldTotalPrice = isNaN(
                parseFloat(designColorPrice?.color_price)
              )
                ? 0
                : parseFloat(designColorPrice.color_price);

              let tempTotalPrice = oldTotalPrice - oldPriceOfDesignMaterial;
              let newTotalPrice = tempTotalPrice + parseFloat(total_price);
              await strapi.query("design-color-price").update(
                { design: designId, color: colorId },
                {
                  color_price: newTotalPrice,
                },
                { patch: true, transacting: t }
              );
            }
          }
        } else {
          let designMaterialPrice = isNaN(
            parseFloat(designData?.material_price)
          )
            ? 0
            : parseFloat(designData.material_price);

          let tempDesignMaterialPrice =
            designMaterialPrice - oldPriceOfDesignMaterial;
          let newDesignMaterialPrice =
            tempDesignMaterialPrice + parseFloat(total_price);
          await strapi.query("designs").update(
            { id: designId },
            {
              material_price: newDesignMaterialPrice,
            },
            { patch: true, transacting: t }
          );
        }

        await strapi
          .query("designs-and-materials")
          .update({ id: id }, ctx.request.body, {
            patch: true,
            transacting: t,
          });
      })
      .then((res) => {
        ctx.send(200);
      })
      .catch((err) => {
        console.log("err ", err);
        return ctx.badRequest(null, "Error");
      });
  },

  async delete(ctx) {
    const { id } = ctx.params;
    await bookshelf.transaction(async (t) => {
      let designMaterialData = await strapi
        .query("designs-and-materials")
        .findOne({
          id: id,
        });

      let oldPriceOfDesignMaterial = isNaN(
        parseFloat(designMaterialData?.total_price)
      )
        ? 0
        : parseFloat(designMaterialData.total_price);

      let designId = designMaterialData?.design?.id;
      let designData = await strapi.query("designs").findOne({
        id: designId,
      });

      if (designMaterialData.isColor) {
        if (designMaterialData.color) {
          let colorObject = designMaterialData.color;
          let colorId =
            typeof colorObject === "object" ? colorObject.id : colorObject;

          let designColorPrice = await strapi
            .query("design-color-price")
            .findOne(
              {
                design: designId,
                color: colorId,
              },
              []
            );

          if (designColorPrice) {
            let oldTotalPrice = isNaN(parseFloat(designColorPrice?.color_price))
              ? 0
              : parseFloat(designColorPrice.color_price);

            let newTotalPrice = oldTotalPrice - oldPriceOfDesignMaterial;

            await strapi.query("design-color-price").update(
              { design: designId, color: colorId },
              {
                color_price: newTotalPrice,
              },
              { patch: true, transacting: t }
            );
          }
        }
      } else {
        let designMaterialPrice = isNaN(parseFloat(designData?.material_price))
          ? 0
          : parseFloat(designData.material_price);
        let newDesignMaterialPrice =
          designMaterialPrice - oldPriceOfDesignMaterial;
        await strapi.query("designs").update(
          { id: designId },
          {
            material_price: newDesignMaterialPrice,
          },
          { patch: true, transacting: t }
        );
      }

      await strapi
        .query("designs-and-materials")
        .delete({ id: id }, { patch: true, transacting: t });
    });
    ctx.send(200);
  },

  async getMaterialCount(ctx) {
    const { designId, isRawMaterial } = ctx.request.query;
    let ids = [];
    let params = {
      isRawMaterial: isRawMaterial,
    };
    if (isRawMaterial) {
      const result = await strapi
        .query("designs-and-materials")
        .model.fetchAll({
          columns: ["raw_material"],

          withRelated: [
            {
              raw_material: (qb) => {
                qb.columns("id");
              },
            },
          ],
        })
        .then((res) => res.toJSON())
        .catch((err) => {});
      console.log(result);
    }
    return {
      ids: ids,
    };
  },

  async getSelectedRawMaterials(ctx) {
    const { design, isColor, isRawMaterial } = ctx.request.query;

    let query = {};
    if (isRawMaterial) {
      query = {
        ...query,
        ready_material: {
          $null: true,
        },
      };
    } else {
      query = {
        ...query,
        raw_material: {
          $null: true,
        },
      };
    }
    if (!isColor) {
      query = {
        ...query,
        color: {
          $null: true,
        },
      };
    }
    const data = await strapi.db.query("api::designs-and-material").find(
      {
        where: query,
      },
      ["id"]
    );
  },
};
