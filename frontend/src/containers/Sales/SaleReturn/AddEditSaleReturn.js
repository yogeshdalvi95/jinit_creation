import React from "react";
import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import {
  Backdrop,
  CircularProgress,
  FormHelperText,
  makeStyles,
  Tooltip
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { NOTFOUNDPAGE, SALERETURN, SALES } from "../../../paths";
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
} from "../../../components";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import {
  checkEmpty,
  convertNumber,
  hasError,
  isEmptyString,
  setErrors
} from "../../../Utils";
import moment from "moment";
import { apiUrl } from "../../../constants";
import no_image_icon from "../../../assets/img/no_image_icon.png";
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
import validationForm from "../form/SaleReturnFormValidation.json";
import SweetAlert from "react-bootstrap-sweetalert";
import { providerForGet, providerForPost } from "../../../api";
import buttonStyles from "../../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import { backend_sale_return } from "../../../constants";
import classNames from "classnames";

const buttonUseStyles = makeStyles(buttonStyles);
const useStyles = makeStyles(styles);
export default function AddEditSaleReturn(props) {
  const classes = useStyles();
  const history = useHistory();
  const buttonClasses = buttonUseStyles();
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
    date: new Date(),
    party: null,
    total_price_of_ready_material: 0,
    add_cost: 0,
    total_price: 0,
    notes: ""
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
    await providerForGet(backend_sale_return + "/" + id, {}, Auth.getToken())
      .then(res => {
        console.log(res, res.status);
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
    console.log(isError);
    if (isError) {
      history.push(NOTFOUNDPAGE);
    }
  };

  const convertData = data => {
    setFormState(formState => ({
      ...formState,
      date: new Date(data.date),
      total_price_of_ready_material: parseFloat(
        data.total_price_of_ready_material
      ),
      add_cost: parseFloat(data.add_cost),
      total_price: parseFloat(data.total_price),
      party: data.party.id,
      notes: data.notes
    }));
    setParty(party => ({
      ...party,
      gst_no: data.party.gst_no,
      id: data.party.id,
      party_name: data.party.party_name,
      address: data.party.party_address
    }));
    let readyMaterialTempArr = [];
    for (let rm of data.sale_return_component) {
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
        message: "No of ready materials to add back to stock :- 1"
      }
    ]);
    let total_price_of_ready_material =
      formState.total_price_of_ready_material + parseFloat(data.final_cost);

    const { total_price } = calculateAddCost(total_price_of_ready_material);

    setFormState(formState => ({
      ...formState,
      total_price: total_price,
      total_price_of_ready_material: total_price_of_ready_material
    }));

    setBackDrop(false);
    setOpenDialogForSelectingReadyMaterial(false);
  };

  const removeReadyMaterial = key => {
    let obj = readyMaterialArray[key];
    setBackDrop(true);
    let total_price_of_ready_material =
      formState.total_price_of_ready_material - parseFloat(obj.total_price);
    const { total_price } = calculateAddCost(total_price_of_ready_material);
    delete readyMaterialError["quantity" + key];
    delete readyMaterialError["price_per_unit" + key];
    setReadyMaterialError(readyMaterialError => ({
      ...readyMaterialError
    }));
    setFormState(formState => ({
      ...formState,
      total_price: total_price,
      total_price_of_ready_material: total_price_of_ready_material
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

  const calculateAddCost = (
    total_price_of_ready_material = formState.total_price_of_ready_material,
    is_add_additional_cost = true,
    add_cost = formState.add_cost
  ) => {
    let total_price = 0;
    if (is_add_additional_cost) {
      total_price = total_price_of_ready_material + parseFloat(add_cost);
    } else {
      total_price = total_price_of_ready_material - parseFloat(add_cost);
    }
    return {
      total_price: total_price
    };
  };

  const handleChangeAddCost = event => {
    delete error[event.target.name];
    setError(error => ({
      ...error
    }));
    let value = isEmptyString(event.target.value)
      ? 0
      : parseFloat(event.target.value);
    const { total_price } = calculateAddCost(
      formState.total_price_of_ready_material,
      true,
      value
    );
    setFormState(formState => ({
      ...formState,
      [event.target.name]: event.target.value,
      total_price: total_price
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
    let isValid = false;
    let error = "";
    let keyName = name + "" + key;
    let quantity = 0;
    console.log("-------------------------------------");
    if (name === "quantity") {
      quantity = 0;
      if (event.target.value && !isNaN(event.target.value)) {
        quantity = parseFloat(event.target.value);
      }
      if (!quantity || quantity < 0) {
        isValid = false;
        error = "Quantity cannot be zero or negative";
      } else {
        isValid = true;
      }

      obj = {
        ...obj,
        quantity: quantity
      };
    } else {
      let finalPriceOfAllReadyMaterial = 0;
      let total_price_of_added_raw_material = 0;
      if (event.target.value && !isNaN(event.target.value)) {
        total_price_of_added_raw_material = parseFloat(event.target.value);
      }
      if (
        !total_price_of_added_raw_material ||
        total_price_of_added_raw_material < 0
      ) {
        isValid = false;
        error = "Total price cannot be zero or negative";
      } else {
        isValid = true;
      }
      let totalPriceOfAllReadyMaterialWithoutTheCurrentReadyMaterial =
        parseFloat(formState.total_price_of_ready_material) -
        parseFloat(obj.total_price);

      finalPriceOfAllReadyMaterial =
        totalPriceOfAllReadyMaterialWithoutTheCurrentReadyMaterial +
        total_price_of_added_raw_material;

      const { total_price } = calculateAddCost(finalPriceOfAllReadyMaterial);
      obj = {
        ...obj,
        total_price: total_price_of_added_raw_material
      };
      setFormState(formState => ({
        ...formState,
        total_price: total_price,
        total_price_of_ready_material: finalPriceOfAllReadyMaterial
      }));
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

    setReadyMaterialArray([
      ...readyMaterialArray.slice(0, key),
      obj,
      ...readyMaterialArray.slice(key + 1)
    ]);
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
    error = setErrors(formState, validationForm);
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
    await providerForPost(backend_sale_return, obj, Auth.getToken())
      .then(res => {
        history.push(SALERETURN);
        setBackDrop(false);
      })
      .catch(err => {
        setBackDrop(false);
        setSnackBar(snackBar => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error Adding/Editing Sale Return Data"
        }));
      });
  };

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
                <GridItem xs={12} sm={12} md={4}>
                  <DatePicker
                    onChange={event => handleOrderDate(event)}
                    label="Return Date"
                    name="return_date"
                    disabled={isView || formState.cancelled}
                    value={formState.date || new Date()}
                    id="return_date"
                    formControlProps={{
                      fullWidth: true
                    }}
                    minDate={
                      isView
                        ? null
                        : new Date(
                            new Date().getFullYear(),
                            new Date().getMonth(),
                            1
                          )
                    }
                    maxDate={
                      isView
                        ? null
                        : new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() + 1,
                            0
                          )
                    }
                    style={{
                      width: "100%",
                      marginTop: "1.5rem"
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInput
                    onChange={event => handleChangeAddCost(event)}
                    labelText="Add. Price to return"
                    name="add_cost"
                    type="number"
                    placeHolder="0"
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
                    labelText="Total Return Price"
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
                                name="total_price"
                                value={Ip.total_price}
                                id="total_price"
                                formControlProps={{
                                  fullWidth: false
                                }}
                                /** For setting errors */
                                helperTextId={"total_price" + key}
                                isHelperText={hasError(
                                  "total_price" + key,
                                  readyMaterialError
                                )}
                                helperText={
                                  hasError(
                                    "total_price" + key,
                                    readyMaterialError
                                  )
                                    ? readyMaterialError[
                                        "total_price" + key
                                      ].map(error => {
                                        return error + " ";
                                      })
                                    : null
                                }
                                error={hasError(
                                  "total_price" + key,
                                  readyMaterialError
                                )}
                              />
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
                                        removeReadyMaterial(key);
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
                        <TableCell colSpan={3} align="right">
                          Total price
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
