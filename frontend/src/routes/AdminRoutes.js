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
  DAILYUSAGERAWMATERIALS
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
  ADDSELLER
];

const purchasesPath = [PURCHASES, ADDPURCHASES, VIEWPURCHASES, EDITPURCHASES];

const sellerPath = [SELLERS, EDITSELLER, ADDSELLER];
/**--------------------------------------------- */
//const sellerPath = [SELLERS, ADDSELLER];
const staffPath = [STAFF, ADDSTAFF];
const adminPath = [ADMIN, ADDADMIN];

export const DashboardStaffRoutes = [
  {
    name: "Purchases",
    layout: "",
    pathList: purchasesAndSellersPath,
    children: [
      {
        path: PURCHASES,
        name: "Purchases",
        layout: "",
        pathList: purchasesPath
      },
      {
        path: SELLERS,
        name: "Sellers",
        layout: "",
        pathList: sellerPath
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
        name: "Add Daily Usage",
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
        name: "Purchases",
        layout: "",
        pathList: purchasesPath
      },
      {
        path: SELLERS,
        name: "Sellers",
        layout: "",
        pathList: sellerPath
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
        name: "Add Daily Usage",
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
        name: "Purchases",
        layout: "",
        pathList: purchasesPath
      },
      {
        path: SELLERS,
        name: "Sellers",
        layout: "",
        pathList: sellerPath
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
        name: "Add Daily Usage",
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
  }
];
