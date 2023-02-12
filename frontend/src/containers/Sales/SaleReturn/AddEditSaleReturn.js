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
  CustomCheckBox,
  CustomInput,
  CustomMaterialUITable,
  CustomTableBody,
  CustomTableCell,
  CustomTableHead,
  CustomTableRow,
  DatePicker,
  DialogBox,
  DialogForSelectingSale,
  FAB,
  GridContainer,
  GridItem,
  PartyDetails,
  SnackBarComponent,
} from "../../../components";
import moment from "moment";
import SweetAlert from "react-bootstrap-sweetalert";
import no_image_icon from "../../../assets/img/no_image_icon.png";

// core components
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { SALERETURN, VIEWSALES } from "../../../paths";
import { useEffect } from "react";
import { useState } from "react";
import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Switch,
  Link,
} from "@material-ui/core";
import { hasError, validateNumber } from "../../../Utils";
import buttonStyles from "../../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import classNames from "classnames";
import {
  apiUrl,
  backend_sale_return,
  frontendServerUrl,
} from "../../../constants";
import {
  addQueryParam,
  convertNumber,
  formatDate,
  removeParamFromUrl,
} from "../../../Utils/CommonUtils";
import { Paper, TableContainer } from "@mui/material";
import {
  providerForDelete,
  providerForGet,
  providerForPost,
} from "../../../api";

const buttonUseStyles = makeStyles(buttonStyles);

const useStyles = makeStyles(styles);

