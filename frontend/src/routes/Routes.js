import React from "react";
import { Switch } from "react-router-dom";
import { Dashboard, RawMaterials } from "../containers";
import { DASHBOARD, RAWMATERIALSVIEW } from "../paths";
import PublicRoute from "./PublicRoute";

const Routes = () => {
  return (
    <div>
      <Switch>
        <PublicRoute path={DASHBOARD} exact component={Dashboard} />
        <PublicRoute path={RAWMATERIALSVIEW} exact component={RawMaterials} />

        {/* <Route path={LOGOUT} exact component={Logout} /> */}
        {/* <DefaultRoute path="*" exact /> */}
      </Switch>
    </div>
  );
};

export default Routes;
