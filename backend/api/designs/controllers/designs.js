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

    return {
      data: data, // your data array
      page: page, // current page number
      pageSize: pageSize,
      totalCount: count, // total row number
    };
  },

  async create(ctx) {
    const { noOfColorsNewlyAdded } = ctx.request.body;
    let body = {
      ...ctx.request.body,
    };
    body = _.omit(body, ["noOfColorsNewlyAdded", "noOfColorsRemoved"]);
    const color_price = noOfColorsNewlyAdded.map((el) => {
      return {
        color: el,
        color_price: 0,
      };
    });
    body = {
      ...body,
      color_price: color_price,
    };
    let data = await strapi
      .query("designs")
      .create(body)
      .then((model) => model)
      .catch((err) => {
        console.log(err);
      });

    ctx.send(data);
  },

  async update(ctx) {
    const { noOfColorsNewlyAdded, noOfColorsRemoved } = ctx.request.body;
    const { id } = ctx.params;
    let body = {
      ...ctx.request.body,
    };
    body = _.omit(body, ["noOfColorsNewlyAdded", "noOfColorsRemoved"]);
    let data = {};
    let cannotBeRemoved = [];
    console.log("herererer");
    console.log(noOfColorsNewlyAdded);
    console.log(noOfColorsRemoved);
    await bookshelf.transaction(async (t) => {
      if (!noOfColorsNewlyAdded.length && !noOfColorsRemoved.length) {
        data = await strapi.query("designs").update({ id: id }, body, {
          patch: true,
          transacting: t,
        });
      }
      if (noOfColorsNewlyAdded.length) {
        const color_price = noOfColorsNewlyAdded.map((el) => {
          return {
            color: el,
            color_price: 0,
          };
        });
        body.color_price = [...body.color_price, ...color_price];
        data = await strapi.query("designs").update({ id: id }, body, {
          patch: true,
          transacting: t,
        });
      }
      if (noOfColorsRemoved.length) {
        await utils.asyncForEach(noOfColorsRemoved, async (c) => {
          const checkForOrders = await strapi
            .query("order-ratios")
            .findOne({ design: id, color: c, quantity_ne: 0 });

          if (checkForOrders) {
            cannotBeRemoved.push(c);
          } else {
            const checkForReadyMaterials = await strapi
              .query("ready-material-and-color")
              .findOne({ design: id, color: c, quantity_ne: 0 });

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
            }
          }
        });
        // const color_price = noOfColorsRemoved.map((el) => {
        //   return {
        //     color: el,
        //     color_price: 0,
        //   };
        // });
        // console.log(body);
        // body.color_price = [...body.color_price, ...color_price];
        // console.log(body);
        // await strapi.query("designs").update({ id: id }, body, {
        //   patch: true,
        //   transacting: t,
        // });
      }
    });
    ctx.send(200);
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
          await strapi.query("designs").delete({
            id: id,
          });
          return ctx.send(200);
        }
      }
    } else {
      return ctx.badRequest(null, "Error");
    }
  },
};
