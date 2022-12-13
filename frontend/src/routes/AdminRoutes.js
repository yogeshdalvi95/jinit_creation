import Dashboard from "@material-ui/icons/Dashboard";
import GroupIcon from "@material-ui/icons/Group";
import {
  ADDADMIN,
  ADDDEPARTMENTS,
  ADDSELLER,
  ADDSTAFF,
  ADMIN,
  DEPARTMENTS,
  PURCHASES,
  RAWMATERIALSVIEW,
  SELLERS,
  STAFF,
  ADDPURCHASES,
  ADDRAWMATERIALS,
  UNITS,
  VIEWPURCHASES,
  EDITSELLER,
  EDITPURCHASES,
  EDITRAWMATERIALS,
  RAWMATERIALUSAGE,
  ADDGOODRETURN,
  EDITGOODRETURN,
  GOODRETURNLIST,
  VIEWGOODRETURN,
  VIEWKACHHAPURCHASEDETAILS,
  ADDORDER,
  EDITORDER,
  PARTIES,
  ADDPARTY,
  EDITPARTY,
  VIEWSALES,
  ADDSALES,
  EDITSALES,
  ORDERS,
  VIEWORDER,
  COLORS,
  ADDCOLOR,
  EDITCOLOR,
  CATEGORIES,
  ADDCATEGORIES,
  EDITCATEGORIES,
  PURCHASELEDGER,
  SALES,
  SALERETURN,
  VIEWSALERETURN,
  ADDSALERETURN,
  EDITSALERETURN,
  DESIGNS,
  ADDDESIGN,
  EDITDESIGN,
  VIEWDESIGN,
  EDITDESIGNID,
  VIEWDESIGNID,
  SELECTRAWMATERIALSID,
  SELECTREADYMATERIALSID,
  VIEWSALESID,
  EDITSALESID,
  EDITORDERID,
  VIEWORDERID,
  VIEWDEPARTMENTSHEETID,
  EDITDEPARTMENTSHEETID,
  ALLPURCHASEPAYEMENTS,
  ADDPURCHASEPAYEMENT,
  EDITPURCHASEPAYEMENT,
  VIEWPURCHASEPAYEMENT,
  EDITPURCHASESID,
  VIEWPURCHASESID,
  ADDRAWMATERIALUSAGE,
  VIEWGOODRETURNID,
  EDITGOODRETURNID,
  VIEWRAWMATERIALSID,
  EDITRAWMATERIALSID,
  ALLSALEPAYEMENTS,
  ADDSALEPAYEMENT,
  EDITSALEPAYEMENT,
  VIEWSALEPAYEMENT,
  EDITPURCHASEPAYEMENTID,
  VIEWPURCHASEPAYEMENTID,
  EDITSALEPAYEMENTID,
  VIEWSALEPAYEMENTID,
  SALELEDGER,
} from "../paths";
import { EDITSALERETURNID, VIEWSALERETURNID } from "../paths/Paths";

/** Raw material and units */

const rawMaterialPathList = [
  RAWMATERIALSVIEW,
  ADDRAWMATERIALS,
  EDITRAWMATERIALS,
  EDITRAWMATERIALSID,
  VIEWRAWMATERIALSID,
];

const colorPath = [COLORS, ADDCOLOR, EDITCOLOR];
const categoryPath = [CATEGORIES, ADDCATEGORIES, EDITCATEGORIES];

const unitsPathList = [UNITS];
const departmentsPath = [DEPARTMENTS, ADDDEPARTMENTS];

/** Daily Usage */
const dailyUsage = [RAWMATERIALUSAGE, ADDRAWMATERIALUSAGE];

const rawMaterialAndUnitPath = [
  ...colorPath,
  ...categoryPath,
  ...rawMaterialPathList,
  ...unitsPathList,
  ...departmentsPath,
  ...dailyUsage,
];

/**---------------------------- */

/** Purchases and sellers path */
const goodsReturnPath = [
  ADDGOODRETURN,
  EDITGOODRETURN,
  GOODRETURNLIST,
  VIEWGOODRETURN,
  EDITGOODRETURNID,
  VIEWGOODRETURNID,
];

/** Ledger */
const PurchaseLedgerPath = [PURCHASELEDGER];

/** Sale Ledger */
const SaleLedgerPath = [SALELEDGER];

/** Purchase  */
const purchasesPath = [
  PURCHASES,
  ADDPURCHASES,
  VIEWPURCHASES,
  EDITPURCHASES,
  EDITPURCHASESID,
  VIEWPURCHASESID,
];

