"use strict";

/**
 * `isCollegeEventOwner` policy.
 */
// const { PLUGIN } = require("../../../../config/constants");
module.exports = async (ctx, next) => {
  const { material_no } = ctx.request.body;
  const dependent = await strapi.query("ready-material").find({
    material_no: material_no,
  });
  if (dependent.length === 0) {
    await next();
  } else {
    return ctx.badRequest(null, "Material Number Already Used");
  }
};
