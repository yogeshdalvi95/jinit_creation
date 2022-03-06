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
    console.log("data ", data);
    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async create(ctx) {
    const { total_price, design } = ctx.request.body;
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

      let designMaterialPrice = isNaN(parseFloat(designData?.material_price))
        ? 0
        : parseFloat(designData.material_price);

      designMaterialPrice = designMaterialPrice + parseFloat(total_price);
      let totalDesignPrice =
        designMaterialPrice + parseFloat(designData?.add_price);

      await strapi.query("designs").update(
        { id: design },
        {
          material_price: designMaterialPrice,
          total_price: totalDesignPrice,
        },
        { patch: true, transacting: t }
      );
    });
    ctx.send(200);
  },

  async update(ctx) {
    const { total_price } = ctx.request.body;
    const { id } = ctx.params;
    await bookshelf.transaction(async (t) => {
      let designMaterialData = await strapi
        .query("designs-and-materials")
        .findOne({
          id: id,
        });

      let oldTotalPrice = isNaN(parseFloat(designMaterialData?.total_price))
        ? 0
        : parseFloat(designMaterialData.total_price);

      let designId = designMaterialData?.design?.id;
      let designData = await strapi.query("designs").findOne({
        id: designId,
      });

      let designMaterialPrice = isNaN(parseFloat(designData?.material_price))
        ? 0
        : parseFloat(designData.material_price);

      let tempDesignMaterialPrice = designMaterialPrice - oldTotalPrice;
      let newDesignMaterialPrice =
        tempDesignMaterialPrice + parseFloat(total_price);
      let totalDesignPrice =
        newDesignMaterialPrice + parseFloat(designData?.add_price);
      await strapi.query("designs").update(
        { id: designId },
        {
          material_price: newDesignMaterialPrice,
          total_price: totalDesignPrice,
        },
        { patch: true, transacting: t }
      );
      await strapi
        .query("designs-and-materials")
        .update({ id: id }, ctx.request.body, { patch: true, transacting: t });
    });
    ctx.send(200);
  },

  async delete(ctx) {
    const { id } = ctx.params;
    await bookshelf.transaction(async (t) => {
      let designMaterialData = await strapi
        .query("designs-and-materials")
        .findOne({
          id: id,
        });

      let oldTotalPrice = isNaN(parseFloat(designMaterialData?.total_price))
        ? 0
        : parseFloat(designMaterialData.total_price);

      let designId = designMaterialData?.design?.id;
      let designData = await strapi.query("designs").findOne({
        id: designId,
      });

      let designMaterialPrice = isNaN(parseFloat(designData?.material_price))
        ? 0
        : parseFloat(designData.material_price);

      let newDesignMaterialPrice = designMaterialPrice - oldTotalPrice;
      let totalDesignPrice =
        newDesignMaterialPrice + parseFloat(designData?.add_price);
      await strapi.query("designs").update(
        { id: designId },
        {
          material_price: newDesignMaterialPrice,
          total_price: totalDesignPrice,
        },
        { patch: true, transacting: t }
      );
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
