"use strict";

/**
 * `isCollegeEventOwner` policy.
 */
// const { PLUGIN } = require("../../../../config/constants");
module.exports = async (ctx, next) => {
  const { id } = ctx.params;
  const { material_no } = ctx.request.body;
  const dependent = await strapi.query("ready-material").findOne({
    material_no: material_no,
  });
  if (dependent) {
    if (dependent.id == id) {
      await next();
    } else {
      return ctx.badRequest(null, "Material Number Already Used");
    }
  } else {
    await next();
  }
};
