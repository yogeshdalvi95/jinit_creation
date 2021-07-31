import React from "react";
import { Switch } from "react-router-dom";
import {
  LOGIN,
  RAWMATERIALSVIEW,
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
  VIEWRAWMATERIALS,
  DAILYUSAGERAWMATERIALS
} from "../paths";
import {
  Login,
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
  AddSeller,
  AddDailyUsage
} from "../containers";
import DefaultRoute from "./DefaultRoute";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

const Routes = () => {
  return (
    <div>
      <Switch>
        {/*** Admin */}
        <PrivateRoute
          openSubMenu={false}
          path={ADMIN}
          exact
          component={Admin}
          header={"Admin Users"}
        />
        <PrivateRoute
          openSubMenu={false}
          path={ADDADMIN}
          exact
          component={AddAdmin}
          header={"Add Admin"}
        />

        {/** Add Staff */}
        <PrivateRoute
          openSubMenu={false}
          path={STAFF}
          exact
          component={Staff}
          header={"Staff Users"}
        />
        <PrivateRoute
          openSubMenu={false}
          path={ADDSTAFF}
          exact
          component={AddStaff}
          header={"Add Staff"}
        />

        {/** Sellers */}
        <PrivateRoute
          openSubMenu={true}
          path={SELLERS}
          exact
          component={Sellers}
          addComponentPath={ADDSELLER}
          header={"Sellers"}
          value={1}
        />
        <PrivateRoute
          openSubMenu={true}
          path={ADDSELLER}
          exact
          component={AddSeller}
          header={"Add Seller"}
        />
        <PrivateRoute
          openSubMenu={true}
          path={EDITSELLER}
          exact
          component={AddSeller}
          header={"Edit Seller"}
        />

        {/** Purchases */}
        <PrivateRoute
          openSubMenu={true}
          path={PURCHASES}
          exact
          component={Purchases}
          addComponentPath={ADDPURCHASES}
          header={"Purchases"}
          value={0}
        />
        <PrivateRoute
          openSubMenu={true}
          path={ADDPURCHASES}
          exact
          component={AddPurchases}
          header={"Add Purchases"}
        />
        <PrivateRoute
          openSubMenu={true}
          path={EDITPURCHASES}
          exact
          component={AddPurchases}
          header={"Edit Purchase"}
        />
        <PrivateRoute
          openSubMenu={true}
          path={VIEWPURCHASES}
          exact
          component={AddPurchases}
          header={"View Purchase"}
        />

        {/** Raw materials */}
        <PrivateRoute
          openSubMenu={true}
          path={RAWMATERIALSVIEW}
          exact
          addComponentPath={ADDRAWMATERIALS}
          component={RawMaterials}
          header={"Raw Materials"}
          value={0}
        />
        <PrivateRoute
          openSubMenu={true}
          path={ADDRAWMATERIALS}
          exact
          component={AddEditRawMaterial}
          header={"Add New Raw Material"}
        />
        <PrivateRoute
          openSubMenu={true}
          path={EDITRAWMATERIALS}
          exact
          component={AddEditRawMaterial}
          header={"Edit Raw Material"}
        />
        <PrivateRoute
          openSubMenu={true}
          path={VIEWRAWMATERIALS}
          exact
          component={AddEditRawMaterial}
          header={"View Raw Material"}
        />
        <PrivateRoute
          openSubMenu={true}
          path={DAILYUSAGERAWMATERIALS}
          exact
          component={AddDailyUsage}
          header={"Daily Usage"}
        />

        {/** Units */}
        <PrivateRoute
          openSubMenu={true}
          path={UNITS}
          exact
          addComponentPath={ADDUNITS}
          component={Units}
          header={"Units"}
          value={1}
        />
        <PrivateRoute
          openSubMenu={true}
          path={ADDUNITS}
          exact
          component={AddEditUnit}
          header={"Add New Unit"}
        />

        <PrivateRoute
          openSubMenu={false}
          path={DEPARTMENTS}
          exact
          component={Departments}
          header={"Departments"}
        />
        <PrivateRoute
          openSubMenu={false}
          path={ADDDEPARTMENTS}
          exact
          component={AddDepartment}
          header={"Add Department"}
        />

        {/** Ready Material */}

        <PublicRoute path={LOGIN} exact component={Login} />
        <DefaultRoute path="*" exact />
      </Switch>
    </div>
  );
};

export default Routes;
