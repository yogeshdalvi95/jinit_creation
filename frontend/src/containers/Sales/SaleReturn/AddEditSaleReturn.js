import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CustomDropDown,
  CustomInput,
  DatePicker,
  DialogBox,
  DialogBoxForSelectingRawMaterial,
  DialogForSelectingPurchase,
  DialogForSelectingSale,
  DialogForSelectingSeller,
  FAB,
  GridContainer,
  GridItem,
  PartyDetails,
  RawMaterialDetail,
  SellerDetails,
  SnackBarComponent,
} from "../../../components";
import moment from "moment";
import SweetAlert from "react-bootstrap-sweetalert";

// core components
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import {
  GOODRETURNLIST,
  SALERETURN,
  SALES,
  VIEWPURCHASES,
  VIEWSALES,
} from "../../../paths";
import { useEffect } from "react";
import { providerForGet, providerForPost, providerForPut } from "../../../api";
import { useState } from "react";
import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Switch,
} from "@material-ui/core";
import {
  checkEmpty,
  hasError,
  setErrors,
  validateNumber,
} from "../../../Utils";
import buttonStyles from "../../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import classNames from "classnames";
import {
  backend_goods_return,
  backend_raw_materials,
  backend_sellers,
  frontendServerUrl,
} from "../../../constants";
import auth from "../../../components/Auth";
import { addQueryParam, removeParamFromUrl } from "../../../Utils/CommonUtils";

const buttonUseStyles = makeStyles(buttonStyles);

const useStyles = makeStyles(styles);

