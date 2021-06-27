import * as React from "react";
import { Route } from "react-router-dom";
import { Layout } from "../hoc";
import { Auth as auth } from "../components";
import { Redirect } from "react-router-dom";
import { LOGIN } from "../paths";
import { DashboardAdminRoutes } from "./AdminRoutes";

const PrivateRoute = ({
  component: Component,
  computedMatch: ComputedMatch,
  header: Header,
  ...otherProps
}) => {
  if (auth.getToken() !== null) {
    console.log("computed Match");
    return (
      <>
        <Route
          render={otherProps => (
            <>
              <Layout dashboardRoutes={DashboardAdminRoutes} header={Header}>
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
