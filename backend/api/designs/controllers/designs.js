"use strict";
const utils = require("../../../config/utils");
const bookshelf = require("../../../config/bookshelf");
const _ = require("lodash");
const {
  noDataImg,
  generatePDF,
  getDateInMMDDYYYY,
  base64_encode,
} = require("../../../config/utils");
var path = require("path");
const { PDFDocument, StandardFonts, rgb, degrees } = require("pdf-lib");
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
      [
        "raw_material",
        "raw_material.department",
        "raw_material.unit",
        "raw_material.category",
      ]
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
    const { id, downloadAll, color } = ctx.request.body;
    let designData = await strapi.query("designs").findOne({ id: id });
    let dataToDownload = {};
    const commonRawMaterials = await strapi.query("designs-and-materials").find(
      {
        design: id,
        isColor: false,
      },
      [
        "raw_material",
        "raw_material.department",
        "raw_material.unit",
        "raw_material.category",
      ]
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

    dataToDownload = {
      ...dataToDownload,
      designData: designData,
      commonRawMaterials: {
        commonMaterialsWithoutDie: commonMaterialsWithoutDie,
        commonMaterialsWithDie: commonMaterialsWithDie,
        commonMotiBandhaiMaterial: commonMotiBandhaiMaterial,
      },
    };

    let designColors = designData?.colors;

    /** Download all colors */
    if (!downloadAll) {
      if (color) {
        designColors = designColors.filter((o, i) => {
          if (o.id == color) {
            return true; // stop searching
          }
        });
      } else {
        return ctx.badRequest(null, "Not a valid color");
      }
    }

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

        dataToDownload = {
          ...dataToDownload,
          [colorId]: {
            colorName: colorName,
            colorMaterial: colorMaterial,
            colorBandhaiMaterials: colorBandhaiMaterials,
          },
        };
      });

      let arr = [];
      let image = noDataImg;
      if (
        designData.images &&
        designData.images.length &&
        designData.images[0].url
      ) {
        image =
          "data:image/png;base64," +
          base64_encode(
            path.resolve(
              __dirname,
              `./../../../public${designData.images[0].url}`
            )
          );

        let html = `
            <img
            src='${image}'
            class="center1"
            alt="No data"
            />
        `;
        let buffer = await generatePDF(
          "Design Details",
          html,
          false,
          "A4",
          false
        );
        arr.push(buffer);
      }

      await utils.asyncForEach(designColors, async (dc) => {
        console.log("dc => ", dc);
        let html = "";
        html =
          html +
          ` <p class="p centerAlignedText moreBottomMargin lessTopMargin"><b>${dc.name}</b></p>
            <table><tr><th>Name</th><th>Size</th><th>Quantity</th></tr>
        `;

        if (
          dataToDownload &&
          dataToDownload.commonRawMaterials &&
          dataToDownload.commonRawMaterials.commonMaterialsWithoutDie &&
          dataToDownload.commonRawMaterials.commonMaterialsWithoutDie.length
        ) {
          dataToDownload.commonRawMaterials.commonMaterialsWithoutDie.map(
            (d) => {
              html =
                html +
                `
                <tr>
                  <td>
                    ${d.raw_material.name}
                  </td>
                  <td>
                    ${d.raw_material.size}
                  </td>
                  <td>
                    ${d.quantity}
                  </td>
                </tr>
              `;
            }
          );
        }
        if (
          dataToDownload &&
          dataToDownload[dc.id] &&
          dataToDownload[dc.id].colorMaterial &&
          dataToDownload[dc.id].colorMaterial.length
        ) {
          dataToDownload[dc.id].colorMaterial.map((d) => {
            html =
              html +
              `
                <tr>
                  <td class = "C8C8C8">
                    ${d.raw_material.name}
                  </td>
                  <td class = "C8C8C8">
                    ${d.raw_material.size}
                  </td>
                  <td class = "C8C8C8">
                    ${d.quantity}
                  </td>
                </tr>
              `;
          });
        }

        html =
          html +
          `
          </table>
          <p class="p centerAlignedText moreTopMargin"><b>Die</b></p>
          <table><tr><th>Name</th><th>Size</th><th>Quantity</th></tr>
        `;

        if (
          dataToDownload &&
          dataToDownload.commonRawMaterials &&
          dataToDownload.commonRawMaterials.commonMaterialsWithDie &&
          dataToDownload.commonRawMaterials.commonMaterialsWithDie.length
        ) {
          dataToDownload.commonRawMaterials.commonMaterialsWithDie.map((d) => {
            html =
              html +
              `
                <tr>
                  <td>
                    ${d.raw_material.name}
                  </td>
                  <td>
                    ${d.raw_material.size}
                  </td>
                  <td>
                    ${d.quantity}
                  </td>
                </tr>
              `;
          });
        }

        html =
          html +
          `
            </table>
            <p class="p centerAlignedText moreTopMargin"><b>Bandhai</b></p>
            <table><tr><th>Name</th><th>Size</th><th>Quantity</th></tr>
          `;

        if (
          dataToDownload &&
          dataToDownload.commonRawMaterials &&
          dataToDownload.commonRawMaterials.commonMotiBandhaiMaterial &&
          dataToDownload.commonRawMaterials.commonMotiBandhaiMaterial.length
        ) {
          dataToDownload.commonRawMaterials.commonMotiBandhaiMaterial.map(
            (d) => {
              html =
                html +
                `
                  <tr>
                    <td>
                      ${d.raw_material.name}
                    </td>
                    <td>
                      ${d.raw_material.size}
                    </td>
                    <td>
                      ${d.quantity}
                    </td>
                  </tr>
                `;
            }
          );
        }
        if (
          dataToDownload &&
          dataToDownload[dc.id] &&
          dataToDownload[dc.id].colorBandhaiMaterials &&
          dataToDownload[dc.id].colorBandhaiMaterials.length
        ) {
          dataToDownload[dc.id].colorBandhaiMaterials.map((d) => {
            html =
              html +
              `
                  <tr>
                    <td class = "C8C8C8">
                      ${d.raw_material.name}
                    </td>
                    <td class = "C8C8C8">
                      ${d.raw_material.size}
                    </td>
                    <td class = "C8C8C8">
                      ${d.quantity}
                    </td>
                  </tr>
                `;
          });
        }

        html =
          html +
          `
            </table>          `;

        let buffer = await generatePDF("", html, false, "A4", false);
        arr.push(buffer);
      });

      try {
        const mergedPdf = await PDFDocument.create();
        for (const pdfBytes of arr) {
          const pdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices()
          );
          copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
          });
        }

        const buf = await mergedPdf.save();
        var pdfBuffer = Buffer.from(buf.buffer, "binary");

        ctx.send(pdfBuffer);
      } catch (err) {
        console.log("error => ", err);
        throw err;
      }
    } else {
      return ctx.badRequest(null, "No colors");
    }
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

        const files = ctx.request.files;
        if (files && files["files.images"]) {
          const fileName = files["files.images"].name;
          files["files.images"] = {
            ...files["files.images"],
            name: fileName.split(".")[0] + ".png",
            mime: "image/png",
          };
          await strapi.plugins.upload.services.upload.upload({
            data: {
              fileInfo: {},
              refId: newData.id,
              ref: "designs",
              field: "images",
            },
            files: files["files.images"],
          });
        }

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
        const files = ctx.request.files;
        if (files && files["files.images"]) {
          const fileName = files["files.images"].name;
          files["files.images"] = {
            ...files["files.images"],
            name: fileName.split(".")[0] + ".png",
            mime: "image/png",
          };
          await strapi.plugins.upload.services.upload.upload({
            data: {
              fileInfo: {},
              refId: id,
              ref: "designs",
              field: "images",
            },
            files: files["files.images"],
          });
        }

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
