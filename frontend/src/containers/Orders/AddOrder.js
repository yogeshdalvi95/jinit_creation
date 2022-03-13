import React, { useEffect, useState } from "react";

import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  IconButton,
  makeStyles,
  Switch,
  Tooltip,
} from "@material-ui/core";
import no_image_icon from "../../assets/img/no_image_icon.png";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import {
  checkEmpty,
  convertNumber,
  hasError,
  isEmptyString,
  setErrors,
  uuidv4,
} from "../../Utils";
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
  DialogForCheckingStockAvailibility,
  DialogForSelectingColor,
  DialogForSelectingParties,
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent,
} from "../../components";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import { DEPARTMENTSHEET, EDITORDER, ORDERS, VIEWORDER } from "../../paths";
import validationForm from "./form/ValidationForm.json";
import SweetAlert from "react-bootstrap-sweetalert";
import buttonStyles from "../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import classNames from "classnames";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import {
  apiUrl,
  backend_order,
  backend_order_check_raw_material_availibility,
} from "../../constants";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import { providerForGet, providerForPost, providerForPut } from "../../api";
import moment from "moment";

const useStyles = makeStyles(styles);
const buttonUseStyles = makeStyles(buttonStyles);

export default function AddOrder(props) {
  const classes = useStyles();
  const history = useHistory();
  const [openBackDrop, setBackDrop] = useState(false);
  const [alert, setAlert] = useState(null);
  const [openDialogForSelectingDesign, setOpenDialogForSelectingDesign] =
    useState(false);
  const [openDialogForStockAvailibility, setOpenDialogForStockAvailibility] =
    useState(false);

  const [availibleStocks, setAvailibleStocks] = useState({});

  const [openDialogForSelectingColor, setOpenDialogForSelectingColor] =
    useState(false);

  const [error, setError] = React.useState({});

  const [isView] = useState(
    props.location.state ? props.location.state.view : false
  );

  const [isEdit] = useState(
    props.location.state ? props.location.state.edit : false
  );

  const buttonClasses = buttonUseStyles();

  const [openDialogForSelectingParties, setOpenDialogForSelectingParties] =
    useState(false);
  const [formState, setFormState] = useState({
    id: null,
    order_id: uuidv4(),
    total_price: 0,
    total_price_formatted: "0",
    processing: true,
    partial_completed: false,
    cancelled: false,
    fully_completed: false,
    is_ratio_present: false,
    notes: "",
    quantity: 0,
    buffer_quantity: 0,
    price_per_piece: 0,
    price_per_piece_formatted: "0",
    add_cost: 0,
    add_cost_formatted: "0",
    completed_quantity: 0,
    previous_completed: 0,
    total_used_quantity_in_ratio: 0,
    nl_no: "",
    party_no: "",
    date: new Date(),
  });

  const [party, setParty] = useState({
    id: null,
    party_name: "",
    gst_no: "",
  });

  const [readyMaterial, setReadyMaterial] = useState({
    id: null,
    material_no: "",
    total_cost: 0,
    images: null,
    availableQuantity: 0,
    isColorVariationAvailable: false,
  });
  const urlParams = new URLSearchParams(window.location.search);
  const [ratio, setRatio] = useState([]);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  useEffect(() => {
    //window.location.reload();

    let order_id = urlParams.get("oid");
    if (order_id) {
      if (
        props.location.state &&
        (props.location.state.view || props.location.state.edit)
      ) {
        getData(order_id);
      } else {
        //window.location.reload();
        history.push({
          pathname: VIEWORDER,
          search: `?oid=${order_id}`,
          state: { view: true },
        });
        window.location.reload();
        //history.push(`${VIEWORDER}?oid=${order_id}`, { view: true });
      }
    } else {
      //history.push(ORDERS);
    }
  }, []);

  const getData = async (order_id) => {
    setBackDrop(true);
    await providerForGet(backend_order + "/" + order_id, {}, Auth.getToken())
      .then((res) => {
        setBackDrop(false);
        setData(res.data);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error viewing/editing order",
        }));
      });
  };

  const setData = (data) => {
    setFormState((formState) => ({
      ...formState,
      id: data.id,
      order_id: data.order_id,
      total_price: data.total_price,
      processing: data.processing,
      partial_completed: data.partial_completed,
      cancelled: data.cancelled,
      fully_completed: data.fully_completed,
      is_ratio_present: data.is_ratio_present,
      notes: data.notes,
      quantity: data.quantity,
      buffer_quantity: data.buffer_quantity,
      price_per_piece: data.price_per_piece,
      add_cost: data.add_cost,
      completed_quantity: data.completed_quantity,
      previous_completed: data.completed_quantity,
      date: new Date(data.date),
      nl_no: data.nl_no,
      party_no: data.party_no,
    }));
    if (data.ready_material) {
      let ready_material = data.ready_material;
      setReadyMaterial({
        id: ready_material.id,
        material_no: ready_material.material_no,
        total_cost: ready_material.final_cost,
        images: ready_material.images,
        availableQuantity: ready_material.total_quantity,
        isColorVariationAvailable: ready_material.isColorVariationAvailable,
      });
    }
    if (data.party) {
      let party = data.party;
      setParty({
        id: party.id,
        party_name: party.party_name,
        gst_no: party.gst_no,
      });
    }

    if (data.ratio && data.ratio.length) {
      let arr = data.ratio;
      let new_arr = [];
      new_arr = arr.map((r) => {
        return {
          id: r.id,
          color: r.color ? r.color.id : null,
          name: r.color ? r.color.name : null,
          quantity: r.quantity,
          quantity_completed: r.quantity_completed,
        };
      });
      setFormState((formState) => ({
        ...formState,
        is_ratio_present: new_arr.length ? true : false,
      }));
      setRatio(new_arr);
    }
  };

  const onBackClick = () => {
    history.push(ORDERS);
  };

  const handleCloseDialogForDesign = () => {
    setOpenDialogForSelectingDesign(false);
  };

  const handleAddDesign = (data) => {
    setReadyMaterial((readyMaterial) => ({
      ...readyMaterial,
      id: data.id,
      material_no: data.material_no,
      availableQuantity: data.total_quantity,
      images: data.images,
      total_cost: data.final_cost,
      isColorVariationAvailable: data.isColorVariationAvailable,
    }));

    delete error["ready_material"];
    setError((error) => ({
      ...error,
    }));
    /** Price Calculation */
    let quantity = isNaN(parseFloat(formState.quantity))
      ? 0
      : parseFloat(formState.quantity);
    let ppp = isNaN(parseFloat(data.final_cost))
      ? 0
      : parseFloat(data.final_cost);
    let add_cost = isNaN(parseFloat(formState.add_cost))
      ? 0
      : parseFloat(formState.add_cost);
    let total_price = quantity * ppp + add_cost;
    setFormState((formState) => ({
      ...formState,
      price_per_piece: ppp,
      total_price: total_price,
    }));
    handleCloseDialogForDesign();
  };

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  const handleChange = (event) => {
    let isValid = true;
    if (isValid) {
      delete error[event.target.name];
      setError((error) => ({
        ...error,
      }));
      setFormState((formState) => ({
        ...formState,
        [event.target.name]: event.target.value,
      }));
    }
  };

  const submit = (event) => {
    event.preventDefault();
    setBackDrop(true);
    let isValid = false;
    let error = {};
    /** This will set errors as per validations defined in form */
    error = setErrors(formState, validationForm);

    if (checkEmpty(error)) {
      setBackDrop(false);
      setError({});
      isValid = true;
    } else {
      setBackDrop(false);
      setError(error);
    }

    if (!readyMaterial.id || !party.id) {
      if (!readyMaterial.id) {
        setError((error) => ({
          ...error,
          ready_material: ["Ready Material is required"],
        }));
      }

      if (!party.id) {
        setError((error) => ({
          ...error,
          party: ["Party is required"],
        }));
      }
      isValid = false;
    }

    if (isValid) {
      const confirmBtnClasses = classNames({
        [buttonClasses.button]: true,
        [buttonClasses["success"]]: true,
      });

      const cancelBtnClasses = classNames({
        [buttonClasses.button]: true,
        [buttonClasses["danger"]]: true,
      });

      if (isEdit) {
        let text = "";
        let parseCompletedValue = parseFloat(formState.completed_quantity);
        let parsePreviousCompletedValue = parseFloat(
          formState.previous_completed
        );
        parseCompletedValue = isNaN(parseCompletedValue)
          ? 0
          : parseCompletedValue;
        parsePreviousCompletedValue = isNaN(parsePreviousCompletedValue)
          ? 0
          : parsePreviousCompletedValue;
        let diff = parseCompletedValue - parsePreviousCompletedValue;
        if (diff > 0) {
          text = `Previous completed value was '${parsePreviousCompletedValue}' and new completed value is '${parseCompletedValue}'. 
          This will add ${diff} stocks to the selected ready material, Arey you sure?`;
        } else if (diff < 0) {
          text = `Previous completed value was '${parsePreviousCompletedValue}' and new completed value is '${parseCompletedValue}'. 
          This will remove ${diff} stocks from the selected ready material, Arey you sure?`;
        } else {
          text = `Arey you sure you want to save the changes?`;
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
            {text}
          </SweetAlert>
        );
      } else {
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
            Please check the quantity and added details properly Note :- If you
            have added completed quantity then that much quantity will be added
            to stock for the selected ready material!
          </SweetAlert>
        );
      }
    }
  };

  const handleCloseDialog = () => {
    setAlert(null);
  };

  const handleAcceptDialog = () => {
    setAlert(null);
    addButton();
  };

  const getRatio = () => {
    let arr = ratio;
    let newArr = [];
    arr.map((nv) => {
      if (nv.color && nv.name && !isEmptyString(nv.name)) {
        if (nv.id) {
          newArr.push({
            id: nv.id,
            color: nv.color,
            name: nv.name,
            quantity: nv.quantity,
            quantity_completed: nv.quantity_completed,
          });
        } else {
          newArr.push({
            color: nv.color,
            name: nv.name,
            quantity: nv.quantity,
            quantity_completed: nv.quantity_completed,
          });
        }
      }
    });
    return newArr;
  };

  const addButton = async () => {
    let arr = getRatio();
    setBackDrop(true);
    if (isEdit) {
      await providerForPut(
        backend_order,
        formState.id,
        {
          order_id: formState.order_id,
          total_price: formState.total_price,
          processing: formState.processing,
          partial_completed: formState.partial_completed,
          category: formState.category,
          is_ratio_present: formState.is_ratio_present,
          cancelled: formState.cancelled,
          fully_completed: formState.fully_completed,
          notes: formState.notes,
          ready_material: readyMaterial.id,
          quantity: formState.quantity,
          buffer_quantity: formState.buffer_quantity,
          price_per_piece: formState.price_per_piece,
          add_cost: formState.add_cost,
          completed_quantity: formState.completed_quantity,
          previous_completed: formState.previous_completed,
          party: party.id,
          ratio: arr,
          party_no: formState.party_no,
          nl_no: formState.nl_no,
          date: formState.date,
        },
        Auth.getToken()
      )
        .then((res) => {
          history.push(ORDERS);
          setBackDrop(false);
        })
        .catch((err) => {
          setBackDrop(false);
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: err.response.message
              ? err.response.message
              : "Error editing new order",
          }));
        });
    } else {
      await providerForPost(
        backend_order,
        {
          order_id: formState.order_id,
          total_price: formState.total_price,
          processing: formState.processing,
          partial_completed: formState.partial_completed,
          category: formState.category,
          is_ratio_present: formState.is_ratio_present,
          cancelled: formState.cancelled,
          fully_completed: formState.fully_completed,
          notes: formState.notes,
          ready_material: readyMaterial.id,
          quantity: formState.quantity,
          buffer_quantity: formState.buffer_quantity,
          price_per_piece: formState.price_per_piece,
          add_cost: formState.add_cost,
          completed_quantity: formState.completed_quantity,
          party: party.id,
          ratio: arr,
          party_no: formState.party_no,
          nl_no: formState.nl_no,
          date: formState.date,
        },
        Auth.getToken()
      )
        .then((res) => {
          history.push(ORDERS);
          setBackDrop(false);
        })
        .catch((err) => {
          setBackDrop(false);
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: err.response.message
              ? err.response.message
              : "Error adding new order",
          }));
        });
    }
  };

  const openDesignDialogFunction = (status) => {
    setOpenDialogForSelectingDesign(status);
  };

  const openDialogForSelectingParty = () => {
    setOpenDialogForSelectingParties(true);
  };

  const handleCloseDialogForParties = () => {
    setOpenDialogForSelectingParties(false);
  };

  const handleAddParties = (data) => {
    setParty((party) => ({
      ...party,
      gst_no: data.gst_no,
      id: data.id,
      party_name: data.party_name,
    }));
    delete error["party"];
    setError((error) => ({
      ...error,
    }));
    handleCloseDialogForParties();
  };

  const handleChangePricePerPiece = (event) => {
    let value = event.target.value;
    if (value == "" || value >= 0) {
      delete error["price_per_piece"];
      setError((error) => ({
        ...error,
      }));

      let new_value = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
      let quantity = isNaN(formState.quantity)
        ? 0
        : parseFloat(formState.quantity);
      let add_cost = isNaN(parseFloat(formState.add_cost))
        ? 0
        : parseFloat(formState.add_cost);
      let final_value = quantity * new_value + add_cost;
      setFormState((formState) => ({
        ...formState,
        price_per_piece: value,
        total_price: final_value,
      }));
    } else {
      setError((error) => ({
        ...error,
        price_per_piece: ["Price Per Piece cannot be negative"],
      }));
    }
  };

  const handleChangeAddCost = (event) => {
    let value = event.target.value;
    if (value == "" || value >= 0) {
      delete error["add_cost"];
      setError((error) => ({
        ...error,
      }));

      let new_value = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
      let total_price = isNaN(formState.total_price)
        ? 0
        : parseFloat(formState.total_price);
      let old_add_cost = isNaN(parseFloat(formState.add_cost))
        ? 0
        : parseFloat(formState.add_cost);
      total_price = total_price - old_add_cost;
      let final_value = total_price + new_value;
      setFormState((formState) => ({
        ...formState,
        add_cost: value,
        total_price: final_value,
      }));
    } else {
      setError((error) => ({
        ...error,
        quantity: ["Add. Cost cannot be negative"],
      }));
    }
  };

  const handleChangeTotalQuantity = (event) => {
    let value = event.target.value;
    if (value == "" || value >= 0) {
      delete error["quantity"];
      setError((error) => ({
        ...error,
      }));
      if (value == "" || parseFloat(value) <= parseFloat(formState.quantity)) {
        let new_value = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
        let completed_quantity = isNaN(formState.completed_quantity)
          ? 0
          : parseFloat(formState.completed_quantity);

        let buffer_quantity = new_value - completed_quantity;
        setFormState((formState) => ({
          ...formState,
          quantity: value,
          buffer_quantity: buffer_quantity,
        }));
      }
    } else {
      setError((error) => ({
        ...error,
        quantity: ["Quantity cannot be negative"],
      }));
    }
  };

  const handleChangeQuantity = (event) => {
    let value = event.target.value;
    if (value == "" || value >= 0) {
      delete error["quantity"];
      setError((error) => ({
        ...error,
      }));

      let new_value = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
      let price_per_piece = isNaN(formState.price_per_piece)
        ? 0
        : parseFloat(formState.price_per_piece);
      let add_cost = isNaN(parseFloat(formState.add_cost))
        ? 0
        : parseFloat(formState.add_cost);
      let final_value = price_per_piece * new_value + add_cost;

      setFormState((formState) => ({
        ...formState,
        quantity: value,
        total_price: final_value,
      }));
    } else {
      setError((error) => ({
        ...error,
        quantity: ["Quantity cannot be negative"],
      }));
    }
  };

  const handleChangeCompletedQuantity = (event) => {
    let value = event.target.value;
    if (value == "" || value >= 0) {
      delete error["completed_quantity"];
      setError((error) => ({
        ...error,
      }));
      if (value == "" || parseFloat(value) <= parseFloat(formState.quantity)) {
        let new_value = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
        let quantity = isNaN(formState.quantity)
          ? 0
          : parseFloat(formState.quantity);
        let old_completed_quantity = isNaN(
          parseFloat(formState.completed_quantity)
        )
          ? 0
          : parseFloat(formState.completed_quantity);
        let buffer_quantity = quantity + old_completed_quantity;
        buffer_quantity = quantity - new_value;
        setFormState((formState) => ({
          ...formState,
          completed_quantity: value,
          buffer_quantity: buffer_quantity,
        }));
      }
    } else {
      setError((error) => ({
        ...error,
        completed_quantity: ["Completed Quantity cannot be negative"],
      }));
    }
  };

  const addRatio = () => {
    setOpenDialogForSelectingColor(true);
  };

  const handleCloseDialogForColor = () => {
    setOpenDialogForSelectingColor(false);
  };

  const handleSelectColor = (data) => {
    let i = 0;
    let isPresent = false;
    while (i < ratio.length) {
      if (ratio[i].color === data.id) {
        isPresent = true;
        break;
      }
      i = i + 1;
    }
    if (!isPresent) {
      setRatio([
        {
          id: null,
          color: data.id,
          name: data.name,
          quantity: 0,
          quantity_completed: 0,
        },
        ...ratio,
      ]);
    } else {
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Color already present",
      }));
    }
    setOpenDialogForSelectingColor(false);
  };

  const handleChangeRepeatableComponent = (e, k) => {
    let name = e.target.name;
    let value = e.target.value;
    let obj = ratio[k];
    obj = {
      ...obj,
      [name]: parseFloat(value),
    };
    setRatio([...ratio.slice(0, k), obj, ...ratio.slice(k + 1)]);
  };

  const checkAvailibility = async () => {
    setBackDrop(true);
    await providerForPost(
      backend_order_check_raw_material_availibility,
      {
        ready_material: readyMaterial.id,
        ratio: ratio && ratio.length ? ratio : [],
        remaining_quantity:
          parseFloat(formState.quantity) -
          parseFloat(formState.completed_quantity),
      },
      Auth.getToken()
    )
      .then((res) => {
        setOpenDialogForStockAvailibility(true);
        setAvailibleStocks(res.data);
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error",
        }));
      });
  };

  const handleCloseDialogForStockAvailibility = () => {
    setOpenDialogForStockAvailibility(false);
  };

  useEffect(() => {
    setFormState((formState) => ({
      ...formState,
      is_ratio_present: ratio && ratio.length ? true : false,
    }));
  }, [ratio]);

  const handleOrderDate = (event) => {
    let date = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (date === "Invalid date") {
      date = null;
    } else {
      date = new Date(date).toISOString();
    }

    setFormState((formState) => ({
      ...formState,
      date: date,
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
      <DialogBoxForSelectingReadyMaterial
        handleCancel={handleCloseDialogForDesign}
        handleClose={handleCloseDialogForDesign}
        handleAddDesign={handleAddDesign}
        isHandleKey={false}
        open={openDialogForSelectingDesign}
      />
      <DialogForSelectingParties
        handleCancel={handleCloseDialogForParties}
        handleClose={handleCloseDialogForParties}
        handleAddParties={handleAddParties}
        open={openDialogForSelectingParties}
      />
      <DialogForSelectingColor
        handleCancel={handleCloseDialogForColor}
        handleClose={handleCloseDialogForColor}
        handleAddColor={handleSelectColor}
        open={openDialogForSelectingColor}
      />
      <DialogForCheckingStockAvailibility
        handleCancel={handleCloseDialogForStockAvailibility}
        handleClose={handleCloseDialogForStockAvailibility}
        availibleStocks={availibleStocks}
        open={openDialogForStockAvailibility}
      />
      <GridItem xs={12} sm={12} md={8}>
        <Card>
          <CardHeader color="primary" className={classes.cardHeaderStyles}>
            <h4 className={classes.cardTitleWhite}>{props.header}</h4>
            <p className={classes.cardCategoryWhite}></p>
          </CardHeader>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  onChange={(event) => handleChange(event)}
                  labelText="Order ID"
                  name="order_id"
                  disabled={isView || isEdit || formState.cancelled}
                  value={formState.order_id}
                  id="order_id"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  /** For setting errors */
                  helperTextId={"helperText_order_id"}
                  isHelperText={hasError("order_id", error)}
                  helperText={
                    hasError("order_id", error)
                      ? error["order_id"].map((error) => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("order_id", error)}
                />
              </GridItem>
              {/* 
              <GridItem xs={12} sm={12} md={4}>
                <CustomInput
                  onChange={event => handleChange(event)}
                  labelText="NL No"
                  name="nl_no"
                  disabled={isView || formState.cancelled}
                  value={formState.nl_no}
                  id="nl_no"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem> */}

              <GridItem xs={12} sm={12} md={4}>
                <DatePicker
                  onChange={(event) => handleOrderDate(event)}
                  label="Order Date"
                  name="order_date"
                  disabled={isView || formState.cancelled}
                  value={formState.date || new Date()}
                  id="order_date"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  style={{
                    width: "100%",
                    marginTop: "1.5rem",
                  }}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem
                xs={12}
                sm={12}
                md={12}
                style={{
                  margin: "20px 10px 20px 13px",
                }}
              >
                <GridContainer>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    style={{
                      margin: "0px 0px 10px 0px",
                    }}
                  >
                    <b>Design : </b>
                  </GridItem>
                </GridContainer>

                <GridContainer
                  style={{
                    margin: "2px 2px 2px 2px",
                    border: "1px solid #C0C0C0",
                    borderRadius: "10px",
                  }}
                >
                  <GridItem
                    xs={12}
                    sm={12}
                    md={10}
                    style={{
                      margin: "15px 0px 10px 0px",
                    }}
                  >
                    {readyMaterial.id ? (
                      <div
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <GridContainer>
                          <GridItem xs={12} sm={12} md={12}>
                            <div className={classes.imageDivInTable}>
                              {readyMaterial.images &&
                              readyMaterial.images.length &&
                              readyMaterial.images[0].url ? (
                                <img
                                  alt="ready_material_photo"
                                  src={apiUrl + readyMaterial.images[0].url}
                                  loader={<CircularProgress />}
                                  style={{
                                    height: "10rem",
                                    width: "20rem",
                                  }}
                                  className={classes.UploadImage}
                                />
                              ) : (
                                <img
                                  src={no_image_icon}
                                  alt="ready_material_photo"
                                  style={{
                                    height: "10rem",
                                    width: "20rem",
                                  }}
                                  loader={<CircularProgress />}
                                  className={classes.DefaultNoImage}
                                />
                              )}
                            </div>
                          </GridItem>
                        </GridContainer>
                        <GridContainer>
                          <GridItem xs={12} sm={12} md={12}>
                            <b>Material No : </b> {readyMaterial.material_no}
                          </GridItem>
                        </GridContainer>
                        <GridContainer>
                          <GridItem xs={12} sm={12} md={12}>
                            <b>Total Available Quantity : </b>{" "}
                            {readyMaterial.availableQuantity}
                          </GridItem>
                        </GridContainer>
                        <GridContainer>
                          <GridItem xs={12} sm={12} md={12}>
                            <b>Price Per Piece : </b>{" "}
                            {convertNumber(readyMaterial.total_cost, true)}
                          </GridItem>
                        </GridContainer>
                      </div>
                    ) : (
                      <GridContainer style={{ dispay: "flex" }}>
                        <GridItem xs={12} sm={12} md={12}>
                          No Design Selected
                        </GridItem>
                      </GridContainer>
                    )}
                  </GridItem>
                  <GridItem xs={12} sm={12} md={1}>
                    <Tooltip
                      title={
                        readyMaterial.id ? "Change Design " : "Select Design"
                      }
                    >
                      <IconButton
                        disabled={isView || isEdit || formState.cancelled}
                        onClick={() => {
                          openDesignDialogFunction(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </GridItem>
                  <GridItem xs={12} sm={12} md={1}>
                    <IconButton
                      disabled={isView || isEdit || formState.cancelled}
                      onClick={() => {
                        delete error["ready_material"];
                        setError((error) => ({
                          ...error,
                        }));
                        setReadyMaterial((readyMaterial) => ({
                          ...readyMaterial,
                          id: null,
                          availableQuantity: 0,
                          images: null,
                          total_cost: 0,
                          isColorVariationAvailable: false,
                        }));
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </GridItem>
                  {/* <Button
                    component="span"
                    className={
                      formState.image
                        ? classes.editIconOnImage
                        : classes.addIconOnImage
                    }
                  >
                    <EditIcon fontSize="small" />
                  </Button> */}
                </GridContainer>
                <GridContainer>
                  <GridItem>
                    {hasError("ready_material", error) ? (
                      <GridItem xs={12} sm={12} md={12}>
                        <FormHelperText
                          id={"ready_material_helpertext_id"}
                          error={hasError("ready_material", error)}
                        >
                          {hasError("ready_material", error)
                            ? error["ready_material"].map((error) => {
                                return error + " ";
                              })
                            : null}
                        </FormHelperText>
                      </GridItem>
                    ) : null}
                  </GridItem>
                </GridContainer>
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem
                xs={12}
                sm={12}
                md={12}
                style={{
                  margin: "20px 10px 0px 13px",
                }}
              >
                <GridContainer>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    style={{
                      margin: "0px 0px 10px 0px",
                    }}
                  >
                    <b>Party : </b>
                  </GridItem>
                </GridContainer>

                <GridContainer
                  style={{
                    margin: "2px 2px 0px 2px",
                    border: "1px solid #C0C0C0",
                    borderRadius: "10px",
                  }}
                >
                  <GridItem
                    xs={12}
                    sm={12}
                    md={10}
                    style={{
                      margin: "15px 0px 10px 0px",
                    }}
                  >
                    {party.id ? (
                      <>
                        <GridContainer style={{ dispay: "flex" }}>
                          <GridItem xs={12} sm={12} md={12}>
                            <b>Party : </b> {party.party_name}
                          </GridItem>
                          <GridItem xs={12} sm={12} md={12}>
                            <b>GST No : </b> {party.gst_no}
                          </GridItem>
                        </GridContainer>
                      </>
                    ) : (
                      <GridContainer style={{ dispay: "flex" }}>
                        <GridItem xs={12} sm={12} md={12}>
                          No party selected
                        </GridItem>
                      </GridContainer>
                    )}
                  </GridItem>
                  <GridItem xs={12} sm={12} md={1}>
                    <Tooltip
                      title={party.id ? "Change Party " : "Select Party"}
                    >
                      <IconButton
                        disabled={isView || isEdit || formState.cancelled}
                        onClick={() => {
                          openDialogForSelectingParty(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </GridItem>
                  <GridItem xs={12} sm={12} md={1}>
                    <IconButton
                      disabled={isView || isEdit || formState.cancelled}
                      onClick={() => {
                        delete error["party"];
                        setError((error) => ({
                          ...error,
                        }));
                        setParty((party) => ({
                          ...party,
                          gst_no: "",
                          id: null,
                          party_name: "",
                        }));
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem>
                    {hasError("party", error) ? (
                      <GridItem xs={12} sm={12} md={12}>
                        <FormHelperText
                          id={"party_helpertext_id"}
                          error={hasError("party", error)}
                        >
                          {hasError("party", error)
                            ? error["party"].map((error) => {
                                return error + " ";
                              })
                            : null}
                        </FormHelperText>
                      </GridItem>
                    ) : null}
                  </GridItem>
                </GridContainer>
              </GridItem>
            </GridContainer>
            {readyMaterial.id ? (
              <>
                {/* <GridContainer>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    style={{
                      margin: "20px 0 0 0"
                    }}
                  >
                    <Typography variant="caption" display="block" gutterBottom>
                      Note :- Please add <b>New Price Per Piece</b> only if you
                      want to change the actual original price per piece of
                      ready material, else leave it blank
                    </Typography>
                  </GridItem>
                </GridContainer> */}
                <GridContainer>
                  <GridItem xs={12} sm={12} md={3}>
                    <CustomInput
                      onChange={(event) => handleChangePricePerPiece(event)}
                      labelText="Price Per Piece"
                      disabled={isView || isEdit || formState.cancelled}
                      value={formState.price_per_piece}
                      id="price_per_piece"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      type="number"
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
                  <GridItem
                    xs={12}
                    sm={12}
                    md={3}
                    style={{
                      margin: "45px 0 0 0",
                    }}
                  >
                    {convertNumber(
                      isNaN(formState.price_per_piece)
                        ? 0
                        : formState.price_per_piece,
                      true
                    )}
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <CustomInput
                      onChange={(event) => handleChangeAddCost(event)}
                      labelText="Additional Cost"
                      disabled={isView || formState.cancelled}
                      value={formState.add_cost}
                      id="add_cost"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      type="number"
                      /** For setting errors */
                      helperTextId={"helperText_add_cost"}
                      isHelperText={hasError("add_cost", error)}
                      helperText={
                        hasError("add_cost", error)
                          ? error["add_cost"].map((error) => {
                              return error + " ";
                            })
                          : null
                      }
                      error={hasError("add_cost", error)}
                    />
                  </GridItem>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={3}
                    style={{
                      margin: "45px 0 0 0",
                    }}
                  >
                    {convertNumber(
                      isNaN(formState.add_cost) ? 0 : formState.add_cost,
                      true
                    )}
                  </GridItem>
                </GridContainer>
              </>
            ) : null}

            <GridContainer>
              <GridItem xs={12} sm={12} md={4}>
                <CustomInput
                  onChange={(event) => handleChange(event)}
                  labelText="Party Number"
                  name="party_no"
                  disabled={isView || formState.cancelled}
                  value={formState.party_no}
                  id="party_no"
                  formControlProps={{
                    fullWidth: true,
                  }}
                />
              </GridItem>
            </GridContainer>

            <GridContainer>
              <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  onChange={(event) => handleChangeQuantity(event)}
                  labelText="Total Quantity"
                  name="quantity"
                  disabled={
                    isView ||
                    (isEdit && formState.completed_quantity !== 0) ||
                    formState.cancelled
                  }
                  value={formState.quantity}
                  id="quantity"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  type="number"
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
                  //onChange={event => handleChangeCompletedQuantity(event)}
                  onChange={(event) => {
                    let parsedValue = parseFloat(event.target.value);
                    let parsedTotalQuantity = parseFloat(formState.quantity);
                    if (
                      isNaN(parsedValue) ||
                      parsedValue <= parsedTotalQuantity
                    ) {
                      handleChange(event);
                      if (parsedValue === parsedTotalQuantity) {
                        setFormState((formState) => ({
                          ...formState,
                          partial_completed: false,
                          fully_completed: true,
                        }));
                      } else {
                        let partial_completed = false;
                        if (parsedValue === 0) {
                          partial_completed = false;
                        } else {
                          partial_completed = true;
                        }
                        setFormState((formState) => ({
                          ...formState,
                          partial_completed: partial_completed,
                          fully_completed: false,
                        }));
                      }
                    }
                  }}
                  labelText="Completed Quantity"
                  disabled={
                    isView || !formState.quantity || formState.cancelled
                  }
                  value={formState.completed_quantity}
                  id="completed_quantity"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  name="completed_quantity"
                  type="number"
                  /** For setting errors */
                  helperTextId={"helperText_completed_quantity"}
                  isHelperText={hasError("completed_quantity", error)}
                  helperText={
                    hasError("completed_quantity", error)
                      ? error["completed_quantity"].map((error) => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("completed_quantity", error)}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  //onChange={event => handleChangeCompletedQuantity(event)}
                  onChange={(event) => handleChange(event)}
                  labelText="Remaining Quantity"
                  disabled={true}
                  value={
                    isNaN(
                      parseFloat(formState.quantity) -
                        parseFloat(formState.completed_quantity)
                    )
                      ? parseFloat(formState.quantity)
                      : parseFloat(formState.quantity) -
                        parseFloat(formState.completed_quantity)
                  }
                  id="remaining_quantity"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  name="remaining_quantity"
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  onChange={(event) => {
                    let parsedValue = parseFloat(event.target.value);
                    let parsedCompleted = parseFloat(
                      formState.completed_quantity
                    );
                    let parsedTotal = parseFloat(formState.quantity);
                    parsedCompleted = isNaN(parsedCompleted)
                      ? 0
                      : parsedCompleted;
                    parsedTotal = isNaN(parsedTotal) ? 0 : parsedTotal;
                    if (
                      isNaN(parsedValue) ||
                      parsedValue <= parsedTotal - parsedCompleted
                    ) {
                      handleChange(event);
                    }
                  }}
                  labelText="Quantity saved for later"
                  disabled={isView || formState.cancelled}
                  value={formState.buffer_quantity}
                  id="buffer_quantity"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  name="buffer_quantity"
                  type="number"
                  /** For setting errors */
                  helperTextId={"helperText_buffer_quantity"}
                  isHelperText={hasError("buffer_quantity", error)}
                  helperText={
                    hasError("buffer_quantity", error)
                      ? error["buffer_quantity"].map((error) => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("buffer_quantity", error)}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={4} md={4} className={classes.switchBox}>
                <div className={classes.block}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.cancelled ? true : false}
                        onChange={(event) => {
                          setFormState((formState) => ({
                            ...formState,
                            cancelled: event.target.checked,
                          }));
                        }}
                        disabled={
                          isView ||
                          formState.quantity === formState.completed_quantity
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
                    label="Cancelled"
                  />
                </div>
              </GridItem>
              <GridItem xs={12} sm={4} md={4} className={classes.switchBox}>
                <div className={classes.block}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.fully_completed ? true : false}
                        // onChange={event => {
                        //   setFormState(formState => ({
                        //     ...formState,
                        //     fully_completed: event.target.checked
                        //   }));
                        // }}
                        disabled={isView}
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
                    label="Fully Completed"
                  />
                </div>
              </GridItem>
              <GridItem xs={12} sm={4} md={4} className={classes.switchBox}>
                <div className={classes.block}>
                  <FormControlLabel
                    control={
                      <Switch
                        disabled={isView}
                        checked={formState.partial_completed ? true : false}
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
                    label="Partial Completed"
                  />
                </div>
              </GridItem>
            </GridContainer>
            {readyMaterial.id && readyMaterial.isColorVariationAvailable ? (
              <>
                {isView ? null : (
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                      <FAB
                        color="primary"
                        disabled={isView || formState.cancelled}
                        size={"medium"}
                        variant="extended"
                        onClick={() => addRatio()}
                      >
                        <AddIcon className={classes.extendedIcon} />
                        <h5>Add Ratio</h5>
                      </FAB>
                    </GridItem>
                  </GridContainer>
                )}
                {ratio && ratio.length ? (
                  <GridContainer>
                    <GridItem
                      xs={12}
                      sm={12}
                      md={12}
                      style={{
                        margin: "20px 10px 20px 13px",
                      }}
                    >
                      <GridContainer
                        style={{
                          margin: "1px 1px 1px 1px",
                          border: "1px solid #C0C0C0",
                          borderRadius: "10px",
                        }}
                      >
                        <GridItem xs={12} sm={12} md={12}>
                          <>
                            {ratio.map((r, key) => (
                              <GridContainer>
                                <GridItem xs={12} sm={12} md={3}>
                                  <CustomInput
                                    labelText="Color"
                                    id="color"
                                    name="color"
                                    disabled={true}
                                    value={r.name}
                                    formControlProps={{
                                      fullWidth: true,
                                    }}
                                  />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={3}>
                                  <CustomInput
                                    onChange={(event) =>
                                      handleChangeRepeatableComponent(
                                        event,
                                        key
                                      )
                                    }
                                    labelText="Quantity"
                                    disabled={
                                      isEdit || isView || formState.cancelled
                                    }
                                    value={r.quantity}
                                    id="quantity"
                                    formControlProps={{
                                      fullWidth: true,
                                    }}
                                    type="number"
                                    name="quantity"
                                    /** For setting errors */
                                    helperTextId={"helperText_quantity"}
                                    isHelperText={hasError("quantity_error", r)}
                                    helperText={
                                      hasError("quantity_error", error)
                                        ? error["quantity_error"].map(
                                            (error) => {
                                              return error + " ";
                                            }
                                          )
                                        : null
                                    }
                                    error={hasError("quantity_error", error)}
                                  />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={3}>
                                  <CustomInput
                                    onChange={(event) => {
                                      let parsedValue = parseFloat(
                                        event.target.value
                                      );
                                      let obj = ratio[key];
                                      let parsedTotalQuantity = parseFloat(
                                        obj["quantity"]
                                      );
                                      if (
                                        isNaN(parsedValue) ||
                                        parsedValue <= parsedTotalQuantity
                                      ) {
                                        handleChangeRepeatableComponent(
                                          event,
                                          key
                                        );
                                      }
                                    }}
                                    labelText="Quantity Completed"
                                    disabled={isView || formState.cancelled}
                                    value={r.quantity_completed}
                                    id="quantity_completed"
                                    formControlProps={{
                                      fullWidth: true,
                                    }}
                                    name="quantity_completed"
                                    type="number"
                                    /** For setting errors */
                                    helperTextId={
                                      "helperText_quantity_completed"
                                    }
                                    isHelperText={hasError(
                                      "quantity_completed",
                                      r
                                    )}
                                    helperText={
                                      hasError("quantity_completed", error)
                                        ? error["quantity_completed"].map(
                                            (error) => {
                                              return error + " ";
                                            }
                                          )
                                        : null
                                    }
                                    error={hasError(
                                      "quantity_completed",
                                      error
                                    )}
                                  />
                                </GridItem>
                                {isView ? null : (
                                  <GridItem
                                    xs={6}
                                    sm={6}
                                    md={1}
                                    className={classes.addDeleteFabButon}
                                  >
                                    <FAB
                                      color="primary"
                                      align={"end"}
                                      size={"small"}
                                      disabled={
                                        isView ||
                                        formState.cancelled ||
                                        parseFloat(
                                          ratio[key]["quantity_completed"]
                                        ) > 0
                                      }
                                      onClick={() => {
                                        setRatio([
                                          ...ratio.slice(0, key),
                                          ...ratio.slice(key + 1),
                                        ]);
                                      }}
                                    >
                                      <DeleteIcon />
                                    </FAB>
                                  </GridItem>
                                )}
                              </GridContainer>
                            ))}
                          </>
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                  </GridContainer>
                ) : null}
              </>
            ) : null}
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
            {readyMaterial.id ? (
              <GridContainer>
                <GridItem xs={12} sm={12} md={4}>
                  <Button color="primary" onClick={() => checkAvailibility()}>
                    Check Stock Availability
                  </Button>
                </GridItem>
                {urlParams.get("oid") ? (
                  <GridItem xs={12} sm={12} md={4}>
                    <Button
                      color="primary"
                      onClick={() => {
                        history.push({
                          pathname: DEPARTMENTSHEET,
                          search: `?oid=${urlParams.get("oid")}`,
                        });
                      }}
                    >
                      Check Department Sheet
                    </Button>
                  </GridItem>
                ) : null}
              </GridContainer>
            ) : null}

            <GridContainer>
              <GridItem
                xs={12}
                sm={12}
                md={3}
                style={{
                  margin: "30px 0 0 0",
                }}
              >
                <b>Total Price W/O Tax : </b>
              </GridItem>
              <GridItem
                xs={12}
                sm={12}
                md={3}
                style={{
                  margin: "30px 0 0 0",
                }}
              >
                {convertNumber(
                  isNaN(formState.total_price) ? 0 : formState.total_price,
                  true
                )}
              </GridItem>
            </GridContainer>
          </CardBody>
          {isView ? (
            <CardFooter>
              <Button
                color="primary"
                onClick={(e) => {
                  history.push({
                    pathname: EDITORDER,
                    search: `?oid=${urlParams.get("oid")}`,
                    state: { edit: true },
                  });
                  window.location.reload();
                }}
              >
                Edit
              </Button>
            </CardFooter>
          ) : (
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
