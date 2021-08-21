"use strict";

const { default: createStrapi } = require("strapi");

/**
 * `isCollegeEventOwner` policy.
 */
// const { PLUGIN } = require("../../../../config/constants");
module.exports = async (ctx, next) => {
  const isEdit = Object.keys(ctx.params).length ? true : false;
  const id = ctx.params.id;
  let isPresent = false;
  const { balance } = ctx.request.body;
  if (isEdit) {
    const getPreviousValues = await strapi
      .query("raw-material")
      .findOne({ id: id });

    const previousBalance = parseFloat(getPreviousValues.balance);

    const checkIfPresentInPurchases = await strapi
      .query("individual-kachha-purchase")
      .findOne({ raw_material: id });

    const checkIfPresentInReturns = await strapi
      .query("goods-return")
      .findOne({ raw_material: id });

    const checkIfPresentInMonthlySheet = await strapi
      .query("monthly-sheet")
      .findOne({ raw_material: id });

    if (parseFloat(balance) === previousBalance) {
      await next();
    } else {
      if (
        !checkIfPresentInPurchases &&
        !checkIfPresentInReturns &&
        !checkIfPresentInMonthlySheet
      ) {
        await next();
      } else {
        return ctx.badRequest(null, "Balance cannot be updated");
      }
    }
  } else {
    await next();
  }
};
