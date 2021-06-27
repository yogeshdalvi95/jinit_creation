import Dashboard from "@material-ui/icons/Dashboard";
import GroupIcon from "@material-ui/icons/Group";
import { Dashboard as DashboardScreen, Sellers, Users } from "../containers";
import {
  ADDSELLER,
  PURCHASES,
  RAWMATERIALSVIEW,
  SELLERS,
  USERS
} from "../paths";

export const DashboardAdminRoutes = [
  {
    path: USERS,
    name: "Users",
    icon: GroupIcon,
    component: Users,
    layout: "",
    pathList: [USERS]
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
