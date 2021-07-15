import React from "react";
import { Switch } from "react-router-dom";
import {
  LOGIN,
  RAWMATERIALSVIEW,
  PROFILE,
  SELLERS,
  PURCHASES,
  ADMIN,
  STAFF,
  ADDADMIN,
  ADDSTAFF,
  DEPARTMENTS,
  ADDDEPARTMENTS,
  ADDPURCHASES,
  UNITS,
  ADDRAWMATERIALS,
  ADDUNITS,
  ADDSELLER,
  VIEWPURCHASES,
  EDITSELLER,
  EDITPURCHASES,
  EDITRAWMATERIALS,
  VIEWRAWMATERIALS
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
  AddDepartment,
  AddPurchases,
  Purchases,
  RawMaterials,
  Units,
  AddEditRawMaterial,
  AddEditUnit,
  AddSeller
} from "../containers";
import DefaultRoute from "./DefaultRoute";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import RouteWithTabLayoutForPurchase from "./RouteWithTabLayoutForPurchase";
import { RouteWithTabLayoutForRawMaterial } from ".";

const Routes = () => {
  return (
    <div>
      <Switch>
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
        <RouteWithTabLayoutForPurchase
          path={SELLERS}
          exact
          component={Sellers}
          addComponentPath={ADDSELLER}
          header={"Sellers"}
          value={1}
        />
        <PrivateRoute
          path={ADDSELLER}
          exact
          component={AddSeller}
          header={"Add Seller"}
        />
        <PrivateRoute
          path={EDITSELLER}
          exact
          component={AddSeller}
          header={"Edit Seller"}
        />

        {/** Purchases */}
        <RouteWithTabLayoutForPurchase
          path={PURCHASES}
          exact
          component={Purchases}
          addComponentPath={ADDPURCHASES}
          header={"Purchases"}
          value={0}
        />
        <PrivateRoute
          path={ADDPURCHASES}
          exact
          component={AddPurchases}
          header={"Add Purchases"}
        />
        <PrivateRoute
          path={EDITPURCHASES}
          exact
          component={AddPurchases}
          header={"Edit Purchase"}
        />
        <PrivateRoute
          path={VIEWPURCHASES}
          exact
          component={AddPurchases}
          header={"View Purchase"}
        />

        {/** Raw materials */}
        <RouteWithTabLayoutForRawMaterial
          path={RAWMATERIALSVIEW}
          exact
          addComponentPath={ADDRAWMATERIALS}
          component={RawMaterials}
          header={"Raw Materials"}
          value={0}
        />
        <PrivateRoute
          path={ADDRAWMATERIALS}
          exact
          component={AddEditRawMaterial}
          header={"Add New Raw Material"}
        />
        <PrivateRoute
          path={EDITRAWMATERIALS}
          exact
          component={AddEditRawMaterial}
          header={"Edit Raw Material"}
        />
        <PrivateRoute
          path={VIEWRAWMATERIALS}
          exact
          component={AddEditRawMaterial}
          header={"View Raw Material"}
        />

        {/** Units */}
        <RouteWithTabLayoutForRawMaterial
          path={UNITS}
          exact
          addComponentPath={ADDUNITS}
          component={Units}
          header={"Units"}
          value={1}
        />
        <PrivateRoute
          path={ADDUNITS}
          exact
          component={AddEditUnit}
          header={"Add New Unit"}
        />

        <PublicRoute path={LOGIN} exact component={Login} />
        <DefaultRoute path="*" exact />
      </Switch>
    </div>
  );
};

export default Routes;
