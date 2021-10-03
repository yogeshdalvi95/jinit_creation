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
  DEPARTMENTSHEET
} from "../paths";

/** Raw material and units */
const colorPath = [COLORS, ADDCOLOR, EDITCOLOR];
const categoryPath = [CATEGORIES, ADDCATEGORIES, EDITCATEGORIES];
const rawMaterialPathList = [
  RAWMATERIALSVIEW,
  ADDRAWMATERIALS,
  EDITRAWMATERIALS
];
const unitsPathList = [UNITS];
const departmentsPath = [DEPARTMENTS, ADDDEPARTMENTS];
const dailyUsage = [DAILYUSAGERAWMATERIALS];

const rawMaterialAndUnitPath = [
  ...colorPath,
  ...categoryPath,
  ...rawMaterialPathList,
  ...unitsPathList,
  ...departmentsPath,
  ...dailyUsage
];

/**---------------------------- */

const readyMaterialPath = [
  LISTREADYMATERIAL,
  ADDREADYMATERIAL,
  EDITREADYMATERIAL,
  VIEWREADYMATERIAL
];

/** Purchases and sellers path */
const purchasesAndSellersPath = [
  PURCHASES,
  ADDPURCHASES,
  VIEWPURCHASES,
  EDITPURCHASES,
  SELLERS,
  EDITSELLER,
  ADDSELLER,
  ADDGOODRETURN,
  EDITGOODRETURN,
  GOODRETURNLIST,
  VIEWGOODRETURN,
  VIEWKACHHAPURCHASEDETAILS
];

const goodsReturnPath = [
  ADDGOODRETURN,
  EDITGOODRETURN,
  GOODRETURNLIST,
  VIEWGOODRETURN
];

const purchasesPath = [PURCHASES, ADDPURCHASES, VIEWPURCHASES, EDITPURCHASES];
const kachhaPurchaseDetailsPath = [VIEWKACHHAPURCHASEDETAILS];

const sellerPath = [SELLERS, EDITSELLER, ADDSELLER];
/**--------------------------------------------- */
//const sellerPath = [SELLERS, ADDSELLER];
const staffPath = [STAFF, ADDSTAFF];
const adminPath = [ADMIN, ADDADMIN];

/**-----order------- */
const orderPathsList = [ADDORDER, VIEWORDER, ORDERS, EDITORDER];
const departmentSheetList = [DEPARTMENTSHEET];
const orderPaths = [...orderPathsList, ...departmentSheetList];

const salesAllPathList = [
  PARTIES,
  ADDPARTIES,
  EDITPARTIES,
  VIEWSALES,
  ADDSALES,
  EDITSALES
];

const partiesPathList = [PARTIES, ADDPARTIES, EDITPARTIES];
const salesPathList = [VIEWSALES, ADDSALES, EDITSALES];

export const DashboardStaffRoutes = [
  {
    name: "Purchases",
    layout: "",
    pathList: purchasesAndSellersPath,
    children: [
      {
        path: PURCHASES,
        name: "All Purchases",
        layout: "",
        pathList: purchasesPath
      },
      {
        path: VIEWKACHHAPURCHASEDETAILS,
        name: "Kachha Purchase Details",
        layout: "",
        pathList: kachhaPurchaseDetailsPath
      },
      {
        path: SELLERS,
        name: "Sellers",
        layout: "",
        pathList: sellerPath
      },
      {
        path: GOODRETURNLIST,
        name: "Goods Return",
        layout: "",
        pathList: goodsReturnPath
      }
    ]
  },
  {
    name: "Raw Materials",
    layout: "",
    pathList: rawMaterialAndUnitPath,
    children: [
      {
        path: RAWMATERIALSVIEW,
        name: "Raw Materials",
        layout: "",
        pathList: rawMaterialPathList
      },
      {
        path: DAILYUSAGERAWMATERIALS,
        name: "Daily Usage",
        layout: "",
        pathList: dailyUsage
      },
      {
        path: DEPARTMENTS,
        name: "Departments",
        layout: "",
        pathList: departmentsPath
      },
      {
        path: CATEGORIES,
        name: "Categories",
        layout: "",
        pathList: categoryPath
      },
      {
        path: COLORS,
        name: "Colors",
        layout: "",
        pathList: colorPath
      },
      {
        path: UNITS,
        name: "Units",
        layout: "",
        pathList: unitsPathList
      }
    ]
  },
  {
    path: LISTREADYMATERIAL,
    name: "Ready Materials",
    icon: Dashboard,
    layout: "",
    pathList: readyMaterialPath
  },
  {
    name: "Orders",
    layout: "",
    pathList: orderPaths,
    children: [
      {
        path: ORDERS,
        name: "Orders",
        layout: "",
        pathList: orderPathsList
      },
      {
        path: DEPARTMENTSHEET,
        name: "Department Sheet",
        layout: "",
        pathList: departmentSheetList
      }
    ]
  },
  {
    name: "Sales",
    layout: "",
    pathList: salesAllPathList,
    children: [
      {
        path: VIEWSALES,
        name: "Sales",
        layout: "",
        pathList: salesPathList
      },
      {
        path: PARTIES,
        name: "Parties",
        layout: "",
        pathList: partiesPathList
      }
    ]
  }
];

