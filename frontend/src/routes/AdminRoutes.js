import Dashboard from "@material-ui/icons/Dashboard";
import GroupIcon from "@material-ui/icons/Group";
import {
  Admin,
  Dashboard as DashboardScreen,
  Departments,
  Sellers,
  Staff,
  Users
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
  USERS
} from "../paths";

export const DashboardStaffRoutes = [
  {
    path: RAWMATERIALSVIEW,
    name: "Raw Materials",
    icon: Dashboard,
    component: DashboardScreen,
    layout: "",
    pathList: [RAWMATERIALSVIEW]
  },
  {
    path: SELLERS,
    name: "Sellers",
    icon: "payments",
    component: Sellers,
    layout: "",
    pathList: [SELLERS, ADDSELLER]
  },
  {
    path: PURCHASES,
    name: "Purchases",
    icon: "payments",
    component: DashboardScreen,
    layout: "",
    pathList: [PURCHASES]
  }
];

export const DashboardAdminRoutes = [
  {
    path: STAFF,
    name: "Staff Users",
    icon: GroupIcon,
    component: Staff,
    layout: "",
    pathList: [STAFF, ADDSTAFF]
  },
  {
    path: SELLERS,
    name: "Sellers",
    icon: "payments",
    component: Sellers,
    layout: "",
    pathList: [SELLERS, ADDSELLER]
  },
  {
    path: PURCHASES,
    name: "Purchases",
    icon: "payments",
    component: DashboardScreen,
    layout: "",
    pathList: [PURCHASES]
  },
  {
    path: RAWMATERIALSVIEW,
    name: "Raw Materials",
    icon: Dashboard,
    component: DashboardScreen,
    layout: "",
    pathList: [RAWMATERIALSVIEW]
  }
];

export const SuperAdminDashboardRoutes = [
  {
    path: ADMIN,
    name: "Admin Users",
    icon: GroupIcon,
    component: Admin,
    layout: "",
    pathList: [ADMIN, ADDADMIN]
  },
  {
    path: STAFF,
    name: "Staff Users",
    icon: GroupIcon,
    component: Staff,
    layout: "",
    pathList: [STAFF, ADDSTAFF]
  },
  {
    path: SELLERS,
    name: "Sellers",
    icon: "payments",
    component: Sellers,
    layout: "",
    pathList: [SELLERS, ADDSELLER]
  },
  {
    path: PURCHASES,
    name: "Purchases",
    icon: "payments",
    component: DashboardScreen,
    layout: "",
    pathList: [PURCHASES]
  },
  {
    path: DEPARTMENTS,
    name: "Departments",
    icon: "payments",
    component: Departments,
    layout: "",
    pathList: [DEPARTMENTS, ADDDEPARTMENTS]
  },
  {
    path: RAWMATERIALSVIEW,
    name: "Raw Materials",
    icon: Dashboard,
    component: DashboardScreen,
    layout: "",
    pathList: [RAWMATERIALSVIEW]
  }
];
