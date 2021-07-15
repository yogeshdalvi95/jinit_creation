import * as React from "react";
import { Route, useHistory } from "react-router-dom";
import { Layout, RawMaterialTabLayout } from "../hoc";
import { Auth as auth, FAB, GridContainer, GridItem } from "../components";
import { Redirect } from "react-router-dom";
import { LOGIN, UNITS } from "../paths";
import {
  DashboardAdminRoutes,
  DashboardStaffRoutes,
  SuperAdminDashboardRoutes
} from "./AdminRoutes";
import AddIcon from "@material-ui/icons/Add";
import { useLocation } from "react-router-dom";

const RouteWithTabLayoutForRawMaterial = ({
  component,
  computedMatch: ComputedMatch,
  header: Header,
  value,
  addComponentPath,
  ...otherProps
}) => {
  const history = useHistory();
  let location = useLocation();

  if (auth.getToken() !== null) {
    let routes = [];
    if (auth.getUserInfo().role.name === process.env.REACT_APP_SUPER_ADMIN) {
      routes = SuperAdminDashboardRoutes;
    } else if (auth.getUserInfo().role.name === process.env.REACT_APP_ADMIN) {
      routes = DashboardAdminRoutes;
    } else {
      routes = DashboardStaffRoutes;
    }

    const handleAdd = () => {
      history.push(addComponentPath);
    };
    return (
      <>
        <Route
          render={otherProps => (
            <>
              <Layout dashboardRoutes={routes} header={Header}>
                <GridContainer>
                  {location.pathname !== UNITS ? (
                    <GridItem xs={12} sm={12} md={12}>
                      <FAB
                        color="primary"
                        align={"end"}
                        size={"small"}
                        onClick={() => handleAdd()}
                      >
                        <AddIcon />
                      </FAB>
                    </GridItem>
                  ) : null}

                  <RawMaterialTabLayout
                    value={value}
                    component={component}
                    title={Header}
                  />
                </GridContainer>
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
export default RouteWithTabLayoutForRawMaterial;