export default function AddEditSaleReturn(props) {
  const classes = useStyles();
  const buttonClasses = buttonUseStyles();
  const history = useHistory();
  const [error] = React.useState({});
  const [alert, setAlert] = useState(null);
  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [id] = useState(props.id ? props.id : null);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const [openBackDrop, setOpenBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    date: new Date(),
    notes: "",
    total_price: 0,
    kachha_ledger: true,
    pakka_ledger: false,
    sale_return_no: "----",
  });

  const [sale, setSale] = useState(null);
  const [designError, setDesignError] = useState({});
  const [selectedparty, setSelectedParty] = React.useState(null);
  const [designDetail, setDesignDetail] = React.useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogForSelectingSale, setOpenDialogForSelectingSale] =
    useState(false);

  /** useEffect */
  useEffect(() => {
    if ((isEdit || isView) && id) {
      getEditViewData(id);
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

  const getEditViewData = async (id) => {
    setOpenBackDrop(true);
    let isError = false;
    await providerForGet(backend_sale_return + "/" + id, {}, Auth.getToken())
      .then((res) => {
        if (res.status === 200) {
          convertData(res.data);
        } else {
          isError = true;
        }
      })
      .catch((err) => {
        setOpenBackDrop(false);
        isError = true;
      });
    if (isError) {
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Error fetching sale return data",
      }));
    }
  };

  const convertData = (data) => {
    setOpenBackDrop(true);

    setFormState({
      date: new Date(data.date),
      notes: data.notes,
      total_price: validateNumber(data.total_price),
      kachha_ledger: data.kachha_ledger,
      pakka_ledger: data.pakka_ledger,
      sale_return_no: data.sale_return_no,
    });

    if (data.sale) {
      let saleData = data.sale;
      setSale({
        id: saleData.id,
        bill_no: saleData.bill_no,
        date: new Date(saleData.date),
        type_of_bill: data.type_of_bill,
        total_price: validateNumber(saleData.total_price),
        total_price_of_all_design: validateNumber(
          saleData.total_price_of_all_design
        ),
      });
    }

    setSelectedParty({
      gst_no: data.party.gst_no,
      id: data.party.id,
      party_name: data.party.party_name,
      party_address: data.party.party_address,
    });

    let saleReadyMaterial = {};
    data.sale_ready_material.forEach((el) => {
      let designId = el.design?.id;
      let colorId = el.color?.id;
      let design = el.design;
      /** ----------------------------------------- */
      let colorData = {
        id: el.id,
        design: designId,
        colorData: el.color,
        color: colorId,
        quantity: validateNumber(el.quantity),
        returned_quantity: validateNumber(el.returned_quantity),
        price_per_unit: validateNumber(el.price_per_unit),
        return_price_per_unit: validateNumber(el.return_price_per_unit),
        total_price: validateNumber(el.total_price),
        return_total_price: validateNumber(el.return_total_price),
        previousQuantity: validateNumber(el.returned_quantity),
        quantity_to_add_deduct: 0,
        availableQuantity: el.color_price?.stock ? el.color_price?.stock : 0,
        selected: false,
      };

      if (designId) {
        if (saleReadyMaterial[designId]) {
          let allColors = saleReadyMaterial[designId].allColors;
          allColors.push(colorData);
          saleReadyMaterial = {
            ...saleReadyMaterial,
            [designId]: {
              ...saleReadyMaterial[designId],
              allColors: allColors,
            },
          };
        } else {
          saleReadyMaterial = {
            ...saleReadyMaterial,
            [designId]: {
              material_no: design.material_no,
              material_price: design.material_price,
              add_price: validateNumber(design.add_price),
              images: design.images,
              allColors: [colorData],
              is_ready_material: true,
              are_ready_materials_clubbed: false,
            },
          };
        }
      } else {
        saleReadyMaterial = {
          ...saleReadyMaterial,
          [["NoDesign-" + Math.floor(new Date().valueOf() * Math.random())]]: {
            id: el.id,
            designId: null,
            images: [],
            colorsPresent: [],
            allColors: [],
            name: el.name,
            quantity: validateNumber(el.quantity),
            returned_quantity: validateNumber(el.returned_quantity),
            price_per_unit: validateNumber(el.price_per_unit),
            return_price_per_unit: validateNumber(el.return_price_per_unit),
            total_price: validateNumber(el.total_price),
            return_total_price: validateNumber(el.return_total_price),
            previousQuantity: validateNumber(el.returned_quantity),
            is_ready_material: false,
            are_ready_materials_clubbed: true,
          },
        };
      }
    });

    setDesignDetail(saleReadyMaterial);
    setOpenBackDrop(false);
  };

  const handleShowAlert = (saleReturnData) => {
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
          onConfirm={() => {
            setAlert(null);
          }}
          onCancel={() => {
            setAlert(null);
          }}
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
      removeParamFromUrl("osd");
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

  const setBackDrop = (status) => {
    setOpenBackDrop(status);
  };

  const setPartyAndSaleData = (party, designDetail, saleData) => {
    console.log(party, designDetail, saleData);
    setDesignDetail(designDetail);
    setSelectedParty(party);
    setSale(saleData);
  };

  const onSelectCheckBox = (event, colorKey, designKey) => {
    let currObject = designDetail[designKey];
    if (colorKey !== null && colorKey !== undefined && colorKey >= 0) {
      let colorObj = currObject.allColors[colorKey];
      colorObj = {
        ...colorObj,
        selected: event.target.checked,
      };
      setDesignDetail((designDetail) => ({
        ...designDetail,
        [designKey]: {
          ...designDetail[designKey],
          allColors: [
            ...designDetail[designKey].allColors.slice(0, colorKey),
            colorObj,
            ...designDetail[designKey].allColors.slice(colorKey + 1),
          ],
        },
      }));
    }
  };

  const handleChangeForRepetableComponent = (event, colorKey, designKey) => {
    let currObject = designDetail[designKey];
    let name = event.target.name;
    let total_price_per_piece = 0;
    let total_previous_price = 0;
    let isValid = false;
    let error = "";
    if (colorKey !== null && colorKey !== undefined && colorKey >= 0) {
      let colorObj = currObject.allColors[colorKey];
      total_previous_price = colorObj.return_total_price;
      let keyName = name + "color" + colorKey + "design" + designKey;
      let quantity_to_add_deduct = 0;
      let previousQuantity = validateNumber(colorObj.previousQuantity);
      let soldQuantity = validateNumber(colorObj.quantity);

      /** Calculations */
      if (name === "returned_quantity") {
        let returned_quantity = 0;
        let price_per_piece = validateNumber(colorObj.return_price_per_unit);
        if (event.target.value && !isNaN(event.target.value)) {
          returned_quantity = validateNumber(event.target.value);
        }
        total_price_per_piece = returned_quantity * price_per_piece;

        /** Set Error */
        console.log("returned_quantity => ", returned_quantity);
        console.log("soldQuantity => ", soldQuantity);
        if (returned_quantity > soldQuantity) {
          isValid = false;
          error = "Quantity cannot be greater than the sold quantity";
        } else if (returned_quantity < 0) {
          isValid = false;
          error = "Quantity cannot be negative";
        } else {
          isValid = true;
          quantity_to_add_deduct = returned_quantity - previousQuantity;
        }
      } else {
        let returned_quantity = validateNumber(colorObj.returned_quantity);
        let price_per_piece = 0;
        if (event.target.value && !isNaN(event.target.value)) {
          price_per_piece = validateNumber(event.target.value);
        }
        total_price_per_piece = returned_quantity * price_per_piece;
        if (price_per_piece < 0) {
          isValid = false;
          error = "Price per piece cannot be negative";
        } else {
          isValid = true;
          quantity_to_add_deduct = returned_quantity - previousQuantity;
        }
      }
      if (isValid) {
        delete designError[keyName];
        setDesignError((designError) => ({
          ...designError,
        }));
      } else {
        setDesignError((designError) => ({
          ...designError,
          [keyName]: [error],
        }));
      }

      colorObj = {
        ...colorObj,
        quantity_to_add_deduct: quantity_to_add_deduct,
        [name]: event.target.value,
        return_total_price: total_price_per_piece,
        message: ``,
      };

      setDesignDetail((designDetail) => ({
        ...designDetail,
        [designKey]: {
          ...designDetail[designKey],
          allColors: [
            ...designDetail[designKey].allColors.slice(0, colorKey),
            colorObj,
            ...designDetail[designKey].allColors.slice(colorKey + 1),
          ],
        },
      }));
    }
    /** New Price Calculation */
    let total_price_after_deducted_old_value =
      validateNumber(formState.total_price) -
      validateNumber(total_previous_price);
    let total_price_after_adding_new_value =
      total_price_after_deducted_old_value + total_price_per_piece;

    /** Set new price */
    setFormState((formState) => ({
      ...formState,
      total_price: total_price_after_adding_new_value,
    }));
  };

  const deleteData = async (e) => {
    e.preventDefault();
    setOpenBackDrop(true);
    await providerForDelete(backend_sale_return, id, Auth.getToken())
      .then(async (res) => {
        setOpenBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "success",
          message: "Successfully deleted sale return data",
        }));
        history.push(SALERETURN);
      })
      .catch((err) => {
        setOpenBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error deleting sale return data",
        }));
      });
  };

  const addEditData = async (e) => {
    e.preventDefault();
    let obj = {};
    obj = {
      id: id,
      state: {
        ...formState,
        sale: sale.id,
        saleDate: sale.date,
        saleBillNo: sale.bill_no,
        party: selectedparty.id,
      },
      designAndColor: designDetail,
    };
    setBackDrop(true);
    await providerForPost(backend_sale_return, obj, Auth.getToken())
      .then((res) => {
        history.push(SALERETURN);
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error Adding/Editing Sale Data",
        }));
      });
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
        setBackDrop={() => setBackDrop()}
        setPartyAndSaleData={setPartyAndSaleData}
      />
      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="primary" className={classes.cardHeaderStyles}>
            <h4 className={classes.cardTitleWhite}>{props.header}</h4>
            <p className={classes.cardCategoryWhite}></p>
          </CardHeader>
          <CardBody>
            <>
              <GridContainer>
                <GridItem xs={12} sm={12} md={3}>
                  <DatePicker
                    onChange={(event) => handleStartDateChange(event)}
                    label="Sale Return Date"
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
                      rows: 1,
                    }}
                  />
                </GridItem>
              </GridContainer>
            </>
            <br />
            <br />
            <br />
            {sale && sale.id && (
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

                    <GridItem xs={12} sm={12} md={12}>
                      <b>Sale Details :-</b>
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={12}>
                          <Link
                            href={`${frontendServerUrl}${VIEWSALES}/${sale.id}`}
                            underline="always"
                            target="_blank"
                          >
                            Check sale data here
                          </Link>
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                          <b>Bill No : </b>
                          {sale.bill_no}
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}></GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                          <b>Date : </b> {formatDate(sale.date)}
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                          <b>Type : </b> {sale.type_of_bill}
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                          <b>Total Price : </b>{" "}
                          {convertNumber(sale.total_price, true)}
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                  </GridContainer>
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
                    {selectedparty && selectedparty.id && (
                      <GridItem xs={12} sm={12} md={12}>
                        <PartyDetails party={selectedparty} viewParty={true} />
                      </GridItem>
                    )}
                  </GridContainer>
                </GridItem>
              </GridContainer>
            )}
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

            {designDetail && sale && (
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <TableContainer
                    component={Paper}
                    sx={{
                      marginTop: 3,
                    }}
                  >
                    <CustomMaterialUITable
                      sx={{ textAlignLast: "center" }}
                      aria-label="sale-table"
                    >
                      <CustomTableHead>
                        <CustomTableRow>
                          <CustomTableCell>Is Ready Material?</CustomTableCell>
                          {!isView && <CustomTableCell>Select</CustomTableCell>}
                          <CustomTableCell>Ratio Name</CustomTableCell>
                          <CustomTableCell align="left">
                            Curr. Stock
                          </CustomTableCell>
                          <CustomTableCell align="left">
                            Pcs Sold
                          </CustomTableCell>
                          <CustomTableCell align="left">
                            Pcs Returned
                          </CustomTableCell>
                          <CustomTableCell align="left">
                            Selling Price Per Piece
                          </CustomTableCell>
                          <CustomTableCell align="left">
                            Returning Price Per Piece
                          </CustomTableCell>
                          <CustomTableCell align="left">
                            Total Returning Price
                          </CustomTableCell>
                        </CustomTableRow>
                      </CustomTableHead>
                      <CustomTableBody>
                        {Object.keys(designDetail).map((Ip, designKey) => {
                          let isNoDesign = Ip.includes("NoDesign");
                          return (
                            <>
                              <CustomTableRow key={Ip} height={20}>
                                <CustomTableCell
                                  align="center"
                                  rowSpan={
                                    (isNoDesign &&
                                      designDetail[Ip].is_ready_material) ||
                                    designDetail[Ip].are_ready_materials_clubbed
                                      ? 1
                                      : 1 + designDetail[Ip].allColors.length
                                  }
                                >
                                  {designDetail[Ip].is_ready_material
                                    ? "Yes"
                                    : "No"}
                                </CustomTableCell>
                                {(isNoDesign &&
                                  designDetail[Ip].is_ready_material) ||
                                designDetail[Ip].are_ready_materials_clubbed ? (
                                  <>
                                    <CustomTableCell align="left">
                                      {" "}
                                      ----
                                    </CustomTableCell>
                                    <CustomTableCell align="left">
                                      {designDetail[Ip].name}
                                    </CustomTableCell>
                                    <CustomTableCell align="left">
                                      {designDetail[Ip].availableQuantity}
                                    </CustomTableCell>
                                    <CustomTableCell align="left">
                                      {designDetail[Ip].quantity}
                                    </CustomTableCell>
                                    <CustomTableCell align="left">
                                      ----
                                    </CustomTableCell>
                                    <CustomTableCell align="right">
                                      {designDetail[Ip].price_per_unit}
                                    </CustomTableCell>
                                    <CustomTableCell align="right">
                                      ----
                                    </CustomTableCell>
                                    <CustomTableCell align="right">
                                      ----
                                    </CustomTableCell>
                                  </>
                                ) : (
                                  <CustomTableCell align="center" colSpan={8}>
                                    <GridItem xs={12} sm={12} md={12}>
                                      <GridContainer
                                        style={{
                                          dispay: "flex",
                                        }}
                                      >
                                        <GridItem xs={12} sm={12} md={12}>
                                          <div
                                            className={classes.imageDivInTable}
                                          >
                                            {designDetail[Ip].images &&
                                            designDetail[Ip].images.length &&
                                            designDetail[Ip].images[0].url ? (
                                              <img
                                                alt="ready_material_photo"
                                                src={
                                                  apiUrl +
                                                  designDetail[Ip].images[0].url
                                                }
                                                loader={<CircularProgress />}
                                                style={{
                                                  height: "5rem",
                                                  width: "10rem",
                                                }}
                                                className={classes.UploadImage}
                                              />
                                            ) : (
                                              <img
                                                src={no_image_icon}
                                                alt="ready_material_photo"
                                                style={{
                                                  height: "5rem",
                                                  width: "10rem",
                                                }}
                                                loader={<CircularProgress />}
                                                className={
                                                  classes.DefaultNoImage
                                                }
                                              />
                                            )}
                                          </div>
                                        </GridItem>
                                      </GridContainer>
                                      <GridContainer>
                                        <GridItem xs={12} sm={12} md={12}>
                                          <b>Material No : </b>
                                          {designDetail[Ip].material_no}
                                        </GridItem>
                                      </GridContainer>
                                    </GridItem>
                                  </CustomTableCell>
                                )}
                              </CustomTableRow>
                              {designDetail[Ip].allColors &&
                                designDetail[Ip].allColors.map(
                                  (c, colorKey) => (
                                    <>
                                      <CustomTableRow
                                        key={Ip + "-" + c.color}
                                        sx={{
                                          "&:last-child td, &:last-child th": {
                                            border: 0,
                                          },
                                          backgroundColor: c.isDeleted
                                            ? "#e7e7e7"
                                            : "transparent",
                                          textDecoration: c.isDeleted
                                            ? "line-through"
                                            : "none",
                                        }}
                                      >
                                        {!isView && (
                                          <CustomTableCell
                                            align="left"
                                            sx={{
                                              p: 0,
                                            }}
                                          >
                                            <CustomCheckBox
                                              onChange={(event) => {
                                                onSelectCheckBox(
                                                  event,
                                                  colorKey,
                                                  Ip
                                                );
                                              }}
                                              noMargin
                                              labelText=""
                                              name="select_ready_material"
                                              checked={c.selected}
                                              id="select_ready_material"
                                            />
                                          </CustomTableCell>
                                        )}
                                        <CustomTableCell align="left">
                                          {c.colorData.name}
                                        </CustomTableCell>
                                        <CustomTableCell align="left">
                                          {c.availableQuantity}
                                        </CustomTableCell>
                                        <CustomTableCell align="left">
                                          {c.quantity}
                                        </CustomTableCell>
                                        {isView ? (
                                          <CustomTableCell
                                            align="left"
                                            sx={{
                                              pt: 0,
                                              pb: 0,
                                              borderBottom:
                                                "2px solid #6c6c6c !important",
                                            }}
                                          >
                                            {c.returned_quantity}
                                          </CustomTableCell>
                                        ) : (
                                          <CustomTableCell
                                            align="left"
                                            sx={{
                                              pt: 0,
                                              pb: 0,
                                              borderBottom:
                                                "2px solid #6c6c6c !important",
                                            }}
                                          >
                                            <CustomInput
                                              noMargin
                                              defaultValue="Small"
                                              size="large"
                                              variant="standard"
                                              color="secondary"
                                              onChange={(event) =>
                                                handleChangeForRepetableComponent(
                                                  event,
                                                  colorKey,
                                                  Ip
                                                )
                                              }
                                              type="number"
                                              disabled={isView || !c.selected}
                                              name="returned_quantity"
                                              value={c.returned_quantity}
                                              id={
                                                "returned_quantity" +
                                                colorKey +
                                                "design" +
                                                Ip
                                              }
                                              formControlProps={{
                                                fullWidth: false,
                                              }}
                                              /** For setting errors */
                                              helperTextId={
                                                "returned_quantitycolor" +
                                                colorKey +
                                                "design" +
                                                Ip
                                              }
                                              isHelperText={hasError(
                                                "returned_quantitycolor" +
                                                  colorKey +
                                                  "design" +
                                                  Ip,
                                                designError
                                              )}
                                              helperText={
                                                hasError(
                                                  "returned_quantitycolor" +
                                                    colorKey +
                                                    "design" +
                                                    Ip,
                                                  designError
                                                )
                                                  ? designError[
                                                      "returned_quantitycolor" +
                                                        colorKey +
                                                        "design" +
                                                        Ip
                                                    ].map((error) => {
                                                      return error + " ";
                                                    })
                                                  : null
                                              }
                                              error={hasError(
                                                "returned_quantitycolor" +
                                                  colorKey +
                                                  "design" +
                                                  Ip,
                                                designError
                                              )}
                                            />
                                          </CustomTableCell>
                                        )}
                                        <CustomTableCell align="left">
                                          {c.price_per_unit}
                                        </CustomTableCell>
                                        {isView ? (
                                          <CustomTableCell
                                            align="right"
                                            sx={{
                                              pt: 0,
                                              pb: 0,
                                              borderBottom:
                                                "2px solid #6c6c6c !important",
                                            }}
                                          >
                                            {c.return_price_per_unit}
                                          </CustomTableCell>
                                        ) : (
                                          <CustomTableCell
                                            align="right"
                                            sx={{
                                              pt: 0,
                                              pb: 0,
                                              borderBottom:
                                                "2px solid #6c6c6c !important",
                                            }}
                                          >
                                            <CustomInput
                                              noMargin
                                              defaultValue="Small"
                                              size="small"
                                              variant="standard"
                                              color="secondary"
                                              onChange={(event) =>
                                                handleChangeForRepetableComponent(
                                                  event,
                                                  colorKey,
                                                  Ip
                                                )
                                              }
                                              type="number"
                                              disabled={isView || !c.selected}
                                              name="return_price_per_unit"
                                              value={c.return_price_per_unit}
                                              id={
                                                "return_price_per_unitcolor" +
                                                colorKey +
                                                "design" +
                                                Ip
                                              }
                                              formControlProps={{
                                                fullWidth: false,
                                              }}
                                              /** For setting errors */
                                              helperTextId={
                                                "return_price_per_unitcolor" +
                                                colorKey +
                                                "design" +
                                                Ip
                                              }
                                              isHelperText={hasError(
                                                "return_price_per_unitcolor" +
                                                  colorKey +
                                                  "design" +
                                                  Ip,
                                                designError
                                              )}
                                              helperText={
                                                hasError(
                                                  "return_price_per_unitcolor" +
                                                    colorKey +
                                                    "design" +
                                                    Ip,
                                                  designError
                                                )
                                                  ? designError[
                                                      "return_price_per_unitcolor" +
                                                        colorKey +
                                                        "design" +
                                                        Ip
                                                    ].map((error) => {
                                                      return error + " ";
                                                    })
                                                  : null
                                              }
                                              error={hasError(
                                                "return_price_per_unitcolor" +
                                                  colorKey +
                                                  "design" +
                                                  Ip,
                                                designError
                                              )}
                                            />
                                          </CustomTableCell>
                                        )}
                                        <CustomTableCell
                                          align="right"
                                          sx={{
                                            pt: 0,
                                            pb: 0,
                                            borderBottom:
                                              "2px solid #6c6c6c !important",
                                          }}
                                        >
                                          {c.return_total_price}
                                        </CustomTableCell>
                                      </CustomTableRow>
                                    </>
                                  )
                                )}
                            </>
                          );
                        })}
                      </CustomTableBody>
                      <CustomTableBody>
                        <CustomTableRow>
                          <CustomTableCell
                            colSpan={isView ? 7 : 8}
                            align="right"
                          >
                            Total
                          </CustomTableCell>

                          <CustomTableCell>
                            {convertNumber(
                              parseFloat(formState.total_price).toFixed(2),
                              true
                            )}
                          </CustomTableCell>
                          {isView ? null : (
                            <>
                              <CustomTableCell colSpan={2}></CustomTableCell>
                            </>
                          )}
                        </CustomTableRow>
                      </CustomTableBody>
                    </CustomMaterialUITable>
                  </TableContainer>
                </GridItem>
              </GridContainer>
            )}
          </CardBody>
          {isView ? (
            <CardFooter>
              <Button
                color="danger"
                disabled={Object.keys(designError).length}
                onClick={(e) => deleteData(e)}
              >
                Delete
              </Button>
            </CardFooter>
          ) : (
            <CardFooter>
              <Button
                color="primary"
                disabled={Object.keys(designError).length}
                onClick={(e) => addEditData(e)}
              >
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
