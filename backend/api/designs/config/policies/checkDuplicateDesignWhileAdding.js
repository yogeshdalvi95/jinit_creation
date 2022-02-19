"use strict";

/**
 * `isCollegeEventOwner` policy.
 */
// const { PLUGIN } = require("../../../../config/constants");
module.exports = async (ctx, next) => {
  let body = null;
  if (ctx.request.files) {
    body = JSON.parse(ctx.request.body.data);
  } else {
    body = ctx.request.body;
  }
  const { material_no } = body;
  const dependent = await strapi.query("designs").find({
    material_no: material_no,
  });
  if (dependent.length === 0) {
    await next();
  } else {
    return ctx.badRequest(null, "Design Number Already Used");
  }
};
