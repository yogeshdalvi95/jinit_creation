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
  CustomAutoComplete,
  CustomDropDown,
  CustomInput,
  DatePicker,
  DialogBox,
  DialogBoxForSelectingRawMaterial,
  FAB,
  GridContainer,
  GridItem,
  Muted,
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
import {
  backend_purchases,
  backend_raw_materials,
  backend_sellers,
} from "../../constants";
import { useState } from "react";
import { Backdrop, CircularProgress, InputAdornment } from "@material-ui/core";
import {
  checkEmpty,
  checkIfDateFallsInAcceptableRange,
  convertNumber,
  getMinDate,
  hasError,
  isEmptyString,
  setErrors,
  validateNumber,
} from "../../Utils";
import SweetAlert from "react-bootstrap-sweetalert";
import buttonStyles from "../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import classNames from "classnames";
import validationForm from "./form/PurchasesForm.json";

const useStyles = makeStyles(styles);
const buttonUseStyles = makeStyles(buttonStyles);

export default function AddPurchases(props) {
  const classes = useStyles();
  const buttonClasses = buttonUseStyles();
  const history = useHistory();
  const [rawMaterial, setRawMaterial] = useState([]);
  const [alert, setAlert] = useState(null);
  const [seller, setSeller] = useState([]);

  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [id, setId] = useState(props.id ? props.id : null);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    id: null,
    type_of_bill: "",
    cgst_percent: 0,
    sgst_percent: 0,
    igst_percent: 0,
    total_amt_with_tax: 0,
    total_amt_without_tax: 0,
    total_amt_with_tax_formatted: 0,
    total_amt_without_tax_formatted: 0,
    notes: "",
    date: new Date(),
    invoice_number: "",
    bill_no: "",
    seller: null,
    gst_no: "",
  });

  const kachhaPurchaseDetails = {
    id: null,
    raw_material: null,
    raw_material_name: "",
    purchase_cost: 0,
    purchase_quantity: 0,
    purchase_unit: "",
    total_purchase_cost: 0,
    total_purchase_cost_formatted: 0,
  };

  const pakkaPurchaseDetails = {
    id: null,
    name: "",
    purchase_cost: 0,
    purchase_quantity: 0,
    total_purchase_cost: 0,
    total_purchase_cost_formatted: 0,
  };
  const [error, setError] = React.useState({});

  const [individualKachhaPurchase, setIndividualKachhaPurchase] = useState([
    kachhaPurchaseDetails,
  ]);

  const [individualPakkaPurchase, setIndividualPakkaPurchase] = useState([
    pakkaPurchaseDetails,
  ]);
  const [
    openDialogForSelectingRawMaterial,
    setOpenDialogForSelectingRawMaterial,
  ] = useState({
    key: null,
    status: false,
  });

  const [rawMaterialDetails, setRawMaterialDetails] = useState({
    id: null,
    name: "",
    department: null,
    color: null,
    category: null,
    size: "",
    balance: "",
    name_value: [],
  });

  useEffect(() => {
    if (
      props.location.state &&
      (props.location.state.view || props.location.state.edit) &&
      props.location.state.data
    ) {
      setData(props.location.state.data);
    }
    getRawMaterial();
    getSellerName();
  }, []);

  const setData = (data) => {
    setFormState((formState) => ({
      ...formState,
      id: data.purchase.id,
      seller: data.purchase.seller ? data.purchase.seller.id : null,
      type_of_bill: data.purchase.type_of_bill,
      cgst_percent: data.purchase.cgst_percent,
      sgst_percent: data.purchase.sgst_percent,
      igst_percent: data.purchase.igst_percent,
      gst_no: data.purchase.seller ? data.purchase.seller.gst_no : "",
      total_amt_with_tax: data.purchase.total_amt_with_tax,
      total_amt_without_tax: data.purchase.total_amt_without_tax,
      total_amt_with_tax_formatted: convertNumber(
        data.purchase.total_amt_with_tax,
        true
      ),
      total_amt_without_tax_formatted: convertNumber(
        data.purchase.total_amt_without_tax,
        true
      ),
      notes: data.purchase.notes,
      date: new Date(data.purchase.date),
      invoice_number: data.purchase.invoice_number,
      bill_no: data.purchase.bill_no,
    }));

    let arr = [];
    arr = data.individualPurchase.map((d) => {
      let object = {
        id: d.id,
        purchase_cost: d.purchase_cost,
        purchase_quantity: d.purchase_quantity,
        total_purchase_cost: d.total_purchase_cost,
        total_purchase_cost_formatted: convertNumber(
          d.total_purchase_cost,
          true
        ),
      };
      if (data.purchase.type_of_bill === "Kachha") {
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
        let nameObject = {
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
        object = {
          ...object,
          raw_material: d.raw_material ? d.raw_material.id : null,
          purchase_unit: d.unit,
          raw_material_name: nameObject,
        };
      } else {
        object = {
          ...object,
          name: d.name,
        };
      }
      return object;
    });
    if (data.purchase.type_of_bill === "Kachha") {
      setIndividualKachhaPurchase(arr);
    } else {
      setIndividualPakkaPurchase(arr);
    }
  };

  const getSellerName = async () => {
    setBackDrop(true);
    await providerForGet(
      backend_sellers,
      {
        pageSize: -1,
      },
      Auth.getToken()
    )
      .then((res) => {
        setSeller(res.data.data);
        setBackDrop(false);
      })
      .catch((err) => {});
  };

  const getRawMaterial = async () => {
    setBackDrop(true);
    await providerForGet(
      backend_raw_materials,
      {
        pageSize: -1,
      },
      Auth.getToken()
    )
      .then((res) => {
        setRawMaterial(res.data.data);
        setBackDrop(false);
      })
      .catch((err) => {});
  };

  const handleChange = (event) => {
    if (event.target.name === "type_of_bill") {
      setRawMaterialDetails((rawMaterialDetails) => ({
        ...rawMaterialDetails,
        id: null,
        name: "",
        department: null,
        color: null,
        category: null,
        size: "",
        balance: "",
        name_value: [],
      }));
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
        if (isEmptyString(value)) {
          cgst_percent = 0;
        } else {
          cgst_percent = parseFloat(value);
        }
        if (!isNaN(parseFloat(formState.sgst_percent))) {
          sgst_percent = parseFloat(formState.sgst_percent);
        }
      }
      if (name === "sgst_percent") {
        if (isEmptyString(value)) {
          sgst_percent = 0;
        } else {
          sgst_percent = parseFloat(value);
        }
        if (!isNaN(parseFloat(formState.cgst_percent))) {
          cgst_percent = parseFloat(formState.cgst_percent);
        }
      }
    } else {
      if (isEmptyString(value)) {
        igst_percent = 0;
      } else {
        igst_percent = parseFloat(value);
      }
    }

    let total_amt_without_tax = 0;
    if (!isNaN(parseFloat(formState.total_amt_without_tax))) {
      total_amt_without_tax = parseFloat(formState.total_amt_without_tax);
    }

    let cgst = (parseFloat(cgst_percent) / 100) * total_amt_without_tax;
    let sgst = (parseFloat(sgst_percent) / 100) * total_amt_without_tax;
    let igst = (parseFloat(igst_percent) / 100) * total_amt_without_tax;

    console.log("percent ", cgst_percent, sgst_percent, igst_percent);
    console.log(cgst, sgst, igst);

    let totalCostWithTax = total_amt_without_tax + cgst + sgst + igst;
    let totalCostWithTaxFormatted = convertNumber(
      totalCostWithTax.toFixed(2),
      true
    );
    let total_amt_without_tax_formatted = convertNumber(
      total_amt_without_tax.toFixed(2),
      true
    );

    setFormState((formState) => ({
      ...formState,
      total_amt_with_tax: totalCostWithTax,
      total_amt_with_tax_formatted: totalCostWithTaxFormatted,
      total_amt_without_tax: total_amt_without_tax,
      total_amt_without_tax_formatted: total_amt_without_tax_formatted,
    }));
  };

  /** This function calculate the total cost when we add value for
   * purchase cost or purchase quantity per raw material
   **/
  const calculateTotalCost = (name, value, object, arr, k) => {
    let costPerRawMaterial = 0;
    let totalCostWithTax = 0;
    let totalCostWithOutTax = 0;
    let perRawMaterialFormatted = "0";
    let totalCostWithTaxFormatted = "0";
    let totalCostWithOutTaxFormatted = "0";

    let valueToMultiply = 0;
    if (isEmptyString(value)) {
      value = 0;
    }
    if (name === "purchase_cost") {
      valueToMultiply = object["purchase_quantity"];
      if (isEmptyString(valueToMultiply)) {
        valueToMultiply = 0;
      }
    } else if (name === "purchase_quantity") {
      valueToMultiply = object["purchase_cost"];
      if (isEmptyString(valueToMultiply)) {
        valueToMultiply = 0;
      }
    }

    costPerRawMaterial = parseFloat(valueToMultiply) * parseFloat(value);
    /** Convert number to amount format */
    perRawMaterialFormatted = convertNumber(
      costPerRawMaterial.toFixed(2),
      true
    );

    arr.map((Ip, key) => {
      if (key !== k) {
        totalCostWithOutTax =
          totalCostWithOutTax + parseFloat(Ip.total_purchase_cost);
      }
      return null;
    });

    totalCostWithOutTax = totalCostWithOutTax + costPerRawMaterial;
    totalCostWithOutTaxFormatted = convertNumber(
      totalCostWithOutTax.toFixed(2),
      true
    );

    /** Calculate tax */
    let cgst_percent = formState.cgst_percent;
    if (isEmptyString(cgst_percent)) {
      cgst_percent = 0;
    }

    let sgst_percent = formState.sgst_percent;
    if (isEmptyString(sgst_percent)) {
      sgst_percent = 0;
    }

    let igst_percent = formState.igst_percent;
    if (isEmptyString(igst_percent)) {
      igst_percent = 0;
    }

    let cgst = (parseFloat(cgst_percent) / 100) * totalCostWithOutTax;
    let sgst = (parseFloat(sgst_percent) / 100) * totalCostWithOutTax;
    let igst = (parseFloat(igst_percent) / 100) * totalCostWithOutTax;

    totalCostWithTax = totalCostWithOutTax + cgst + sgst + igst;
    totalCostWithTaxFormatted = convertNumber(
      totalCostWithTax.toFixed(2),
      true
    );

    return {
      perRawMaterial: costPerRawMaterial,
      totalCostWithTax: totalCostWithTax,
      totalCostWithOutTax: totalCostWithOutTax,
      perRawMaterialFormatted: perRawMaterialFormatted,
      totalCostWithTaxFormatted: totalCostWithTaxFormatted,
      totalCostWithOutTaxFormatted: totalCostWithOutTaxFormatted,
    };
  };

  /** Handle change for repetable compoment */
  const handleChangeAutoCompleteForRepetableComponent = (
    name,
    value,
    key,
    objectToAdd
  ) => {
    if (formState.type_of_bill === "Kachha") {
      let object = individualKachhaPurchase[key];
      if (value === null) {
        object[name] = null;
        object["raw_material_name"] = {};
        if (name === "raw_material") {
          object["purchase_unit"] = "";
        }
      } else {
        object[name] = value.id;
        object["raw_material_name"] = objectToAdd;
        if (name === "raw_material") {
          object["purchase_unit"] = value.unit ? value.unit.name : "unit";
        }
      }
      setIndividualKachhaPurchase([
        ...individualKachhaPurchase.slice(0, key),
        object,
        ...individualKachhaPurchase.slice(key + 1),
      ]);

      if (name === "raw_material") {
        if (value) {
          let arr = [];
          value.name_value.map((nv) => {
            arr.push({
              name: nv.name,
              value: nv.value,
            });
          });
          setRawMaterialDetails((rawMaterialDetails) => ({
            ...rawMaterialDetails,
            id: "#" + value.id,
            name: value ? value.name : "",
            department: value ? value.department.name : "",
            size: value ? value.size : "",
            category: objectToAdd.category,
            balance: value ? value.balance : "",
            color: objectToAdd.color,
            name_value: arr,
          }));
        } else {
          setRawMaterialDetails((rawMaterialDetails) => ({
            ...rawMaterialDetails,
            id: null,
            name: null,
            department: null,
            size: null,
            category: null,
            balance: null,
            color: null,
            name_value: [],
          }));
        }
      }
    }
    handleCloseDialogForRawMaterial();
  };

  /** Handle change for repetable compoment */
  const handleChangeForRepetableComponent = (event, key) => {
    let name = event.target.name;
    let value = event.target.value;

    let object = {};
    let purchaseArr = [];
    if (formState.type_of_bill === "Kachha") {
      object = individualKachhaPurchase[key];
      purchaseArr = individualKachhaPurchase;
      object[name] = value;
    } else {
      object = individualPakkaPurchase[key];
      purchaseArr = individualPakkaPurchase;
      object[name] = value;
    }
    /** Calculating total cost per raw material and total cost with tax and total cost without tax */
    if (name === "purchase_cost" || name === "purchase_quantity") {
      const {
        perRawMaterial,
        totalCostWithTax,
        totalCostWithOutTax,
        perRawMaterialFormatted,
        totalCostWithTaxFormatted,
        totalCostWithOutTaxFormatted,
      } = calculateTotalCost(name, value, object, purchaseArr, key);

      setFormState((formState) => ({
        ...formState,
        total_amt_with_tax: totalCostWithTax,
        total_amt_without_tax: totalCostWithOutTax,
        total_amt_with_tax_formatted: totalCostWithTaxFormatted,
        total_amt_without_tax_formatted: totalCostWithOutTaxFormatted,
      }));

      object = {
        ...object,
        total_purchase_cost: perRawMaterial,
        total_purchase_cost_formatted: perRawMaterialFormatted,
      };
    }

    /** Depending on kachha and pakka bill add data */
    if (formState.type_of_bill === "Kachha") {
      setIndividualKachhaPurchase([
        ...individualKachhaPurchase.slice(0, key),
        object,
        ...individualKachhaPurchase.slice(key + 1),
      ]);
    } else {
      setIndividualPakkaPurchase([
        ...individualPakkaPurchase.slice(0, key),
        object,
        ...individualPakkaPurchase.slice(key + 1),
      ]);
    }
  };

  const onBackClick = () => {
    history.push(PURCHASES);
  };

  const checkRepeatableComponent = () => {
    let finalArr = [];
    let initArr = [];
    let status = true;
    let str = "";
    let errorCount = 0;
    if (formState.type_of_bill === "Kachha") {
      initArr = individualKachhaPurchase;
    } else {
      initArr = individualPakkaPurchase;
    }
    initArr.map((i, k) => {
      if (isEdit) {
        if (!i.total_purchase_cost) {
          status = false;
          str =
            `For purchase no ${k + 1} the purchase cost cannot be empty or 0 ` +
            `${errorCount !== 0 ? " | " : ""}` +
            str;

          errorCount = errorCount + 1;
        }
      } else {
        if (i.total_purchase_cost) {
          finalArr.push(i);
        }
      }
    });
    if (isEdit) {
      finalArr = initArr;
    }
    if (formState.type_of_bill === "Kachha") {
      setIndividualKachhaPurchase(finalArr);
    } else {
      setIndividualPakkaPurchase(finalArr);
    }

    return {
      arr: finalArr,
      status: status,
      error: str,
    };
  };
  const handleCheckValidation = (event) => {
    event.preventDefault();
    setBackDrop(true);
    let isValid = false;
    let error = {};
    /** This will set errors as per validations defined in form */
    error = setErrors(formState, validationForm);
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
      submit();
    }
  };

  const submit = () => {
    if (isEdit) {
      addEditData();
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
          Please make sure you have added the right purchases and the right
          quantity as the quantity once added cannot be changed.
        </SweetAlert>
      );
    }
  };

  const addEditData = async () => {
    const { arr, status, error } = checkRepeatableComponent();

    /** Status checks if the repeatable component is proper while editing for adding it is always true */
    if (status) {
      let obj = {};
      if (formState.type_of_bill === "Kachha") {
        obj = {
          purchases: formState,
          kachhaPurchase: arr,
          pakkaPurchase: individualPakkaPurchase,
        };
      } else {
        obj = {
          purchases: formState,
          kachhaPurchase: individualKachhaPurchase,
          pakkaPurchase: arr,
        };
      }
      setBackDrop(true);
      await providerForPost(backend_purchases, obj, Auth.getToken())
        .then((res) => {
          history.push(PURCHASES);
          setBackDrop(false);
        })
        .catch((err) => {});
    } else {
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: error,
      }));
    }
  };

  const addNewPurchase = (type) => {
    if (type === "Kachha") {
      setIndividualKachhaPurchase([
        ...individualKachhaPurchase,
        kachhaPurchaseDetails,
      ]);
    } else {
      setIndividualPakkaPurchase([
        ...individualPakkaPurchase,
        pakkaPurchaseDetails,
      ]);
    }
  };

  const deletePurchase = (purchase, key) => {
    let object = {};
    if (purchase === "Kachha") {
      object = individualKachhaPurchase[key];
    } else if (purchase === "Pakka") {
      object = individualPakkaPurchase[key];
    }

    let total_amt_without_tax = formState.total_amt_without_tax;
    total_amt_without_tax = total_amt_without_tax - object.total_purchase_cost;
    let total_amt_without_tax_formatted = convertNumber(
      total_amt_without_tax.toFixed(2),
      true
    );

    /** Calculate tax */
    let cgst_percent = formState.cgst_percent;
    if (isEmptyString(cgst_percent)) {
      cgst_percent = 0;
    }

    let sgst_percent = formState.sgst_percent;
    if (isEmptyString(sgst_percent)) {
      sgst_percent = 0;
    }

    let cgst = (parseFloat(cgst_percent) / 100) * total_amt_without_tax;
    let sgst = (parseFloat(sgst_percent) / 100) * total_amt_without_tax;
    let total_amt_with_tax = total_amt_without_tax + cgst + sgst;
    let total_amt_with_tax_formatted = convertNumber(
      total_amt_with_tax.toFixed(2),
      true
    );

    setFormState((formState) => ({
      ...formState,
      total_amt_with_tax: total_amt_with_tax,
      total_amt_with_tax_formatted: total_amt_with_tax_formatted,
      total_amt_without_tax: total_amt_without_tax,
      total_amt_without_tax_formatted: total_amt_without_tax_formatted,
    }));

    if (purchase === "Kachha") {
      setIndividualKachhaPurchase([
        ...individualKachhaPurchase.slice(0, key),
        ...individualKachhaPurchase.slice(key + 1),
      ]);
    } else if (purchase === "Pakka") {
      setIndividualPakkaPurchase([
        ...individualPakkaPurchase.slice(0, key),
        ...individualPakkaPurchase.slice(key + 1),
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
      {/* <DialogBox
        open={openDialog}
        dialogTitle={""}
        handleCancel={handleCloseDialog}
        handleClose={handleCloseDialog}
        handleAccept={handleAcceptDialog}
        cancelButton={"Cancel"}
        acceptButton={"Yes"}
        isWarning
        text={[
          `Please make sure you have added the right purchases and the right
        quantity as the quantity once added cannot be changed.`,
          `Are you sure you
        want to proceed ?`
        ]}
      ></DialogBox> */}
      <DialogBoxForSelectingRawMaterial
        handleCancel={handleCloseDialogForRawMaterial}
        handleClose={handleCloseDialogForRawMaterial}
        handleAccept={handleAcceptDialogForRawMaterial}
        handleAddRawMaterial={handleChangeAutoCompleteForRepetableComponent}
        isHandleKey={true}
        gridKey={openDialogForSelectingRawMaterial.key}
        open={openDialogForSelectingRawMaterial.status}
      />
      <GridItem xs={12} sm={12} md={10}>
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
            </GridContainer>

            {formState.type_of_bill ? (
              <GridContainer>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomAutoComplete
                    id="seller-name"
                    disabled={isView || isEdit}
                    labelText="Seller"
                    autocompleteId={"seller-id"}
                    optionKey={"seller_name"}
                    options={seller}
                    onChange={(event, value) => {
                      delete error["seller"];
                      setError((error) => ({
                        ...error,
                      }));
                      if (value === null) {
                        setFormState((formState) => ({
                          ...formState,
                          seller: null,
                          gst_no: "",
                        }));
                      } else {
                        setFormState((formState) => ({
                          ...formState,
                          seller: value.id,
                          gst_no: value.gst_no,
                        }));
                      }
                    }}
                    value={
                      seller[
                        seller.findIndex(function (item, i) {
                          return item.id === formState.seller;
                        })
                      ] || null
                    }
                    /** For setting errors */
                    helperTextId={"helperText_seller"}
                    isHelperText={hasError("seller", error)}
                    helperText={
                      hasError("seller", error)
                        ? error["seller"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    error={hasError("seller", error)}
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="GST No."
                    name="gst_no"
                    disabled
                    value={formState.gst_no}
                    id="gst_no"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
              </GridContainer>
            ) : null}
            <GridContainer>
              {formState.type_of_bill && formState.type_of_bill !== "" ? (
                <>
                  {formState.type_of_bill === "Pakka" ? (
                    <GridItem xs={12} sm={12} md={3}>
                      <CustomInput
                        labelText="Invoice Number"
                        name="invoice_number"
                        onChange={(event) => handleChange(event)}
                        value={formState.invoice_number}
                        id="invoice_number"
                        formControlProps={{
                          fullWidth: true,
                        }}
                      />
                    </GridItem>
                  ) : (
                    <GridItem xs={12} sm={12} md={3}>
                      <CustomInput
                        labelText="Bill Number"
                        name="bill_no"
                        onChange={(event) => handleChange(event)}
                        value={formState.bill_no}
                        id="bill_no"
                        formControlProps={{
                          fullWidth: true,
                        }}
                      />
                    </GridItem>
                  )}
                  <GridItem xs={12} sm={12} md={3}>
                    <DatePicker
                      onChange={(event) => handleStartDateChange(event)}
                      label="Purchase Date"
                      name="date"
                      disabled={
                        isEdit || isView
                          ? !checkIfDateFallsInAcceptableRange(formState.date)
                          : false
                      }
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
                        marginTop: "1.5rem",
                        width: "100%",
                      }}
                    />
                  </GridItem>
                  {formState.type_of_bill === "Pakka" ? (
                    <>
                      <GridItem xs={12} sm={12} md={3}>
                        <CustomInput
                          labelText="Total amount in rupees(with tax)"
                          name="total_amt_with_tax"
                          disabled
                          value={formState.total_amt_with_tax_formatted}
                          id="total_amt_with_tax"
                          formControlProps={{
                            fullWidth: true,
                          }}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={3}>
                        <CustomInput
                          labelText="Total amount in rupees(without tax)"
                          name="total_amt_without_tax"
                          disabled
                          value={formState.total_amt_without_tax_formatted}
                          id="total_amt_without_tax"
                          formControlProps={{
                            fullWidth: true,
                          }}
                        />
                      </GridItem>
                    </>
                  ) : (
                    <GridItem xs={12} sm={12} md={4}>
                      <CustomInput
                        labelText="Total amount in rupees"
                        name="total_amt_without_tax"
                        disabled
                        value={formState.total_amt_without_tax_formatted}
                        id="total_amt_without_tax"
                        formControlProps={{
                          fullWidth: true,
                        }}
                      />
                    </GridItem>
                  )}
                </>
              ) : null}
            </GridContainer>
            {formState.type_of_bill === "Pakka" ? (
              <GridContainer>
                {" "}
                <GridItem xs={12} sm={12} md={3}>
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
                <GridItem xs={12} sm={12} md={3}>
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
                <GridItem xs={12} sm={12} md={3}>
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

            {isView ||
            isEdit ||
            isEmptyString(formState.type_of_bill) ? null : (
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <FAB
                    color="primary"
                    size={"medium"}
                    variant="extended"
                    onClick={() => addNewPurchase(formState.type_of_bill)}
                  >
                    <AddIcon className={classes.extendedIcon} />
                    <h5>Add new purchase</h5>
                  </FAB>
                </GridItem>
              </GridContainer>
            )}

            {/** Should get executed only when the bill is pakka bill */}
            {formState.type_of_bill &&
              formState.type_of_bill === "Kachha" &&
              individualKachhaPurchase.map((Ip, key) => (
                <GridContainer key={key}>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={9}
                    className={classes.componentBorder}
                  >
                    <GridContainer
                      style={
                        Ip.raw_material ? {} : { justifyContent: "center" }
                      }
                    >
                      {Ip.raw_material ? (
                        <GridItem
                          xs={12}
                          sm={12}
                          md={8}
                          style={{
                            margin: "27px 0px 0px",
                          }}
                        >
                          <GridContainer style={{ dispay: "flex" }}>
                            <GridItem xs={12} sm={12} md={8}>
                              <b>Id : </b> {Ip.raw_material_name.id}
                            </GridItem>
                          </GridContainer>
                          <GridContainer style={{ dispay: "flex" }}>
                            <GridItem xs={12} sm={12} md={8}>
                              <b>Name : </b> {Ip.raw_material_name.name}
                            </GridItem>
                          </GridContainer>
                          <GridContainer>
                            <GridItem xs={12} sm={12} md={8}>
                              <b>Department : </b>
                              {Ip.raw_material_name.department}
                            </GridItem>
                          </GridContainer>
                          <GridContainer>
                            <GridItem xs={12} sm={12} md={8}>
                              <b>Category : </b>
                              {Ip.raw_material_name.category}
                            </GridItem>
                          </GridContainer>
                          <GridContainer>
                            <GridItem xs={12} sm={12} md={8}>
                              <b>Color :</b> {Ip.raw_material_name.color}
                            </GridItem>
                          </GridContainer>
                          <GridContainer>
                            <GridItem xs={12} sm={12} md={8}>
                              <b>Size : </b>
                              {Ip.raw_material_name.size}
                            </GridItem>
                          </GridContainer>
                        </GridItem>
                      ) : null}

                      {isView || isEdit ? null : (
                        <GridItem
                          xs={12}
                          sm={12}
                          md={4}
                          style={{
                            margin: "27px 0px 0px",
                          }}
                        >
                          <Button
                            color="primary"
                            onClick={() => {
                              addChangeRawMaterial(key);
                            }}
                          >
                            {Ip.raw_material
                              ? "Change Raw Material"
                              : " Select Raw Material"}
                          </Button>
                        </GridItem>
                      )}
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          onChange={(event) =>
                            handleChangeForRepetableComponent(event, key)
                          }
                          type="number"
                          disabled={isView}
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
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          onChange={(event) =>
                            handleChangeForRepetableComponent(event, key)
                          }
                          type="number"
                          disabled={isView || isEdit}
                          labelText="Purchase Quantity"
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
                        />
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          labelText="Total Purchase Cost"
                          disabled
                          name="total_purchase_cost"
                          value={Ip.total_purchase_cost_formatted}
                          id="quantity"
                          formControlProps={{
                            fullWidth: true,
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                  </GridItem>
                  {isView || isEdit ? null : (
                    <GridItem
                      xs={12}
                      sm={12}
                      md={2}
                      className={classes.addDeleteFabButon}
                    >
                      <FAB
                        color="primary"
                        align={"end"}
                        size={"small"}
                        onClick={() => {
                          deletePurchase("Kachha", key);
                        }}
                      >
                        <DeleteIcon />
                      </FAB>
                    </GridItem>
                  )}

                  {/* <GridItem
                xs={6}
                sm={6}
                md={2}
                className={classes.addDeleteFabButon}
              >
                
              </GridItem> */}
                </GridContainer>
              ))}

            {/** Should get executed only when the bill is pakka bill */}
            {formState.type_of_bill &&
              formState.type_of_bill === "Pakka" &&
              individualPakkaPurchase.map((Ip, key) => (
                <GridContainer key={key}>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={9}
                    className={classes.componentBorder}
                  >
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={12}>
                        <CustomInput
                          onChange={(event) =>
                            handleChangeForRepetableComponent(event, key)
                          }
                          labelText="Item Name"
                          name="name"
                          disabled={isView}
                          value={Ip.name}
                          id={"item_name" + key}
                          formControlProps={{
                            fullWidth: true,
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          onChange={(event) =>
                            handleChangeForRepetableComponent(event, key)
                          }
                          labelText="Purchase cost per unit"
                          type="number"
                          disabled={isView}
                          name="purchase_cost"
                          value={Ip.purchase_cost}
                          id="purchase_cost"
                          formControlProps={{
                            fullWidth: true,
                          }}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          labelText="Purchase Quantity"
                          type="number"
                          disabled={isView || isEdit}
                          name="purchase_quantity"
                          value={Ip.purchase_quantity}
                          onChange={(event) =>
                            handleChangeForRepetableComponent(event, key)
                          }
                          id="quantity"
                          formControlProps={{
                            fullWidth: true,
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          disabled
                          labelText="Total Purchase Cost"
                          name="total_purchase_cost"
                          value={Ip.total_purchase_cost_formatted}
                          id="quantity"
                          formControlProps={{
                            fullWidth: true,
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                  </GridItem>

                  {isView || isEdit ? null : (
                    <GridItem
                      xs={12}
                      sm={12}
                      md={2}
                      className={classes.addDeleteFabButon}
                    >
                      <FAB
                        color="primary"
                        align={"end"}
                        size={"small"}
                        onClick={() => {
                          deletePurchase("Pakka", key);
                        }}
                      >
                        <DeleteIcon />
                      </FAB>
                    </GridItem>
                  )}
                </GridContainer>
              ))}
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

      {rawMaterialDetails.name ? (
        <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardBody>
              <GridItem xs={12} sm={12} md={12}>
                <Muted>Id :{rawMaterialDetails.id}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted>Name :{rawMaterialDetails.name}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted> Department : {rawMaterialDetails.department}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted> Category : {rawMaterialDetails.category}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted> Color : {rawMaterialDetails.color}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted> Size : {rawMaterialDetails.size}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted>
                  Balance :{" "}
                  {isEmptyString(rawMaterialDetails.balance)
                    ? "0"
                    : rawMaterialDetails.balance}
                </Muted>
              </GridItem>
              {rawMaterialDetails.name_value.map((nv) => (
                <GridItem xs={12} sm={12} md={12}>
                  <Muted>
                    {" "}
                    {nv.name} : {nv.value}
                  </Muted>
                </GridItem>
              ))}
            </CardBody>
          </Card>
        </GridItem>
      ) : null}
    </GridContainer>
  );
}
