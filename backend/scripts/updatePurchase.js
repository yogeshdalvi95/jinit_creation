const bookshelf = require("../config/bookshelf");
const utils = require("../config/utils");
(async () => {
  await init();
  console.log("\n");
  process.exit(0);
})();

async function init() {
  const response = await bookshelf
    .model("purchases")
    .fetchAll()
    .then((model) => model.toJSON());
  await utils.asyncForEach(response, async (r) => {
    if (r.type_of_bill === "Kachha") {
      let seller = r.seller;
      let date = r.date;
      const kachhaResponse = await bookshelf
        .model("individual-kachha-purchase")
        .where({ purchase: r.id })
        .fetchAll()
        .then((model) => model.toJSON());
      await utils.asyncForEach(kachhaResponse, async (kr) => {
        await bookshelf
          .model("individual-kachha-purchase")
          .where({ id: kr.id })
          .save(
            {
              date: utils.getDateInYYYYMMDD(new Date(date)),
              seller: seller,
            },
            { method: "update", patch: true, require: false }
          )
          .then((res) => res.toJSON());
      });
    } else {
      let seller = r.seller;
      let date = r.date;
      const pakkaResponse = await bookshelf
        .model("individual-pakka-purchase")
        .where({ purchase: r.id })
        .fetchAll()
        .then((model) => model.toJSON());
      await utils.asyncForEach(pakkaResponse, async (kr) => {
        await bookshelf
          .model("individual-pakka-purchase")
          .where({ id: kr.id })
          .save(
            {
              date: utils.getDateInYYYYMMDD(new Date(date)),
              seller: seller,
            },
            { method: "update", patch: true, require: false }
          )
          .then((res) => res.toJSON());
      });
    }
  });
}
