module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", env("SERVER_PORT")),
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "884deef1cee15649eda3c0f55c1063e0"),
    },
  },
});
