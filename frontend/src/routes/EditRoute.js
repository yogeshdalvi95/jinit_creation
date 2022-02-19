import * as React from "react";
import { Route, useHistory } from "react-router-dom";
import { Layout } from "../hoc";
import { Auth as auth } from "../components";
import { Redirect } from "react-router-dom";
import { LOGIN } from "../paths";
import {
  DashboardAdminRoutes,
  DashboardStaffRoutes,
  SuperAdminDashboardRoutes,
} from "./AdminRoutes";

const EditRoute = ({
  component: Component,
  computedMatch: ComputedMatch,
  header: Header,
  openSubMenu: OpenSubMenu,
  defaultPathToPush: DefaultPathToPush,
  ...otherProps
}) => {
  const history = useHistory();
  if (auth.getToken() !== null) {
    let routes = [];
    if (auth.getUserInfo().role.name === process.env.REACT_APP_SUPER_ADMIN) {
      routes = SuperAdminDashboardRoutes;
    } else if (auth.getUserInfo().role.name === process.env.REACT_APP_ADMIN) {
      routes = DashboardAdminRoutes;
    } else {
      routes = DashboardStaffRoutes;
    }

    let id = otherProps?.location?.pathname
      ? otherProps.location.pathname.match(/\d+/g)
      : null;

    if (id.length) {
      return (
        <>
          <Route
            render={(props) => (
              <>
                <Layout
                  dashboardRoutes={routes}
                  header={Header}
                  openSubMenu={OpenSubMenu}
                >
                  <Component
                    {...props}
                    urlParams={ComputedMatch}
                    header={Header}
                    id={id[id.length - 1]}
                    isEdit={true}
                  />
                </Layout>
              </>
            )}
          />
        </>
      );
    } else {
      history.push(DefaultPathToPush);
      return null;
    }
  } else {
    auth.clearAppStorage();
    return (
      <React.Fragment>
        <Redirect
          to={{
            pathname: LOGIN,
          }}
        />
      </React.Fragment>
    );
  }
};
export default EditRoute;
