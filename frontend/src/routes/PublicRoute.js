import * as React from "react";
import { Route } from "react-router-dom";
import { Auth as auth, NotFoundPage } from "../components";
import { Layout } from "../hoc";

const PublicRoute = ({ component: Component, ...otherProps }) => {
  if (auth.getToken() === null) {
    return (
      <>
        {/* <Route
          render={otherProps => (
            <>
              <Component {...otherProps} />
            </>
          )}
        /> */}
        <Route
          render={otherProps => (
            <>
              <Layout>
                <Component {...otherProps} />
              </Layout>
            </>
          )}
        />
      </>
    );
  } else {
    return (
      <React.Fragment>
        <NotFoundPage />
      </React.Fragment>
    );
  }
};
export default PublicRoute;
