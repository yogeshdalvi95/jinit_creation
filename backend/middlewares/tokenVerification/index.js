module.exports = (strapi) => {
  return {
    initialize() {
      strapi.app.use(async (ctx, next) => {
        if (ctx.request.url.includes("/webapi")) {
          if (ctx.request.url.includes("private")) {
            if (
              ctx.request.header &&
              ctx.request.header.authorization &&
              ctx.request.header.authorization.startsWith("Bearer ")
            ) {
              let token = ctx.request.header.authorization.substring(
                7,
                ctx.request.header.authorization.length
              );

              try {
                const { id } = await strapi.plugins[
                  "users-permissions"
                ].services.jwt.getToken(ctx);

                const checkIfDataExists = await strapi
                  .query("active-users")
                  .findOne({
                    user: id,
                    token: token,
                  });
                if (checkIfDataExists) {
                  await next();
                } else {
                  await strapi.query("active-users").delete({
                    user: id,
                  });
                  return ctx.response.forbidden(
                    ["Forbidden"],
                    ["No login details present, logging out"]
                  );
                }
              } catch (err) {
                return ctx.response.forbidden(["Forbidden"], ["Invalid token"]);
              }
            } else {
              return ctx.response.forbidden(["Forbidden"], ["No auth"]);
            }
          } else {
            ctx.response.badRequest(["Not Found"], [""]);
          }
        } else {
          await next();
        }
      });
    },
  };
};
