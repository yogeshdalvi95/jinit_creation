"use strict";

module.exports = async (ctx, next) => {
  const { id, state } = ctx.request.body;
  const { order_id } = state;

  const bill_data = await strapi.query("sales").findOne({
    bill_no: bill_no,
  });

  if (bill_data) {
    if (id) {
      if (id == bill_data.id) {
        await next();
      } else {
        return ctx.badRequest("Bill Number already used");
      }
    } else {
      return ctx.badRequest("Bill Number already used");
    }
  } else {
    await next();
  }
};
