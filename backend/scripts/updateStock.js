const bookshelf = require("../config/bookshelf");
const utils = require("../config/utils");
(async () => {
  await init();
  console.log("\n");
  process.exit(0);
})();

async function init() {
  const designs = await bookshelf
    .model("designs")
    .fetchAll()
    .then((model) => model.toJSON());
  await utils.asyncForEach(designs, async (r) => {
    console.log("design id => ", r.id);
    const designColorPrice = await bookshelf
      .model("design-color-price")
      .where({ design: r.id })
      .fetchAll()
      .then((model) => model.toJSON());
    if (designColorPrice && designColorPrice.length) {
      await utils.asyncForEach(designColorPrice, async (dc) => {
        if (!dc.stock) {
          await bookshelf
            .model("design-color-price")
            .where({ id: dc.id })
            .save(
              {
                stock: 1,
              },
              { method: "update", patch: true, require: false }
            )
            .then((res) => res.toJSON());
        }
      });
    }
    console.log("designColorPrice => ", designColorPrice);
  });
}

const temp = async () => {
  await utils.asyncForEach(response, async (r) => {
    if (r.type_of_bill === "Kachha") {
      let seller = r.seller;
      let date = r.date;
      const kachhaResponse = await bookshelf
        .model("individual-purchase")
        .where({ purchase: r.id })
        .fetchAll()
        .then((model) => model.toJSON());
      await utils.asyncForEach(kachhaResponse, async (kr) => {
        await bookshelf
          .model("individual-purchase")
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
};
