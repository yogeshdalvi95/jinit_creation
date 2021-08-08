"use strict";

/**
 * `isCollegeEventOwner` policy.
 */
// const { PLUGIN } = require("../../../../config/constants");
module.exports = async (ctx, next) => {
  const { ready_material, raw_material } = ctx.request.body;
  const dependent = await strapi
    .query("raw-material-and-quantity-for-ready-material")
    .find({
      ready_material: ready_material,
      raw_material: raw_material,
    });
  if (dependent.length === 0) {
    await next();
  } else {
    return ctx.badRequest(null, "Raw Material has already been added");
  }
};
