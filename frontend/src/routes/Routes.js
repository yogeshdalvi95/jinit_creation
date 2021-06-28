import React from "react";
import { Switch } from "react-router-dom";
import {
  LOGIN,
  RAWMATERIALSVIEW,
  PROFILE,
  SELLERS,
  PURCHASES,
  ADDSELLER,
  ADMIN,
  STAFF,
  ADDADMIN,
  ADDSTAFF,
  DEPARTMENTS,
  ADDDEPARTMENTS
} from "../paths";
import {
  Login,
  Dashboard,
  Sellers,
  Admin,
  Staff,
  AddAdmin,
  AddStaff,
  Departments,
  AddDepartment
} from "../containers";
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
        {/*** Admin */}
        <PrivateRoute
          path={ADMIN}
          exact
          component={Admin}
          header={"Admin Users"}
        />
        <PrivateRoute
          path={ADDADMIN}
          exact
          component={AddAdmin}
          header={"Add Admin"}
        />

        {/** Add Staff */}
        <PrivateRoute
          path={STAFF}
          exact
          component={Staff}
          header={"Staff Users"}
        />
        <PrivateRoute
          path={ADDSTAFF}
          exact
          component={AddStaff}
          header={"Add Staff"}
        />

        {/** Add Departments */}
        <PrivateRoute
          path={DEPARTMENTS}
          exact
          component={Departments}
          header={"Departments"}
        />
        <PrivateRoute
          path={ADDDEPARTMENTS}
          exact
          component={AddDepartment}
          header={"Add Department"}
        />

        {/** Sellers */}
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
