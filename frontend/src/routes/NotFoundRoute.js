import { Route } from "react-router-dom";
import React from "../../node_modules/react";
import { NotFoundPage } from "../components";
import { Auth as auth } from "../components";
import { Layout } from "../hoc";
import {
  DashboardAdminRoutes,
  DashboardStaffRoutes,
  SuperAdminDashboardRoutes
} from "./AdminRoutes";

const NotFoundRoute = ({
  header: Header,
  openSubMenu: OpenSubMenu,
  ...otherProps
}) => {
  if (auth.getToken() !== null) {
    console.log("Hrrererere");
    let routes = [];
    if (auth.getUserInfo().role.name === process.env.REACT_APP_SUPER_ADMIN) {
      routes = SuperAdminDashboardRoutes;
    } else if (auth.getUserInfo().role.name === process.env.REACT_APP_ADMIN) {
      routes = DashboardAdminRoutes;
    } else {
      routes = DashboardStaffRoutes;
    }
    return (
      <Route
        render={otherProps => (
          <>
            <Layout
              dashboardRoutes={routes}
              header={Header}
              openSubMenu={OpenSubMenu}
            >
              <NotFoundPage />
            </Layout>
          </>
        )}
      />
    );
  } else {
    return (
      <>
        <NotFoundPage />
      </>
    );
  }
};

export default NotFoundRoute;
