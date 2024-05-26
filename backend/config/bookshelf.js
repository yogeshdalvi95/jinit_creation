const knex = require("knex")({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: parseInt("5432"),
    database: "jinit_backup",
    user: "postgres",
    password: "root",
  },
});

const bookshelf = require("bookshelf")(knex);

/**
 * Registering models for bookshelf
 */
bookshelf.model("category", {
  tableName: "categories",
  requireFetch: false,
});

bookshelf.model("color", {
  tableName: "colors",
  requireFetch: false,
});

bookshelf.model("department", {
  tableName: "departments",
  requireFetch: false,
});

bookshelf.model("plating", {
  tableName: "platings",
  requireFetch: false,
});

bookshelf.model("department-order-sheet", {
  tableName: "department_order_sheets",
  requireFetch: false,
});

bookshelf.model("department-sheet-with-color", {
  tableName: "department_sheet_with_colors",
  requireFetch: false,
});

bookshelf.model("design-color-price", {
  tableName: "design_color_prices",
  requireFetch: false,
});

bookshelf.model("designs", {
  tableName: "designs",
  requireFetch: false,
});

bookshelf.model("designs-and-materials", {
  tableName: "designs_and_materials",
  requireFetch: false,
});

bookshelf.model("goods-return", {
  tableName: "goods_return",
  requireFetch: false,
});

bookshelf.model("individual-purchase", {
  tableName: "individual_purchases",
  requireFetch: false,
});

bookshelf.model("monthly-purchase-balance", {
  tableName: "monthly_purchase_balances",
  requireFetch: false,
});

bookshelf.model("monthly-sale-balance", {
  tableName: "monthly_sale_balances",
  requireFetch: false,
});

bookshelf.model("monthly-sheet", {
  tableName: "monthly_sheets",
  requireFetch: false,
});

bookshelf.model("order-ratios", {
  tableName: "order_ratios",
  requireFetch: false,
});

bookshelf.model("orders", {
  tableName: "orders",
  requireFetch: false,
});

bookshelf.model("party", {
  tableName: "parties",
  requireFetch: false,
});

bookshelf.model("purchase-payment-transaction", {
  tableName: "purchase_payment_transactions",
  requireFetch: false,
});

bookshelf.model("purchase-payments", {
  tableName: "purchase_payments",
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

bookshelf.model("ready-material-and-color", {
  tableName: "ready_material_and_colors",
  requireFetch: false,
});

bookshelf.model("sale-payment", {
  tableName: "sale_payments",
  requireFetch: false,
});

bookshelf.model("sale-payment-transaction", {
  tableName: "sale_payment_transactions",
  requireFetch: false,
});

bookshelf.model("sale-return", {
  tableName: "sale_returns",
  requireFetch: false,
});

bookshelf.model("sales", {
  tableName: "sales",
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
