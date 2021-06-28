import * as React from "react";
import { Route } from "react-router-dom";
import { Layout } from "../hoc";
import { Auth as auth } from "../components";
import { Redirect } from "react-router-dom";
import { LOGIN } from "../paths";
import {
  DashboardAdminRoutes,
  DashboardStaffRoutes,
  SuperAdminDashboardRoutes
} from "./AdminRoutes";

const PrivateRoute = ({
  component: Component,
  computedMatch: ComputedMatch,
  header: Header,
  ...otherProps
}) => {
  if (auth.getToken() !== null) {
    let routes = [];
    if (auth.getUserInfo().role.name === process.env.REACT_APP_SUPER_ADMIN) {
      routes = SuperAdminDashboardRoutes;
    } else if (auth.getUserInfo().role.name === process.env.REACT_APP_ADMIN) {
      routes = DashboardAdminRoutes;
    } else {
      routes = DashboardStaffRoutes;
    }
    return (
      <>
        <Route
          render={otherProps => (
            <>
              <Layout dashboardRoutes={routes} header={Header}>
                <Component {...otherProps} urlParams={ComputedMatch} />
              </Layout>
            </>
          )}
        />
      </>
    );
  } else {
    auth.clearAppStorage();
    return (
      <React.Fragment>
        <Redirect
          to={{
            pathname: LOGIN
          }}
        />
      </React.Fragment>
    );
  }
};
export default PrivateRoute;
