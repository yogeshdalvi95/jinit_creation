import React from "react";
import { Route } from "react-router-dom";
import { Redirect } from "../../node_modules/react-router-dom";
import PropTypes from "../../node_modules/prop-types";
import { Auth, NotFoundPage } from "../components";
import { LOGIN } from "../paths";
import { getRoutesOnLogin } from "../Utils";
import { Layout } from "../hoc";

const DefaultRoute = (props) => {
  const auth = Auth.getToken();
  if (auth !== null) {
    let routes = getRoutesOnLogin(Auth);
    return (
      <Route
        render={(otherProps) => (
          <>
            <Layout dashboardRoutes={routes}>
              <NotFoundPage />
            </Layout>
          </>
        )}
      />
    );
  } else {
    return (
      <>
        <Redirect
          to={{
            pathname: LOGIN,
            state: { from: props.location },
          }}
        />
      </>
    );
  }
};

DefaultRoute.propTypes = {
  path: PropTypes.string,
};

export default DefaultRoute;
