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
  DAILYUSAGERAWMATERIALS,
  GOODRETURNLIST,
  ADDGOODRETURN,
  EDITGOODRETURN,
  VIEWGOODRETURN,
  VIEWKACHHAPURCHASEDETAILS,
  LISTREADYMATERIAL,
  ADDREADYMATERIAL,
  EDITREADYMATERIAL,
  VIEWREADYMATERIAL,
  VIEWSALES,
  PARTIES,
  ADDPARTIES,
  EDITPARTIES,
  VIEWORDERS,
  ADDORDER,
  EDITORDER
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
  AddDailyUsage,
  GoodsReturn,
  AddGoodReturn,
  KachhaPurchaseDetails,
  ReadyMaterials,
  AddEditReadyMaterial,
  Sales,
  Parties,
  AddParties,
  AddOrder,
  ViewOrders
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
          header={"All Purchases"}
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
        <PrivateRoute
          openSubMenu={true}
          path={VIEWKACHHAPURCHASEDETAILS}
          exact
          component={KachhaPurchaseDetails}
          header={"Kachha Purchase Details"}
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
          openSubMenu={true}
          path={DEPARTMENTS}
          exact
          component={Departments}
          header={"Departments"}
        />
        <PrivateRoute
          openSubMenu={true}
          path={ADDDEPARTMENTS}
          exact
          component={AddDepartment}
          header={"Add Department"}
        />

        {/** Goods Return */}
        <PrivateRoute
          openSubMenu={true}
          path={GOODRETURNLIST}
          exact
          component={GoodsReturn}
          header={"Returned Goods"}
        />
        <PrivateRoute
          openSubMenu={true}
          path={ADDGOODRETURN}
          exact
          component={AddGoodReturn}
          header={"Return Goods"}
        />
        <PrivateRoute
          openSubMenu={true}
          path={EDITGOODRETURN}
          exact
          component={AddGoodReturn}
          header={"Edit Returned Goods"}
        />
        <PrivateRoute
          openSubMenu={true}
          path={VIEWGOODRETURN}
          exact
          component={AddGoodReturn}
          header={"View Returned Goods"}
        />

        {/** Ready Material */}
        <PrivateRoute
          openSubMenu={true}
          path={LISTREADYMATERIAL}
          exact
          component={ReadyMaterials}
          header={"Ready Material"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={ADDREADYMATERIAL}
          exact
          component={AddEditReadyMaterial}
          header={"Add Ready Material"}
        />
        <PrivateRoute
          openSubMenu={true}
          path={EDITREADYMATERIAL}
          exact
          component={AddEditReadyMaterial}
          header={"Edit Ready Material"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={VIEWREADYMATERIAL}
          exact
          component={AddEditReadyMaterial}
          header={"Views Ready Material"}
        />

        {/** SALES */}
        <PrivateRoute
          openSubMenu={true}
          path={VIEWSALES}
          exact
          component={Sales}
          header={"View Sales"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={PARTIES}
          exact
          component={Parties}
          header={"View Parties"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={ADDPARTIES}
          exact
          component={AddParties}
          header={"Add Party"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={EDITPARTIES}
          exact
          component={AddParties}
          header={"Edit Party"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={ADDORDER}
          exact
          component={AddOrder}
          header={"Add Order"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={EDITORDER}
          exact
          component={AddOrder}
          header={"Edit Order"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={VIEWORDERS}
          exact
          component={ViewOrders}
          header={"View Order"}
        />

        <PublicRoute path={LOGIN} exact component={Login} />
        <DefaultRoute path="*" exact />
      </Switch>
    </div>
  );
};

export default Routes;
