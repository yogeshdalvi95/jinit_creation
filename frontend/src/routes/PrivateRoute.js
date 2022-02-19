import * as React from "react";
import { Route } from "react-router-dom";
import { Layout } from "../hoc";
import { Auth as auth, NotFoundPage } from "../components";
import { Redirect } from "react-router-dom";
import { LOGIN } from "../paths";
import { getRoutesOnLogin } from "../Utils";

const PrivateRoute = ({
  component: Component,
  computedMatch: ComputedMatch,
  header,
  openSubMenu,
  defaultPathToPush: DefaultPathToPush,
  isDependent = false,
  ...otherProps
}) => {
  if (auth.getToken() !== null) {
    let routes = getRoutesOnLogin(auth);
    let id = [];
    if (isDependent) {
      id = otherProps?.location?.pathname
        ? otherProps.location.pathname.match(/\d+/g)
        : [];
    }

    return (
      <>
        <Route
          render={(props) => (
            <>
              <Layout
                dashboardRoutes={routes}
                header={header}
                openSubMenu={openSubMenu}
              >
                {isDependent && id && id.length && (
                  <Component
                    {...props}
                    urlParams={ComputedMatch}
                    header={header}
                    id={id[id.length - 1]}
                    {...otherProps}
                  />
                )}
                {isDependent && (!id || (id && !id.length)) && <NotFoundPage />}
                {!isDependent && (
                  <Component
                    {...props}
                    urlParams={ComputedMatch}
                    header={header}
                    {...otherProps}
                  />
                )}
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
            pathname: LOGIN,
          }}
        />
      </React.Fragment>
    );
  }
};
export default PrivateRoute;
