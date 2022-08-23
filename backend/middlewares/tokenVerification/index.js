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

              const { id } = await strapi.plugins[
                "users-permissions"
              ].services.jwt.getToken(ctx);

              console.log("id => ", id);
              const checkIfDataExists = await strapi
                .query("active-users")
                .findOne({
                  user: id,
                  token: token,
                });
              if (checkIfDataExists) {
                console.log("Middleware passed successfully");
                await next();
              } else {
                await strapi.query("active-users").delete({
                  user: id,
                });
                // ctx.response.unauthorized([message], [scheme], [attributes])
                return ctx.response.unauthorized(
                  ["Forbidden"],
                  ["No login details present, logging out"]
                );
              }
            } else {
              console.log("Forbidden no auth 401");
              return ctx.response.unauthorized(["Forbidden"], ["No auth"]);
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
