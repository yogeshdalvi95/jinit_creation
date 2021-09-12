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
  VIEWORDERS,
  EDITORDER,
  PARTIES,
  ADDPARTIES,
  EDITPARTIES,
  VIEWSALES,
  ADDSALES,
  EDITSALES
} from "../paths";

/** Raw material and units */
const rawMaterialAndUnitPath = [
  RAWMATERIALSVIEW,
  ADDRAWMATERIALS,
  EDITRAWMATERIALS,
  UNITS,
  DEPARTMENTS,
  ADDDEPARTMENTS,
  DAILYUSAGERAWMATERIALS
];
const rawMaterialPathList = [
  RAWMATERIALSVIEW,
  ADDRAWMATERIALS,
  EDITRAWMATERIALS
];
const unitsPathList = [UNITS];
const departmentsPath = [DEPARTMENTS, ADDDEPARTMENTS];
const dailyUsage = [DAILYUSAGERAWMATERIALS];

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
const orderPaths = [ADDORDER, VIEWORDERS, EDITORDER];

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
    path: VIEWORDERS,
    name: "Orders",
    layout: "",
    pathList: orderPaths
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
    path: VIEWORDERS,
    name: "Orders",
    layout: "",
    pathList: orderPaths
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
    path: VIEWORDERS,
    name: "Orders",
    layout: "",
    pathList: orderPaths
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
