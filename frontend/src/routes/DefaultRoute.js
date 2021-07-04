import React from "../../node_modules/react";
import { Redirect } from "../../node_modules/react-router-dom";
import PropTypes from "../../node_modules/prop-types";
import { Auth, NotFoundPage } from "../components";
import { ADMIN, LOGIN, RAWMATERIALSVIEW, STAFF } from "../paths";

const DefaultRoute = props => {
  console.log("Default route");
  const auth = Auth.getToken();
  const userInfo = Auth.getUserInfo();
  if (auth !== null) {
    if (userInfo.role.name === process.env.REACT_APP_ADMIN) {
      return (
        <Redirect
          to={{
            pathname: STAFF,
            state: { from: props.location }
          }}
        />
      );
    } else if (userInfo.role.name === process.env.REACT_APP_SUPER_ADMIN) {
      return (
        <Redirect
          to={{
            pathname: ADMIN,
            state: { from: props.location }
          }}
        />
      );
    } else if (userInfo.role.name === process.env.REACT_APP_STAFF) {
      return (
        <Redirect
          to={{
            pathname: RAWMATERIALSVIEW,
            state: { from: props.location }
          }}
        />
      );
    } else {
      return <NotFoundPage />;
    }
  } else {
    return (
      <>
        <Redirect
          to={{
            pathname: LOGIN,
            state: { from: props.location }
          }}
        />
      </>
    );
  }
};

DefaultRoute.propTypes = {
  path: PropTypes.string
};

export default DefaultRoute;
