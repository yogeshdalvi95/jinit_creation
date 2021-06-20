import React from "../../node_modules/react";
import { Redirect } from "../../node_modules/react-router-dom";
import PropTypes from "../../node_modules/prop-types";
import { Auth, NotFoundPage } from "../components";
import { DASHBOARD, LOGIN } from "../paths";
import { Route } from "react-router-dom";
import { LogIn } from "../containers";

const DefaultRoute = props => {
  return (
    <Redirect
      to={{
        pathname: DASHBOARD,
        state: { from: props.location }
      }}
    />
  );
};

DefaultRoute.propTypes = {
  component: PropTypes.any.isRequired,
  layout: PropTypes.any.isRequired,
  path: PropTypes.string
};

export default DefaultRoute;
