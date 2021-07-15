import Dashboard from "@material-ui/icons/Dashboard";
import GroupIcon from "@material-ui/icons/Group";
import {
  Admin,
  Dashboard as DashboardScreen,
  Departments,
  Staff
} from "../containers";
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
  EDITSELLER
} from "../paths";

const purchases = "shopping_cart";
const departments = "apartment";

const rawMaterialPath = [RAWMATERIALSVIEW, ADDRAWMATERIALS, UNITS];
const departmentsPath = [DEPARTMENTS, ADDDEPARTMENTS];
const purchasesPath = [
  PURCHASES,
  ADDPURCHASES,
  SELLERS,
  EDITSELLER,
  ADDSELLER,
  VIEWPURCHASES
];
//const sellerPath = [SELLERS, ADDSELLER];
const staffPath = [STAFF, ADDSTAFF];
const adminPath = [ADMIN, ADDADMIN];

export const DashboardStaffRoutes = [
  {
    path: RAWMATERIALSVIEW,
    name: "Raw Materials",
    icon: Dashboard,
    component: DashboardScreen,
    layout: "",
    pathList: rawMaterialPath
  },
  {
    path: PURCHASES,
    name: "Purchases",
    icon: purchases,
    component: DashboardScreen,
    layout: "",
    pathList: purchasesPath
  },
  {
    path: DEPARTMENTS,
    name: "Departments",
    icon: departments,
    component: Departments,
    layout: "",
    pathList: departmentsPath
  }
];

export const DashboardAdminRoutes = [
  {
    path: STAFF,
    name: "Staff Users",
    icon: "manage_accounts",
    component: Staff,
    layout: "",
    pathList: [STAFF, ADDSTAFF]
  },
  {
    path: PURCHASES,
    name: "Purchases",
    icon: purchases,
    component: DashboardScreen,
    layout: "",
    pathList: purchasesPath
  },
  {
    path: DEPARTMENTS,
    name: "Departments",
    icon: departments,
    component: Departments,
    layout: "",
    pathList: departmentsPath
  },
  {
    path: RAWMATERIALSVIEW,
    name: "Raw Materials",
    icon: Dashboard,
    component: DashboardScreen,
    layout: "",
    pathList: rawMaterialPath
  }
];

export const SuperAdminDashboardRoutes = [
  {
    path: ADMIN,
    name: "Admin Users",
    icon: GroupIcon,
    component: Admin,
    layout: "",
    pathList: adminPath
  },
  {
    path: STAFF,
    name: "Staff Users",
    icon: GroupIcon,
    component: Staff,
    layout: "",
    pathList: staffPath
  },
  {
    path: PURCHASES,
    name: "Purchases",
    icon: purchases,
    component: DashboardScreen,
    layout: "",
    pathList: purchasesPath
  },
  {
    path: DEPARTMENTS,
    name: "Departments",
    icon: departments,
    component: Departments,
    layout: "",
    pathList: departmentsPath
  },
  {
    path: RAWMATERIALSVIEW,
    name: "Raw Materials",
    icon: Dashboard,
    component: DashboardScreen,
    layout: "",
    pathList: rawMaterialPath
  }
];
