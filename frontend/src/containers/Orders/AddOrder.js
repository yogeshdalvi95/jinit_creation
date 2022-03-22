import React, { useEffect, useState } from "react";

import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  makeStyles,
  Switch,
  Tooltip,
} from "@material-ui/core";
import no_image_icon from "../../assets/img/no_image_icon.png";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { hasError, isEmptyString, uuidv4 } from "../../Utils";
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CustomInput,
  DatePicker,
  DialogBoxForSelectingDesign,
  DialogForCheckingStockAvailibility,
  DialogForSelectingColor,
  DialogForSelectingParties,
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent,
} from "../../components";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import { DEPARTMENTSHEET, EDITORDER, NOTFOUNDPAGE, ORDERS } from "../../paths";
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
import { validateNumber } from "../../Utils";

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

  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [id] = useState(props.id ? props.id : null);

  const buttonClasses = buttonUseStyles();

  const [openDialogForSelectingParties, setOpenDialogForSelectingParties] =
    useState(false);

  const [formState, setFormState] = useState({
    order_id: uuidv4(),
    inProgress: true,
    cancelled: false,
    completed: false,
    notes: "",
    quantity: 0,
    bufferQuantity: 0,
    completedQuantity: 0,
    previousCompleted: 0,
    remainingQuantity: 0,
    party_no: "",
    date: new Date(),
    total_price: 0,
  });

  const [party, setParty] = useState({
    id: null,
    party_name: "",
    gst_no: "",
  });

  const [design, setDesign] = useState({
    id: null,
    material_no: "",
    images: [],
    material_price: 0,
    add_price: 0,
    color_price: [],
    colors: 0,
  });
  const urlParams = new URLSearchParams(window.location.search);
  const [ratio, setRatio] = useState([]);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  useEffect(() => {
    if ((isEdit || isView) && id) {
      getData(id);
    }
  }, []);

  useEffect(() => {
    let parsedCompletedValue = validateNumber(formState.completedQuantity);
    let parsedTotalQuantity = validateNumber(formState.quantity);
    if (
      parsedCompletedValue &&
      parsedTotalQuantity &&
      parsedCompletedValue <= parsedTotalQuantity
    ) {
      if (parsedCompletedValue === parsedTotalQuantity) {
        setFormState((formState) => ({
          ...formState,
          inProgress: false,
          completed: true,
        }));
      } else {
        setFormState((formState) => ({
          ...formState,
          inProgress: true,
          completed: false,
        }));
      }
    } else {
      setFormState((formState) => ({
        ...formState,
        inProgress: true,
        completed: false,
      }));
    }
  }, [formState.completedQuantity, formState.quantity]);

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
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

  const handleCloseDialog = () => {
    setAlert(null);
  };

  const handleAcceptDialog = () => {
    setAlert(null);
    addButton();
  };

  const onBackClick = () => {
    history.push(ORDERS);
  };

  const handleCloseDialogForDesign = () => {
    setOpenDialogForSelectingDesign(false);
  };

  const handleCloseDialogForStockAvailibility = () => {
    setOpenDialogForStockAvailibility(false);
  };

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
      order_id: data.order_id,
      inProgress: data.in_progress,
      cancelled: data.cancelled,
      completed: data.completed,
      bufferQuantity: data.buffer_quantity,
      completedQuantity: data.completed_quantity,
      previousCompleted: data.completed_quantity,
      remainingQuantity: data.remaining_quantity,
      notes: data.notes,
      quantity: data.quantity,
      date: new Date(data.date),
      party_no: data.party_no,
    }));

    if (data.design) {
      let design = data.design;
      setDesign({
        id: design.id,
        material_no: design.material_no,
        images: design.images,
        material_price: design.material_price,
        add_price: design.add_price,
        color_price: [],
        colors: design.colors,
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

    setRatio(data.ratio);
  };

  /** Add design  */
  const handleAddDesign = (data) => {
    /** Color Price */
    delete error["design"];
    ratio.forEach((r, k) => {
      delete error["quantity" + k];
      delete error["quantityCompleted" + k];
    });

    setError((error) => ({
      ...error,
    }));

    let colorPriceArray = data.color_price;
    let colorRatios = [];

    if (data.colors && data.colors.length) {
      if (data.color_price?.length) {
        colorPriceArray.forEach((d) => {
          colorRatios.push({
            design: d.design,
            color: d.color?.id,
            colorName: d.color?.name,
            quantity: 0,
            quantityCompleted: 0,
            order: null,
          });
        });
        setRatio(colorRatios);
      } else {
        history.push(NOTFOUNDPAGE);
      }
    } else {
      setRatio([]);
    }
    setDesign((design) => ({
      ...design,
      id: data.id,
      material_no: data.material_no,
      images: data.images,
      material_price: data.material_price,
      add_price: data.add_price,
      color_price: data.color_price,
      colors: data.colors,
    }));

    handleCloseDialogForDesign();
  };

  const submit = (event) => {
    event.preventDefault();
    //setBackDrop(true);
    let isValid = true;
    let error = {};
    /** This will set errors as per validations defined in form */
    // error = setErrors(formState, validationForm);

    // if (checkEmpty(error)) {
    //   setBackDrop(false);
    //   setError({});
    //   isValid = true;
    // } else {
    //   setBackDrop(false);
    //   setError(error);
    // }

    if (!design.id || !party.id) {
      if (!design.id) {
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
        let parseCompletedValue = validateNumber(formState.completed_quantity);
        let parsePreviousCompletedValue = validateNumber(
          formState.previousCompleted
        );
        parseCompletedValue = validateNumber(parseCompletedValue);
        parsePreviousCompletedValue = validateNumber(
          parsePreviousCompletedValue
        );
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
            Note :- If you have added completed quantity then that much quantity
            will be added to stock for the selected design!
          </SweetAlert>
        );
      }
    }
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
        id,
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
          ready_material: design.id,
          quantity: formState.quantity,
          buffer_quantity: formState.buffer_quantity,
          price_per_piece: formState.price_per_piece,
          add_cost: formState.add_cost,
          completed_quantity: formState.completed_quantity,
          previousCompleted: formState.previousCompleted,
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
      let data = {
        order_id: formState.order_id?.trim(),
        design: design.id,
        quantity: formState.quantity,
        buffer_quantity: formState.bufferQuantity,
        completed_quantity: formState.completedQuantity,
        remaining_quantity: formState.remainingQuantity,
        party: party.id,
        party_no: formState.party_no,
        date: formState.date,
        in_progress: formState.inProgress,
        completed: formState.completed,
        cancelled: formState.cancelled,
        notes: formState.notes,
        total_price: formState.total_price,
        ratio: ratio,
      };
      await providerForPost(backend_order, data, Auth.getToken())
        .then((res) => {
          history.push(`${EDITORDER}/${res.data.id}`);
          window.location.reload();
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

  // const handleChangeTotalQuantity = (event) => {
  //   let value = event.target.value;
  //   if (value == "" || value >= 0) {
  //     delete error["quantity"];
  //     setError((error) => ({
  //       ...error,
  //     }));
  //     if (value == "" || parseFloat(value) <= parseFloat(formState.quantity)) {
  //       let new_value = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
  //       let completed_quantity = isNaN(formState.completed_quantity)
  //         ? 0
  //         : parseFloat(formState.completed_quantity);

  //       let buffer_quantity = new_value - completed_quantity;
  //       setFormState((formState) => ({
  //         ...formState,
  //         quantity: value,
  //         buffer_quantity: buffer_quantity,
  //       }));
  //     }
  //   } else {
  //     setError((error) => ({
  //       ...error,
  //       quantity: ["Quantity cannot be negative"],
  //     }));
  //   }
  // };

  // const handleChangeQuantity = (event) => {
  //   let value = event.target.value;
  //   if (value === "" || value >= 0) {
  //     delete error["quantity"];
  //     setError((error) => ({
  //       ...error,
  //     }));

  //     let quantity = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
  //     let completedQuantity = isNaN(parseFloat(formState.completed_quantity))
  //       ? 0
  //       : parseFloat(formState.completed_quantity);
  //     let remainingQuantity = quantity - completedQuantity;

  //     setFormState((formState) => ({
  //       ...formState,
  //       quantity: value,
  //       remainingQuantity: remainingQuantity,
  //     }));
  //   } else {
  //     setError((error) => ({
  //       ...error,
  //       quantity: ["Quantity cannot be negative"],
  //     }));
  //   }
  // };

  // const handleChangeCompletedQuantity = (event) => {
  //   let value = event.target.value;
  //   if (value == "" || value >= 0) {
  //     delete error["completed_quantity"];
  //     setError((error) => ({
  //       ...error,
  //     }));
  //     if (value == "" || parseFloat(value) <= parseFloat(formState.quantity)) {
  //       let new_value = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
  //       let quantity = isNaN(formState.quantity)
  //         ? 0
  //         : parseFloat(formState.quantity);
  //       let old_completed_quantity = isNaN(
  //         parseFloat(formState.completed_quantity)
  //       )
  //         ? 0
  //         : parseFloat(formState.completed_quantity);
  //       let buffer_quantity = quantity + old_completed_quantity;
  //       buffer_quantity = quantity - new_value;
  //       setFormState((formState) => ({
  //         ...formState,
  //         completed_quantity: value,
  //         buffer_quantity: buffer_quantity,
  //       }));
  //     }
  //   } else {
  //     setError((error) => ({
  //       ...error,
  //       completed_quantity: ["Completed Quantity cannot be negative"],
  //     }));
  //   }
  // };

  // const addRatio = () => {
  //   setOpenDialogForSelectingColor(true);
  // };

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

  const cancelDesign = () => {
    delete error["design"];
    setDesign((design) => ({
      id: null,
      material_no: "",
      images: [],
      material_price: 0,
      add_price: 0,
      color_price: [],
      colors: 0,
    }));
    ratio.forEach((r, k) => {
      delete error["quantity" + k];
      delete error["quantityCompleted" + k];
    });
    setError((error) => ({
      ...error,
    }));
    setRatio([]);
  };

  const handleChangeRepeatableComponent = (
    event,
    key,
    isNumber = false,
    name = null,
    errorKey
  ) => {
    let isValid = true;
    let value = event.target.value;
    let errorValue = [];
    let obj = ratio[key];

    if (isNumber) {
      value = isNaN(parseFloat(value)) ? value : parseFloat(value);
      if (typeof value === "string") {
        errorValue = [`${name} should be a valid positive number`];
      } else if (value < 0) {
        errorValue = [`${name} cannot be negative`];
        isValid = false;
      }
      if (name === "Quantity Completed") {
        if (validateNumber(value) > obj.quantity) {
          errorValue = [`${name} should be smaller then quantity placed`];
          isValid = false;
        }
      }
      if (name === "Quantity") {
        delete error["quantityCompleted" + key];
      }
    }

    if (isValid) {
      delete error[errorKey];
      setError((error) => ({
        ...error,
      }));
    } else {
      setError((error) => ({
        ...error,
        [errorKey]: errorValue,
      }));
    }

    obj = {
      ...obj,
      [event.target.name]: value,
    };
    setRatio([...ratio.slice(0, key), obj, ...ratio.slice(key + 1)]);
  };

  const handleChange = (event, isNumber = false, name = null) => {
    let isValid = true;
    let value = event.target.value;
    let errorValue = [];
    if (isNumber) {
      value = isNaN(parseFloat(value)) ? value : parseFloat(value);
      if (typeof value === "string") {
        errorValue = [`${name} should be a valid positive number`];
      } else if (value < 0) {
        errorValue = [`${name} cannot be negative`];
        isValid = false;
      }
    }
    if (isValid) {
      delete error[event.target.name];
      setError((error) => ({
        ...error,
      }));
    } else {
      setError((error) => ({
        ...error,
        [event.target.name]: errorValue,
      }));
    }
    setFormState((formState) => ({
      ...formState,
      [event.target.name]: value,
    }));
  };

  const checkAvailibility = async () => {
    setBackDrop(true);
    await providerForPost(
      backend_order_check_raw_material_availibility,
      {
        design: design.id,
        ratio: ratio && ratio.length ? ratio : [],
        remaining_quantity: validateNumber(formState.remainingQuantity),
        buffer_quantity: validateNumber(formState.bufferQuantity),
        total_quantity: validateNumber(formState.quantity),
        completed_quantity: validateNumber(formState.completedQuantity),
      },
      Auth.getToken()
    )
      .then((res) => {
        setAvailibleStocks(res.data);
        setOpenDialogForStockAvailibility(true);
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

  const totalQuantity = (num) => {
    let output = 0;
    if (num === 0) {
      output = ratio.reduce((acc, currObj) => {
        return acc + validateNumber(currObj.quantity);
      }, output);
    } else if (num === 1) {
      output = ratio.reduce((acc, currObj) => {
        return acc + validateNumber(currObj.quantityCompleted);
      }, output);
    } else if (num === 2) {
      output = ratio.reduce((acc, currObj) => {
        return (
          acc +
          (validateNumber(currObj.quantity) -
            validateNumber(currObj.quantityCompleted))
        );
      }, output);
    }
    console.log("output 1234", output);
    return output.toFixed(2);
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
      <DialogBoxForSelectingDesign
        handleCancel={handleCloseDialogForDesign}
        handleClose={handleCloseDialogForDesign}
        handleAddDesign={handleAddDesign}
        isHandleKey={false}
        open={openDialogForSelectingDesign}
        selectMultiColors={false}
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
                  disabled={isView}
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
              <GridItem xs={12} sm={12} md={4}>
                <DatePicker
                  onChange={(event) => handleOrderDate(event)}
                  label="Order Date"
                  name="order_date"
                  disabled={isView}
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
                  margin: "20px 10px 0px 13px",
                  overflowX: "auto",
                }}
              >
                <GridContainer>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    style={{
                      margin: "0px 0px 10px 0px",
                      overflowX: "auto",
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
                    overflowX: "auto",
                  }}
                >
                  <GridItem
                    xs={12}
                    sm={12}
                    md={10}
                    style={{
                      margin: "15px 0px 10px 0px",
                      overflowX: "auto",
                    }}
                  >
                    {design.id ? (
                      <div
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <GridContainer>
                          <GridItem
                            xs={12}
                            md={12}
                            lg={12}
                            style={{ overflowX: "auto" }}
                          >
                            <div className={classes.imageDivInTable}>
                              {design.images &&
                              design.images.length &&
                              design.images[0].url ? (
                                <img
                                  alt="ready_material_photo"
                                  src={apiUrl + design.images[0].url}
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
                            <b>Material No : </b> {design.material_no}
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
                      title={design.id ? "Change Design " : "Select Design"}
                    >
                      <IconButton
                        disabled={
                          isView ||
                          isEdit ||
                          formState.cancelled ||
                          formState.completed
                        }
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
                      disabled={
                        isView ||
                        isEdit ||
                        formState.cancelled ||
                        formState.completed
                      }
                      onClick={() => cancelDesign()}
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
                        disabled={
                          isView ||
                          isEdit ||
                          formState.cancelled ||
                          formState.completed
                        }
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
                      disabled={
                        isView ||
                        isEdit ||
                        formState.cancelled ||
                        formState.completed
                      }
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

            {/** Quantity */}
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  // onChange={(event) => handleChangeQuantity(event)}
                  onChange={(event) =>
                    handleChange(event, true, "Total Order Quantity")
                  }
                  labelText="Total Order Quantity"
                  name="quantity"
                  disabled={
                    isView || formState.completed || formState.cancelled
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
              {/* <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  //onChange={event => handleChangeCompletedQuantity(event)}
                  onChange={(event) =>
                    handleChange(event, true, "Completed Quantity")
                  }
                  labelText="Completed Quantity"
                  disabled={
                    isView || formState.cancelled || formState.completed
                  }
                  value={formState.completedQuantity}
                  id="completedQuantity"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  name="completedQuantity"
                  type="number"
                  helperTextId={"helperText_completedQuantity"}
                  isHelperText={hasError("completedQuantity", error)}
                  helperText={
                    hasError("completedQuantity", error)
                      ? error["completedQuantity"].map((error) => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("completedQuantity", error)}
                />
              </GridItem> */}
              {/* <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  //onChange={event => handleChangeCompletedQuantity(event)}
                  onChange={(event) =>
                    handleChange(event, true, "Remaining Quantity")
                  }
                  labelText="Remaining Quantity"
                  disabled={
                    isView || formState.cancelled || formState.completed
                  }
                  value={formState.remainingQuantity}
                  id="remainingQuantity"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  type="number"
                  name="remainingQuantity"
                  helperTextId={"helperText_remainingQuantity"}
                  isHelperText={hasError("remainingQuantity", error)}
                  helperText={
                    hasError("remainingQuantity", error)
                      ? error["remainingQuantity"].map((error) => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("remainingQuantity", error)}
                />
              </GridItem> */}
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  onChange={(event) =>
                    handleChange(
                      event,
                      true,
                      "Buffer Quantity / Quantity for which ratio not present"
                    )
                  }
                  labelText="Buffer Quantity / Quantity for which ratio not present"
                  disabled={
                    isView || formState.cancelled || formState.completed
                  }
                  value={formState.bufferQuantity}
                  id="bufferQuantity"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  name="bufferQuantity"
                  type="number"
                  /** For setting errors */
                  helperTextId={"helperText_bufferQuantity"}
                  isHelperText={hasError("bufferQuantity", error)}
                  helperText={
                    hasError("bufferQuantity", error)
                      ? error["bufferQuantity"].map((error) => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("bufferQuantity", error)}
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
                            completed: false,
                            inProgress: event.target.checked ? false : true,
                          }));
                        }}
                        disabled={
                          isView ||
                          formState.quantity === formState.completed_quantity ||
                          formState.completed
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
                        checked={formState.completed ? true : false}
                        disabled={isView || formState.cancelled}
                        onChange={(event) => {
                          setFormState((formState) => ({
                            ...formState,
                            completed: event.target.checked,
                            inProgress: event.target.checked ? false : true,
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
                    label="Completed"
                  />
                </div>
              </GridItem>
              <GridItem xs={12} sm={4} md={4} className={classes.switchBox}>
                <div className={classes.block}>
                  <FormControlLabel
                    control={
                      <Switch
                        disabled={
                          isView || formState.cancelled || formState.completed
                        }
                        checked={formState.inProgress ? true : false}
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
                    label="In Progress"
                  />
                </div>
              </GridItem>
            </GridContainer>

            {/* {isView ? null : (
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
                )} */}
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
                            <GridItem xs={12} sm={12} md={2}>
                              <CustomInput
                                labelText="Color"
                                disabled={true}
                                value={r.colorName}
                                formControlProps={{
                                  fullWidth: true,
                                }}
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={2}>
                              <CustomInput
                                onChange={(event) =>
                                  handleChangeRepeatableComponent(
                                    event,
                                    key,
                                    true,
                                    "Quantity",
                                    "quantity" + key
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
                                name={"quantity"}
                                /** For setting errors */
                                helperTextId={"helperText_quantity" + key}
                                isHelperText={hasError("quantity" + key, error)}
                                helperText={
                                  hasError("quantity" + key, error)
                                    ? error["quantity" + key].map((error) => {
                                        return error + " ";
                                      })
                                    : null
                                }
                                error={hasError("quantity" + key, error)}
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={2}>
                              <CustomInput
                                onChange={(event) =>
                                  handleChangeRepeatableComponent(
                                    event,
                                    key,
                                    true,
                                    "Quantity Completed",
                                    "quantityCompleted" + key
                                  )
                                }
                                labelText="Quantity Completed"
                                disabled={
                                  isView || formState.cancelled || !r.quantity
                                }
                                value={r.quantityCompleted}
                                id="quantityCompleted"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                name="quantityCompleted"
                                type="number"
                                /** For setting errors */
                                helperTextId={
                                  "helperText_quantityCompleted" + key
                                }
                                isHelperText={hasError(
                                  "quantityCompleted" + key,
                                  error
                                )}
                                helperText={
                                  hasError("quantityCompleted" + key, error)
                                    ? error["quantityCompleted" + key].map(
                                        (error) => {
                                          return error + " ";
                                        }
                                      )
                                    : null
                                }
                                error={hasError(
                                  "quantityCompleted" + key,
                                  error
                                )}
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={2}>
                              <CustomInput
                                labelText="Remaining Quantity"
                                disabled={true}
                                value={r.quantity - r.quantityCompleted}
                                id="quantityRemaining"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                name="quantityRemaining"
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
                                  // disabled={
                                  //   isView ||
                                  //   formState.cancelled ||
                                  //   validateNumber(
                                  //     ratio[key]["quantity_completed"]
                                  //   ) > 0
                                  // }
                                  disabled
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
            {ratio && ratio.length ? (
              <GridContainer>
                <GridItem
                  xs={12}
                  sm={12}
                  md={12}
                  style={{
                    margin: "-10px 10px 20px 13px",
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
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={2}></GridItem>
                        <GridItem xs={12} sm={12} md={2}>
                          <CustomInput
                            labelText="Total Quantity"
                            disabled={true}
                            value={totalQuantity(0)}
                            formControlProps={{
                              fullWidth: true,
                            }}
                            name="quantityRemaining"
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={2}>
                          <CustomInput
                            labelText="Total Completed"
                            disabled={true}
                            value={totalQuantity(1)}
                            formControlProps={{
                              fullWidth: true,
                            }}
                            name="quantityRemaining"
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={2}>
                          <CustomInput
                            labelText="Total Remaining"
                            disabled={true}
                            value={totalQuantity(2)}
                            formControlProps={{
                              fullWidth: true,
                            }}
                            name="quantityRemaining"
                          />
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                  </GridContainer>
                </GridItem>
              </GridContainer>
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

            {/* <GridContainer>
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
            </GridContainer> */}
          </CardBody>
          <CardFooter>
            <GridContainer>
              {isView ? (
                <GridItem>
                  <Button
                    color="primary"
                    disabled={
                      !design.id ||
                      !party.id ||
                      !formState.quantity ||
                      !formState.order_id ||
                      Object.keys(error).length
                    }
                    onClick={(e) => {
                      history.push(`${EDITORDER}/${id}`);
                      window.location.reload();
                    }}
                  >
                    Edit
                  </Button>
                </GridItem>
              ) : (
                <GridItem>
                  <Button
                    color="primary"
                    onClick={(e) => submit(e)}
                    disabled={
                      !design.id ||
                      !party.id ||
                      !formState.quantity ||
                      !formState.order_id ||
                      Object.keys(error).length
                    }
                  >
                    Save
                  </Button>
                </GridItem>
              )}
              {design.id ? (
                <>
                  <GridItem>
                    <Button color="primary" onClick={() => checkAvailibility()}>
                      Check Stock Availability
                    </Button>
                  </GridItem>
                  {urlParams.get("oid") ? (
                    <GridItem>
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
                </>
              ) : null}
            </GridContainer>
          </CardFooter>
        </Card>
        <Backdrop className={classes.backdrop} open={openBackDrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </GridItem>
    </GridContainer>
  );
}
