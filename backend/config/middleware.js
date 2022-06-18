module.exports = {
  load: {
    before: [
      "boom",
      "responseTime",
      "logger",
      "cors",
      "responses",
      "tokenVerification",
    ],
    order: [
      "Define the middlewares' load order by putting their name in this array in the right order",
    ],
    after: ["parser", "router"],
  },
  settings: {
    tokenVerification: {
      enabled: true,
    },
    cors: {
      origin: ["*"], //allow all
    },
  },
};
