"use strict";

/**
 * `isCollegeEventOwner` policy.
 */
// const { PLUGIN } = require("../../../../config/constants");
module.exports = async (ctx, next) => {
  const { id } = ctx.params;
  let body = null;

  if (ctx.request.files) {
    body = JSON.parse(ctx.request.body.data);
    const data = await strapi.query("designs").findOne({
      id: id,
    });

    /** Delete Image */
    let isImageAlreadyPresent =
      data.images && data.images.length && data.images[0].url ? true : false;
    let deleteImageId = null;
    if (isImageAlreadyPresent) {
      deleteImageId = data.images[0].id;
      const file = await strapi.plugins["upload"].services.upload.fetch({
        id: deleteImageId,
      });
      await strapi.plugins["upload"].services.upload.remove(file);
    }
  } else {
    body = ctx.request.body;
  }

  const { material_no } = body;
  const dependent = await strapi.query("designs").findOne({
    material_no: material_no,
  });
  if (dependent) {
    if (body && dependent.id == id) {
      await next();
    } else {
      return ctx.badRequest(null, "Design Number Already Used or invalid");
    }
  } else {
    await next();
  }
};
