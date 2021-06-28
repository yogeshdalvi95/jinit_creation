import * as React from "react";
import { Redirect, Route } from "react-router-dom";
import { Auth as auth, NotFoundPage } from "../components";
import { ADMIN, RAWMATERIALSVIEW, STAFF, USERS } from "../paths";

const PublicRoute = ({ component: Component, ...otherProps }) => {
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
    if (auth.getUserInfo().role.name === process.env.REACT_APP_ADMIN) {
      return (
        <Redirect
          to={{
            pathname: STAFF
          }}
        />
      );
    } else if (
      auth.getUserInfo().role.name === process.env.REACT_APP_SUPER_ADMIN
    ) {
      return (
        <Redirect
          to={{
            pathname: ADMIN
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
