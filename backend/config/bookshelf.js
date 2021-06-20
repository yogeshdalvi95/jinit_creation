const knex = require("knex")({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: parseInt("5432"),
    database: "jinit_creation",
    user: "postgres",
    password: "root",
  },
});

const bookshelf = require("bookshelf")(knex);

/**
 * Registering models for bookshelf
 */

bookshelf.model("department", {
  tableName: "departments",
  requireFetch: false,
});

bookshelf.model("monthly-sheet", {
  tableName: "monthly_sheets",
  requireFetch: false,
});

bookshelf.model("orders", {
  tableName: "orders",
  requireFetch: false,
});

bookshelf.model("purchases", {
  tableName: "purchases",
  requireFetch: false,
});

bookshelf.model("raw-material", {
  tableName: "raw_materials",
  requireFetch: false,
});

bookshelf.model("ready-material", {
  tableName: "ready_materials",
  requireFetch: false,
});

bookshelf.model("seller", {
  tableName: "sellers",
  requireFetch: false,
});

bookshelf.model("units", {
  tableName: "units",
  requireFetch: false,
});

bookshelf.model("permission", {
  requireFetch: false,
  tableName: "users-permissions_permission",
});

bookshelf.model("role", {
  requireFetch: false,
  tableName: "users-permissions_role",
});

bookshelf.model("user", {
  tableName: "users-permissions_user",
  requireFetch: false,
});

bookshelf.model("uploadMorph", {
  requireFetch: false,
  tableName: "upload_file_morph",
});

module.exports = bookshelf;