export default function AddEditSaleReturn(props) {
  const classes = useStyles();
  const buttonClasses = buttonUseStyles();
  const history = useHistory();
  const [error, setError] = React.useState({});
  const [alert, setAlert] = useState(null);
  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [id] = useState(props.id ? props.id : null);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    quantity: 0,
    notes: "",
    date: new Date(),
    total_price: 0,
    price_per_piece: 0,
    kachha_ledger: true,
    pakka_ledger: false,
    selected: "sale",
  });

  const [design, setDesign] = useState(null);
  const [color, setColor] = useState(null);
  const [seller, setSeller] = useState(null);
  const [party, setParty] = useState(null);
  const [purchase, setPurchase] = useState(null);
  const [sale, setSale] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogForSelectingSale, setOpenDialogForSelectingSale] =
    useState(false);

  /** useEffect */
  useEffect(() => {
    if ((isEdit || isView) && id) {
      // getEditViewData(id);
    }
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has("osd")) {
      let openSaleDialog = queryParams.get("osd");
      if (validateNumber(openSaleDialog)) {
        setOpenDialogForSelectingSale(true);
      }
    }

    //let colorId = urlParams.get("color");
  }, []);

  /** Submit data */
  const submit = async (event) => {
    event.preventDefault();
    setBackDrop(true);
    let isValid = false;
    let error = {};
    /** This will set errors as per validations defined in form */

    // if (!rawMaterialData) {
    //   error = {
    //     ...error,
    //     raw_material: ["Raw Material is required"],
    //   };
    // }
    // if (!seller) {
    //   error = {
    //     ...error,
    //     seller: ["Seller is required"],
    //   };
    // }
    if (formState.selected === "purchase" && !purchase) {
      error = {
        ...error,
        purchase: ["Purchase is required"],
      };
    }
    if (!formState.quantity) {
      error = {
        ...error,
        quantity: ["Quantity is required"],
      };
    }
    if (!formState.price_per_piece) {
      error = {
        ...error,
        price_per_piece: ["Price per piece is required"],
      };
    }

    /** If no errors then isValid is set true */
    if (checkEmpty(error)) {
      setBackDrop(false);
      setError({});
      isValid = true;
    } else {
      setBackDrop(false);
      setError(error);
    }
    if (isValid) {
      handleAddEdit();
    }
  };

  const handleAddEdit = () => {
    if (isEdit) {
      // addEditData();
    } else {
      const confirmBtnClasses = classNames({
        [buttonClasses.button]: true,
        [buttonClasses["success"]]: true,
      });

      const cancelBtnClasses = classNames({
        [buttonClasses.button]: true,
        [buttonClasses["danger"]]: true,
      });

      setAlert(
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes"
          confirmBtnCssClass={confirmBtnClasses}
          confirmBtnBsStyle="outline-{variant}"
          title="Heads up?"
          onConfirm={handleAcceptDialog}
          onCancel={handleCloseDialog}
          cancelBtnCssClass={cancelBtnClasses}
          focusCancelBtn
        >
          Please make sure you have added the right quantity and selected the
          right raw material because the quantity will be deducted from the raw
          material balance!
        </SweetAlert>
      );
      //setOpenDialog(true);
    }
  };

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  const handleCloseDialog = () => {
    setAlert(null);
    setOpenDialog(false);
  };

  const handleAcceptDialog = () => {
    setOpenDialog(false);
    setAlert(null);
    //addEditData();
  };

  const handleChange = () => {};

  const onBackClick = () => {
    history.push(SALERETURN);
  };

  const handleOpenCloseDialogForSale = (status) => {
    /** Open dialog */
    if (status) {
      addQueryParam("osd", 1);
    } else {
      /** Close dialog */
      let queryParams = removeParamFromUrl("osd");
      history.replace({
        search: queryParams.toString(),
      });
    }
    setOpenDialogForSelectingSale(status);
  };

  const handleAddSale = () => {
    handleOpenCloseDialogForSale(false);
  };

  const handleStartDateChange = (event) => {
    let startDate = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (startDate === "Invalid date") {
      startDate = null;
    } else {
      startDate = new Date(startDate).toISOString();
    }
    setFormState((formState) => ({
      ...formState,
      date: startDate,
    }));
  };

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <FAB align={"start"} size={"small"} onClick={onBackClick}>
          <KeyboardArrowLeftIcon />
        </FAB>
      </GridItem>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      {alert}
      <DialogBox
        open={openDialog}
        dialogTitle={""}
        handleCancel={handleCloseDialog}
        handleClose={handleCloseDialog}
        handleAccept={handleAcceptDialog}
        cancelButton={"Cancel"}
        acceptButton={"Yes"}
        isWarning
        text={[
          `Please make sure you have added the right quantity and selected right raw material because
           the quantity will be deducted from the raw material balance!`,
          `Are you sure you
        want to proceed ?`,
        ]}
      ></DialogBox>
      <DialogForSelectingSale
        handleCancel={() => handleOpenCloseDialogForSale(false)}
        handleClose={() => handleOpenCloseDialogForSale(false)}
        handleAddSale={handleAddSale}
        open={openDialogForSelectingSale}
      />
      <GridItem xs={12} sm={12} md={10}>
        <Card>
          <CardHeader color="primary" className={classes.cardHeaderStyles}>
            <h4 className={classes.cardTitleWhite}>{props.header}</h4>
            <p className={classes.cardCategoryWhite}></p>
          </CardHeader>
          <CardBody>
            <GridContainer>
              <>
                <GridItem
                  xs={12}
                  sm={12}
                  md={12}
                  className={classes.labelButtonStylesForAddForm}
                >
                  {!isEdit && !isView && (
                    <Button
                      color="primary"
                      onClick={() => {
                        handleOpenCloseDialogForSale(true);
                      }}
                    >
                      {sale ? "Change Sale" : "Select Sale"}
                    </Button>
                  )}

                  {sale && (
                    <Button
                      color="primary"
                      onClick={() => {
                        window.open(
                          `${frontendServerUrl}${VIEWSALES}/${sale}?highlight=true&design=${design.id}&color=${color.id}`,
                          "_blank"
                        );
                      }}
                    >
                      View Sale
                    </Button>
                  )}
                </GridItem>
                {hasError("sale", error) ? (
                  <GridItem xs={12} sm={12} md={12}>
                    <FormHelperText
                      id={"seller_helpertext_id"}
                      error={hasError("sale", error)}
                    >
                      {hasError("sale", error)
                        ? error["sale"].map((error) => {
                            return error + " ";
                          })
                        : null}
                    </FormHelperText>
                  </GridItem>
                ) : null}
              </>
            </GridContainer>
            <GridContainer>
              <GridItem
                xs={12}
                sm={12}
                md={6}
                className={classes.rootLabelButtonGridBorderRight}
              >
                <GridContainer>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    className={classes.labelStylesForAddForm}
                  >
                    Sale
                  </GridItem>
                </GridContainer>
                {/* {rawMaterialData && rawMaterialData.id ? (
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                      <RawMaterialDetail raw_material={rawMaterialData} />
                    </GridItem>
                  </GridContainer>
                ) : null} */}
              </GridItem>
              {/** Sell to */}
              <GridItem xs={12} sm={12} md={6}>
                <GridContainer>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    className={classes.labelStylesForAddForm}
                  >
                    Sold to
                  </GridItem>
                </GridContainer>

                {party && party.id ? (
                  <GridContainer>
                    <GridItem>
                      <PartyDetails party={party} />
                    </GridItem>
                  </GridContainer>
                ) : null}
              </GridItem>
            </GridContainer>
            {formState.selected ? (
              <>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={3}>
                    <DatePicker
                      onChange={(event) => handleStartDateChange(event)}
                      label="Selling Date"
                      name="date"
                      disabled={isView}
                      value={formState.date || new Date()}
                      id="date"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      style={{
                        marginTop: "1.8rem",
                        width: "100%",
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <CustomInput
                      onChange={(event) => handleChange(event)}
                      type="number"
                      disabled={isView}
                      labelText="Quantity"
                      name="quantity"
                      value={formState.quantity}
                      id="purchase_quantity"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      /** For setting errors */
                      helperTextId={"helperText_quantity"}
                      isHelperText={hasError("quantity", error)}
                      helperText={
                        hasError("quantity", error)
                          ? error["quantity"].map((error) => {
                              return error + " ";
                            })
                          : null
                      }
                      error={hasError("quantity", error)}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <CustomInput
                      onChange={(event) => handleChange(event)}
                      type="number"
                      disabled={isView}
                      labelText="Price Per Piece"
                      name="price_per_piece"
                      value={formState.price_per_piece}
                      id="price_per_piece"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      /** For setting errors */
                      helperTextId={"helperText_price_per_piece"}
                      isHelperText={hasError("price_per_piece", error)}
                      helperText={
                        hasError("price_per_piece", error)
                          ? error["price_per_piece"].map((error) => {
                              return error + " ";
                            })
                          : null
                      }
                      error={hasError("price_per_piece", error)}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <CustomInput
                      onChange={(event) => handleChange(event)}
                      type="number"
                      disabled={true}
                      labelText="Total Price"
                      name="total_price"
                      value={formState.total_price.toFixed(2)}
                      id="total_price"
                      formControlProps={{
                        fullWidth: true,
                      }}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText="Notes"
                      id="notes"
                      name="notes"
                      disabled={isView}
                      onChange={(event) => handleChange(event)}
                      value={formState.notes}
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        multiline: true,
                        rows: 3,
                      }}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={3}
                    className={classes.switchBoxInFilter}
                  >
                    <div className={classes.block}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formState.kachha_ledger}
                            disabled={isView}
                            onChange={(event) => {
                              setFormState((formState) => ({
                                ...formState,
                                kachha_ledger: event.target.checked,
                              }));
                            }}
                            classes={{
                              switchBase: classes.switchBase,
                              checked: classes.switchChecked,
                              thumb: classes.switchIcon,
                              track: classes.switchBar,
                            }}
                          />
                        }
                        classes={{
                          label: classes.label,
                        }}
                        label="Add in Kachha Ledger?"
                      />
                    </div>
                  </GridItem>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={3}
                    className={classes.switchBoxInFilter}
                  >
                    <div className={classes.block}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formState.pakka_ledger}
                            disabled={isView}
                            onChange={(event) => {
                              setFormState((formState) => ({
                                ...formState,
                                pakka_ledger: event.target.checked,
                              }));
                            }}
                            classes={{
                              switchBase: classes.switchBase,
                              checked: classes.switchChecked,
                              thumb: classes.switchIcon,
                              track: classes.switchBar,
                            }}
                          />
                        }
                        classes={{
                          label: classes.label,
                        }}
                        label="Add in Pakka Ledger?"
                      />
                    </div>
                  </GridItem>
                </GridContainer>
              </>
            ) : null}
          </CardBody>
          {isView || !formState.selected ? null : (
            <CardFooter>
              <Button color="primary" onClick={(e) => submit(e)}>
                Save
              </Button>
            </CardFooter>
          )}
        </Card>
        <Backdrop className={classes.backdrop} open={openBackDrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </GridItem>
    </GridContainer>
  );
}
