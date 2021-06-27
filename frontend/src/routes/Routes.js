import React from "react";
import { Switch } from "react-router-dom";
import {
  LOGIN,
  RAWMATERIALSVIEW,
  USERS,
  PROFILE,
  SELLERS,
  PURCHASES,
  ADDSELLER
} from "../paths";
import { Login, Dashboard, Users, Sellers } from "../containers";
import DefaultRoute from "./DefaultRoute";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import { AddSeller } from "../containers/Sellers";

const Routes = () => {
  return (
    <div>
      <Switch>
        <PrivateRoute
          path={RAWMATERIALSVIEW}
          exact
          component={Dashboard}
          header={"Raw Materials"}
        />
        <PrivateRoute
          path={PROFILE}
          exact
          component={Dashboard}
          header={"Profile"}
        />
        <PrivateRoute path={USERS} exact component={Users} header={"Users"} />
        <PrivateRoute
          path={SELLERS}
          exact
          component={Sellers}
          header={"Sellers"}
        />
        <PrivateRoute
          path={ADDSELLER}
          exact
          component={AddSeller}
          header={"Add Seller"}
        />
        <PrivateRoute
          path={PURCHASES}
          exact
          component={Dashboard}
          header={"Purchases"}
        />
        <PublicRoute path={LOGIN} exact component={Login} />
        <DefaultRoute path="*" exact />
      </Switch>
    </div>
  );
};

export default Routes;