/** Purchase Payments Json */
const purchasePaymentsJson = [
  ADDPURCHASEPAYEMENT,
  EDITPURCHASEPAYEMENT,
  VIEWPURCHASEPAYEMENT,
  ALLPURCHASEPAYEMENTS,
  EDITPURCHASEPAYEMENTID,
  VIEWPURCHASEPAYEMENTID,
];

/** Sale Payments Json */
const salePaymentsJson = [
  ADDSALEPAYEMENT,
  EDITSALEPAYEMENT,
  VIEWSALEPAYEMENT,
  ALLSALEPAYEMENTS,
  EDITSALEPAYEMENTID,
  VIEWSALEPAYEMENTID,
];

/** Kachha Purchase */
const kachhaPurchaseDetailsPath = [VIEWKACHHAPURCHASEDETAILS];

/** SellerPath */
const sellerPath = [SELLERS, EDITSELLER, ADDSELLER];

const purchasesAndSellersPath = [
  ...purchasesPath,
  ...sellerPath,
  ...goodsReturnPath,
  ...kachhaPurchaseDetailsPath,
  ...PurchaseLedgerPath,
  ...purchasePaymentsJson,
];

/**--------------------------------------------- */
//const sellerPath = [SELLERS, ADDSELLER];
const staffPath = [STAFF, ADDSTAFF];
const adminPath = [ADMIN, ADDADMIN];

/**-----order------- */
const orderPathsList = [
  ADDORDER,
  VIEWORDER,
  ORDERS,
  EDITORDER,
  EDITORDERID,
  VIEWORDERID,
];
const departmentSheetPaths = [VIEWDEPARTMENTSHEETID, EDITDEPARTMENTSHEETID];
const orderPaths = [...orderPathsList, ...departmentSheetPaths];

const partiesPathList = [PARTIES, ADDPARTY, EDITPARTY];
const salesPathList = [
  SALES,
  VIEWSALES,
  ADDSALES,
  EDITSALES,
  EDITSALESID,
  VIEWSALESID,
];

const salesReturnPathList = [
  SALERETURN,
  VIEWSALERETURN,
  ADDSALERETURN,
  EDITSALERETURN,
  EDITSALERETURNID,
  VIEWSALERETURNID,
];

const salesAllPathList = [
  ...partiesPathList,
  ...salesPathList,
  ...salesReturnPathList,
  ...salePaymentsJson,
  ...SaleLedgerPath,
];

const designPathList = [
  DESIGNS,
  ADDDESIGN,
  EDITDESIGN,
  VIEWDESIGN,
  EDITDESIGNID,
  VIEWDESIGNID,
  SELECTRAWMATERIALSID,
  SELECTREADYMATERIALSID,
];

const rawMaterialsJson = {
  path: RAWMATERIALSVIEW,
  name: "Raw Materials",
  layout: "",
  pathList: rawMaterialPathList,
};

const dailyUsageJson = {
  path: RAWMATERIALUSAGE,
  name: "Daily Usage",
  layout: "",
  pathList: dailyUsage,
};

const goodsReturnJson = {
  path: GOODRETURNLIST,
  name: "Goods Return",
  layout: "",
  pathList: goodsReturnPath,
};

const sellerJson = {
  path: SELLERS,
  name: "Sellers",
  layout: "",
  pathList: sellerPath,
};

const purchaseJson = {
  path: PURCHASES,
  name: "All Purchases",
  layout: "",
  pathList: purchasesPath,
};

const PurchasePaymentsJson = {
  path: ALLPURCHASEPAYEMENTS,
  name: "Payments",
  layout: "",
  pathList: purchasePaymentsJson,
};

const SalePaymentsJson = {
  path: ALLSALEPAYEMENTS,
  name: "Payments",
  layout: "",
  pathList: salePaymentsJson,
};

const kachhaPurchaseJson = {
  path: VIEWKACHHAPURCHASEDETAILS,
  name: "Kachha Purchase Details",
  layout: "",
  pathList: kachhaPurchaseDetailsPath,
};

const purchaseLedgerJson = {
  path: PURCHASELEDGER,
  name: "Purchase Ledger",
  layout: "",
  pathList: PurchaseLedgerPath,
};

const saleLedgerJson = {
  path: SALELEDGER,
  name: "Sale Ledger",
  layout: "",
  pathList: SaleLedgerPath,
};

const salesJson = {
  path: SALES,
  name: "Sales",
  layout: "",
  pathList: salesPathList,
};

