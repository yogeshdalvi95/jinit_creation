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
  LISTREADYMATERIAL,
  ADDREADYMATERIAL,
  EDITREADYMATERIAL,
  VIEWREADYMATERIAL,
  DAILYUSAGERAWMATERIALS,
  ADDGOODRETURN,
  EDITGOODRETURN,
  GOODRETURNLIST,
  VIEWGOODRETURN,
  VIEWKACHHAPURCHASEDETAILS,
  ADDORDER,
  EDITORDER,
  PARTIES,
  ADDPARTIES,
  EDITPARTIES,
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
  DEPARTMENTSHEET,
  LEDGER,
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
  SELECTRAWMATERIALS,
  SELECTRAWMATERIALSID,
  SELECTREADYMATERIALSID,
  VIEWSALESID,
  EDITSALESID,
} from "../paths";

/** Raw material and units */

const rawMaterialPathList = [
  RAWMATERIALSVIEW,
  ADDRAWMATERIALS,
  EDITRAWMATERIALS,
];

const colorPath = [COLORS, ADDCOLOR, EDITCOLOR];
const categoryPath = [CATEGORIES, ADDCATEGORIES, EDITCATEGORIES];

const unitsPathList = [UNITS];
const departmentsPath = [DEPARTMENTS, ADDDEPARTMENTS];

/** Daily Usage */
const dailyUsage = [DAILYUSAGERAWMATERIALS];

const rawMaterialAndUnitPath = [
  ...colorPath,
  ...categoryPath,
  ...rawMaterialPathList,
  ...unitsPathList,
  ...departmentsPath,
  ...dailyUsage,
];

/**---------------------------- */
const readyMaterialPath = [
  LISTREADYMATERIAL,
  ADDREADYMATERIAL,
  EDITREADYMATERIAL,
  VIEWREADYMATERIAL,
];

/** Purchases and sellers path */
const goodsReturnPath = [
  ADDGOODRETURN,
  EDITGOODRETURN,
  GOODRETURNLIST,
  VIEWGOODRETURN,
];

/** Ledger */
const ledgerPath = [LEDGER];

/** Purchase  */
const purchasesPath = [PURCHASES, ADDPURCHASES, VIEWPURCHASES, EDITPURCHASES];

/** Kachha Purchase */
const kachhaPurchaseDetailsPath = [VIEWKACHHAPURCHASEDETAILS];

/** SellerPath */
const sellerPath = [SELLERS, EDITSELLER, ADDSELLER];

const purchasesAndSellersPath = [
  ...purchasesPath,
  ...sellerPath,
  ...goodsReturnPath,
  ...kachhaPurchaseDetailsPath,
  ...ledgerPath,
];

/**--------------------------------------------- */
//const sellerPath = [SELLERS, ADDSELLER];
const staffPath = [STAFF, ADDSTAFF];
const adminPath = [ADMIN, ADDADMIN];

/**-----order------- */
const orderPathsList = [ADDORDER, VIEWORDER, ORDERS, EDITORDER];
const departmentSheetList = [DEPARTMENTSHEET];
const orderPaths = [...orderPathsList, ...departmentSheetList];

const partiesPathList = [PARTIES, ADDPARTIES, EDITPARTIES];
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
];

const salesAllPathList = [
  ...partiesPathList,
  ...salesPathList,
  ...salesReturnPathList,
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
  path: DAILYUSAGERAWMATERIALS,
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

const kachhaPurchaseJson = {
  path: VIEWKACHHAPURCHASEDETAILS,
  name: "Kachha Purchase Details",
  layout: "",
  pathList: kachhaPurchaseDetailsPath,
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

const departmentSheetJson = {
  path: DEPARTMENTSHEET,
  name: "Department Sheet",
  layout: "",
  pathList: departmentSheetList,
};

export const DashboardStaffRoutes = [
  {
    name: "Purchases",
    layout: "",
    pathList: purchasesAndSellersPath,
    children: [purchaseJson, kachhaPurchaseJson, goodsReturnJson, sellerJson],
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
    path: LISTREADYMATERIAL,
    name: "Ready Materials",
    icon: Dashboard,
    layout: "",
    pathList: readyMaterialPath,
  },
  {
    name: "Orders",
    layout: "",
    pathList: orderPaths,
    children: [ordersJson, departmentSheetJson],
  },
  {
    name: "Sales",
    layout: "",
    pathList: salesAllPathList,
    children: [salesJson, saleReturnJson, partiesJson],
  },
];

export const DashboardAdminRoutes = [
  {
    path: STAFF,
    name: "Staff Users",
    icon: "manage_accounts",
    layout: "",
    pathList: staffPath,
  },
  {
    name: "Purchases",
    layout: "",
    pathList: purchasesAndSellersPath,
    children: [purchaseJson, kachhaPurchaseJson, goodsReturnJson, sellerJson],
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
    path: LISTREADYMATERIAL,
    name: "Ready Materials",
    icon: Dashboard,
    layout: "",
    pathList: readyMaterialPath,
  },
  {
    name: "Orders",
    layout: "",
    pathList: orderPaths,
    children: [ordersJson, departmentSheetJson],
  },
  {
    name: "Sales",
    layout: "",
    pathList: salesAllPathList,
    children: [salesJson, saleReturnJson, partiesJson],
  },
];

export const SuperAdminDashboardRoutes = [
  {
    path: ADMIN,
    name: "Admin Users",
    icon: GroupIcon,
    layout: "",
    pathList: adminPath,
  },
  {
    path: STAFF,
    name: "Staff Users",
    icon: GroupIcon,
    layout: "",
    pathList: staffPath,
  },
  {
    name: "Purchases",
    layout: "",
    pathList: purchasesAndSellersPath,
    children: [purchaseJson, kachhaPurchaseJson, goodsReturnJson, sellerJson],
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
    path: LISTREADYMATERIAL,
    name: "Ready Materials",
    icon: Dashboard,
    layout: "",
    pathList: readyMaterialPath,
  },
  {
    name: "Orders",
    layout: "",
    pathList: orderPaths,
    children: [ordersJson, departmentSheetJson],
  },
  {
    name: "Sales",
    layout: "",
    pathList: salesAllPathList,
    children: [salesJson, saleReturnJson, partiesJson],
  },
];
