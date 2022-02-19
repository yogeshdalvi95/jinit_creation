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
  ADDORDER,
  EDITORDER,
  VIEWORDER,
  ORDERS,
  ADDCOLOR,
  EDITCOLOR,
  COLORS,
  ADDCATEGORIES,
  EDITCATEGORIES,
  CATEGORIES,
  DEPARTMENTSHEET,
  LEDGER,
  SALES,
  ADDSALES,
  EDITSALES,
  NOTFOUNDPAGE,
  SALERETURN,
  ADDSALERETURN,
  EDITSALERETURN,
  VIEWSALERETURN,
  DESIGNS,
  ADDDESIGN,
  VIEWDESIGNID,
  EDITDESIGNID,
  SELECTRAWMATERIALSID,
  SELECTREADYMATERIALSID,
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
  ViewOrders,
  DepartmentSheet,
  Ledger,
  AddEditSales,
  SaleReturn,
  AddEditSaleReturn,
  Designs,
  AddEditDesign,
  DesignMaterials,
} from "../containers";
import DefaultRoute from "./DefaultRoute";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import {
  AddEditCategories,
  AddEditColor,
  Categories,
  Color,
} from "../containers/RawMaterials";
import EditRoute from "./EditRoute";
import ViewRoute from "./ViewRoute";
import NotFoundRoute from "./NotFoundRoute";
import RouteWithTabLayout from "./RouteWithTabLayout";

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

        <PrivateRoute
          openSubMenu={true}
          path={LEDGER}
          exact
          component={Ledger}
          header={"Purchase Ledger"}
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

        {/** Designs */}
        <PrivateRoute
          openSubMenu={true}
          path={DESIGNS}
          exact
          component={Designs}
          header={"Designs"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={ADDDESIGN}
          exact
          component={AddEditDesign}
          header={"Add Design"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={EDITDESIGNID}
          exact
          component={AddEditDesign}
          header={"Edit Design"}
          isDependent={true}
          isEdit={true}
        />

        <PrivateRoute
          openSubMenu={true}
          path={VIEWDESIGNID}
          exact
          component={AddEditDesign}
          header={"View Design"}
          isDependent={true}
          isView={true}
        />

        {/** Material for design */}
        <RouteWithTabLayout
          openSubMenu={true}
          path={SELECTRAWMATERIALSID}
          exact
          component={DesignMaterials}
          header={"Select Raw Materials For Design"}
          isColor={false}
        />

        <RouteWithTabLayout
          openSubMenu={true}
          path={SELECTREADYMATERIALSID}
          exact
          component={DesignMaterials}
          header={"Select Ready Materials For Design"}
          isColor={false}
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

        {/** Orders section */}
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
          path={VIEWORDER}
          exact
          component={AddOrder}
          header={"View Order"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={ORDERS}
          exact
          component={ViewOrders}
          header={"Orders"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={DEPARTMENTSHEET}
          exact
          component={DepartmentSheet}
          header={"Department Sheet"}
        />

        {/** Colors */}
        <PrivateRoute
          openSubMenu={true}
          path={ADDCOLOR}
          exact
          component={AddEditColor}
          header={"Add Color"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={EDITCOLOR}
          exact
          component={AddEditColor}
          header={"Edit Color"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={COLORS}
          exact
          component={Color}
          header={"Colors"}
        />

        {/** Categoris */}
        <PrivateRoute
          openSubMenu={true}
          path={ADDCATEGORIES}
          exact
          component={AddEditCategories}
          header={"Add Category"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={EDITCATEGORIES}
          exact
          component={AddEditCategories}
          header={"Edit Category"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={CATEGORIES}
          exact
          component={Categories}
          header={"Categories"}
        />

        {/** SALES */}
        <PrivateRoute
          openSubMenu={true}
          path={SALES}
          exact
          component={Sales}
          header={"Sales"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={ADDSALES}
          exact
          component={AddEditSales}
          header={"Add Sale"}
        />

        <EditRoute
          openSubMenu={true}
          path={EDITSALES}
          exact
          component={AddEditSales}
          header={"Edit Sale"}
          defaultPathToPush={SALES}
        />

        <ViewRoute
          openSubMenu={true}
          path={VIEWSALES}
          exact
          component={AddEditSales}
          header={"View Sale"}
          defaultPathToPush={SALES}
        />

        {/** Sale return  */}

        <PrivateRoute
          openSubMenu={true}
          path={SALERETURN}
          exact
          component={SaleReturn}
          header={"Sale Return"}
        />

        <PrivateRoute
          openSubMenu={true}
          path={ADDSALERETURN}
          exact
          component={AddEditSaleReturn}
          header={"Add Sale Return"}
        />

        <EditRoute
          openSubMenu={true}
          path={EDITSALERETURN}
          exact
          component={AddEditSaleReturn}
          header={"Edit Sale Return"}
          defaultPathToPush={SALERETURN}
        />

        <ViewRoute
          openSubMenu={true}
          path={VIEWSALERETURN}
          exact
          component={AddEditSaleReturn}
          header={"View Sale"}
          defaultPathToPush={SALERETURN}
        />

        {/** Parties section */}
        <PrivateRoute
          openSubMenu={true}
          path={PARTIES}
          exact
          component={Parties}
          header={"Parties"}
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

        <NotFoundRoute
          openSubMenu={true}
          path={NOTFOUNDPAGE}
          exact
          header={""}
        />

        <PublicRoute path={LOGIN} exact component={Login} />
        <DefaultRoute path="*" exact />
      </Switch>
    </div>
  );
};

export default Routes;
