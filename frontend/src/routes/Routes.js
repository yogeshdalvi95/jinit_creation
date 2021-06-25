import React from "react";
import { Route, Switch } from "react-router-dom";
import auth from "../components/Auth";
import { Layout } from "../hoc";
import { DashboardAdminRoutes, allAdminRoutes } from "./AdminRoutes";
import PublicRoute from "./PublicRoute";

const Routes = () => {
  if (auth.getToken()) {
    return (
      <div>
        <Switch>
          <Route
            path="/"
            render={props => (
              <Layout
                allRoutes={allAdminRoutes}
                dashboardRoutes={DashboardAdminRoutes}
                {...props}
              />
            )}
          />
        </Switch>
      </div>
    );
  } else {
    return (
      <div>
        <PublicRoute />
      </div>
    );
  }
};

export default Routes;