export const DashboardAdminRoutes = [
  {
    path: STAFF,
    name: "Staff Users",
    icon: "manage_accounts",
    layout: "",
    pathList: staffPath
  },
  {
    name: "Purchases",
    layout: "",
    pathList: purchasesAndSellersPath,
    children: [
      {
        path: PURCHASES,
        name: "All Purchases",
        layout: "",
        pathList: purchasesPath
      },
      {
        path: VIEWKACHHAPURCHASEDETAILS,
        name: "Kachha Purchase Details",
        layout: "",
        pathList: kachhaPurchaseDetailsPath
      },
      {
        path: SELLERS,
        name: "Sellers",
        layout: "",
        pathList: sellerPath
      },
      {
        path: GOODRETURNLIST,
        name: "Goods Return",
        layout: "",
        pathList: goodsReturnPath
      }
    ]
  },
  {
    name: "Raw Materials",
    layout: "",
    pathList: rawMaterialAndUnitPath,
    children: [
      {
        path: RAWMATERIALSVIEW,
        name: "Raw Materials",
        layout: "",
        pathList: rawMaterialPathList
      },
      {
        path: DAILYUSAGERAWMATERIALS,
        name: "Daily Usage",
        layout: "",
        pathList: dailyUsage
      },
      {
        path: DEPARTMENTS,
        name: "Departments",
        layout: "",
        pathList: departmentsPath
      },
      {
        path: CATEGORIES,
        name: "Categories",
        layout: "",
        pathList: categoryPath
      },
      {
        path: COLORS,
        name: "Colors",
        layout: "",
        pathList: colorPath
      },
      {
        path: UNITS,
        name: "Units",
        layout: "",
        pathList: unitsPathList
      }
    ]
  },
  {
    path: LISTREADYMATERIAL,
    name: "Ready Materials",
    icon: Dashboard,
    layout: "",
    pathList: readyMaterialPath
  },
  {
    name: "Orders",
    layout: "",
    pathList: orderPaths,
    children: [
      {
        path: ORDERS,
        name: "Orders",
        layout: "",
        pathList: orderPathsList
      },
      {
        path: DEPARTMENTSHEET,
        name: "Department Sheet",
        layout: "",
        pathList: departmentSheetList
      }
    ]
  },
  {
    name: "Sales",
    layout: "",
    pathList: salesAllPathList,
    children: [
      {
        path: VIEWSALES,
        name: "Sales",
        layout: "",
        pathList: salesPathList
      },
      {
        path: PARTIES,
        name: "Parties",
        layout: "",
        pathList: partiesPathList
      }
    ]
  }
];

export const SuperAdminDashboardRoutes = [
  {
    path: ADMIN,
    name: "Admin Users",
    icon: GroupIcon,
    layout: "",
    pathList: adminPath
  },
  {
    path: STAFF,
    name: "Staff Users",
    icon: GroupIcon,
    layout: "",
    pathList: staffPath
  },
  {
    name: "Purchases",
    layout: "",
    pathList: purchasesAndSellersPath,
    children: [
      {
        path: PURCHASES,
        name: "All Purchases",
        layout: "",
        pathList: purchasesPath
      },
      {
        path: VIEWKACHHAPURCHASEDETAILS,
        name: "Kachha Purchase Details",
        layout: "",
        pathList: kachhaPurchaseDetailsPath
      },
      {
        path: SELLERS,
        name: "Sellers",
        layout: "",
        pathList: sellerPath
      },
      {
        path: GOODRETURNLIST,
        name: "Goods Return",
        layout: "",
        pathList: goodsReturnPath
      }
    ]
  },
  {
    name: "Raw Materials",
    layout: "",
    pathList: rawMaterialAndUnitPath,
    children: [
      {
        path: RAWMATERIALSVIEW,
        name: "Raw Materials",
        layout: "",
        pathList: rawMaterialPathList
      },
      {
        path: DAILYUSAGERAWMATERIALS,
        name: "Daily Usage",
        layout: "",
        pathList: dailyUsage
      },
      {
        path: DEPARTMENTS,
        name: "Departments",
        layout: "",
        pathList: departmentsPath
      },
      {
        path: CATEGORIES,
        name: "Categories",
        layout: "",
        pathList: categoryPath
      },
      {
        path: COLORS,
        name: "Colors",
        layout: "",
        pathList: colorPath
      },
      {
        path: UNITS,
        name: "Units",
        layout: "",
        pathList: unitsPathList
      }
    ]
  },
  {
    path: LISTREADYMATERIAL,
    name: "Ready Materials",
    icon: Dashboard,
    layout: "",
    pathList: readyMaterialPath
  },
  {
    name: "Orders",
    layout: "",
    pathList: orderPaths,
    children: [
      {
        path: ORDERS,
        name: "Orders",
        layout: "",
        pathList: orderPathsList
      },
      {
        path: DEPARTMENTSHEET,
        name: "Department Sheet",
        layout: "",
        pathList: departmentSheetList
      }
    ]
  },
  {
    name: "Sales",
    layout: "",
    pathList: salesAllPathList,
    children: [
      {
        path: VIEWSALES,
        name: "Sales",
        layout: "",
        pathList: salesPathList
      },
      {
        path: PARTIES,
        name: "Parties",
        layout: "",
        pathList: partiesPathList
      }
    ]
  }
];
