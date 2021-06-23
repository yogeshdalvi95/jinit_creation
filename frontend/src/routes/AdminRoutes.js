import Dashboard from "@material-ui/icons/Dashboard";
import Person from "@material-ui/icons/Person";
import LibraryBooks from "@material-ui/icons/LibraryBooks";
import BubbleChart from "@material-ui/icons/BubbleChart";
import { Dashboard as DashboardScreen } from "../containers";

export const DashboardAdminRoutes = [
  {
    path: "/page1",
    name: "Page 1",
    icon: Dashboard,
    component: DashboardScreen,
    layout: "/admin",
    pathList: ["/admin/page1"]
  },
  {
    path: "/page2",
    name: "Page 2",
    icon: Person,
    component: DashboardScreen,
    layout: "/admin",
    pathList: ["/admin/page2"]
  },
  {
    path: "/page3",
    name: "Page 3",
    icon: "content_paste",
    component: DashboardScreen,
    layout: "/admin",
    pathList: ["/admin/page3"]
  },
  {
    path: "/page4",
    name: "Page 4",
    icon: LibraryBooks,
    component: DashboardScreen,
    layout: "/admin",
    pathList: ["/admin/page4"]
  },
  {
    path: "/page5",
    name: "Page 5",
    icon: BubbleChart,
    component: DashboardScreen,
    layout: "/admin",
    pathList: ["/admin/page5"]
  }
];

export const allAdminRoutes = [
  {
    path: "/page1",
    name: "Page 1",
    component: DashboardScreen,
    layout: "/admin",
    redirect: false,
    dashboardRoutes: DashboardAdminRoutes
  },
  {
    path: "/page2",
    name: "Page 2",
    component: DashboardScreen,
    layout: "/admin",
    redirect: false,
    dashboardRoutes: DashboardAdminRoutes
  },
  {
    path: "/page3",
    name: "Page 3",
    component: DashboardScreen,
    layout: "/admin",
    redirect: false,
    dashboardRoutes: DashboardAdminRoutes
  },
  {
    path: "/page4",
    name: "Page 4",
    component: DashboardScreen,
    layout: "/admin",
    redirect: false,
    dashboardRoutes: DashboardAdminRoutes
  },
  {
    path: "/page5",
    name: "Page 5",
    component: DashboardScreen,
    layout: "/admin",
    redirect: false,
    dashboardRoutes: DashboardAdminRoutes
  },
  {
    from: "/admin",
    to: "/page1",
    layout: "/admin",
    redirect: true
  },
  {
    from: "/",
    to: "/page1",
    layout: "/admin",
    redirect: true
  }
];
