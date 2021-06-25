import * as React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { NotFoundPage } from "../components";
import { Login } from "../containers";

const PublicRoute = props => {
  return (
    <div>
      <Switch>
        <Route path={"/Login"} exact component={Login} />
        <Redirect from={"/"} to={"/Login"} />
        <Route path="*" exact component={NotFoundPage} />
      </Switch>
    </div>
  );
};
export default PublicRoute;
