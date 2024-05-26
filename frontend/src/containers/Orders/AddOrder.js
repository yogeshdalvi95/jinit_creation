import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
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
import { hasError, isEmptyString, s2ab, uuidv4 } from "../../Utils";
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CustomAutoComplete,
  CustomInput,
  DatePicker,
  DialogBoxForSelectingDesign,
  DialogForCheckingStockAvailibility,
  DialogForSelectingParties,
  FAB,
  GridContainer,
  GridItem,
  RatioData,
  SnackBarComponent,
} from "../../components";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import { EDITDEPARTMENTSHEETID, EDITORDER, ORDERS } from "../../paths";
import SweetAlert from "react-bootstrap-sweetalert";
import buttonStyles from "../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import classNames from "classnames";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import {
  apiUrl,
  backend_color,
  backend_order,
  backend_order_check_raw_material_availibility,
  backend_plating,
} from "../../constants";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  providerForDelete,
  providerForGet,
  providerForPost,
  providerForPut,
} from "../../api";
import moment from "moment";
import { validateNumber } from "../../Utils";
import { Chip, Typography } from "@mui/material";

const useStyles = makeStyles(styles);
const buttonUseStyles = makeStyles(buttonStyles);

export default function AddOrder(props) {
  const classes = useStyles();
  const buttonClasses = buttonUseStyles();

  const confirmBtnClasses = classNames({
    [buttonClasses.button]: true,
    [buttonClasses["success"]]: true,
  });

  const cancelBtnClasses = classNames({
    [buttonClasses.button]: true,
    [buttonClasses["danger"]]: true,
  });

  const history = useHistory();
  const [openBackDrop, setBackDrop] = useState(false);
  const [alert, setAlert] = useState(null);
  const [openDialogForSelectingDesign, setOpenDialogForSelectingDesign] =
    useState(false);
  const [openDialogForStockAvailibility, setOpenDialogForStockAvailibility] =
    useState(false);

  const [availibleStocks, setAvailibleStocks] = useState({});

  const [error, setError] = React.useState({});
  const [info, setInfo] = React.useState({});

  const [whiteColorError, setWhiteColorError] = React.useState(null);

  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [id] = useState(props.id ? props.id : null);

  const [openDialogForSelectingParties, setOpenDialogForSelectingParties] =
    useState(false);

  const [formState, setFormState] = useState({
    order_id: uuidv4(),
    inProgress: true,
    cancelled: false,
    completed: false,
    notes: "",
    quantity: 0,
    party_no: "",
    date: new Date(),
    bufferQuantity: 0,
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
  const [color, setColor] = useState([]);
  const [plating, setPlating] = useState([]);
  const [colorPresent, setColorPresent] = useState([]);
  const [duplicateColorAlert, setDuplicateColorAlert] = useState(null);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  useEffect(() => {
    if ((isEdit || isView) && id) {
      getData(id);
    }
    getColorData();
    getPlatingData();
  }, []);

  useEffect(() => {
    let completedQuantity = 0;
    completedQuantity = ratio.reduce((acc, currObj) => {
      return acc + validateNumber(currObj.quantityCompleted);
    }, completedQuantity);

    let parsedCompletedValue = validateNumber(completedQuantity);
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
  }, [formState.quantity, ratio]);

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

  const handleAcceptDialog = (status) => {
    setAlert(null);
    console.log("ratio -> ", ratio);
    addButton(status);
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

  const getPlatingData = async () => {
    setBackDrop(true);
    await providerForGet(backend_plating, { pageSize: -1 }, Auth.getToken())
      .then((res) => {
        setBackDrop(false);
        setPlating(res.data.data);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error getting plating data",
        }));
      });
  };

  const getColorData = async () => {
    setBackDrop(true);
    await providerForGet(backend_color, { pageSize: -1 }, Auth.getToken())
      .then((res) => {
        setBackDrop(false);
        setColor(res.data.data);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error getting color data",
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
      notes: data.notes,
      quantity: data.quantity,
      date: new Date(data.date),
      party_no: data.party_no,
    }));

    if (data.design) {
      let design = data.design;
      setColorPresent(design.colors.map((c) => c.id));
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

    setRatio([
      {
        color: null,
        colorData: null,
        quantity: 0,
        quantityCompleted: 0,
        order: null,
        plating: null,
        platingData: null,
      },
    ]);

    setColorPresent(data.colors.map((c) => c.id));

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
    const status = {
      completed: formState.completed,
      inProgress: formState.inProgress,
      cancelled: formState.cancelled,
    };

    let output = 0;
    output = ratio.reduce((acc, currObj) => {
      return acc + validateNumber(currObj.quantityCompleted);
    }, output);

    if (output > formState.quantity) {
      isValid = false;
      setDuplicateColorAlert(
        <SweetAlert
          danger
          confirmBtnText="Cancel"
          confirmBtnCssClass={cancelBtnClasses}
          title="Heads up?"
          onConfirm={() => setDuplicateColorAlert(null)}
          style={{
            position: "initial",
          }}
        >
          Quantity added for ratios execeds the total order quantity
        </SweetAlert>
      );
    } else if (output === formState.quantity) {
      isValid = true;
      status.inProgress = false;
      status.completed = true;
      status.cancelled = false;
      setFormState((formState) => ({
        ...formState,
        completed: true,
        inProgress: false,
        cancelled: false,
      }));
    }

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
      setAlert(
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes"
          confirmBtnCssClass={confirmBtnClasses}
          confirmBtnBsStyle="outline-{variant}"
          title="Heads up?"
          onConfirm={() => handleAcceptDialog(status)}
          onCancel={handleCloseDialog}
          cancelBtnCssClass={cancelBtnClasses}
          focusCancelBtn
          style={{
            position: "initial",
          }}
        >
          {"Arey you sure you want to save the changes?"}
        </SweetAlert>
      );
    }
  };

  const addButton = async (status) => {
    setBackDrop(true);
    if (isEdit) {
      await providerForPut(
        backend_order,
        id,
        {
          order_id: formState.order_id?.trim(),
          quantity: formState.quantity,
          date: formState.date,
          in_progress: status.inProgress,
          completed: status.completed,
          cancelled: status.cancelled,
          notes: formState.notes,
          ratio: ratio,
        },
        Auth.getToken()
      )
        .then((res) => {
          // history.push(`${EDITORDER}/${id}`);
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
              : "Error editing new order",
          }));
        });
    } else {
      let data = {
        order_id: formState.order_id?.trim(),
        design: design.id,
        quantity: formState.quantity,
        party: party.id,
        party_no: formState.party_no,
        date: formState.date,
        in_progress: formState.inProgress,
        completed: formState.completed,
        cancelled: formState.cancelled,
        notes: formState.notes,
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
    setColorPresent([]);
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
    errorKey,
    targetName = null
  ) => {
    let isValid = true;
    let value = isNumber ? event.target.value : event ? event.id : null;
    let errorValue = [];
    let obj = ratio[key];
    let isSetData = true;

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
          errorValue = [
            `${name} should be smaller then quantity which is placed on the left`,
          ];
          isValid = false;
        }
      }
      if (name === "Quantity") {
        delete error["quantityCompleted" + key];
        if (!formState.quantity || isEmptyString(formState.quantity)) {
          setError((error) => ({
            ...error,
            quantity: ["Total Order Quantity cannot be 0"],
          }));
          isSetData = false;
        } else {
          if (validateNumber(value) < obj.quantityCompleted) {
            errorValue = [
              `${name} should be greater then quantity completed which is on the right`,
            ];
            isValid = false;
          }
          //calculateBufferQuantity()
        }
      }
    } else {
      console.log("Here I am -->>>", event, ratio[key], ratio, key, targetName);
      if (targetName === "plating") {
        obj = {
          ...obj,
          platingData: event,
        };
      } else {
        obj = {
          ...obj,
          colorData: event,
        };
      }

      if (!event) {
        // let colorData = ratio[key].colorData;
        // color.push(colorData);
        // setColor(color);
        delete info[errorKey];
        setInfo((info) => ({
          ...info,
        }));
      } else {
        // setColor(color.filter((c) => c.id !== value));
        if (targetName !== "plating") {
          if (
            !obj.plating &&
            ratio.findIndex((r) => !r.plating && r.color === value) !== -1
          ) {
            isSetData = false;
            setDuplicateColorAlert(
              <SweetAlert
                danger
                confirmBtnText="Cancel"
                confirmBtnCssClass={cancelBtnClasses}
                title="Heads up?"
                onConfirm={() => setDuplicateColorAlert(null)}
                style={{
                  position: "initial",
                }}
              >
                {`${event.name} is already added!`}
              </SweetAlert>
            );

            if (ratio[key]) {
              setRatio([...ratio.slice(0, key), ...ratio.slice(key + 1)]);
            }
          } else if (
            obj.plating &&
            ratio.findIndex(
              (r) => r.plating === obj.plating && r.color === value
            ) !== -1
          ) {
            isSetData = false;
            setDuplicateColorAlert(
              <SweetAlert
                danger
                confirmBtnText="Cancel"
                confirmBtnCssClass={cancelBtnClasses}
                title="Heads up?"
                onConfirm={() => setDuplicateColorAlert(null)}
                style={{
                  position: "initial",
                }}
              >
                {`${event.name} is already added for plating ${obj.platingData.name}!`}
              </SweetAlert>
            );

            if (ratio[key]) {
              setRatio([...ratio.slice(0, key), ...ratio.slice(key + 1)]);
            }
          }
        }

        if (isSetData) {
          if (colorPresent.includes(value)) {
            setInfo((info) => ({
              ...info,
              [errorKey]: {
                msg: "Color already present",
                isError: false,
              },
            }));
          } else {
            setInfo((info) => ({
              ...info,
              [errorKey]: {
                msg: "Color not present",
                isError: true,
              },
            }));
          }
        }
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

    if (isSetData) {
      obj = {
        ...obj,
        [targetName ? targetName : event.target.name]: value,
      };
      setRatio([...ratio.slice(0, key), obj, ...ratio.slice(key + 1)]);
    }
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
    providerForGet(
      backend_order_check_raw_material_availibility + "/" + id,
      {},
      Auth.getToken()
    )
      .then((res) => {
        saveAs(
          new Blob([s2ab(res.data)], { type: "application/octet-stream" }),
          `raw_material_availibility_for_order_${formState.order_id}.xlsx`
        );
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error while exporting data",
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
    return output.toFixed(2);
  };

  const calculateBufferQuantity = () => {
    let output = 0;
    output = ratio.reduce((acc, currObj) => {
      return acc + validateNumber(currObj.quantity);
    }, output);

    return validateNumber(formState.quantity) - output;
  };

  const setAlertForDeleteDesign = async (platingKey, colorKey, key) => {
    let content = "Are you sure you want to delete this ratio?";
    if (ratio.length === 1) {
      content =
        "Are you sure you want to delete this ratio, this will delete the entire order?";
    }
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes"
        confirmBtnCssClass={confirmBtnClasses}
        confirmBtnBsStyle="outline-{variant}"
        title="Heads up?"
        onConfirm={() => {
          ratio.length === 1
            ? deleteEntireOrder()
            : deleteDesignColor(platingKey, colorKey, key);
        }}
        onCancel={handleCloseDialog}
        cancelBtnCssClass={cancelBtnClasses}
        focusCancelBtn
        style={{
          position: "initial",
        }}
      >
        {content}
      </SweetAlert>
    );
  };

  const deleteEntireOrder = async () => {
    if (id) {
      await providerForDelete(`${backend_order}/${id}`, null, Auth.getToken())
        .then(async (res) => {
          handleCloseDialog();
          onBackClick();
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "success",
            message: "Successfully deleted the ratio",
          }));
        })
        .catch((err) => {
          handleCloseDialog();
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error deleting ratio",
          }));
        });
    } else {
      handleCloseDialog();
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Error deleting ratio!",
      }));
    }
  };

  const deleteDesignColor = async (platingKey, colorKey, key) => {
    if (id && design.id && colorKey) {
      await providerForDelete(
        `${backend_order}/${id}/design/${design.id}/plating/${platingKey}/color/${colorKey}`,
        null,
        Auth.getToken()
      )
        .then(async (res) => {
          /** First change the ratio array */
          if (ratio.length === 1) {
            setRatio([
              {
                color: null,
                colorData: null,
                plating: null,
                platingData: null,
                quantity: 0,
                quantityCompleted: 0,
                order: null,
              },
            ]);
          } else {
            setRatio([...ratio.slice(0, key), ...ratio.slice(key + 1)]);
          }
          delete info["color" + key];
          setInfo((info) => ({
            ...info,
          }));
          handleCloseDialog();
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "success",
            message: "Successfully deleted the ratio",
          }));
        })
        .catch((err) => {
          handleCloseDialog();
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error deleting ratio",
          }));
        });
    } else {
      handleCloseDialog();
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Error deleting ratio!",
      }));
    }
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
      {duplicateColorAlert}
      {alert}
      <DialogBoxForSelectingDesign
        handleCancel={handleCloseDialogForDesign}
        handleClose={handleCloseDialogForDesign}
        handleAddDesign={handleAddDesign}
        selectedParty={party}
        isHandleKey={false}
        open={openDialogForSelectingDesign}
        selectMultiColors={false}
        highlightOtherPartyDesign={true}
      />
      <DialogForSelectingParties
        handleCancel={handleCloseDialogForParties}
        handleClose={handleCloseDialogForParties}
        handleAddParties={handleAddParties}
        open={openDialogForSelectingParties}
      />
      {/* <DialogForSelectingColor
        handleCancel={handleCloseDialogForColor}
        handleClose={handleCloseDialogForColor}
        handleAddColor={handleSelectColor}
        open={openDialogForSelectingColor}
      /> */}
      <DialogForCheckingStockAvailibility
        handleCancel={handleCloseDialogForStockAvailibility}
        handleClose={handleCloseDialogForStockAvailibility}
        availibleStocks={availibleStocks}
        open={openDialogForStockAvailibility}
      />
      <GridItem xs={12} sm={12} md={10}>
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
                  isSelectOnlyFinancialYear={true}
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
                    marginTop: "1.8rem",
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
                      color: party.id ? "inherit" : "rgba(0, 0, 0, 0.26)",
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
                    color: party.id ? "inherit" : "rgba(0, 0, 0, 0.26)",
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
                          <RatioData data={design.colors} />
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
                        party.id
                          ? design.id
                            ? "Change Design "
                            : "Select Design"
                          : "Please select party first"
                      }
                    >
                      <IconButton
                        disabled={
                          isView ||
                          isEdit ||
                          formState.cancelled ||
                          formState.completed ||
                          !party.id
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
                        formState.completed ||
                        !party.id
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
                    {party.id ? (
                      hasError("ready_material", error) ? (
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
                      ) : null
                    ) : (
                      <FormHelperText id={"ready_material_helpertext_id"}>
                        Please select party first
                      </FormHelperText>
                    )}
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
                  disabled={isView || formState.cancelled || isEdit}
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
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="Buffer Quantity / Quantity for which ratio not present"
                  disabled={true}
                  value={calculateBufferQuantity()}
                  id="bufferQuantity"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  name="bufferQuantity"
                  type="number"
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
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
              <GridItem xs={12} sm={4} md={4} className={classes.switchBox}>
                <div className={classes.block}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.completed ? true : false}
                        disabled={
                          isView || formState.cancelled || !formState.quantity
                        }
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
              {isEdit ? (
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
                            formState.quantity ===
                              formState.completed_quantity ||
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
              ) : null}
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
            {whiteColorError ? (
              <GridContainer>
                <GridItem
                  xs={12}
                  sm={12}
                  md={12}
                  style={{
                    marginTop: "20px",
                  }}
                >
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{ color: "red" }}
                  >
                    {whiteColorError}
                  </Typography>
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
                              <CustomAutoComplete
                                id={"plating" + key}
                                labelText="Plating"
                                autocompleteId={"plating" + key}
                                optionKey={"name"}
                                disabled={
                                  r.id ||
                                  isView ||
                                  formState.cancelled ||
                                  formState.completed
                                }
                                options={plating}
                                onChange={(event, value) => {
                                  handleChangeRepeatableComponent(
                                    value,
                                    key,
                                    false,
                                    "Plating",
                                    "plating" + key,
                                    "plating"
                                  );
                                }}
                                value={
                                  plating[
                                    plating.findIndex(function (item, i) {
                                      return item.id === r.plating;
                                    })
                                  ] || null
                                }
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                /** For setting errors */
                                helperTextId={"helperText_plating" + key}
                                isHelperText={true}
                                helperText={
                                  info["plating" + key]
                                    ? info["plating" + key].msg
                                    : ""
                                }
                                error={
                                  info["plating" + key]?.isError ? true : false
                                }
                              />
                              {/**
                               * design: d.design,
                               * color: d.color?.id,
                               * colorName: d.color?.name,
                               * quantity: 0,
                               * quantityCompleted: 0,
                               * order: null,
                               */}
                            </GridItem>
                            <GridItem xs={12} sm={12} md={2}>
                              <CustomAutoComplete
                                id={"color" + key}
                                labelText="Color"
                                autocompleteId={"color" + key}
                                optionKey={"name"}
                                disabled={
                                  r.id ||
                                  isView ||
                                  formState.cancelled ||
                                  formState.completed
                                }
                                renderOption={(option, state) => {
                                  if (colorPresent.includes(option.id)) {
                                    return (
                                      <Tooltip
                                        title={option.name}
                                        placement="top"
                                      >
                                        <Chip
                                          label={option.name}
                                          color="success"
                                          variant="outlined"
                                        />
                                      </Tooltip>
                                    );
                                  } else {
                                    return (
                                      <Tooltip
                                        title={option.name}
                                        placement="top"
                                      >
                                        <Chip
                                          label={option.name}
                                          variant="outlined"
                                        />
                                      </Tooltip>
                                    );
                                  }
                                }}
                                options={color}
                                onChange={(event, value) => {
                                  handleChangeRepeatableComponent(
                                    value,
                                    key,
                                    false,
                                    "Color",
                                    "color" + key,
                                    "color"
                                  );
                                }}
                                value={
                                  color[
                                    color.findIndex(function (item, i) {
                                      return item.id === r.color;
                                    })
                                  ] || null
                                }
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                /** For setting errors */
                                helperTextId={"helperText_color" + key}
                                isHelperText={true}
                                helperText={
                                  info["color" + key]
                                    ? info["color" + key].msg
                                    : ""
                                }
                                error={
                                  info["color" + key]?.isError ? true : false
                                }
                              />
                              {/**
                               * design: d.design,
                               * color: d.color?.id,
                               * colorName: d.color?.name,
                               * quantity: 0,
                               * quantityCompleted: 0,
                               * order: null,
                               */}
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
                                labelText={"Quantity"}
                                disabled={
                                  isView ||
                                  formState.cancelled ||
                                  !r.color ||
                                  formState.completed
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
                                  isView ||
                                  formState.cancelled ||
                                  !r.quantity ||
                                  !r.color ||
                                  formState.completed
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

                            {!isView ? (
                              <>
                                {isEdit ? (
                                  <>
                                    <GridItem
                                      xs={6}
                                      sm={6}
                                      md={1}
                                      className={classes.addDeleteFabButon}
                                    >
                                      <FAB
                                        marginTop={2}
                                        color="danger"
                                        align={"end"}
                                        size={"small"}
                                        onClick={() => {
                                          console.log("r -> ", r);
                                          if (r.id) {
                                            setAlertForDeleteDesign(
                                              r.plating,
                                              r.color,
                                              key
                                            );
                                          } else {
                                            setRatio([
                                              ...ratio.slice(0, key),
                                              ...ratio.slice(key + 1),
                                            ]);
                                            delete info["color" + key];
                                            setInfo((info) => ({
                                              ...info,
                                            }));
                                          }
                                        }}
                                      >
                                        <DeleteIcon />
                                      </FAB>
                                    </GridItem>
                                  </>
                                ) : (
                                  <>
                                    <GridItem
                                      xs={6}
                                      sm={6}
                                      md={1}
                                      className={classes.addDeleteFabButon}
                                    >
                                      <FAB
                                        color="danger"
                                        align={"end"}
                                        size={"small"}
                                        disabled={!r.color}
                                        onClick={() => {
                                          // let colorData = ratio[key].colorData;
                                          // color.push(colorData);
                                          // setColor(color);
                                          // delete info["color" + key];
                                          // setInfo((info) => ({
                                          //   ...info,
                                          // }));

                                          if (ratio.length === 1) {
                                            setRatio([
                                              {
                                                color: null,
                                                colorData: null,
                                                plating: null,
                                                platingData: null,
                                                quantity: 0,
                                                quantityCompleted: 0,
                                                order: null,
                                              },
                                            ]);
                                          } else {
                                            setRatio([
                                              ...ratio.slice(0, key),
                                              ...ratio.slice(key + 1),
                                            ]);
                                          }
                                          delete info["color" + key];
                                          setInfo((info) => ({
                                            ...info,
                                          }));
                                        }}
                                      >
                                        <DeleteIcon />
                                      </FAB>
                                    </GridItem>
                                  </>
                                  //   <GridItem xs={12} sm={12} md={12}>
                                  //   <FAB
                                  //     color="primary"
                                  //     size={"medium"}
                                  //     variant="extended"
                                  //     onClick={() => addReadyMaterial()}
                                  //     disabled={!party.id}
                                  //     toolTip={
                                  //       party.id
                                  //         ? "Select raw materials for sale"
                                  //         : "Select party first"
                                  //     }
                                  //   >
                                  //     <AddIcon className={classes.extendedIcon} />
                                  //     <h5>Add Ready Material</h5>
                                  //   </FAB>
                                  // </GridItem>
                                )}
                                {ratio.length - 1 === key ? (
                                  <GridItem
                                    xs={6}
                                    sm={6}
                                    md={1}
                                    className={classes.addDeleteFabButon}
                                  >
                                    <FAB
                                      color="success"
                                      align={"end"}
                                      size={"small"}
                                      disabled={
                                        !r.color ||
                                        calculateBufferQuantity() === 0
                                      }
                                      onClick={() => {
                                        setRatio([
                                          ...ratio,
                                          {
                                            color: null,
                                            colorData: null,
                                            plating: null,
                                            platingData: null,
                                            quantity: 0,
                                            quantityCompleted: 0,
                                            order: null,
                                          },
                                        ]);
                                      }}
                                    >
                                      <AddIcon />
                                    </FAB>
                                  </GridItem>
                                ) : null}
                              </>
                            ) : null}
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
                        <GridItem xs={12} sm={12} md={3}></GridItem>
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
              {isEdit || isView ? (
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
                          history.push(`${EDITDEPARTMENTSHEETID}/${id}`);
                        }}
                      >
                        Department Sheet
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
