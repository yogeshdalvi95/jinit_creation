import * as React from "react";
import { Route } from "react-router-dom";
import { Auth as auth, NotFoundPage } from "../components";
import { Layout } from "../hoc";

const PublicRoute = ({
  component: Component,
  routes: Routes,
  ...otherProps
}) => {
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
              <Layout routes={Routes}>
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
