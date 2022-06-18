"use strict";
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");
const _ = require("lodash");
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
    const count = await strapi.query("designs").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("designs").find(query);
    const newData = [];
    await utils.asyncForEach(data, async (d) => {
      let newJson = {
        ...d,
        color_price: [],
      };
      if (d.colors.length) {
        const designColorPrice = await strapi.query("design-color-price").find(
          {
            design: d.id,
          },
          ["color"]
        );
        newJson.color_price = designColorPrice;
        newData.push(newJson);
      } else {
        newData.push(newJson);
      }
    });

    return {
      data: newData, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async designForParties(ctx) {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let _limit = 10;
    let _start = 0;

    _limit = pageSize;
    _start = (page - 1) * _limit;

    /**getting count */
    const count = await strapi.query("designs").count(query);

    query["_limit"] = _limit;
    query["_start"] = _start;

    const data = await strapi.query("designs").find(query);
    const newData = [];
    await utils.asyncForEach(data, async (d) => {
      let newJson = {
        ...d,
        color_price: [],
      };
      if (d.colors.length) {
        const designColorPrice = await strapi.query("design-color-price").find(
          {
            design: d.id,
          },
          ["color"]
        );
        newJson.color_price = designColorPrice;
        newData.push(newJson);
      } else {
        newData.push(newJson);
      }
    });

    return {
      data: newData, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async findOne(ctx) {
    const { query } = utils.getRequestParams(ctx.request.query);
    const { id } = ctx.params;

    await strapi.services["designs"].calculateDesignsLatestMaterialPrice(id);

    let designData = await strapi.query("designs").findOne({ id: id });
    const designColorPrice = await strapi.query("design-color-price").find(
      {
        design: id,
      },
      []
    );
    designData = {
      ...designData,
      color_price: designColorPrice,
    };
    ctx.send(designData);
  },

  async viewDesign(ctx) {
    const { id } = ctx.params;
    let designData = await strapi.query("designs").findOne({ id: id });
    const designColorPrice = await strapi.query("design-color-price").find(
      {
        design: id,
      },
      ["color"]
    );
    designData = {
      ...designData,
      color_price: designColorPrice,
    };
    let dataToSend = {};

    const commonRawMaterials = await strapi.query("designs-and-materials").find(
      {
        design: id,
        isColor: false,
      },
      ["raw_material", "raw_material.department", "raw_material.unit"]
    );

    let commonMaterialsWithoutDie = [];
    let commonMaterialsWithDie = [];
    let commonMotiBandhaiMaterial = [];

    commonRawMaterials.forEach((el) => {
      if (el?.raw_material?.is_die) {
        commonMaterialsWithDie.push(el);
      } else if (el.raw_material?.department?.name === "MOTI BANDHAI") {
        commonMotiBandhaiMaterial.push(el);
      } else {
        commonMaterialsWithoutDie.push(el);
      }
    });

    dataToSend = {
      ...dataToSend,
      designData: designData,
      commonRawMaterials: {
        commonMaterialsWithoutDie: commonMaterialsWithoutDie,
        commonMaterialsWithDie: commonMaterialsWithDie,
        commonMotiBandhaiMaterial: commonMotiBandhaiMaterial,
      },
    };

    const designColors = designData?.colors;
    if (
      Object.prototype.toString.call(designColors) === "[object Array]" &&
      designColors.length
    ) {
      await utils.asyncForEach(designColors, async (c) => {
        let colorId = c.id;
        let colorName = c.name;
        const colorRawMaterials = await strapi
          .query("designs-and-materials")
          .find(
            {
              design: id,
              isColor: true,
              color: colorId,
            },
            [
              "raw_material",
              "raw_material.department",
              "raw_material.unit",
              "raw_material.category",
              "raw_material.color",
            ]
          );

        let colorMaterial = [];
        let colorBandhaiMaterials = [];

        colorRawMaterials.forEach((el) => {
          if (el.raw_material?.department?.name === "MOTI BANDHAI") {
            colorBandhaiMaterials.push(el);
          } else {
            colorMaterial.push(el);
          }
        });

        dataToSend = {
          ...dataToSend,
          [colorId]: {
            colorName: colorName,
            colorMaterial: colorMaterial,
            colorBandhaiMaterials: colorBandhaiMaterials,
          },
        };
      });
    }
    ctx.send(dataToSend);
  },

  async downloadDesign(ctx) {
    const { id } = ctx.params;
    let designData = await strapi.query("designs").findOne({ id: id });
    
  },

  async generatePdf(ctx) {
    const { id } = ctx.params;
    let designData = await strapi.query("designs").findOne({ id: id });
    const designColorPrice = await strapi.query("design-color-price").find(
      {
        design: id,
      },
      ["color"]
    );
    designData = {
      ...designData,
      color_price: designColorPrice,
    };
    let dataToSend = {};

    const commonRawMaterials = await strapi.query("designs-and-materials").find(
      {
        design: id,
        isColor: false,
      },
      ["raw_material", "raw_material.department", "raw_material.unit"]
    );

    let commonMaterialsWithoutDie = [];
    let commonMaterialsWithDie = [];
    let commonMotiBandhaiMaterial = [];

    commonRawMaterials.forEach((el) => {
      if (el?.raw_material?.is_die) {
        commonMaterialsWithDie.push(el);
      } else if (el.raw_material?.department?.name === "MOTI BANDHAI") {
        commonMotiBandhaiMaterial.push(el);
      } else {
        commonMaterialsWithoutDie.push(el);
      }
    });

    dataToSend = {
      ...dataToSend,
      designData: designData,
    };

    const designColors = designData?.colors;
    if (
      Object.prototype.toString.call(designColors) === "[object Array]" &&
      designColors.length
    ) {
      await utils.asyncForEach(designColors, async (c) => {
        let materialsWithDie = [...commonMaterialsWithDie];
        let materialsWithoutDie = [...commonMaterialsWithoutDie];
        let bandhaiMaterials = [...commonMotiBandhaiMaterial];

        let colorId = c.id;
        let colorName = c.name;
        const colorRawMaterials = await strapi
          .query("designs-and-materials")
          .find(
            {
              design: id,
              isColor: true,
              color: colorId,
            },
            ["raw_material", "raw_material.department", "raw_material.unit"]
          );

        colorRawMaterials.forEach((el) => {
          if (el?.raw_material?.is_die) {
            materialsWithDie.push(el);
          } else if (el.raw_material?.department?.name === "MOTI BANDHAI") {
            bandhaiMaterials.push(el);
          } else {
            materialsWithoutDie.push(el);
          }
        });

        dataToSend = {
          ...dataToSend,
          [colorId]: {
            colorName: colorName,
            materialsWithDie: materialsWithDie,
            materialsWithoutDie: materialsWithoutDie,
            bandhaiMaterials: bandhaiMaterials,
          },
        };
      });
    }
  },

  async create(ctx) {
    const { colors } = ctx.request.body;
    let body = {
      ...ctx.request.body,
    };
    let newData = {};
    await bookshelf
      .transaction(async (t) => {
        newData = await strapi
          .query("designs")
          .create(body, {
            transacting: t,
          })
          .then((model) => model)
          .catch((err) => {
            console.log(err);
          });

        await utils.asyncForEach(colors, async (c) => {
          await strapi
            .query("design-color-price")
            .create(
              {
                design: newData.id,
                color: c.id,
                color_price: 0,
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
      })
      .then((res) => {
        ctx.send(newData);
      })
      .catch((err) => {
        console.log("err ", err);
        return ctx.badRequest(null, "Error");
      });
  },

  async update(ctx) {
    const { id } = ctx.params;
    const files = ctx.request.files;

    let colors = [];
    let body = {};
    if (ctx.request.files && ctx.request.body.data) {
      let { data } = ctx.request.body;
      data = JSON.parse(data);
      body = {
        ...data,
      };
      colors = data.colors;
    } else {
      body = {
        ...ctx.request.body,
      };
      colors = body.colors;
    }

    let data = {};
    let cannotBeRemoved = [];
    let removed = [];
    let newlyAdded = [];

    /** Previous design data */
    let previousDesignData = await strapi.query("designs").findOne({
      id: id,
    });

    let oldColorArray = previousDesignData.colors.map((el) => el.id);
    let newColorAray = colors.map((el) => el.id);
    let noOfColorsNewlyAdded = newColorAray.filter(
      (x) => !oldColorArray.includes(x)
    );
    let noOfColorsRemoved = oldColorArray.filter(
      (x) => !newColorAray.includes(x)
    );

    await bookshelf
      .transaction(async (t) => {
        await utils.asyncForEach(noOfColorsNewlyAdded, async (c) => {
          newlyAdded.push(c);
          await strapi
            .query("design-color-price")
            .create(
              {
                design: id,
                color: c,
                color_price: 0,
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

        await utils.asyncForEach(noOfColorsRemoved, async (c) => {
          const checkForOrders = await strapi
            .query("order-ratios")
            .findOne({ design: id, color: c, quantity_ne: 0 });

          if (checkForOrders) {
            cannotBeRemoved.push(c);
          } else {
            const checkForReadyMaterials = await strapi
              .query("design-color-price")
              .findOne({ design: id, color: c, stock_ne: 0 });

            if (checkForReadyMaterials) {
              cannotBeRemoved.push(c);
            } else {
              await strapi.query("designs-and-materials").delete(
                {
                  design: id,
                  color: c,
                },
                {
                  patch: true,
                  transacting: t,
                }
              );
              await strapi.query("design-color-price").delete(
                {
                  design: id,
                  color: c,
                },
                {
                  patch: true,
                  transacting: t,
                }
              );
              removed.push(c);
            }
          }
        });

        let currentColorArray = body.colors.map((el) => el.id);
        cannotBeRemoved.forEach((el) => {
          currentColorArray.push(el);
        });

        data = await strapi.query("designs").update(
          { id: id },
          {
            ...body,
            colors: currentColorArray,
          },
          {
            patch: true,
            transacting: t,
          }
        );
      })
      .then((res) => {
        ctx.send({
          newlyAdded: newlyAdded,
          removed: removed,
          cannotBeRemoved: cannotBeRemoved,
          data: data,
        });
      })
      .catch((err) => {
        console.log("err ", err);
        return ctx.badRequest(null, "Error");
      });
  },

  async checkDuplicateName(ctx) {
    const { designNumber } = ctx.request.body;
    const data = await strapi.query("designs").find({
      material_no: designNumber,
    });
    if (data.length) {
      return ctx.badRequest(null, "Error");
    } else {
      return ctx.send(200);
    }
  },

  async duplicateDesign(ctx) {
    let { design, designNumber } = ctx.request.body;
    designNumber = designNumber.trim();
    let isError = false;
    let newData = {};

    const data = await strapi.query("designs").find({
      material_no: designNumber,
    });

    if (data.length) {
      ctx.badRequest(null, "Error");
    } else {
      await bookshelf.transaction(async (t) => {
        let oldDesign = await strapi.query("designs").findOne({
          id: design,
        });
        if (oldDesign && Object.keys(oldDesign).length) {
          oldDesign = _.omit(oldDesign, ["id"]);
          oldDesign.material_no = designNumber;
          newData = await strapi
            .query("designs")
            .create(oldDesign, { transacting: t })
            .then((model) => model)
            .catch((err) => {
              console.log(err);
            });

          const newDesignId = newData.id;

          let oldDesignColorPrice = await strapi
            .query("design-color-price")
            .find({
              design: design,
            });
          await utils.asyncForEach(oldDesignColorPrice, async (d) => {
            d.design = newDesignId;
            await strapi
              .query("design-color-price")
              .create(d, { transacting: t })
              .then((model) => model)
              .catch((err) => {
                isError = true;
              });
          });

          const oldDesignMaterialData = await strapi
            .query("designs-and-materials")
            .find({
              design: design,
            });
          await utils.asyncForEach(oldDesignMaterialData, async (d) => {
            d = _.omit(d, ["id"]);
            d.design = newDesignId;
            await strapi
              .query("designs-and-materials")
              .create(d, { transacting: t })
              .then((model) => model)
              .catch((err) => {
                isError = true;
              });
          });
        } else {
          isError = true;
        }
      });
      if (isError) {
        return ctx.send(500);
      } else {
        return ctx.send(newData);
      }
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;

    const designData = await strapi.query("designs").findOne({
      id: id,
    });

    if (designData) {
      const chechIfDesignPresentInReadyMaterial = await strapi
        .query("ready-material")
        .findOne({
          design: id,
        });
      if (chechIfDesignPresentInReadyMaterial) {
        return ctx.badRequest(null, "Cannot delete");
      } else {
        const chechIfDesignPresentInOrders = await strapi
          .query("orders")
          .findOne({
            design: id,
          });
        if (chechIfDesignPresentInOrders) {
          return ctx.badRequest(null, "Cannot delete");
        } else {
          await bookshelf
            .transaction(async (t) => {
              await strapi.query("designs-and-materials").delete(
                {
                  design: id,
                },
                { transacting: t }
              );
              await strapi.query("design-color-price").delete(
                {
                  design: id,
                },
                { transacting: t }
              );
              await strapi.query("designs").delete(
                {
                  id: id,
                },
                { transacting: t }
              );
            })
            .then((res) => {
              ctx.send(200);
            })
            .catch((err) => {
              console.log("err ", err);
              return ctx.badRequest(null, "Error");
            });
        }
      }
    } else {
      return ctx.badRequest(null, "Error");
    }
  },
};
