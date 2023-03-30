"use strict";

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = async () => {
  //   const knex = strapi.connections.default;
  //   await knex.schema.alterTable("designs_and_materials", async (t) => {
  //     // you might need to check the index existence first
  //     // single column indexes
  //     console.log(
  //       't.index("raw_material", "raw_material") => ',
  //       t.index("raw_material", "raw_material")
  //     );
  //     if (!t.index("raw_material", "raw_material")) {
  //       t.index("raw_material", "raw_material");
  //     }
  //     // for multi column indexes
  //     if (!t.index(["raw_material", "design"], "raw_material_design")) {
  //       t.index(["raw_material", "design"], "raw_material_design");
  //     }
  //   });
};
