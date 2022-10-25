import React from "react";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  makeStyles,
  Switch,
  Tooltip,
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
  CustomDropDown,
  CustomInput,
  CustomMaterialUITable,
  CustomTableBody,
  CustomTableCell,
  CustomTableHead,
  CustomTableRow,
  DatePicker,
  DialogBoxForSelectingDesign,
  FAB,
  GridContainer,
  GridItem,
  PartyDetails,
  RemoteAutoComplete,
  SnackBarComponent,
} from "../../components";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import {
  checkEmpty,
  convertNumber,
  hasError,
  isEmptyString,
  validateNumber,
} from "../../Utils";
import moment from "moment";
import { apiUrl, backend_parties } from "../../constants";
import no_image_icon from "../../assets/img/no_image_icon.png";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";
import { Paper, TableContainer, TextField, Typography } from "@mui/material";
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
  const [openBackDrop, setBackDrop] = useState(false);
  const [alert, setAlert] = useState(null);
  const [openDialogForSelectingDesign, setOpenDialogForSelectingDesign] =
    useState(false);
  const [rawMaterialIdTohighLight, setRawMaterialToHighLight] =
    React.useState(null);
  const [selectedparty, setSelectedParty] = React.useState(null);
  let sampleDesignData = {
    ["NoDesign-" + Math.floor(new Date().valueOf() * Math.random())]: {
      material_no: null,
      material_price: 0,
      add_price: 0,
      designId: null,
      images: null,
      stock: 0,
      colorsPresent: [],
      allColors: [],
      isNew: true,
      is_ready_material: true,
      are_ready_materials_clubbed: false,
    },
  };
  const [selectedDesign, setSelectedDesign] = React.useState({});
  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [id] = useState(props.id ? props.id : null);

  const [formState, setFormState] = useState({
    type_of_bill: null,
    bill_no: "",
    date: new Date(),
    is_gst_bill: false,
    total_price_of_all_design: 0,
    total_price_without_gst: 0,
    add_cost: 0,
    total_price: 0,
    sgst: 0,
    cgst: 0,
    igst: 0,
  });

  const [designError, setDesignError] = useState({});

  const [party, setParty] = useState({
    id: null,
    party_name: "",
    gst_no: "",
    address: "",
    is_whole_seller: false,
    is_retailer: false,
  });

  const [design, setDesign] = useState([]);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  useEffect(() => {
    if ((isEdit || isView) && id) {
      getEditViewData(id);
    }
    if (isView) {
      const urlParams = new URLSearchParams(window.location.search);
      let designId = urlParams.get("design");
      let colorId = urlParams.get("color");
      setRawMaterialToHighLight({
        design: designId,
        color: colorId,
      });
    }
  }, []);

  const getEditViewData = async (id) => {
    setBackDrop(true);
    let isError = false;
    await providerForGet(backend_sales + "/" + id, {}, Auth.getToken())
      .then((res) => {
        if (res.status === 200) {
          convertData(res.data);
        } else {
          isError = true;
        }
      })
      .catch((err) => {
        setBackDrop(false);
        isError = true;
      });
    if (isError) {
      history.push(NOTFOUNDPAGE);
    }
  };

  const convertData = (data) => {
    setBackDrop(true);
    setFormState((formState) => ({
      ...formState,
      bill_no: data.bill_no,
      date: new Date(data.date),
      type_of_bill: data.type_of_bill,
      total_price_of_all_design: validateNumber(data.total_price_of_all_design),
      total_price_without_gst: validateNumber(data.total_price_with_add_cost),
      add_cost: validateNumber(data.add_cost),
      total_price: validateNumber(data.total_price),
      sgst: validateNumber(data.sgst),
      cgst: validateNumber(data.cgst),
      igst: validateNumber(data.igst),
      party: data.party.id,
    }));

    setParty((party) => ({
      ...party,
      gst_no: data.party.gst_no,
      id: data.party.id,
      party_name: data.party.party_name,
      address: data.party.party_address,
      is_retailer: data.party.party_address,
      is_whole_seller: data.party.is_whole_seller,
    }));

    setSelectedParty({
      label: data.party.party_name,
      value: data.party.id,
      allData: data.party,
    });

    let saleReadyMaterial = {};
    data.sale_ready_material.forEach((el) => {
      let designId = el.design?.id;
      let colorId = el.color?.id;
      let design = el.design;
      /** ----------------------------------------- */
      let colorData = {
        design: designId,
        colorData: el.color,
        color: colorId,
        quantity: el.quantity,
        previousQuantity: el.quantity,
        quantity_to_add_deduct: 0,
        price_per_unit: validateNumber(el.price_per_unit),
        total_price: validateNumber(el.total_price),
        availableQuantity: el.color_price?.stock ? el.color_price?.stock : 0,
        isDeleted: false,
        isCannotDelete: true,
        message: "",
      };

      if (designId) {
        if (saleReadyMaterial[designId]) {
          let colorsPresent = saleReadyMaterial[designId].colorsPresent;
          let allColors = saleReadyMaterial[designId].allColors;
          colorsPresent.push(colorId);
          allColors.push(colorData);
          saleReadyMaterial = {
            ...saleReadyMaterial,
            [designId]: {
              ...saleReadyMaterial[designId],
              colorsPresent: colorsPresent,
              allColors: allColors,
              isNew: false,
            },
          };
        } else {
          saleReadyMaterial = {
            ...saleReadyMaterial,
            [designId]: {
              material_no: design.material_no,
              material_price: design.material_price,
              add_price: validateNumber(design.add_price),
              designId: design.id,
              images: design.images,
              stock: design.stock,
              colorsPresent: [colorId],
              allColors: [colorData],
              is_ready_material: true,
              are_ready_materials_clubbed: false,
            },
          };
        }
      }
    });

    setSelectedDesign(saleReadyMaterial);
    setBackDrop(false);
  };

  const onBackClick = () => {
    history.push(SALES);
  };

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  const handleCloseDialogForDesign = () => {
    setOpenDialogForSelectingDesign(false);
  };

  const restoreReadyMaterial = (key) => {
    let obj = design[key];
    setBackDrop(true);
    let total_price_of_all_design =
      formState.total_price_of_all_design + parseFloat(obj.total_price);
    const { total_price, total_price_with_add_cost } = calculateAddCostAndGst(
      total_price_of_all_design
    );
    setFormState((formState) => ({
      ...formState,
      total_price: total_price,
      total_price_of_all_design: total_price_of_all_design,
      total_price_without_gst: total_price_with_add_cost,
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
      delete designError[quantityKey];
      setDesignError((designError) => ({
        ...designError,
      }));
    } else {
      setDesignError((designError) => ({
        ...designError,
        [quantityKey]: [quantityError],
      }));
    }

    if (isPPPValid) {
      delete designError[pppKey];
      setDesignError((designError) => ({
        ...designError,
      }));
    } else {
      setDesignError((designError) => ({
        ...designError,
        [pppKey]: [pppError],
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
            ? `No of ready material ${
                quantity_to_add_deduct < 0
                  ? "to be added back to stock"
                  : "to be deducted from stock"
              }: ${Math.abs(quantity_to_add_deduct)}`
            : ""
          : "",
    };
    setDesign([...design.slice(0, key), obj, ...design.slice(key + 1)]);
    setBackDrop(false);
  };

  const removeReadyMaterial = (colorKey, designKey) => {
    console.log(selectedDesign);
    console.log(designKey);
    console.log(colorKey);
    if (
      colorKey === null &&
      selectedDesign[designKey].are_ready_materials_clubbed
    ) {
      let currObject = {
        ...selectedDesign[designKey],
      };
      console.log(currObject);
      setBackDrop(true);
      /** Recalculate totao */
      let total_price_of_all_design =
        validateNumber(formState.total_price_of_all_design) -
        validateNumber(currObject.total_price);
      const { total_price, total_price_with_add_cost } = calculateAddCostAndGst(
        total_price_of_all_design
      );
      /** Remove all errors corresponding to that particular entry */
      delete designError[`quantity${designKey}`];
      delete designError[`price_per_unit${designKey}`];
      delete designError[`name${designKey}`];
      setDesignError((designError) => ({
        ...designError,
      }));
      setFormState((formState) => ({
        ...formState,
        total_price: total_price,
        total_price_of_all_design: total_price_of_all_design,
        total_price_without_gst: total_price_with_add_cost,
      }));
      if (currObject["isCannotDelete"]) {
        setSelectedDesign((selectDesign) => ({
          ...selectedDesign,
          [designKey]: {
            ...selectedDesign[designKey],
            isDeleted: true,
          },
        }));
      } else {
        delete currObject[designKey];
        setSelectedDesign(currObject);
      }
      setBackDrop(false);
    } else {
      let colorArray = selectedDesign[designKey]?.allColors;
      if (Object.prototype.toString.call(colorArray) === "[object Array]") {
        let colorObj = colorArray[colorKey];
        setBackDrop(true);

        let total_price_of_all_design =
          formState.total_price_of_all_design -
          validateNumber(colorObj.total_price);
        const { total_price, total_price_with_add_cost } =
          calculateAddCostAndGst(total_price_of_all_design);
        delete designError[
          "quantity" + "color" + colorKey + "design" + designKey
        ];
        delete designError[
          "price_per_unit" + "color" + colorKey + "design" + designKey
        ];
        setDesignError((designError) => ({
          ...designError,
        }));
        setFormState((formState) => ({
          ...formState,
          total_price: total_price,
          total_price_of_all_design: total_price_of_all_design,
          total_price_without_gst: total_price_with_add_cost,
        }));
        if (colorObj["isCannotDelete"]) {
          colorObj = {
            ...colorObj,
            quantity_to_add_deduct: -colorObj.previousQuantity,
            isDeleted: true,
            message:
              "No of ready material added back to stock : " +
              colorObj.previousQuantity,
          };
        } else {
          if (colorArray.length === 1) {
            delete selectedDesign[designKey];
            setSelectedDesign((selectDesign) => ({
              ...selectedDesign,
            }));
          } else {
            let indexOfColor = selectedDesign[designKey].colorsPresent.indexOf(
              colorObj.color
            );
            selectedDesign[designKey].allColors.splice(colorKey, 1);
            selectedDesign[designKey].colorsPresent.splice(indexOfColor, 1);

            setSelectedDesign((selectedDesign) => ({
              ...selectedDesign,
              [designKey]: {
                ...selectedDesign[designKey],
                allColors: [...selectedDesign[designKey].allColors],
                colorsPresent: [...selectedDesign[designKey].colorsPresent],
              },
            }));
          }
        }
        setBackDrop(false);
      }
    }
  };

  const calculateAddCostAndGst = (
    total_price_of_all_design = formState.total_price_of_all_design,
    is_add_additional_cost = true,
    add_cost = formState.add_cost,
    cgst_percent = formState.cgst,
    sgst_percent = formState.sgst,
    igst_percent = formState.igst
  ) => {
    let total_price_with_add_cost = 0;
    if (is_add_additional_cost) {
      total_price_with_add_cost =
        total_price_of_all_design + parseFloat(add_cost);
    } else {
      total_price_with_add_cost =
        total_price_of_all_design - parseFloat(add_cost);
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

    const igst_value = calculateIgstPercent(
      igst_percent,
      total_price_with_add_cost
    );

    total_price =
      total_price_with_add_cost + cgst_value + sgst_value + igst_value;
    return {
      total_price: total_price,
      total_price_with_add_cost: total_price_with_add_cost,
    };
  };

  const cgstSgstValueChange = (event) => {
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
    } else if (name === "sgst") {
      /** Remove old value */
      let oldPercentValue = calculateSgstPercent();
      total_price = total_price - oldPercentValue;
      percentValue = calculateSgstPercent(value);
    } else {
      let oldPercentValue = calculateIgstPercent();
      total_price = total_price - oldPercentValue;
      percentValue = calculateIgstPercent(value);
    }
    total_price = total_price + percentValue;
    setFormState((formState) => ({
      ...formState,
      total_price: total_price,
      [name]: event.target.value,
    }));
  };

  const calculateIgstPercent = (
    igst = formState.igst,
    total_price_with_add_cost = formState.total_price_without_gst
  ) => {
    let igst_percent = 0;
    if (!isNaN(parseFloat(igst))) {
      igst_percent = parseFloat(igst);
    }
    let igst_value = (igst_percent / 100) * total_price_with_add_cost;
    return igst_value;
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

  const handleChangeAddCost = (event) => {
    delete designError[event.target.name];
    setDesignError((designError) => ({
      ...designError,
    }));
    let value = isEmptyString(event.target.value)
      ? 0
      : parseFloat(event.target.value);
    const { total_price, total_price_with_add_cost } = calculateAddCostAndGst(
      formState.total_price_of_all_design,
      true,
      value
    );
    setFormState((formState) => ({
      ...formState,
      [event.target.name]: event.target.value,
      total_price: total_price,
      total_price_without_gst: total_price_with_add_cost,
    }));
  };

  const handleChange = (event) => {
    delete designError[event.target.name];
    setDesignError((designError) => ({
      ...designError,
    }));
    if (event.target.name === "type_of_bill") {
      setDesign([]);
      setDesignError({});
      setParty({
        id: null,
        party_name: "",
        gst_no: "",
        address: "",
        is_whole_seller: false,
        is_retailer: false,
      });
      setSelectedParty(null);
      setFormState({
        type_of_bill: null,
        bill_no: "",
        date: new Date(),
        is_gst_bill: false,
        total_price_of_all_design: 0,
        total_price_without_gst: 0,
        add_cost: 0,
        total_price: 0,
        sgst: 0,
        cgst: 0,
        igst: 0,
      });
      setSelectedDesign({});
    }
    setFormState((formState) => ({
      ...formState,
      [event.target.name]: event.target.value,
    }));
  };

  /** Handle change */
  const handleChangeForRepetableComponent = (event, colorKey, designKey) => {
    let currObject = selectedDesign[designKey];
    let name = event.target.name;
    let total_price_per_piece = 0;
    let total_previous_price = 0;
    let isValid = false;
    let error = "";
    if (colorKey !== null && colorKey !== undefined && colorKey >= 0) {
      let colorObj = currObject.allColors[colorKey];
      total_previous_price = colorObj.total_price;
      let keyName = name + "color" + colorKey + "design" + designKey;
      let quantity_to_add_deduct = 0;
      let availableQuantity = validateNumber(colorObj.availableQuantity);
      let previousQuantity = validateNumber(colorObj.previousQuantity);

      /** Calculations */
      if (name === "quantity") {
        let quantity = 0;
        let price_per_piece = validateNumber(colorObj.price_per_unit);
        if (event.target.value && !isNaN(event.target.value)) {
          quantity = validateNumber(event.target.value);
        }
        total_price_per_piece = quantity * price_per_piece;

        /** Set Error */
        if (
          quantity > previousQuantity &&
          quantity - previousQuantity > availableQuantity
        ) {
          isValid = false;
          error =
            "Quantity cannot be greater than the available ready material quantity";
        } else if (!quantity || quantity < 0) {
          isValid = false;
          error = "Quantity cannot be zero or negative";
        } else {
          isValid = true;
          quantity_to_add_deduct = quantity - previousQuantity;
        }
      } else {
        let quantity = validateNumber(colorObj.quantity);
        let price_per_piece = 0;
        if (event.target.value && !isNaN(event.target.value)) {
          price_per_piece = validateNumber(event.target.value);
        }
        total_price_per_piece = quantity * price_per_piece;
        if (!price_per_piece || price_per_piece < 0) {
          isValid = false;
          error = "Price per piece cannot be zero or negative";
        } else {
          isValid = true;
          quantity_to_add_deduct = quantity - previousQuantity;
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
        message: isValid
          ? quantity_to_add_deduct
            ? `No of ready material ${
                quantity_to_add_deduct < 0
                  ? "to be added back to stock"
                  : "to be deducted from stock"
              }: ${Math.abs(quantity_to_add_deduct)}`
            : ""
          : "",
      };

      colorObj = {
        ...colorObj,
        [name]: event.target.value,
        total_price: total_price_per_piece,
      };

      setSelectedDesign((selectedDesign) => ({
        ...selectedDesign,
        [designKey]: {
          ...selectedDesign[designKey],
          allColors: [
            ...selectedDesign[designKey].allColors.slice(0, colorKey),
            colorObj,
            ...selectedDesign[designKey].allColors.slice(colorKey + 1),
          ],
        },
      }));
      /** ------------------------------ */
    } else {
      /** If there is no design */
      let keyName = `${name}${designKey}`;
      /** Calculations */
      if (name === "quantity") {
        let quantity = 0;
        let price_per_piece = validateNumber(currObject.price_per_unit);
        if (event.target.value && !isNaN(event.target.value)) {
          quantity = validateNumber(event.target.value);
        }
        total_price_per_piece = quantity * price_per_piece;

        /** Set Error */
        if (!quantity || quantity < 0) {
          isValid = false;
          error = "Quantity cannot be zero or negative";
        } else {
          isValid = true;
        }
      } else if (name === "price_per_unit") {
        let quantity = validateNumber(currObject.quantity);
        let price_per_piece = 0;
        if (event.target.value && !isNaN(event.target.value)) {
          price_per_piece = validateNumber(event.target.value);
        }
        total_price_per_piece = quantity * price_per_piece;
        if (!price_per_piece || price_per_piece < 0) {
          isValid = false;
          error = "Price per piece cannot be zero or negative";
        } else {
          isValid = true;
        }
      } else {
        isValid = true;
      }
      /** Set Error */
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
      /** Set value */
      setSelectedDesign((selectedDesign) => ({
        ...selectedDesign,
        [designKey]: {
          ...selectedDesign[designKey],
          [name]: event.target.value,
          total_price: total_price_per_piece,
        },
      }));
      total_previous_price = currObject.total_price;
    }
    /** New Price Calculation */

    let total_price_after_deducted_old_value =
      validateNumber(formState.total_price_of_all_design) -
      validateNumber(total_previous_price);
    let total_price_after_adding_new_value =
      total_price_after_deducted_old_value + total_price_per_piece;

    const { total_price, total_price_with_add_cost } = calculateAddCostAndGst(
      total_price_after_adding_new_value
    );

    /** Set new price */
    setFormState((formState) => ({
      ...formState,
      total_price: total_price,
      total_price_without_gst: total_price_with_add_cost,
      total_price_of_all_design: total_price_after_adding_new_value,
    }));
  };

  const handleOrderDate = (event) => {
    let date = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (date === "Invalid date") {
      date = null;
    } else {
      date = new Date(date).toISOString();
    }

    delete designError["date"];
    setDesignError((designError) => ({
      ...designError,
    }));

    setFormState((formState) => ({
      ...formState,
      date: date,
    }));
  };

  const addReadyMaterial = () => {
    setOpenDialogForSelectingDesign(true);
  };

  const handleCheckValidation = (event) => {
    event.preventDefault();
    setBackDrop(true);
    let isValid = false;
    let err = { ...designError };
    /** This will set errors as per validations defined in form */
    if (!party.id) {
      isValid = false;
      err = {
        ...err,
        seller: ["Party is required"],
      };
    }
    if (isEmptyString(formState.bill_no)) {
      isValid = false;
      err = {
        ...err,
        bill_no: ["Bill number is required"],
      };
    }

    err = checkData(err);
    console.log("Error => ", err);
    /** If no errors then isValid is set true */
    if (checkEmpty(err) && checkEmpty(designError)) {
      setBackDrop(false);
      setDesignError({});
      isValid = true;
    } else {
      setBackDrop(false);
      setDesignError(err);
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

  const checkData = (err) => {
    if (isEmptyString(formState.bill_no)) {
      err = {
        ...err,
        bill_no: ["Bill number is required"],
      };
    }
    if (!formState.date) {
      err = {
        ...err,
        date: ["Sale Date is required"],
      };
    }
    if (!party || (party && !party.id)) {
      err = {
        ...err,
        party: ["Party is required"],
      };
    }
    /** Error for Design data */
    Object.keys(selectedDesign).forEach((Ip) => {
      let object = selectedDesign[Ip];
      if (object.is_ready_material) {
        if (object.allColors && object.allColors.length) {
          object.allColors.forEach((c, colorKey) => {
            if (!validateNumber(c.quantity)) {
              err = {
                ...err,
                ["quantitycolor" + colorKey + "design" + Ip]: [
                  "Quantity is required",
                ],
              };
            }
            if (!validateNumber(c.price_per_unit)) {
              err = {
                ...err,
                ["price_per_unitcolor" + colorKey + "design" + Ip]: [
                  "Price per unit is required",
                ],
              };
            }
          });
        }
      } else {
        if (isEmptyString(object.name)) {
          err = {
            ...err,
            ["name" + Ip]: ["Name is required"],
          };
        }
        if (!validateNumber(object.quantity)) {
          err = {
            ...err,
            ["quantity" + Ip]: ["Quantity is required"],
          };
        }
        if (!validateNumber(object.price_per_unit)) {
          err = {
            ...err,
            ["price_per_unit" + Ip]: ["Price per unit is required"],
          };
        }
      }
    });
    return err;
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
      designAndColor: selectedDesign,
      party: party.id,
    };
    setBackDrop(true);
    console.log("Object => ", obj);
    console.log("error => ", designError);
    await providerForPost(backend_sales, obj, Auth.getToken())
      .then((res) => {
        history.push(SALES);
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

  const selectDesign = (row, mainDesignData) => {
    let design = row.design;
    let singlePiecePrice =
      validateNumber(row.color_price) +
      validateNumber(mainDesignData.material_price) +
      validateNumber(mainDesignData.add_price);
    let colorData = {
      design: row.design,
      colorData: row.color,
      color: row.color.id,
      quantity: 1,
      previousQuantity: 0,
      quantity_to_add_deduct: 1,
      price_per_unit: singlePiecePrice.toFixed(2),
      total_price: singlePiecePrice.toFixed(2),
      availableQuantity: row.stock,
      isCannotDelete: false,
      message: "No of ready material to be deducted from stocks :- 1",
    };
    setBackDrop(true);
    if (selectedDesign.hasOwnProperty(design)) {
      let colorsPresent = selectedDesign[design].colorsPresent;
      let allColors = selectedDesign[design].allColors;
      colorsPresent.push(row.color.id);
      allColors.push(colorData);

      setSelectedDesign((selectedDesign) => ({
        ...selectedDesign,
        [design]: {
          ...selectedDesign[design],
          colorsPresent: colorsPresent,
          allColors: allColors,
        },
      }));
    } else {
      setSelectedDesign((selectedDesign) => ({
        ...selectedDesign,
        [design]: {
          material_no: mainDesignData.material_no,
          material_price: mainDesignData.material_price,
          add_price: mainDesignData.add_price,
          designId: mainDesignData.id,
          images: mainDesignData.images,
          stock: mainDesignData.stock,
          colorsPresent: [row.color.id],
          allColors: [colorData],
          is_ready_material: true,
          are_ready_materials_clubbed: false,
        },
      }));
    }

    let total_price_of_all_design =
      formState.total_price_of_all_design + singlePiecePrice;

    const { total_price, total_price_with_add_cost } = calculateAddCostAndGst(
      total_price_of_all_design
    );

    setFormState((formState) => ({
      ...formState,
      total_price: total_price,
      total_price_of_all_design: total_price_of_all_design,
      total_price_without_gst: total_price_with_add_cost,
    }));
    setBackDrop(false);
  };

  const setPartyData = async (data) => {
    delete designError["party"];
    setDesignError((designError) => ({
      ...designError,
    }));
    if (data && data.value) {
      setParty((party) => ({
        ...party,
        gst_no: data.allData.gst_no,
        id: data.allData.id,
        party_name: data.allData.party_name,
        address: data.allData.party_address,
        is_retailer: data.allData.is_retailer,
        is_whole_seller: data.allData.is_whole_seller,
      }));
      setSelectedParty(data);
    } else {
      setParty({
        ...party,
        id: null,
        party_name: "",
        gst_no: "",
        address: "",
        is_whole_seller: false,
        is_retailer: false,
      });
      setSelectedParty(null);
    }
  };

  const addText = () => {
    setSelectedDesign((selectedDesign) => ({
      ...selectedDesign,
      [["NoDesign-" + Math.floor(new Date().valueOf() * Math.random())]]: {
        designId: null,
        images: [],
        colorsPresent: [],
        allColors: [],
        name: "",
        quantity: 1,
        price_per_unit: 0,
        total_price: 0,
        previousQuantity: 0,
        isNew: true,
        isDeleted: false,
        isCannotDelete: false,
        is_ready_material: false,
        are_ready_materials_clubbed: true,
      },
    }));
  };

  console.log("Object => ", selectedDesign);
  console.log("formState => ", formState);
  console.log("party => ", party);
  console.log("error => ", designError);

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
        {/* <DialogBoxForSelectingReadyMaterial
          handleCancel={handleCloseDialogForDesign}
          handleClose={handleCloseDialogForDesign}
          handleAddDesign={handleAddDesign}
          isHandleKey={false}
          noAddAvailableQuantites={true}
          selectedReadyMaterial={design}
          open={openDialogForSelectingDesign}
        /> */}
        <DialogBoxForSelectingDesign
          handleCancel={handleCloseDialogForDesign}
          handleClose={handleCloseDialogForDesign}
          isHandleKey={false}
          open={openDialogForSelectingDesign}
          noAddAvailableQuantites={true}
          title={"Select Ready Material For Sale"}
          partyId={party.id}
          selectMultiColors={true}
          selectedDesign={selectedDesign}
          selectDesign={selectDesign}
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
                    labelText="Type of Sale"
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
                        onChange={(event) => handleOrderDate(event)}
                        label="Sale Date"
                        name="date"
                        disabled={isView}
                        value={formState.date}
                        id="date"
                        formControlProps={{
                          fullWidth: true,
                        }}
                        style={{
                          width: "100%",
                          marginTop: "1.5rem",
                        }}
                        /** For setting errors */
                        helperTextId={"helperText_bill_date"}
                        isHelperText={hasError("date", designError)}
                        helperText={
                          hasError("date", designError)
                            ? designError["date"].map((designError) => {
                                return designError + " ";
                              })
                            : null
                        }
                        error={hasError("date", designError)}
                      />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3}>
                      <CustomInput
                        onChange={(event) => handleChange(event)}
                        labelText="Bill/Invoice Number"
                        name="bill_no"
                        disabled={isView || isEdit}
                        value={formState.bill_no}
                        id="bill_no"
                        formControlProps={{
                          fullWidth: true,
                        }}
                        /** For setting errors */
                        helperTextId={"helperText_bill_no"}
                        isHelperText={hasError("bill_no", designError)}
                        helperText={
                          hasError("bill_no", designError)
                            ? designError["bill_no"].map((designError) => {
                                return designError + " ";
                              })
                            : null
                        }
                        error={hasError("bill_no", designError)}
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
                          setSelectedData={setPartyData}
                          searchString={"party_name"}
                          apiName={backend_parties}
                          placeholder="Select Party..."
                          selectedValue={selectedparty}
                          isError={designError.party}
                          errorText={"Please select a party"}
                          isSeller={true}
                        />
                      </GridItem>
                    )}
                  </>
                ) : null}
              </GridContainer>
              {formState.type_of_bill &&
                selectedparty &&
                selectedparty.value &&
                selectedparty.allData && (
                  <GridContainer>
                    <GridItem
                      xs={12}
                      sm={12}
                      md={6}
                      style={{ marginTop: "1.5rem" }}
                    >
                      <PartyDetails party={selectedparty.allData} />
                    </GridItem>
                  </GridContainer>
                )}

              {formState.type_of_bill === "Pakka" ? (
                <GridContainer>
                  <GridItem xs={12} sm={12} md={2}>
                    <CustomInput
                      onChange={(event) => cgstSgstValueChange(event)}
                      labelText="CGST(%)"
                      name="cgst"
                      disabled={isView || validateNumber(formState.igst)}
                      value={formState.cgst}
                      id="cgst"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      /** For setting errors */
                      helperTextId={"helperText_cgst"}
                      isHelperText={hasError("cgst", designError)}
                      helperText={
                        hasError("cgst", designError)
                          ? designError["cgst"].map((designError) => {
                              return designError + " ";
                            })
                          : null
                      }
                      error={hasError("cgst", designError)}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={2}>
                    <CustomInput
                      onChange={(event) => cgstSgstValueChange(event)}
                      labelText="SGST(%)"
                      name="sgst"
                      disabled={isView || validateNumber(formState.igst)}
                      value={formState.sgst}
                      id="sgst"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      /** For setting errors */
                      helperTextId={"helperText_sgst"}
                      isHelperText={hasError("sgst", designError)}
                      helperText={
                        hasError("sgst", designError)
                          ? designError["sgst"].map((designError) => {
                              return designError + " ";
                            })
                          : null
                      }
                      error={hasError("sgst", designError)}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={2}>
                    <CustomInput
                      onChange={(event) => cgstSgstValueChange(event)}
                      labelText="IGST(%)"
                      name="igst"
                      disabled={
                        isView ||
                        validateNumber(formState.sgst) ||
                        validateNumber(formState.cgst)
                      }
                      value={formState.igst}
                      id="igst"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      /** For setting errors */
                      helperTextId={"helperText_igst"}
                      isHelperText={hasError("igst", designError)}
                      helperText={
                        hasError("igst", designError)
                          ? designError["igst"].map((designError) => {
                              return designError + " ";
                            })
                          : null
                      }
                      error={hasError("igst", designError)}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <CustomInput
                      onChange={(event) => handleChangeAddCost(event)}
                      labelText="Add. Cost"
                      name="add_cost"
                      type="number"
                      disabled={isView}
                      value={formState.add_cost}
                      id="add_cost"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      /** For setting errors */
                      helperTextId={"helperText_add_cost"}
                      isHelperText={hasError("add_cost", designError)}
                      helperText={
                        hasError("add_cost", designError)
                          ? designError["add_cost"].map((designError) => {
                              return designError + " ";
                            })
                          : null
                      }
                      error={hasError("add_cost", designError)}
                    />
                  </GridItem>
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
                            formState.total_price_without_gst,
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
                            formState.total_price,
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
                          formState.total_price,
                          true
                        )}`}</b>
                      </GridItem>
                    )}
                  </>
                ) : null}
              </GridContainer>

              {!isView &&
              formState.type_of_bill &&
              formState.type_of_bill !== "" ? (
                <GridContainer>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    style={{
                      marginTop: "2rem",
                    }}
                  >
                    <FAB
                      color="primary"
                      size={"medium"}
                      variant="extended"
                      onClick={() => addReadyMaterial()}
                      disabled={!party.id}
                      toolTip={
                        party.id
                          ? "Select ready materials for sale"
                          : "Select party first"
                      }
                    >
                      <AddIcon className={classes.extendedIcon} />
                      <h5>Add Ready Material</h5>
                    </FAB>
                    <FAB
                      color="primary"
                      size={"medium"}
                      variant="extended"
                      onClick={() => addText()}
                      disabled={!party.id}
                      toolTip={
                        party.id
                          ? "Select ready materials for sale"
                          : "Select party first"
                      }
                    >
                      <AddIcon className={classes.extendedIcon} />
                      <h5>Add Text</h5>
                    </FAB>
                  </GridItem>
                  {!party.id ? (
                    <>
                      <GridItem xs={12} sm={12} md={12}>
                        <Typography
                          variant="caption"
                          display="block"
                          gutterBottom
                        >
                          Please select party first
                        </Typography>
                      </GridItem>
                    </>
                  ) : null}
                </GridContainer>
              ) : null}

              {formState.type_of_bill ? (
                <GridContainer>
                  <TableContainer component={Paper}>
                    <CustomMaterialUITable
                      sx={{ textAlignLast: "center", ml: "15px" }}
                      aria-label="sale-table"
                      style={{
                        marginTop: 30,
                      }}
                    >
                      <CustomTableHead>
                        <CustomTableRow>
                          <CustomTableCell>Is Ready Material?</CustomTableCell>
                          <CustomTableCell>Ratio Name</CustomTableCell>
                          {isEdit ? (
                            <CustomTableCell align="left">
                              Previous Quantity
                            </CustomTableCell>
                          ) : null}
                          <CustomTableCell align="left">
                            Pcs to sell
                          </CustomTableCell>
                          <CustomTableCell align="left">
                            Price per piece
                          </CustomTableCell>
                          <CustomTableCell align="left">
                            Total Price
                          </CustomTableCell>
                          {!isView && <CustomTableCell>Remove</CustomTableCell>}
                        </CustomTableRow>
                      </CustomTableHead>
                      <CustomTableBody>
                        {selectedDesign &&
                          Object.keys(selectedDesign).map((Ip, designKey) => {
                            let isNoDesign = Ip.includes("NoDesign");
                            return (
                              <>
                                <CustomTableRow key={Ip} height={20}>
                                  <CustomTableCell
                                    align="center"
                                    rowSpan={
                                      (isNoDesign &&
                                        selectedDesign[Ip].is_ready_material) ||
                                      selectedDesign[Ip]
                                        .are_ready_materials_clubbed
                                        ? 1
                                        : 1 +
                                          selectedDesign[Ip].allColors.length
                                    }
                                    sx={{
                                      borderBottom:
                                        "2px solid #6c6c6c !important",
                                    }}
                                  >
                                    {selectedDesign[Ip].is_ready_material
                                      ? "Yes"
                                      : "No"}
                                  </CustomTableCell>
                                  {(isNoDesign &&
                                    selectedDesign[Ip].is_ready_material) ||
                                  selectedDesign[Ip]
                                    .are_ready_materials_clubbed ? (
                                    <>
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
                                          onChange={(event) =>
                                            handleChangeForRepetableComponent(
                                              event,
                                              null,
                                              Ip
                                            )
                                          }
                                          labelText="Name"
                                          name="name"
                                          disabled={isView}
                                          value={selectedDesign[Ip].name}
                                          id={"name" + Ip}
                                          formControlProps={{
                                            fullWidth: true,
                                          }}
                                          helperTextId={"helperText_name" + Ip}
                                          isHelperText={hasError(
                                            "name" + Ip,
                                            designError
                                          )}
                                          helperText={
                                            hasError("name" + Ip, designError)
                                              ? designError["name" + Ip].map(
                                                  (error) => {
                                                    return error + " ";
                                                  }
                                                )
                                              : null
                                          }
                                          error={hasError(
                                            "name" + Ip,
                                            designError
                                          )}
                                        />
                                      </CustomTableCell>
                                      {isEdit ? (
                                        <CustomTableCell
                                          align="right"
                                          sx={{
                                            pt: 0,
                                            pb: 0,
                                            borderBottom:
                                              "2px solid #6c6c6c !important",
                                          }}
                                        >
                                          {selectedDesign[Ip].previousQuantity
                                            ? selectedDesign[Ip]
                                                .previousQuantity
                                            : null}
                                        </CustomTableCell>
                                      ) : null}
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
                                          {selectedDesign[Ip].quantity}
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
                                                null,
                                                Ip
                                              )
                                            }
                                            type="number"
                                            disabled={isView}
                                            name="quantity"
                                            value={selectedDesign[Ip].quantity}
                                            id={"quantity" + Ip}
                                            formControlProps={{
                                              fullWidth: false,
                                            }}
                                            /** For setting errors */
                                            helperTextId={"quantity" + Ip}
                                            isHelperText={hasError(
                                              "quantity" + Ip,
                                              designError
                                            )}
                                            helperText={
                                              hasError(
                                                "quantity" + Ip,
                                                designError
                                              )
                                                ? designError[
                                                    "quantity" + Ip
                                                  ].map((error) => {
                                                    return error + " ";
                                                  })
                                                : null
                                            }
                                            error={hasError(
                                              "quantity" + Ip,
                                              designError
                                            )}
                                          />
                                        </CustomTableCell>
                                      )}

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
                                          {selectedDesign[Ip].price_per_unit}
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
                                                null,
                                                Ip
                                              )
                                            }
                                            type="number"
                                            disabled={isView}
                                            name="price_per_unit"
                                            value={
                                              selectedDesign[Ip].price_per_unit
                                            }
                                            id={"price_per_unit" + Ip}
                                            formControlProps={{
                                              fullWidth: false,
                                            }}
                                            /** For setting errors */
                                            helperTextId={"price_per_unit" + Ip}
                                            isHelperText={hasError(
                                              "price_per_unit" + Ip,
                                              designError
                                            )}
                                            helperText={
                                              hasError(
                                                "price_per_unit" + Ip,
                                                designError
                                              )
                                                ? designError[
                                                    "price_per_unit" + Ip
                                                  ].map((error) => {
                                                    return error + " ";
                                                  })
                                                : null
                                            }
                                            error={hasError(
                                              "price_per_unit" + Ip,
                                              designError
                                            )}
                                          />
                                        </CustomTableCell>
                                      )}
                                      {/* Price per unit */}

                                      <CustomTableCell
                                        align="left"
                                        sx={{
                                          pt: 0,
                                          pb: 0,
                                        }}
                                      >
                                        {convertNumber(
                                          selectedDesign[Ip].total_price,
                                          true
                                        )}
                                      </CustomTableCell>
                                      {isView ? null : (
                                        <CustomTableCell
                                          align="center"
                                          sx={{
                                            pt: 0,
                                            pb: 0,
                                          }}
                                        >
                                          <GridItem xs={12} sm={12} md={12}>
                                            <Tooltip
                                              title={
                                                selectedDesign[Ip].isDeleted
                                                  ? "Restore Back"
                                                  : "Delete"
                                              }
                                            >
                                              <FAB
                                                color="danger"
                                                align={"center"}
                                                size={"small"}
                                                onClick={() => {
                                                  selectedDesign[Ip].isDeleted
                                                    ? restoreReadyMaterial(
                                                        null,
                                                        Ip
                                                      )
                                                    : removeReadyMaterial(
                                                        null,
                                                        Ip
                                                      );
                                                }}
                                              >
                                                {selectedDesign[Ip]
                                                  .isDeleted ? (
                                                  <SettingsBackupRestoreIcon />
                                                ) : (
                                                  <DeleteIcon />
                                                )}
                                              </FAB>
                                            </Tooltip>
                                          </GridItem>
                                        </CustomTableCell>
                                      )}
                                    </>
                                  ) : (
                                    <CustomTableCell
                                      align="center"
                                      colSpan={isView ? 4 : isEdit ? 7 : 6}
                                      sx={{
                                        borderTop: "1px solid black !important",
                                      }}
                                    >
                                      <GridItem xs={12} sm={12} md={12}>
                                        <GridContainer
                                          style={{ dispay: "flex" }}
                                        >
                                          <GridItem xs={12} sm={12} md={12}>
                                            <div
                                              className={
                                                classes.imageDivInTable
                                              }
                                            >
                                              {selectedDesign[Ip].images &&
                                              selectedDesign[Ip].images
                                                .length &&
                                              selectedDesign[Ip].images[0]
                                                .url ? (
                                                <img
                                                  alt="ready_material_photo"
                                                  src={
                                                    apiUrl +
                                                    selectedDesign[Ip].images[0]
                                                      .url
                                                  }
                                                  loader={<CircularProgress />}
                                                  style={{
                                                    height: "5rem",
                                                    width: "10rem",
                                                  }}
                                                  className={
                                                    classes.UploadImage
                                                  }
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
                                            {selectedDesign[Ip].material_no}
                                          </GridItem>
                                        </GridContainer>
                                      </GridItem>
                                    </CustomTableCell>
                                  )}
                                </CustomTableRow>
                                {selectedDesign[Ip].allColors.map(
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
                                        <CustomTableCell
                                          align="left"
                                          sx={{
                                            pt: 0,
                                            pb: 0,
                                            color: "#3b3b42 !important;",
                                            fontSize: "0.9375rem !important",
                                            fontWeight: "400 !Important",
                                          }}
                                        >
                                          {c.colorData.name}
                                        </CustomTableCell>
                                        {isEdit ? (
                                          <CustomTableCell
                                            align="left"
                                            sx={{
                                              pt: 0,
                                              pb: 0,
                                            }}
                                          >
                                            {c.previousQuantity
                                              ? c.previousQuantity
                                              : null}
                                          </CustomTableCell>
                                        ) : null}
                                        {/** Input for quantity */}
                                        {isView ? (
                                          <CustomTableCell align="left">
                                            {c.quantity}
                                          </CustomTableCell>
                                        ) : (
                                          <CustomTableCell
                                            align="left"
                                            sx={{
                                              pt: 0,
                                              pb: 0,
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
                                              disabled={isView}
                                              name="quantity"
                                              value={c.quantity}
                                              id={
                                                "quantity" +
                                                "color" +
                                                colorKey +
                                                "design" +
                                                Ip
                                              }
                                              formControlProps={{
                                                fullWidth: false,
                                              }}
                                              /** For setting errors */
                                              helperTextId={
                                                "quantity" +
                                                "color" +
                                                colorKey +
                                                "design" +
                                                Ip
                                              }
                                              isHelperText={hasError(
                                                "quantity" +
                                                  "color" +
                                                  colorKey +
                                                  "design" +
                                                  Ip,
                                                designError
                                              )}
                                              helperText={
                                                hasError(
                                                  "quantity" +
                                                    "color" +
                                                    colorKey +
                                                    "design" +
                                                    Ip,
                                                  designError
                                                )
                                                  ? designError[
                                                      "quantity" +
                                                        "color" +
                                                        colorKey +
                                                        "design" +
                                                        Ip
                                                    ].map((error) => {
                                                      return error + " ";
                                                    })
                                                  : null
                                              }
                                              error={hasError(
                                                "quantity" +
                                                  "color" +
                                                  colorKey +
                                                  "design" +
                                                  Ip,
                                                designError
                                              )}
                                            />
                                          </CustomTableCell>
                                        )}

                                        {isView ? (
                                          <CustomTableCell align="ri">
                                            {c.price_per_unit}
                                          </CustomTableCell>
                                        ) : (
                                          <CustomTableCell
                                            align="left"
                                            sx={{
                                              pt: 0,
                                              pb: 0,
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
                                              disabled={isView}
                                              name="price_per_unit"
                                              value={c.price_per_unit}
                                              id={
                                                "price_per_unit" +
                                                "color" +
                                                colorKey +
                                                "design" +
                                                Ip
                                              }
                                              formControlProps={{
                                                fullWidth: true,
                                              }}
                                              /** For setting errors */
                                              helperTextId={
                                                "price_per_unit" +
                                                "color" +
                                                colorKey +
                                                "design" +
                                                Ip
                                              }
                                              isHelperText={hasError(
                                                "price_per_unit" +
                                                  "color" +
                                                  colorKey +
                                                  "design" +
                                                  Ip,
                                                designError
                                              )}
                                              helperText={
                                                hasError(
                                                  "price_per_unit" +
                                                    "color" +
                                                    colorKey +
                                                    "design" +
                                                    Ip,
                                                  designError
                                                )
                                                  ? designError[
                                                      "price_per_unit" +
                                                        "color" +
                                                        colorKey +
                                                        "design" +
                                                        Ip
                                                    ].map((error) => {
                                                      return error + " ";
                                                    })
                                                  : null
                                              }
                                              error={hasError(
                                                "price_per_unit" +
                                                  "color" +
                                                  colorKey +
                                                  "design" +
                                                  Ip,
                                                designError
                                              )}
                                            />
                                          </CustomTableCell>
                                        )}
                                        {/* Price per unit */}

                                        <CustomTableCell
                                          align="left"
                                          sx={{
                                            pt: 0,
                                            pb: 0,
                                          }}
                                        >
                                          {convertNumber(c.total_price, true)}
                                        </CustomTableCell>
                                        {isView ? null : (
                                          <CustomTableCell
                                            align="center"
                                            sx={{
                                              pt: 0,
                                              pb: 0,
                                            }}
                                          >
                                            <GridItem xs={12} sm={12} md={12}>
                                              <Tooltip
                                                title={
                                                  c.isDeleted
                                                    ? "Restore Back"
                                                    : "Delete"
                                                }
                                              >
                                                <FAB
                                                  color="danger"
                                                  align={"center"}
                                                  size={"small"}
                                                  onClick={() => {
                                                    c.isDeleted
                                                      ? restoreReadyMaterial(
                                                          colorKey,
                                                          Ip
                                                        )
                                                      : removeReadyMaterial(
                                                          colorKey,
                                                          Ip
                                                        );
                                                  }}
                                                >
                                                  {c.isDeleted ? (
                                                    <SettingsBackupRestoreIcon />
                                                  ) : (
                                                    <DeleteIcon />
                                                  )}
                                                </FAB>
                                              </Tooltip>
                                            </GridItem>
                                          </CustomTableCell>
                                        )}
                                      </CustomTableRow>
                                      {/* <CustomTableRow
                                    sx={{
                                      "&:last-child td, &:last-child th": {
                                        border: 0,
                                      },
                                      backgroundColor: c.isDeleted
                                        ? "#e7e7e7"
                                        : "transparent",
                                      color: "green",
                                    }}
                                  >
                                    <CustomTableCell
                                      align="left"
                                      colSpan={5}
                                      sx={{
                                        color: "green",
                                      }}
                                    >
                                      {c.message}
                                    </CustomTableCell>
                                  </CustomTableRow> */}
                                    </>
                                  )
                                )}

                                {/* {-------------------} */}
                              </>
                            );
                          })}
                      </CustomTableBody>
                      <CustomTableBody>
                        <CustomTableRow>
                          <CustomTableCell
                            colSpan={isEdit ? 5 : 4}
                            align="right"
                          >
                            Total
                          </CustomTableCell>

                          <CustomTableCell>
                            {convertNumber(
                              parseFloat(
                                formState.total_price_of_all_design
                              ).toFixed(2),
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
                </GridContainer>
              ) : null}
            </CardBody>
            {!formState.type_of_bill || isView ? null : (
              <CardFooter>
                <Button
                  color="primary"
                  onClick={(e) => handleCheckValidation(e)}
                  disabled={
                    !Object.keys(selectedDesign).length ||
                    Object.keys(designError).length
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
