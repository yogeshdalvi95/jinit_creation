import * as React from "react";
import { Redirect, Route } from "react-router-dom";
import { Auth as auth, NotFoundPage } from "../components";
import { RAWMATERIALSVIEW, USERS } from "../paths";

const PublicRoute = ({ component: Component, ...otherProps }) => {
  console.log("Component ", Component);
  if (auth.getToken() === null) {
    return (
      <>
        <Route
          render={otherProps => (
            <>
              <Component {...otherProps} />
            </>
          )}
        />
      </>
    );
  } else if (auth.getToken() !== null && auth.getUserInfo() !== null) {
    if (
      auth.getUserInfo().role.name === process.env.REACT_APP_ADMIN ||
      auth.getUserInfo().role.name === process.env.REACT_APP_SUPER_ADMIN
    ) {
      return (
        <Redirect
          to={{
            pathname: USERS
          }}
        />
      );
    } else if (auth.getUserInfo().role.name === process.env.REACT_APP_STAFF) {
      return (
        <Redirect
          to={{
            pathname: RAWMATERIALSVIEW
          }}
        />
      );
    }
  } else {
    return (
      <React.Fragment>
        <NotFoundPage />
      </React.Fragment>
    );
  }
};
export default PublicRoute;
