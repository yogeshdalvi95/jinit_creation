import React from "react";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  makeStyles,
  Switch,
  Tooltip
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { NOTFOUNDPAGE, SALES } from "../../paths";
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CustomInput,
  DatePicker,
  DialogBoxForSelectingReadyMaterial,
  DialogForSelectingParties,
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent
} from "../../components";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import {
  checkEmpty,
  convertNumber,
  hasError,
  isEmptyString,
  setErrors
} from "../../Utils";
import addEditSaleForm from "./form/AddEditSale.json";
import moment from "moment";
import { apiUrl } from "../../constants";
import no_image_icon from "../../assets/img/no_image_icon.png";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import validationForm from "./form/AddEditSale.json";
import SweetAlert from "react-bootstrap-sweetalert";
import { providerForGet, providerForPost } from "../../api";
import buttonStyles from "../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import { backend_sales } from "../../constants";
import classNames from "classnames";

const buttonUseStyles = makeStyles(buttonStyles);
const useStyles = makeStyles(styles);
export default function AddEditSales(props) {
  const classes = useStyles();
  const history = useHistory();
  const buttonClasses = buttonUseStyles();
  let saleForm = addEditSaleForm;
  const [openBackDrop, setBackDrop] = useState(false);
  const [alert, setAlert] = useState(null);
  const [
    openDialogForSelectingReadyMaterial,
    setOpenDialogForSelectingReadyMaterial
  ] = useState(false);

  const [
    openDialogForSelectingParties,
    setOpenDialogForSelectingParties
  ] = useState(false);

  const [error, setError] = React.useState({});
  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [id] = useState(props.id ? props.id : null);
  const [formState, setFormState] = useState({
    id: null,
    bill_no: "",
    seller_name: "",
    gst_no: "",
    date: new Date(),
    is_gst_bill: false,
    total_price_of_ready_material: 0,
    total_price_without_gst: 0,
    add_cost: 0,
    total_price: 0,
    sgst: 0,
    cgst: 0,
    party: null
  });

  const [readyMaterialError, setReadyMaterialError] = useState({});

  const [party, setParty] = useState({
    id: null,
    party_name: "",
    gst_no: "",
    address: ""
  });

  const [readyMaterialArray, setReadyMaterialArray] = useState([]);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: ""
  });

  useEffect(() => {
    if ((isEdit || isView) && id) {
      getEditViewData(id);
    }
  }, []);

  const getEditViewData = async id => {
    setBackDrop(true);
    let isError = false;
    await providerForGet(backend_sales + "/" + id, {}, Auth.getToken())
      .then(res => {
        if (res.status === 200) {
          convertData(res.data);
        } else {
          isError = true;
        }
      })
      .catch(err => {
        setBackDrop(false);
        isError = true;
      });
    if (isError) {
      history.push(NOTFOUNDPAGE);
    }
  };

  const convertData = data => {
    setFormState(formState => ({
      ...formState,
      bill_no: data.bill_no,
      date: new Date(data.date),
      is_gst_bill: data.is_gst_bill,
      total_price_of_ready_material: parseFloat(
        data.total_price_of_ready_material
      ),
      total_price_without_gst: parseFloat(data.total_price_with_add_cost),
      add_cost: parseFloat(data.add_cost),
      total_price: parseFloat(data.total_price),
      sgst: parseFloat(data.sgst),
      cgst: parseFloat(data.cgst),
      party: data.party.id
    }));
    setParty(party => ({
      ...party,
      gst_no: data.party.gst_no,
      id: data.party.id,
      party_name: data.party.party_name,
      address: data.party.party_address
    }));
    let readyMaterialTempArr = [];
    for (let rm of data.sale_ready_material) {
      readyMaterialTempArr.push({
        ready_material: rm.ready_material,
        quantity: rm.quantity,
        previousQuantity: rm.quantity,
        quantity_to_add_deduct: 0,
        price_per_unit: rm.price_per_unit,
        total_price: rm.total_price,
        availableQuantity: rm.ready_material.total_quantity,
        isDeleted: false,
        isCannotDelete: true,
        message: ""
      });
    }
    setReadyMaterialArray(readyMaterialTempArr);
    setBackDrop(false);
  };

  const onBackClick = () => {
    history.push(SALES);
  };

  const snackBarHandleClose = () => {
    setSnackBar(snackBar => ({
      ...snackBar,
      show: false,
      severity: "",
      message: ""
    }));
  };

  const handleCloseDialogForReadyMaterial = () => {
    setOpenDialogForSelectingReadyMaterial(false);
  };

  const handleAddReadyMaterial = data => {
    setBackDrop(true);
    setReadyMaterialArray([
      ...readyMaterialArray,
      {
        ready_material: data,
        quantity: 1,
        previousQuantity: 0,
        quantity_to_add_deduct: 1,
        price_per_unit: data.final_cost,
        total_price: data.final_cost,
        availableQuantity: data.total_quantity,
        isCannotDelete: false,
        message: "No of ready material to be deducted from stocks :- 1"
      }
    ]);
    let total_price_of_ready_material =
      formState.total_price_of_ready_material + parseFloat(data.final_cost);

    const { total_price, total_price_with_add_cost } = calculateAddCostAndGst(
      total_price_of_ready_material
    );

    setFormState(formState => ({
      ...formState,
      total_price: total_price,
      total_price_of_ready_material: total_price_of_ready_material,
      total_price_without_gst: total_price_with_add_cost
    }));

    setBackDrop(false);
    setOpenDialogForSelectingReadyMaterial(false);
  };

  const restoreReadyMaterial = key => {
    let obj = readyMaterialArray[key];
    setBackDrop(true);
    let total_price_of_ready_material =
      formState.total_price_of_ready_material + parseFloat(obj.total_price);
    const { total_price, total_price_with_add_cost } = calculateAddCostAndGst(
      total_price_of_ready_material
    );
    setFormState(formState => ({
      ...formState,
      total_price: total_price,
      total_price_of_ready_material: total_price_of_ready_material,
      total_price_without_gst: total_price_with_add_cost
    }));
    /** -------------- */
    let price_per_piece = parseFloat(obj.price_per_unit);
    let quantity = parseFloat(obj.quantity);
    let isQuantityValid = false;
    let isPPPValid = false;
    let quantityError = "";
    let pppError = "";
    let quantityKey = "quantity" + key;
    let pppKey = "price_per_unit" + key;

    /** Set Error */

    if (
      quantity > obj.previousQuantity &&
      quantity - obj.previousQuantity > parseFloat(obj.availableQuantity)
    ) {
      isQuantityValid = false;
      quantityError =
        "Quantity cannot be greater than the available ready material quantity";
    } else if (!quantity || quantity < 0) {
      isQuantityValid = false;
      quantityError = "Quantity cannot be zero or negative";
    } else {
      isQuantityValid = true;
    }

    if (!price_per_piece || price_per_piece < 0) {
      isPPPValid = false;
      pppError = "Price per piece cannot be zero or negative";
    } else {
      isPPPValid = true;
    }

    if (isQuantityValid) {
      delete readyMaterialError[quantityKey];
      setReadyMaterialError(readyMaterialError => ({
        ...readyMaterialError
      }));
    } else {
      setReadyMaterialError(readyMaterialError => ({
        ...readyMaterialError,
        [quantityKey]: [quantityError]
      }));
    }

    if (isPPPValid) {
      delete readyMaterialError[pppKey];
      setReadyMaterialError(readyMaterialError => ({
        ...readyMaterialError
      }));
    } else {
      setReadyMaterialError(readyMaterialError => ({
        ...readyMaterialError,
        [pppKey]: [pppError]
      }));
    }

    let quantity_to_add_deduct =
      parseFloat(obj.quantity) - parseFloat(obj.previousQuantity);
    obj = {
      ...obj,
      isDeleted: false,
      quantity_to_add_deduct: quantity_to_add_deduct,
      message:
        isQuantityValid && isPPPValid
          ? quantity_to_add_deduct
            ? `No of ready material ${quantity_to_add_deduct < 0
              ? "to be added back to stock"
              : "to be deducted from stock"
            }: ${Math.abs(quantity_to_add_deduct)}`
            : ""
          : ""
    };
    setReadyMaterialArray([
      ...readyMaterialArray.slice(0, key),
      obj,
      ...readyMaterialArray.slice(key + 1)
    ]);
    setBackDrop(false);
  };

  const removeReadyMaterial = key => {
    let obj = readyMaterialArray[key];
    setBackDrop(true);
    let total_price_of_ready_material =
      formState.total_price_of_ready_material - parseFloat(obj.total_price);
    const { total_price, total_price_with_add_cost } = calculateAddCostAndGst(
      total_price_of_ready_material
    );
    delete readyMaterialError["quantity" + key];
    delete readyMaterialError["price_per_unit" + key];
    setReadyMaterialError(readyMaterialError => ({
      ...readyMaterialError
    }));
    setFormState(formState => ({
      ...formState,
      total_price: total_price,
      total_price_of_ready_material: total_price_of_ready_material,
      total_price_without_gst: total_price_with_add_cost
    }));
    if (obj["isCannotDelete"]) {
      obj = {
        ...obj,
        quantity_to_add_deduct: -obj.previousQuantity,
        isDeleted: true,
        message:
          "No of ready material added back to stock : " + obj.previousQuantity
      };
      setReadyMaterialArray([
        ...readyMaterialArray.slice(0, key),
        obj,
        ...readyMaterialArray.slice(key + 1)
      ]);
    } else {
      readyMaterialArray.splice(key, 1);
      setReadyMaterialArray(readyMaterialArray);
    }
    setBackDrop(false);
  };

  const calculateAddCostAndGst = (
    total_price_of_ready_material = formState.total_price_of_ready_material,
    is_add_additional_cost = true,
    add_cost = formState.add_cost,
    cgst_percent = formState.cgst,
    sgst_percent = formState.sgst
  ) => {
    let total_price_with_add_cost = 0;
    if (is_add_additional_cost) {
      total_price_with_add_cost =
        total_price_of_ready_material + parseFloat(add_cost);
    } else {
      total_price_with_add_cost =
        total_price_of_ready_material - parseFloat(add_cost);
    }

    let total_price = 0;

    const cgst_value = calculateCgstPercent(
      cgst_percent,
      total_price_with_add_cost
    );

    const sgst_value = calculateSgstPercent(
      sgst_percent,
      total_price_with_add_cost
    );

    total_price = total_price_with_add_cost + cgst_value + sgst_value;
    return {
      total_price: total_price,
      total_price_with_add_cost: total_price_with_add_cost
    };
  };

  const cgstSgstValueChange = event => {
    let name = event.target.name;
    let value = 0;
    let percentValue = 0;
    let total_price = formState.total_price;
    if (!isNaN(event.target.value)) {
      value = parseFloat(event.target.value);
    }
    if (name === "cgst") {
      /** Remove old value */
      let oldPercentValue = calculateCgstPercent();
      total_price = total_price - oldPercentValue;
      percentValue = calculateCgstPercent(value);
    } else {
      /** Remove old value */
      let oldPercentValue = calculateSgstPercent();
      total_price = total_price - oldPercentValue;
      percentValue = calculateSgstPercent(value);
    }
    total_price = total_price + percentValue;
    setFormState(formState => ({
      ...formState,
      total_price: total_price,
      [name]: event.target.value
    }));
  };

  /** Calculate cgst */
  const calculateCgstPercent = (
    cgst = formState.cgst,
    total_price_with_add_cost = formState.total_price_without_gst
  ) => {
    let cgst_percent = 0;
    if (!isNaN(parseFloat(cgst))) {
      cgst_percent = parseFloat(cgst);
    }
    let cgst_value = (cgst_percent / 100) * total_price_with_add_cost;
    return cgst_value;
  };

  /** Calculate sgst */
  const calculateSgstPercent = (
    sgst = formState.sgst,
    total_price_with_add_cost = formState.total_price_without_gst
  ) => {
    let sgst_percent = 0;
    if (!isNaN(parseFloat(sgst))) {
      sgst_percent = parseFloat(sgst);
    }
    let sgst_value = (sgst_percent / 100) * total_price_with_add_cost;
    return sgst_value;
  };

  const handleChangeAddCost = event => {
    delete error[event.target.name];
    setError(error => ({
      ...error
    }));
    let value = isEmptyString(event.target.value)
      ? 0
      : parseFloat(event.target.value);
    const { total_price, total_price_with_add_cost } = calculateAddCostAndGst(
      formState.total_price_of_ready_material,
      true,
      value
    );
    setFormState(formState => ({
      ...formState,
      [event.target.name]: event.target.value,
      total_price: total_price,
      total_price_without_gst: total_price_with_add_cost
    }));
  };

  const handleCloseDialogForParties = () => {
    setOpenDialogForSelectingParties(false);
  };

  const handleAddParties = data => {
    setParty(party => ({
      ...party,
      gst_no: data.gst_no,
      id: data.id,
      party_name: data.party_name,
      address: data.party_address
    }));
    setFormState(formState => ({
      ...formState,
      party: data.id
    }));
    delete error["party"];
    setError(error => ({
      ...error
    }));
    handleCloseDialogForParties();
  };

  const handleChange = event => {
    delete error[event.target.name];
    setError(error => ({
      ...error
    }));
    setFormState(formState => ({
      ...formState,
      [event.target.name]: event.target.value
    }));
  };

  const handleChangeForRepetableComponent = (event, key) => {
    let obj = readyMaterialArray[key];
    let name = event.target.name;
    let total_price_per_piece = 0;
    let isValid = false;
    let error = "";
    let keyName = name + "" + key;
    let quantity_to_add_deduct = 0;
    if (name === "quantity") {
      let quantity = 0;
      let price_per_piece = obj.price_per_unit;
      if (event.target.value && !isNaN(event.target.value)) {
        quantity = parseFloat(event.target.value);
      }
      total_price_per_piece = quantity * price_per_piece;
      /** Set Error */
      if (
        quantity > obj.previousQuantity &&
        quantity - obj.previousQuantity > parseFloat(obj.availableQuantity)
      ) {
        isValid = false;
        error =
          "Quantity cannot be greater than the available ready material quantity";
      } else if (!quantity || quantity < 0) {
        isValid = false;
        error = "Quantity cannot be zero or negative";
      } else {
        isValid = true;
        quantity_to_add_deduct =
          parseFloat(quantity) - parseFloat(obj.previousQuantity);
      }
    } else {
      let quantity = obj.quantity;
      let price_per_piece = 0;
      if (event.target.value && !isNaN(event.target.value)) {
        price_per_piece = parseFloat(event.target.value);
      }
      total_price_per_piece = quantity * price_per_piece;
      if (!price_per_piece || price_per_piece < 0) {
        isValid = false;
        error = "Price per piece cannot be zero or negative";
      } else {
        isValid = true;
        quantity_to_add_deduct =
          parseFloat(quantity) - parseFloat(obj.previousQuantity);
      }
    }
    if (isValid) {
      delete readyMaterialError[keyName];
      setReadyMaterialError(readyMaterialError => ({
        ...readyMaterialError
      }));
    } else {
      setReadyMaterialError(readyMaterialError => ({
        ...readyMaterialError,
        [keyName]: [error]
      }));
    }

    let total_price_after_deducted_old_value =
      formState.total_price_of_ready_material - parseFloat(obj.total_price);
    let total_price_after_adding_new_value =
      total_price_after_deducted_old_value + total_price_per_piece;

    const { total_price, total_price_with_add_cost } = calculateAddCostAndGst(
      total_price_after_adding_new_value
    );

    obj = {
      ...obj,
      quantity_to_add_deduct: quantity_to_add_deduct,
      message: isValid
        ? quantity_to_add_deduct
          ? `No of ready material ${quantity_to_add_deduct < 0
            ? "to be added back to stock"
            : "to be deducted from stock"
          }: ${Math.abs(quantity_to_add_deduct)}`
          : ""
        : ""
    };

    obj = {
      ...obj,
      [name]: event.target.value,
      total_price: total_price_per_piece
    };

    setReadyMaterialArray([
      ...readyMaterialArray.slice(0, key),
      obj,
      ...readyMaterialArray.slice(key + 1)
    ]);

    setFormState(formState => ({
      ...formState,
      total_price: total_price,
      total_price_without_gst: total_price_with_add_cost,
      total_price_of_ready_material: total_price_after_adding_new_value
    }));
  };

  const toggleSwitch = event => {
    if (event.target.checked) {
      saleForm = {
        ...saleForm,
        cgst: {
          required: true,
          validations: {
            required: {
              value: "true",
              message: "CGST is required"
            }
          }
        },
        sgst: {
          required: true,
          validations: {
            required: {
              value: "true",
              message: "SGST is required"
            }
          }
        }
      };
      setFormState(formState => ({
        ...formState,
        is_gst_bill: true
      }));
    } else {
      setFormState(formState => ({
        ...formState,
        total_price: formState.total_price_without_gst,
        cgst: 0,
        sgst: 0
      }));
      delete saleForm["cgst"];
      delete saleForm["sgst"];
      setFormState(formState => ({
        ...formState,
        is_gst_bill: false
      }));
    }
  };

  const handleOrderDate = event => {
    let date = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (date === "Invalid date") {
      date = null;
    } else {
      date = new Date(date).toISOString();
    }

    setFormState(formState => ({
      ...formState,
      date: date
    }));
  };

  const addReadyMaterial = () => {
    setOpenDialogForSelectingReadyMaterial(true);
  };

  const handleCheckValidation = event => {
    event.preventDefault();
    setBackDrop(true);
    let isValid = false;
    let error = {};
    error = setErrors(formState, saleForm);
    /** If no errors then isValid is set true */
    if (checkEmpty(error) && checkEmpty(readyMaterialError)) {
      setBackDrop(false);
      setError({});
      isValid = true;
    } else {
      setBackDrop(false);
      setError(error);
    }
    if (isValid) {
      submit();
    }
    setBackDrop(false);
  };

  const handleCloseDialog = () => {
    setAlert(null);
  };

  const handleAcceptDialog = () => {
    setAlert(null);
    addEditData();
  };

  const submit = () => {
    if (isEdit) {
      addEditData();
    } else {
      const confirmBtnClasses = classNames({
        [buttonClasses.button]: true,
        [buttonClasses["success"]]: true
      });

      const cancelBtnClasses = classNames({
        [buttonClasses.button]: true,
        [buttonClasses["danger"]]: true
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
          The ready material quantities that are added will be deducted from the
          ready material present in the system! Are you sure you want to
          continue?
        </SweetAlert>
      );
    }
  };

  const addEditData = async () => {
    let obj = {};
    obj = {
      id: id,
      state: formState,
      readyMaterials: readyMaterialArray,
      party: party.id
    };
    setBackDrop(true);
    await providerForPost(backend_sales, obj, Auth.getToken())
      .then(res => {
        history.push(SALES);
        setBackDrop(false);
      })
      .catch(err => {
        setBackDrop(false);
        setSnackBar(snackBar => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error Adding/Editing Sale Data"
        }));
      });
  };

  const checkRepeatableComponent = () => { };

  return (
    <React.Fragment>
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
        <DialogBoxForSelectingReadyMaterial
          handleCancel={handleCloseDialogForReadyMaterial}
          handleClose={handleCloseDialogForReadyMaterial}
          handleAddReadyMaterial={handleAddReadyMaterial}
          isHandleKey={false}
          noAddAvailableQuantites={true}
          selectedReadyMaterial={readyMaterialArray}
          open={openDialogForSelectingReadyMaterial}
        />
        <DialogForSelectingParties
          handleCancel={handleCloseDialogForParties}
          handleClose={handleCloseDialogForParties}
          handleAddParties={handleAddParties}
          open={openDialogForSelectingParties}
        />
        <GridItem xs={12} sm={12} md={10}>
          <Card>
            <CardHeader color="primary" className={classes.cardHeaderStyles}>
              <h4 className={classes.cardTitleWhite}>{props.header}</h4>
              <p className={classes.cardCategoryWhite}></p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={5}>
                  <CustomInput
                    onChange={event => handleChange(event)}
                    labelText="Bill Number"
                    name="bill_no"
                    disabled={isView || isEdit}
                    value={formState.bill_no}
                    id="bill_no"
                    formControlProps={{
                      fullWidth: true
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_bill_no"}
                    isHelperText={hasError("bill_no", error)}
                    helperText={
                      hasError("bill_no", error)
                        ? error["bill_no"].map(error => {
                          return error + " ";
                        })
                        : null
                    }
                    error={hasError("bill_no", error)}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                  <DatePicker
                    onChange={event => handleOrderDate(event)}
                    label="Bill Date"
                    name="bill_date"
                    disabled={isView || formState.cancelled}
                    value={formState.date || new Date()}
                    id="bill_date"
                    formControlProps={{
                      fullWidth: true
                    }}
                    style={{
                      width: "100%",
                      marginTop: "1.5rem"
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
                          checked={formState.is_gst_bill ? true : false}
                          disabled={isView}
                          onChange={event => {
                            toggleSwitch(event);
                          }}
                          classes={{
                            switchBase: classes.switchBase,
                            checked: classes.switchChecked,
                            thumb: classes.switchIcon,
                            track: classes.switchBar
                          }}
                        />
                      }
                      classes={{
                        label: classes.label
                      }}
                      label="Is Gst Bill ?"
                    />
                  </div>
                </GridItem>
              </GridContainer>
              {party.id && isView ? (
                <>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={6}>
                      <CustomInput
                        labelText="Party Name"
                        name="party_name"
                        disabled={true}
                        value={party.party_name}
                        id="party_name"
                        formControlProps={{
                          fullWidth: true
                        }}
                        /** For setting errors */
                        helperTextId={"helperText_party_name"}
                        isHelperText={hasError("party_name", error)}
                        helperText={
                          hasError("party_name", error)
                            ? error["party_name"].map(error => {
                              return error + " ";
                            })
                            : null
                        }
                        error={hasError("party_name", error)}
                      />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={6}>
                      <CustomInput
                        labelText="Party GST Number"
                        name="party_gst_no"
                        disabled={true}
                        value={party.gst_no}
                        id="party_gst_no"
                        formControlProps={{
                          fullWidth: true
                        }}
                        /** For setting errors */
                        helperTextId={"helperText_party_gst_no"}
                        isHelperText={hasError("party_gst_no", error)}
                        helperText={
                          hasError("party_gst_no", error)
                            ? error["party_gst_no"].map(error => {
                              return error + " ";
                            })
                            : null
                        }
                        error={hasError("party_gst_no", error)}
                      />
                    </GridItem>
                  </GridContainer>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                      <CustomInput
                        labelText="Party Address"
                        name="party_address"
                        disabled={true}
                        value={party.address}
                        id="party_address"
                        formControlProps={{
                          fullWidth: true
                        }}
                        /** For setting errors */
                        helperTextId={"helperText_party_address"}
                        isHelperText={hasError("party_address", error)}
                        helperText={
                          hasError("party_address", error)
                            ? error["party_address"].map(error => {
                              return error + " ";
                            })
                            : null
                        }
                        error={hasError("party_address", error)}
                      />
                    </GridItem>
                  </GridContainer>
                </>
              ) : null}
              {isView ? null : (
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <GridContainer>
                      <GridItem
                        xs={12}
                        sm={12}
                        md={12}
                        style={{
                          margin: "27px 0px 0px"
                        }}
                      >
                        <GridContainer style={{ dispay: "flex" }}>
                          <GridItem
                            xs={12}
                            sm={12}
                            md={8}
                            style={{
                              color: "#C8C8C8"
                            }}
                          >
                            <b>Party</b>
                          </GridItem>
                        </GridContainer>
                        <br />
                        <GridContainer style={{ dispay: "flex" }}>
                          <GridItem xs={12} sm={12} md={8}>
                            <b>Party Name : </b> {party.party_name}
                          </GridItem>
                        </GridContainer>
                        <GridContainer>
                          <GridItem xs={12} sm={12} md={8}>
                            <b>Party Gst No : </b>
                            {party.gst_no}
                          </GridItem>
                        </GridContainer>
                        <GridContainer>
                          <GridItem xs={12} sm={12} md={8}>
                            <b>Party Address : </b>
                            {party.address}
                          </GridItem>
                        </GridContainer>
                      </GridItem>
                      {isView ? null : (
                        <>
                          <GridItem
                            xs={12}
                            sm={12}
                            md={12}
                            style={{
                              margin: "27px 0px 0px"
                            }}
                          >
                            <Button
                              color="primary"
                              onClick={() => {
                                setOpenDialogForSelectingParties(true);
                              }}
                            >
                              {party.id ? "Change Party" : "Select Party"}
                            </Button>
                          </GridItem>
                          {hasError("party", error) ? (
                            <GridItem xs={12} sm={12} md={12}>
                              <FormHelperText
                                id={"party_helpertext_id"}
                                error={hasError("party", error)}
                              >
                                {hasError("party", error)
                                  ? error["party"].map(error => {
                                    return error + " ";
                                  })
                                  : null}
                              </FormHelperText>
                            </GridItem>
                          ) : null}
                        </>
                      )}
                    </GridContainer>
                  </GridItem>
                </GridContainer>
              )}
              <GridContainer>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInput
                    onChange={event => cgstSgstValueChange(event)}
                    labelText="CGST(%)"
                    name="cgst"
                    disabled={isView || !formState.is_gst_bill}
                    value={formState.cgst}
                    id="cgst"
                    formControlProps={{
                      fullWidth: true
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_cgst"}
                    isHelperText={hasError("cgst", error)}
                    helperText={
                      hasError("cgst", error)
                        ? error["cgst"].map(error => {
                          return error + " ";
                        })
                        : null
                    }
                    error={hasError("cgst", error)}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInput
                    onChange={event => cgstSgstValueChange(event)}
                    labelText="SGST(%)"
                    name="sgst"
                    disabled={isView || !formState.is_gst_bill}
                    value={formState.sgst}
                    id="sgst"
                    formControlProps={{
                      fullWidth: true
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_sgst"}
                    isHelperText={hasError("sgst", error)}
                    helperText={
                      hasError("sgst", error)
                        ? error["sgst"].map(error => {
                          return error + " ";
                        })
                        : null
                    }
                    error={hasError("sgst", error)}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInput
                    onChange={event => handleChangeAddCost(event)}
                    labelText="Add. Cost"
                    name="add_cost"
                    type="number"
                    disabled={isView}
                    value={formState.add_cost}
                    id="add_cost"
                    formControlProps={{
                      fullWidth: true
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_add_cost"}
                    isHelperText={hasError("add_cost", error)}
                    helperText={
                      hasError("add_cost", error)
                        ? error["add_cost"].map(error => {
                          return error + " ";
                        })
                        : null
                    }
                    error={hasError("add_cost", error)}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInput
                    onChange={event => handleChange(event)}
                    labelText="Total Price"
                    name="total_price"
                    disabled={true}
                    value={parseFloat(formState.total_price).toFixed(2)}
                    id="total_price"
                    formControlProps={{
                      fullWidth: true
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_total_price"}
                    isHelperText={hasError("total_price", error)}
                    helperText={
                      hasError("total_price", error)
                        ? error["total_price"].map(error => {
                          return error + " ";
                        })
                        : null
                    }
                    error={hasError("total_price", error)}
                  />
                </GridItem>
              </GridContainer>
              {isView ? null : (
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <FAB
                      color="primary"
                      size={"medium"}
                      variant="extended"
                      onClick={() => addReadyMaterial()}
                    >
                      <AddIcon className={classes.extendedIcon} />
                      <h5>Add Ready Material</h5>
                    </FAB>
                  </GridItem>
                </GridContainer>
              )}

              <GridContainer>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="sale-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sr No: </TableCell>
                        <TableCell align="left">Ready Material</TableCell>
                        {isEdit ? (
                          <TableCell align="left">Previous Quantity</TableCell>
                        ) : null}
                        <TableCell align="left">Quantity</TableCell>
                        <TableCell align="left">Price per piece</TableCell>
                        <TableCell align="left">Total Price</TableCell>
                        {isView ? null : (
                          <TableCell align="center">Action</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {readyMaterialArray.map((Ip, key) => (
                        <>
                          <TableRow
                            key={Ip.ready_material.id}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                              backgroundColor: Ip.isDeleted
                                ? "#e7e7e7"
                                : "transparent",
                              textDecoration: Ip.isDeleted
                                ? "line-through"
                                : "none"
                            }}
                          >
                            <TableCell align="left" rowSpan={2}>
                              {key + 1}
                            </TableCell>
                            <TableCell
                              align="left"
                              rowSpan={2}
                              sx={{ width: 1 / 2.8 }}
                            >
                              <GridItem xs={12} sm={12} md={12}>
                                <GridContainer style={{ dispay: "flex" }}>
                                  <GridItem xs={12} sm={12} md={12}>
                                    <div className={classes.imageDivInTable}>
                                      {Ip.ready_material.images &&
                                        Ip.ready_material.images.length &&
                                        Ip.ready_material.images[0].url ? (
                                        <img
                                          alt="ready_material_photo"
                                          src={
                                            apiUrl +
                                            Ip.ready_material.images[0].url
                                          }
                                          loader={<CircularProgress />}
                                          style={{
                                            height: "5rem",
                                            width: "10rem"
                                          }}
                                          className={classes.UploadImage}
                                        />
                                      ) : (
                                        <img
                                          src={no_image_icon}
                                          alt="ready_material_photo"
                                          style={{
                                            height: "5rem",
                                            width: "10rem"
                                          }}
                                          loader={<CircularProgress />}
                                          className={classes.DefaultNoImage}
                                        />
                                      )}
                                    </div>
                                  </GridItem>
                                </GridContainer>
                                <GridContainer>
                                  <GridItem xs={12} sm={12} md={8}>
                                    <b>Material No : </b>
                                    {Ip.ready_material.material_no}
                                  </GridItem>
                                </GridContainer>
                                <GridContainer>
                                  <GridItem xs={12} sm={12} md={8}>
                                    <b>Total Available Quantity : </b>
                                    {Ip.availableQuantity}
                                  </GridItem>
                                </GridContainer>
                              </GridItem>
                            </TableCell>
                            {isEdit ? (
                              <TableCell align="left">
                                {Ip.previousQuantity
                                  ? Ip.previousQuantity
                                  : null}
                              </TableCell>
                            ) : null}
                            <TableCell align="left">
                              <CustomInput
                                onChange={event =>
                                  handleChangeForRepetableComponent(event, key)
                                }
                                type="number"
                                disabled={isView}
                                name="quantity"
                                value={Ip.quantity}
                                id="quantity"
                                formControlProps={{
                                  fullWidth: false
                                }}
                                /** For setting errors */
                                helperTextId={"quantity" + key}
                                isHelperText={hasError(
                                  "quantity" + key,
                                  readyMaterialError
                                )}
                                helperText={
                                  hasError("quantity" + key, readyMaterialError)
                                    ? readyMaterialError["quantity" + key].map(
                                      error => {
                                        return error + " ";
                                      }
                                    )
                                    : null
                                }
                                error={hasError(
                                  "quantity" + key,
                                  readyMaterialError
                                )}
                              />
                            </TableCell>
                            <TableCell align="left">
                              <CustomInput
                                onChange={event =>
                                  handleChangeForRepetableComponent(event, key)
                                }
                                type="number"
                                disabled={isView}
                                name="price_per_unit"
                                value={Ip.price_per_unit}
                                id="price_per_unit"
                                formControlProps={{
                                  fullWidth: true
                                }}
                                /** For setting errors */
                                helperTextId={"price_per_unit" + key}
                                isHelperText={hasError(
                                  "price_per_unit" + key,
                                  readyMaterialError
                                )}
                                helperText={
                                  hasError(
                                    "price_per_unit" + key,
                                    readyMaterialError
                                  )
                                    ? readyMaterialError[
                                      "price_per_unit" + key
                                    ].map(error => {
                                      return error + " ";
                                    })
                                    : null
                                }
                                error={hasError(
                                  "price_per_unit" + key,
                                  readyMaterialError
                                )}
                              />
                            </TableCell>
                            <TableCell align="left">
                              {convertNumber(Ip.total_price, true)}
                            </TableCell>
                            {isView ? null : (
                              <TableCell align="left">
                                <GridItem xs={12} sm={12} md={2}>
                                  <Tooltip
                                    title={
                                      Ip.isDeleted ? "Restore Back" : "Delete"
                                    }
                                  >
                                    <FAB
                                      color="primary"
                                      align={"left"}
                                      size={"small"}
                                      onClick={() => {
                                        Ip.isDeleted
                                          ? restoreReadyMaterial(key)
                                          : removeReadyMaterial(key);
                                      }}
                                    >
                                      {Ip.isDeleted ? (
                                        <SettingsBackupRestoreIcon />
                                      ) : (
                                        <DeleteIcon />
                                      )}
                                    </FAB>
                                  </Tooltip>
                                </GridItem>
                              </TableCell>
                            )}
                          </TableRow>
                          <TableRow
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                              backgroundColor: Ip.isDeleted
                                ? "#e7e7e7"
                                : "transparent",
                              color: "green"
                            }}
                          >
                            <TableCell
                              align="left"
                              colSpan={5}
                              sx={{
                                color: "green"
                              }}
                            >
                              {Ip.message}
                            </TableCell>
                          </TableRow>
                        </>
                      ))}
                    </TableBody>
                    <TableBody sx={{ borderTop: 1, borderColor: "gray" }}>
                      <TableRow>
                        <TableCell colSpan={isEdit ? 5 : 4} align="right">
                          Total added ready material price
                        </TableCell>

                        <TableCell>
                          {convertNumber(
                            parseFloat(
                              formState.total_price_of_ready_material
                            ).toFixed(2),
                            true
                          )}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </GridContainer>
            </CardBody>
            {isView ? null : (
              <CardFooter>
                <Button
                  color="primary"
                  onClick={e => handleCheckValidation(e)}
                  disabled={
                    !readyMaterialArray.length ||
                    Object.keys(readyMaterialError).length
                  }
                >
                  Save
                </Button>
              </CardFooter>
            )}
          </Card>
        </GridItem>
      </GridContainer>
      <Backdrop className={classes.backdrop} open={openBackDrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </React.Fragment>
  );
}