const saleReturnJson = {
  path: SALERETURN,
  name: "Sale Return",
  layout: "",
  pathList: salesReturnPathList,
};

const partiesJson = {
  path: PARTIES,
  name: "Parties",
  layout: "",
  pathList: partiesPathList,
};

const departmentJson = {
  path: DEPARTMENTS,
  name: "Departments",
  layout: "",
  pathList: departmentsPath,
};

const categoriesJson = {
  path: CATEGORIES,
  name: "Categories",
  layout: "",
  pathList: categoryPath,
};

const colorsJson = {
  path: COLORS,
  name: "Colors",
  layout: "",
  pathList: colorPath,
};

const unitsJson = {
  path: UNITS,
  name: "Units",
  layout: "",
  pathList: unitsPathList,
};

const ordersJson = {
  path: ORDERS,
  name: "Orders",
  layout: "",
  pathList: orderPathsList,
};

export const DashboardStaffRoutes = [
  {
    name: "Purchases",
    layout: "",
    pathList: purchasesAndSellersPath,
    children: [
      purchaseJson,
      PurchasePaymentsJson,
      goodsReturnJson,
      sellerJson,
      purchaseLedgerJson,
    ],
  },
  {
    name: "Raw Materials",
    layout: "",
    pathList: rawMaterialAndUnitPath,
    children: [
      rawMaterialsJson,
      dailyUsageJson,
      departmentJson,
      categoriesJson,
      colorsJson,
      unitsJson,
    ],
  },
  {
    path: DESIGNS,
    name: "Designs",
    layout: "",
    pathList: designPathList,
  },
  {
    name: "Orders",
    layout: "",
    pathList: orderPaths,
    children: [ordersJson],
  },
  {
    name: "Sales",
    layout: "",
    pathList: salesAllPathList,
    children: [
      salesJson,
      SalePaymentsJson,
      saleReturnJson,
      partiesJson,
      saleLedgerJson,
    ],
  },
];

export const DashboardAdminRoutes = [
  // {
  //   path: STAFF,
  //   name: "Staff Users",
  //   icon: "manage_accounts",
  //   layout: "",
  //   pathList: staffPath,
  // },
  {
    name: "Purchases",
    layout: "",
    pathList: purchasesAndSellersPath,
    children: [
      purchaseJson,
      PurchasePaymentsJson,
      goodsReturnJson,
      sellerJson,
      purchaseLedgerJson,
    ],
  },
  {
    name: "Raw Materials",
    layout: "",
    pathList: rawMaterialAndUnitPath,
    children: [
      rawMaterialsJson,
      dailyUsageJson,
      departmentJson,
      categoriesJson,
      colorsJson,
      unitsJson,
    ],
  },
  {
    path: DESIGNS,
    name: "Designs",
    layout: "",
    pathList: designPathList,
  },
  {
    name: "Orders",
    layout: "",
    pathList: orderPaths,
    children: [ordersJson],
  },
  {
    name: "Sales",
    layout: "",
    pathList: salesAllPathList,
    children: [
      salesJson,
      SalePaymentsJson,
      saleReturnJson,
      partiesJson,
      saleLedgerJson,
    ],
  },
];

export const SuperAdminDashboardRoutes = [
  // {
  //   path: ADMIN,
  //   name: "Admin Users",
  //   icon: GroupIcon,
  //   layout: "",
  //   pathList: adminPath,
  // },
  // {
  //   path: STAFF,
  //   name: "Staff Users",
  //   icon: GroupIcon,
  //   layout: "",
  //   pathList: staffPath,
  // },
  {
    name: "Purchases",
    layout: "",
    pathList: purchasesAndSellersPath,
    children: [
      purchaseJson,
      PurchasePaymentsJson,
      goodsReturnJson,
      sellerJson,
      purchaseLedgerJson,
    ],
  },
  {
    name: "Raw Materials",
    layout: "",
    pathList: rawMaterialAndUnitPath,
    children: [
      rawMaterialsJson,
      dailyUsageJson,
      departmentJson,
      categoriesJson,
      colorsJson,
      unitsJson,
    ],
  },
  {
    path: DESIGNS,
    name: "Designs",
    layout: "",
    pathList: designPathList,
  },
  {
    name: "Orders",
    layout: "",
    pathList: orderPaths,
    children: [ordersJson],
  },
  {
    name: "Sales",
    layout: "",
    pathList: salesAllPathList,
    children: [
      salesJson,
      SalePaymentsJson,
      saleReturnJson,
      partiesJson,
      saleLedgerJson,
    ],
  },
];
