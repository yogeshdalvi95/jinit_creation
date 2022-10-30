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
  CustomMaterialUITable,
  CustomTableBody,
  CustomTableCell,
  CustomTableHead,
  CustomTableRow,
  DatePicker,
  DialogBoxForSelectingRawMaterial,
  FAB,
  GridContainer,
  GridItem,
  RemoteAutoComplete,
  SellerDetails,
  SnackBarComponent,
} from "../../components";
import moment from "moment";

// core components
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { PURCHASES } from "../../paths";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import { useEffect } from "react";
import { providerForGet, providerForPost } from "../../api";
import { backend_purchases, backend_sellers } from "../../constants";
import { useState } from "react";
import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  Switch,
} from "@material-ui/core";
import {
  checkEmpty,
  checkIfDateFallsInAcceptableRange,
  convertNumber,
  getMinDate,
  hasError,
  isEmptyString,
  validateNumber,
} from "../../Utils";
import SweetAlert from "react-bootstrap-sweetalert";
import buttonStyles from "../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import classNames from "classnames";

const useStyles = makeStyles(styles);
const buttonUseStyles = makeStyles(buttonStyles);

export default function AddPurchases(props) {
  const classes = useStyles();
  const buttonClasses = buttonUseStyles();
  const history = useHistory();
  const [alert, setAlert] = useState(null);
  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [selectedSeller, setSelectedSeller] = React.useState(null);
  const [id] = useState(props.id ? props.id : null);
  const [rawMaterialIds, setRawMateralIds] = React.useState([]);
  const [rawMaterialIdTohighLight, setRawMaterialToHighLight] =
    React.useState(null);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    type_of_bill: "",
    cgst_percent: 0,
    sgst_percent: 0,
    igst_percent: 0,
    total_amt_with_tax: 0,
    total_amt_without_tax: 0,
    notes: "",
    date: new Date(),
    bill_no: "",
    seller: null,
    gst_no: "",
  });

  const individualPurchaseObject = {
    id: null,
    raw_material: null,
    raw_material_obj: "",
    purchase_cost: 0,
    purchase_quantity: 0,
    purchase_unit: "",
    total_purchase_cost: 0,
    are_raw_material_clubbed: false,
    is_raw_material: true,
    name: null,
    isNew: true,
  };

  const [error, setError] = React.useState({});

  const [individualPurchase, setIndividualPurchase] = useState([
    individualPurchaseObject,
  ]);

  const [
    openDialogForSelectingRawMaterial,
    setOpenDialogForSelectingRawMaterial,
  ] = useState({
    key: null,
    status: false,
  });

  useEffect(() => {
    if (isEdit || isView) {
      getPurchaseInfo();
    }
    if (isView) {
      const urlParams = new URLSearchParams(window.location.search);
      let highlightRawMaterialId = urlParams.get("highlight");
      setRawMaterialToHighLight(highlightRawMaterialId);
    }
  }, []);

  const getPurchaseInfo = async () => {
    setBackDrop(true);
    await providerForGet(backend_purchases + "/" + id, {}, Auth.getToken())
      .then((res) => {
        setData(res.data);
        setBackDrop(false);
      })
      .catch((err) => {
        console.log("error ---> ", err);
      });
  };

  const setData = (data) => {
    let ids = [];
    setFormState((formState) => ({
      ...formState,
      id: data.purchase.id,
      seller: data.purchase.seller ? data.purchase.seller.id : null,
      type_of_bill: data.purchase.type_of_bill,
      cgst_percent: validateNumber(data.purchase.cgst_percent),
      sgst_percent: validateNumber(data.purchase.sgst_percent),
      igst_percent: validateNumber(data.purchase.igst_percent),
      total_amt_with_tax: validateNumber(data.purchase.total_amt_with_tax),
      total_amt_without_tax: validateNumber(
        data.purchase.total_amt_without_tax
      ),
      notes: data.purchase.notes,
      date: new Date(data.purchase.date),
      bill_no: data.purchase.bill_no,
    }));

    setSelectedSeller({
      label: data.purchase?.seller?.seller_name,
      value: data.purchase?.seller?.id,
      allData: data.purchase?.seller,
    });

    let arr = [];
    data.individualPurchase.forEach((d) => {
      let object = {
        id: d.id,
        purchase_cost: d.purchase_cost,
        purchase_quantity: d.purchase_quantity,
        total_purchase_cost: d.total_purchase_cost,
        are_raw_material_clubbed: d.are_raw_material_clubbed,
        is_raw_material: d.is_raw_material,
        name: d.name,
        raw_material: null,
        purchase_unit: null,
        raw_material_obj: null,
      };
      if (d.is_raw_material) {
        let bal = "0";
        if (!d.raw_material.balance) {
          bal = "0";
        } else {
          bal = d.raw_material.balance;
        }
        let category = d.raw_material.category
          ? d.raw_material.category.name
          : "";
        let color = d.raw_material.color ? d.raw_material.color.name : "";
        let rawMaterialObj = {
          id: "#" + d.raw_material.id,
          name: d.raw_material.name,
          department: d.raw_material.department
            ? d.raw_material.department.name
            : "---",
          category: isEmptyString(category) ? "---" : category,
          color: isEmptyString(color) ? "---" : color,
          size: isEmptyString(d.raw_material.size)
            ? "---"
            : d.raw_material.size,
          bal: bal,
        };
        ids.push(d.raw_material.id);
        object = {
          ...object,
          raw_material: d.raw_material.id,
          purchase_unit: d.raw_material?.unit
            ? d.raw_material.unit.name
            : "unit",
          raw_material_obj: rawMaterialObj,
        };
      }
      arr.push(object);
    });
    setRawMateralIds(ids);
    setIndividualPurchase(arr);
  };

  const handleChange = (event) => {
    if (event.target.name === "type_of_bill") {
      setRawMateralIds([]);
      setError({});
      setSelectedSeller(null);
      setFormState({
        cgst_percent: 0,
        sgst_percent: 0,
        igst_percent: 0,
        total_amt_with_tax: 0,
        total_amt_without_tax: 0,
        notes: "",
        date: new Date(),
        bill_no: "",
        seller: null,
      });
      setIndividualPurchase([individualPurchaseObject]);
    }
    if (
      event.target.name === "cgst_percent" ||
      event.target.name === "sgst_percent" ||
      event.target.name === "igst_percent"
    ) {
      calculateNewTax(event.target.name, event.target.value);
    }
    setFormState((formState) => ({
      ...formState,
      [event.target.name]: event.target.value,
    }));
  };

  const calculateNewTax = (name, value) => {
    let cgst_percent = 0;
    let sgst_percent = 0;
    let igst_percent = 0;
    if (name === "cgst_percent" || name === "sgst_percent") {
      if (name === "cgst_percent") {
        cgst_percent = validateNumber(value);
        sgst_percent = validateNumber(formState.sgst_percent);
      }
      if (name === "sgst_percent") {
        sgst_percent = validateNumber(value);
        cgst_percent = validateNumber(formState.cgst_percent);
      }
    } else {
      igst_percent = validateNumber(value);
    }

    let total_amt_without_tax = validateNumber(formState.total_amt_without_tax);
    let cgst = (cgst_percent / 100) * total_amt_without_tax;
    let sgst = (sgst_percent / 100) * total_amt_without_tax;
    let igst = (igst_percent / 100) * total_amt_without_tax;

    let totalCostWithTax = total_amt_without_tax + cgst + sgst + igst;

    setFormState((formState) => ({
      ...formState,
      total_amt_with_tax: totalCostWithTax,
      total_amt_without_tax: total_amt_without_tax,
    }));
  };

  /** This function calculate the total cost when we add value for
   * purchase cost or purchase quantity per raw material
   **/
  const calculateTotalCost = (name, value, object, arr, k) => {
    let costPerRawMaterial = 0;
    let totalCostWithTax = 0;
    let totalCostWithOutTax = 0;

    let valueToMultiply = 0;
    value = validateNumber(value);

    if (name === "purchase_cost") {
      valueToMultiply = validateNumber(object["purchase_quantity"]);
    } else if (name === "purchase_quantity") {
      valueToMultiply = validateNumber(object["purchase_cost"]);
    }
    costPerRawMaterial = valueToMultiply * value;
    arr.map((Ip, key) => {
      if (key !== k) {
        totalCostWithOutTax =
          totalCostWithOutTax + validateNumber(Ip.total_purchase_cost);
      }
      return null;
    });
    totalCostWithOutTax = totalCostWithOutTax + costPerRawMaterial;

    /** Calculate tax */
    let cgst_percent = validateNumber(formState.cgst_percent);
    let sgst_percent = validateNumber(formState.sgst_percent);
    let igst_percent = validateNumber(formState.igst_percent);
    let cgst = (cgst_percent / 100) * totalCostWithOutTax;
    let sgst = (sgst_percent / 100) * totalCostWithOutTax;
    let igst = (igst_percent / 100) * totalCostWithOutTax;

    totalCostWithTax = totalCostWithOutTax + cgst + sgst + igst;
    return {
      totalCostPerRawMaterial: costPerRawMaterial,
      totalCostWithTax: totalCostWithTax,
      totalCostWithOutTax: totalCostWithOutTax,
    };
  };

  /** Handle change for repetable compoment */
  const handleChangeRawMaterial = (name, value, key, objectToAdd, pcs) => {
    let object = individualPurchase[key];
    let existingRawMaterialIds = [...rawMaterialIds];
    delete error["raw_material" + key];
    delete error["purchase_cost" + key];
    delete error["purchase_quantity" + key];
    setError((error) => ({
      ...error,
    }));
    /** Update the raw material ids */
    if (object["raw_material"]) {
      const index = existingRawMaterialIds.indexOf(object["raw_material"]);
      if (index > -1) {
        existingRawMaterialIds.splice(index, 1);
      }
      existingRawMaterialIds.push(value.id);
    } else {
      existingRawMaterialIds.push(value.id);
    }
    setRawMateralIds(existingRawMaterialIds);

    object = {
      ...object,
      [name]: value.id,
      isNew: true,
      raw_material_obj: objectToAdd,
      purchase_cost: validateNumber(value.costing),
      purchase_quantity: validateNumber(pcs),
      total_purchase_cost: validateNumber(pcs) * validateNumber(value.costing),
      is_raw_material: true,
      are_raw_material_clubbed: false,
    };

    if (name === "raw_material") {
      object = {
        ...object,
        purchase_unit: value.unit ? value.unit.name : "unit",
      };
    }

    let totalCostWithTax = validateNumber(formState.total_amt_with_tax);
    let totalCostWithOutTax = validateNumber(formState.total_amt_without_tax);

    totalCostWithTax = totalCostWithTax + object.total_purchase_cost;
    totalCostWithOutTax = totalCostWithOutTax + object.total_purchase_cost;

    setFormState((formState) => ({
      ...formState,
      total_amt_with_tax: totalCostWithTax,
      total_amt_without_tax: totalCostWithOutTax,
    }));

    setIndividualPurchase([
      ...individualPurchase.slice(0, key),
      object,
      ...individualPurchase.slice(key + 1),
    ]);
    handleCloseDialogForRawMaterial();
  };

  /** Handle change for repetable compoment */
  const handleChangeForRepetableComponent = (event, key, errorKey) => {
    let name = event.target.name;
    let object = {};
    object = individualPurchase[key];

    /** Calculating total cost per raw material and total cost with tax and total cost without tax */
    if (name === "purchase_cost" || name === "purchase_quantity") {
      let value = validateNumber(event.target.value);
      object[name] = event.target.value;
      if (value > 0) {
        delete error[name + key];
        setError((error) => ({
          ...error,
        }));
        const {
          totalCostPerRawMaterial,
          totalCostWithTax,
          totalCostWithOutTax,
        } = calculateTotalCost(name, value, object, individualPurchase, key);
        setFormState((formState) => ({
          ...formState,
          total_amt_with_tax: totalCostWithTax,
          total_amt_without_tax: totalCostWithOutTax,
        }));
        object = {
          ...object,
          total_purchase_cost: totalCostPerRawMaterial,
        };
      } else {
        setError((error) => ({
          ...error,
          [name + key]: [`${errorKey} cannot be negative or zero`],
        }));
      }
    } else if (name === "is_raw_material_or_clubbed") {
      delete error["raw_material" + key];
      delete error["name" + key];
      setError((error) => ({
        ...error,
      }));
      object = {
        ...individualPurchaseObject,
      };
      if (event.target.checked) {
        object = {
          ...object,
          is_raw_material: true,
          are_raw_material_clubbed: false,
        };
      } else {
        object = {
          ...object,
          is_raw_material: false,
          are_raw_material_clubbed: true,
        };
      }
    } else if (name === "name") {
      delete error[name + key];
      setError((error) => ({
        ...error,
      }));
      object[name] = event.target.value;
    }

    setIndividualPurchase([
      ...individualPurchase.slice(0, key),
      object,
      ...individualPurchase.slice(key + 1),
    ]);
  };

  const onBackClick = () => {
    history.push(PURCHASES);
  };

  const handleCheckValidation = (event) => {
    event.preventDefault();
    setBackDrop(true);
    let isValid = false;
    let err = { ...error };
    /** This will set errors as per validations defined in form */
    if (!formState.seller) {
      isValid = false;
      err = {
        ...err,
        seller: ["Seller is required"],
      };
    }
    if (isEmptyString(formState.bill_no)) {
      isValid = false;
      err = {
        ...err,
        bill_no: ["Bill number is required"],
      };
    }

    err = validatePurchaseData(err);
    /** If no errors then isValid is set true */
    if (checkEmpty(err)) {
      setBackDrop(false);
      setError({});
      isValid = true;
    } else {
      setBackDrop(false);
      setError(err);
    }
    if (isValid) {
      submit();
    }
  };

  const validatePurchaseData = (err) => {
    individualPurchase.forEach((Ip, key) => {
      let purchaseCost = validateNumber(Ip.purchase_cost);
      let purchaseQty = validateNumber(Ip.purchase_quantity);
      if (purchaseCost <= 0) {
        err = {
          ...err,
          ["purchase_cost" + key]: [`Purchase Cost cannot be negative or zero`],
        };
      } else {
        delete err["purchase_cost" + key];
      }
      if (purchaseQty <= 0) {
        err = {
          ...err,
          ["purchase_quantity" + key]: [
            `Purchase Qty cannot be negative or zero`,
          ],
        };
      } else {
        delete err["purchase_quantity" + key];
      }
      if (Ip.is_raw_material && !Ip.raw_material) {
        err = {
          ...err,
          ["raw_material" + key]: [`Please select a raw material`],
        };
      } else {
        delete err["raw_material" + key];
      }
      if (Ip.are_raw_material_clubbed && isEmptyString(Ip.name)) {
        err = {
          ...err,
          ["name" + key]: [`Name cannot be empty`],
        };
      } else {
        delete err["name" + key];
      }
    });
    return err;
  };

  const submit = () => {
    const confirmBtnClasses = classNames({
      [buttonClasses.button]: true,
      [buttonClasses["success"]]: true,
    });

    const cancelBtnClasses = classNames({
      [buttonClasses.button]: true,
      [buttonClasses["danger"]]: true,
    });
    let message = "";
    if (isEdit) {
      message = `Are you sure you want to edit the payment made to ${
        selectedSeller?.allData?.seller_name
      } of ${convertNumber(formState.total_amt_with_tax, true)}?`;
    } else {
      message = `Are you sure you want to make a payment of ${convertNumber(
        formState.total_amt_with_tax,
        true
      )} towards seller ${selectedSeller?.allData?.seller_name} ?`;
    }
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
        {message}
      </SweetAlert>
    );
  };

  const addEditData = async () => {
    let obj = {
      purchases: formState,
      individual_purchase: individualPurchase,
    };
    setBackDrop(true);
    await providerForPost(backend_purchases, obj, Auth.getToken())
      .then((res) => {
        history.push(PURCHASES);
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: error,
        }));
      });
  };

  const addNewPurchase = () => {
    setIndividualPurchase([...individualPurchase, individualPurchaseObject]);
  };

  const deletePurchase = (key) => {
    let object = individualPurchase[key];
    let total_amt_without_tax = formState.total_amt_without_tax;
    total_amt_without_tax = total_amt_without_tax - object.total_purchase_cost;
    /** Calculate tax */
    let cgst_percent = validateNumber(formState.cgst_percent);
    let sgst_percent = validateNumber(formState.sgst_percent);

    let cgst = (cgst_percent / 100) * total_amt_without_tax;
    let sgst = (sgst_percent / 100) * total_amt_without_tax;
    let total_amt_with_tax = total_amt_without_tax + cgst + sgst;

    setFormState((formState) => ({
      ...formState,
      total_amt_with_tax: total_amt_with_tax,
      total_amt_without_tax: total_amt_without_tax,
    }));

    delete error["raw_material" + key];
    delete error["purchase_cost" + key];
    delete error["purchase_quantity" + key];
    delete error["name" + key];
    setError((error) => ({
      ...error,
    }));

    if (individualPurchase.length === 1) {
      setIndividualPurchase([individualPurchaseObject]);
    } else {
      setIndividualPurchase([
        ...individualPurchase.slice(0, key),
        ...individualPurchase.slice(key + 1),
      ]);
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
  };

  const handleAcceptDialog = () => {
    setAlert(null);
    addEditData();
  };

  const handleCloseDialogForRawMaterial = () => {
    setOpenDialogForSelectingRawMaterial({
      key: null,
      status: false,
    });
  };

  const handleAcceptDialogForRawMaterial = () => {
    setOpenDialogForSelectingRawMaterial({
      key: null,
      status: false,
    });
    //addEditData();
  };

  const addChangeRawMaterial = (key) => {
    setOpenDialogForSelectingRawMaterial({
      key: key,
      status: true,
    });
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

  const setSeller = (seller) => {
    delete error["seller"];
    setError((error) => ({
      ...error,
    }));
    if (seller && seller.value) {
      setFormState((formState) => ({
        ...formState,
        seller: seller.value,
      }));
      setSelectedSeller(seller);
    } else {
      setFormState((formState) => ({
        ...formState,
        seller: null,
      }));
      setSelectedSeller(null);
    }
  };

  const handleBillNumberChange = (event) => {
    delete error["bill_no"];
    setError((error) => ({
      ...error,
    }));
    setFormState((formState) => ({
      ...formState,
      [event.target.name]: event.target.value,
    }));
    let obj = {
      bill_no: event.target.value.trim(),
    };

    if (isEdit) {
      obj = {
        ...obj,
        id_nin: [id],
      };
    }

    providerForGet(backend_purchases, obj, Auth.getToken()).then((res) => {
      if (res.data?.totalCount) {
        setError((error) => ({
          ...error,
          bill_no: ["Bill/Invoice number already used"],
        }));
      }
    });
  };

  console.log("Error => ", error);

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <FAB align={"start"} size={"small"} onClick={onBackClick}>
          <KeyboardArrowLeftIcon />
        </FAB>
      </GridItem>
      {alert}
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <DialogBoxForSelectingRawMaterial
        handleCancel={handleCloseDialogForRawMaterial}
        handleClose={handleCloseDialogForRawMaterial}
        handleAccept={handleAcceptDialogForRawMaterial}
        handleAddRawMaterial={handleChangeRawMaterial}
        isHandleKey={true}
        gridKey={openDialogForSelectingRawMaterial.key}
        open={openDialogForSelectingRawMaterial.status}
        isAcceptQuantity={true}
        rawMaterialIds={rawMaterialIds}
      />
      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="primary" className={classes.cardHeaderStyles}>
            <h4 className={classes.cardTitleWhite}>{props.header}</h4>
            <p className={classes.cardCategoryWhite}></p>
          </CardHeader>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={12} md={2}>
                <CustomDropDown
                  id="type_of_bill"
                  disabled={isView || isEdit}
                  onChange={(event) => handleChange(event)}
                  labelText="Type of Purchase"
                  name="type_of_bill"
                  value={formState.type_of_bill}
                  nameValue={[
                    { name: "Pakka", value: "Pakka" },
                    { name: "Kachha", value: "Kachha" },
                  ]}
                  formControlProps={{
                    fullWidth: true,
                  }}
                />
              </GridItem>
              {formState.type_of_bill ? (
                <>
                  <GridItem xs={12} sm={12} md={2}>
                    <DatePicker
                      onChange={(event) => handleStartDateChange(event)}
                      label="Purchase Date"
                      name="date"
                      disabled={isView}
                      value={formState.date || new Date()}
                      id="date"
                      minDate={
                        checkIfDateFallsInAcceptableRange(formState.date)
                          ? getMinDate()
                          : null
                      }
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
                      labelText={"Bill/Invoice Number"}
                      name="bill_no"
                      disabled={isView || isEdit}
                      onChange={(event) => handleBillNumberChange(event)}
                      value={formState.bill_no}
                      id="bill_no"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      /** For setting errors */
                      helperTextId={"helperText_bill_no"}
                      isHelperText={hasError("bill_no", error)}
                      helperText={
                        hasError("bill_no", error)
                          ? error["bill_no"].map((error) => {
                              return error + " ";
                            })
                          : null
                      }
                      error={hasError("bill_no", error)}
                    />
                  </GridItem>
                  {!isView && (
                    <GridItem
                      xs={12}
                      sm={12}
                      md={4}
                      style={{ marginTop: "2.2rem" }}
                    >
                      <RemoteAutoComplete
                        setSelectedData={setSeller}
                        searchString={"seller_name"}
                        apiName={backend_sellers}
                        placeholder="Select Seller..."
                        selectedValue={selectedSeller}
                        isError={error.seller}
                        errorText={"Please select a seller"}
                        isSeller={true}
                      />
                    </GridItem>
                  )}
                </>
              ) : null}
            </GridContainer>

            {formState.type_of_bill &&
              selectedSeller &&
              selectedSeller.value &&
              selectedSeller.allData && (
                <GridContainer>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={6}
                    style={{ marginTop: "1.5rem" }}
                  >
                    <SellerDetails seller={selectedSeller.allData} />
                  </GridItem>
                </GridContainer>
              )}
            {formState.type_of_bill === "Pakka" ? (
              <GridContainer>
                {" "}
                <GridItem xs={12} sm={12} md={1}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="CGST(%)"
                    name="cgst_percent"
                    type="number"
                    disabled={isView || validateNumber(formState.igst_percent)}
                    value={formState.cgst_percent}
                    id="cgst_percent"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={1}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="SGST(%)"
                    name="sgst_percent"
                    disabled={isView || validateNumber(formState.igst_percent)}
                    type="number"
                    value={formState.sgst_percent}
                    id="sgst_percent"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>{" "}
                <GridItem xs={12} sm={12} md={1}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="IGST(%)"
                    name="igst_percent"
                    disabled={
                      isView ||
                      validateNumber(formState.sgst_percent) ||
                      validateNumber(formState.cgst_percent)
                    }
                    type="number"
                    value={formState.igst_percent}
                    id="igst_percent"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>{" "}
              </GridContainer>
            ) : null}
            <GridContainer>
              {formState.type_of_bill && formState.type_of_bill !== "" ? (
                <>
                  {formState.type_of_bill === "Pakka" ? (
                    <>
                      <GridItem
                        xs={12}
                        sm={12}
                        md={4}
                        style={{
                          marginTop: "3rem",
                        }}
                      >
                        <b>{`Total amount(without tax):- ${convertNumber(
                          formState.total_amt_without_tax,
                          true
                        )}`}</b>
                      </GridItem>
                      <GridItem
                        xs={12}
                        sm={12}
                        md={4}
                        style={{
                          marginTop: "3rem",
                        }}
                      >
                        <b>{`Total amount(with tax):- ${convertNumber(
                          formState.total_amt_with_tax,
                          true
                        )}`}</b>
                      </GridItem>
                    </>
                  ) : (
                    <GridItem
                      xs={12}
                      sm={12}
                      md={4}
                      style={{
                        marginTop: "3rem",
                      }}
                    >
                      <b>{`Total amount:- ${convertNumber(
                        formState.total_amt_with_tax,
                        true
                      )}`}</b>
                    </GridItem>
                  )}
                </>
              ) : null}
            </GridContainer>

            {formState.type_of_bill ? (
              <>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomInput
                      labelText="Notes"
                      id="notes"
                      name="notes"
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
              </>
            ) : null}

            {/** Should get executed only when the bill is pakka bill */}

            {formState.type_of_bill && (
              <CustomMaterialUITable
                sx={{ minWidth: 650 }}
                aria-label="simple table"
              >
                <CustomTableHead>
                  <CustomTableRow>
                    <CustomTableCell
                      sx={{
                        width: "100px",
                      }}
                    >
                      Is Raw Material?
                    </CustomTableCell>
                    <CustomTableCell
                      sx={{
                        width: "400px",
                      }}
                    >
                      Name/Select Raw Material
                    </CustomTableCell>
                    <CustomTableCell>Purchase Cost</CustomTableCell>
                    <CustomTableCell>Purchase Qty</CustomTableCell>
                    <CustomTableCell>Total</CustomTableCell>
                    {!isView ? <CustomTableCell>Remove</CustomTableCell> : null}
                    {!isView && <CustomTableCell>Add</CustomTableCell>}
                  </CustomTableRow>
                </CustomTableHead>
                <CustomTableBody>
                  {!individualPurchase.length ? (
                    <CustomTableRow>
                      <CustomTableCell
                        colSpan={7}
                        sx={{
                          textAlign: "center",
                          backgroundColor: "#dfdfdf !important",
                        }}
                      >
                        <b>No Data</b>
                      </CustomTableCell>
                    </CustomTableRow>
                  ) : (
                    <>
                      {individualPurchase.map((Ip, key) => {
                        console.log("Ip =>", Ip);
                        let rawMaterial = Ip.raw_material;
                        let isHighLight =
                          rawMaterial == rawMaterialIdTohighLight;
                        return (
                          <>
                            <CustomTableRow>
                              <CustomTableCell
                                style={{
                                  backgroundColor: isHighLight
                                    ? "#e1e1e1"
                                    : "transparent",
                                }}
                              >
                                <div className={classes.block}>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        disabled={
                                          isView ||
                                          (isEdit && !Ip.isNew) ||
                                          formState.type_of_bill === "Kachha"
                                        }
                                        checked={
                                          Ip.is_raw_material ? true : false
                                        }
                                        name={"is_raw_material_or_clubbed"}
                                        onChange={(event) =>
                                          handleChangeForRepetableComponent(
                                            event,
                                            key
                                          )
                                        }
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
                                    label=""
                                  />
                                </div>
                              </CustomTableCell>
                              <CustomTableCell
                                style={{
                                  backgroundColor: isHighLight
                                    ? "#e1e1e1"
                                    : "transparent",
                                }}
                              >
                                {Ip.is_raw_material ? (
                                  <GridContainer style={{ dispay: "flex" }}>
                                    <GridItem xs={12} sm={12} md={12}>
                                      <b>Name : </b> {Ip.raw_material_obj.name}
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={12}>
                                      <b>Department : </b>
                                      {Ip.raw_material_obj.department}
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={12}>
                                      <b>Category : </b>
                                      {Ip.raw_material_obj.category}
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={12}>
                                      <b>Color :</b> {Ip.raw_material_obj.color}
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={12}>
                                      <b>Size : </b>
                                      {Ip.raw_material_obj.size}
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={12}>
                                      <b>Balance : </b>
                                      {Ip.raw_material_obj.bal}
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={12}>
                                      <Button
                                        color="primary"
                                        disabled={
                                          isView ||
                                          (isEdit &&
                                            Ip.raw_material &&
                                            !Ip.isNew) ||
                                          Ip.are_raw_material_clubbed
                                        }
                                        onClick={() => {
                                          addChangeRawMaterial(key);
                                        }}
                                      >
                                        {Ip.raw_material
                                          ? "Change Raw Material"
                                          : " Select Raw Material"}
                                      </Button>
                                      {hasError("raw_material" + key, error) ? (
                                        <FormHelperText
                                          id={"raw_material" + key}
                                          error={hasError(
                                            "raw_material" + key,
                                            error
                                          )}
                                        >
                                          {hasError("raw_material" + key, error)
                                            ? error["raw_material" + key].map(
                                                (error) => {
                                                  return error + " ";
                                                }
                                              )
                                            : null}
                                        </FormHelperText>
                                      ) : null}
                                    </GridItem>
                                  </GridContainer>
                                ) : (
                                  <CustomInput
                                    onChange={(event) =>
                                      handleChangeForRepetableComponent(
                                        event,
                                        key,
                                        "Name"
                                      )
                                    }
                                    labelText="Name"
                                    name="name"
                                    disabled={isView}
                                    value={Ip.name}
                                    id={"name" + key}
                                    formControlProps={{
                                      fullWidth: true,
                                    }}
                                    helperTextId={"helperText_name" + key}
                                    isHelperText={hasError("name" + key, error)}
                                    helperText={
                                      hasError("name" + key, error)
                                        ? error["name" + key].map((error) => {
                                            return error + " ";
                                          })
                                        : null
                                    }
                                    error={hasError("name" + key, error)}
                                  />
                                )}
                              </CustomTableCell>
                              <CustomTableCell
                                style={{
                                  backgroundColor: isHighLight
                                    ? "#e1e1e1"
                                    : "transparent",
                                }}
                              >
                                <CustomInput
                                  onChange={(event) =>
                                    handleChangeForRepetableComponent(
                                      event,
                                      key,
                                      "Purchase Cost"
                                    )
                                  }
                                  type="number"
                                  disabled={
                                    isView ||
                                    (Ip.is_raw_material && !Ip.raw_material)
                                  }
                                  labelText="Purchase Cost"
                                  name="purchase_cost"
                                  value={Ip.purchase_cost}
                                  id="purchase_cost"
                                  formControlProps={{
                                    fullWidth: true,
                                  }}
                                  inputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        {!isEmptyString(Ip.purchase_unit)
                                          ? "/" + Ip.purchase_unit
                                          : ""}
                                      </InputAdornment>
                                    ),
                                  }}
                                  /** For setting errors */
                                  helperTextId={
                                    "helperText_purchase_cost" + key
                                  }
                                  isHelperText={hasError(
                                    "purchase_cost" + key,
                                    error
                                  )}
                                  helperText={
                                    hasError("purchase_cost" + key, error)
                                      ? error["purchase_cost" + key].map(
                                          (error) => {
                                            return error + " ";
                                          }
                                        )
                                      : null
                                  }
                                  error={hasError("purchase_cost" + key, error)}
                                />
                              </CustomTableCell>
                              <CustomTableCell
                                style={{
                                  backgroundColor: isHighLight
                                    ? "#e1e1e1"
                                    : "transparent",
                                }}
                              >
                                <CustomInput
                                  onChange={(event) =>
                                    handleChangeForRepetableComponent(
                                      event,
                                      key,
                                      "Purchase Quantity"
                                    )
                                  }
                                  type="number"
                                  disabled={
                                    isView ||
                                    (Ip.is_raw_material && !Ip.raw_material)
                                  }
                                  labelText="Purchase Qty"
                                  name="purchase_quantity"
                                  value={Ip.purchase_quantity}
                                  id="purchase_quantity"
                                  formControlProps={{
                                    fullWidth: true,
                                  }}
                                  inputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        {!isEmptyString(Ip.purchase_unit)
                                          ? "/" + Ip.purchase_unit
                                          : ""}
                                      </InputAdornment>
                                    ),
                                  }}
                                  /** For setting errors */
                                  helperTextId={
                                    "helperText_purchase_quantity" + key
                                  }
                                  isHelperText={hasError(
                                    "purchase_quantity" + key,
                                    error
                                  )}
                                  helperText={
                                    hasError("purchase_quantity" + key, error)
                                      ? error["purchase_quantity" + key].map(
                                          (error) => {
                                            return error + " ";
                                          }
                                        )
                                      : null
                                  }
                                  error={hasError(
                                    "purchase_quantity" + key,
                                    error
                                  )}
                                />
                              </CustomTableCell>
                              <CustomTableCell
                                sx={{
                                  minWidth: "fit-content",
                                  backgroundColor: isHighLight
                                    ? "#e1e1e1"
                                    : "transparent",
                                }}
                              >
                                <b>
                                  {convertNumber(Ip.total_purchase_cost, true)}
                                </b>
                              </CustomTableCell>
                              {!isView && (
                                <CustomTableCell
                                  style={{
                                    backgroundColor: isHighLight
                                      ? "#e1e1e1"
                                      : "transparent",
                                  }}
                                >
                                  <FAB
                                    disabled={isEdit && !Ip.isNew}
                                    color="danger"
                                    align={"end"}
                                    size={"small"}
                                    onClick={() => {
                                      deletePurchase(key);
                                    }}
                                  >
                                    <DeleteIcon />
                                  </FAB>
                                </CustomTableCell>
                              )}
                              {!isView && (
                                <CustomTableCell
                                  style={{
                                    backgroundColor: isHighLight
                                      ? "#e1e1e1"
                                      : "transparent",
                                  }}
                                >
                                  {!isView &&
                                  individualPurchase.length - 1 === key ? (
                                    <FAB
                                      disabled={
                                        isView ||
                                        (Ip.is_raw_material && !Ip.raw_material)
                                      }
                                      color="success"
                                      align={"end"}
                                      size={"small"}
                                      onClick={() => {
                                        addNewPurchase();
                                      }}
                                    >
                                      <AddIcon />
                                    </FAB>
                                  ) : null}
                                </CustomTableCell>
                              )}
                            </CustomTableRow>
                          </>
                        );
                      })}
                      <CustomTableRow>
                        <CustomTableCell
                          colSpan={4}
                          sx={{
                            textAlign: "right",
                          }}
                        >
                          <b>Total</b>
                        </CustomTableCell>
                        <CustomTableCell>
                          {" "}
                          <b>
                            {convertNumber(
                              formState.total_amt_without_tax,
                              true
                            )}
                          </b>
                        </CustomTableCell>
                        {!isView && <CustomTableCell></CustomTableCell>}
                      </CustomTableRow>
                    </>
                  )}
                </CustomTableBody>
              </CustomMaterialUITable>
            )}
          </CardBody>
          {isView || isEmptyString(formState.type_of_bill) ? null : (
            <CardFooter>
              <Button color="primary" onClick={(e) => handleCheckValidation(e)}>
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
