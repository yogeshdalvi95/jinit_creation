import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { Layout } from "../hoc";
import { DashboardAdminRoutes, allAdminRoutes } from "./AdminRoutes";
import PublicRoute from "./PublicRoute";

const Routes = () => {
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
};

export default Routes;
