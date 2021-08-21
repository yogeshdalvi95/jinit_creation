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
  CustomInput,
  DatePicker,
  DialogBox,
  DialogBoxForSelectingRawMaterial,
  DialogForSelectingSeller,
  FAB,
  GridContainer,
  GridItem,
  Muted,
  SnackBarComponent
} from "../../components";
import moment from "moment";
import SweetAlert from "react-bootstrap-sweetalert";
import validationForm from "./form/GoodsReturn.json";

// core components
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { GOODRETURNLIST } from "../../paths";
import { useEffect } from "react";
import { providerForPost, providerForPut } from "../../api";
import { useState } from "react";
import { Backdrop, CircularProgress, FormHelperText } from "@material-ui/core";
import { checkEmpty, hasError, isEmptyString, setErrors } from "../../Utils";
import buttonStyles from "../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import classNames from "classnames";
import { backend_goods_return } from "../../constants";
import auth from "../../components/Auth";

const buttonUseStyles = makeStyles(buttonStyles);

const useStyles = makeStyles(styles);

export default function AddGoodReturn(props) {
  const classes = useStyles();
  const buttonClasses = buttonUseStyles();
  const history = useHistory();
  const [error, setError] = React.useState({});
  const [alert, setAlert] = useState(null);
  /** VIMP to check if the data is used for viewing */
  const [isView] = useState(
    props.location.state ? props.location.state.view : false
  );

  /** VIMP to check if the data is used for editing */
  const [isEdit] = useState(
    props.location.state ? props.location.state.edit : false
  );

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: ""
  });

  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    id: null,
    seller: null,
    gst_no: "",
    seller_name: "",
    quantity: "",
    notes: "",
    date: new Date(),
    raw_material: null,
    raw_material_name: "",
    raw_material_department: "",
    raw_material_color: "",
    raw_material_category: "",
    raw_material_size: "",
    raw_material_balance: "",
    raw_material_name_value: []
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [
    openDialogForSelectingRawMaterial,
    setOpenDialogForSelectingRawMaterial
  ] = useState(false);
  const [
    openDialogForSelectingSeller,
    setOpenDialogForSelectingSeller
  ] = useState(false);

  useEffect(() => {
    if (
      props.location.state &&
      (props.location.state.view || props.location.state.edit) &&
      props.location.state.data
    ) {
      setData(props.location.state.data);
    }
  }, []);

  const setData = data => {
    let raw_material_data = data.raw_material;
    let bal = "0";
    let department = "";
    if (raw_material_data) {
      department = raw_material_data.department
        ? raw_material_data.department.name
        : "";
      if (!raw_material_data.balance) {
        bal = "0";
      } else {
        bal = raw_material_data.balance;
      }
    }

    setFormState(formState => ({
      ...formState,
      id: data.id,
      seller: data.seller ? data.seller.id : null,
      seller_name: data.seller ? data.seller.seller_name : "",
      gst_no: data.seller ? data.seller.gst_no : "",
      notes: data.notes,
      quantity: data.quantity,
      raw_material: data.raw_material ? data.raw_material.id : null,
      raw_material_name: raw_material_data ? raw_material_data.name : "",
      raw_material_department: department,
      raw_material_color:
        raw_material_data && raw_material_data.color
          ? raw_material_data.color.name
          : "",
      raw_material_category:
        raw_material_data && raw_material_data.category
          ? raw_material_data.category.name
          : "",
      raw_material_size: raw_material_data ? raw_material_data.size : "",
      raw_material_balance: bal,
      raw_material_name_value: raw_material_data
        ? raw_material_data.name_value
        : "",
      date: new Date(data.date)
    }));
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

  const onBackClick = () => {
    history.push(GOODRETURNLIST);
  };

  const submit = async event => {
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
      handleAddEdit();
    }
  };

  const handleAddEdit = () => {
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
          Please make sure you have added the right quantity and selected the
          right raw material because the quantity will be deducted from the raw
          material balance!
        </SweetAlert>
      );
      //setOpenDialog(true);
    }
  };

  const addEditData = async () => {
    setBackDrop(true);
    if (isEdit) {
      let data = {
        seller: formState.seller,
        notes: formState.notes
      };
      await providerForPut(
        backend_goods_return,
        formState.id,
        data,
        auth.getToken()
      )
        .then(res => {
          setBackDrop(false);
          history.push(GOODRETURNLIST);
        })
        .catch(err => {
          setBackDrop(false);
          setSnackBar(snackBar => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error Saving"
          }));
        });
    } else {
      let data = {
        raw_material: formState.raw_material,
        seller: formState.seller,
        quantity: formState.quantity,
        date: new Date(formState.date),
        notes: formState.notes
      };
      await providerForPost(backend_goods_return, data, auth.getToken())
        .then(res => {
          setBackDrop(false);
          history.push(GOODRETURNLIST);
        })
        .catch(err => {
          setBackDrop(false);
          setSnackBar(snackBar => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error Saving"
          }));
        });
    }
  };

  const snackBarHandleClose = () => {
    setSnackBar(snackBar => ({
      ...snackBar,
      show: false,
      severity: "",
      message: ""
    }));
  };

  const handleCloseDialog = () => {
    setAlert(null);
    setOpenDialog(false);
  };

  const handleAcceptDialog = () => {
    setOpenDialog(false);
    setAlert(null);
    addEditData();
  };

  /** Dialogs for raw material */
  const handleCloseDialogForRawMaterial = () => {
    setOpenDialogForSelectingRawMaterial(false);
  };

  const handleStartDateChange = event => {
    let startDate = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (startDate === "Invalid date") {
      startDate = null;
    } else {
      startDate = new Date(startDate).toISOString();
    }
    setFormState(formState => ({
      ...formState,
      date: startDate
    }));
  };

  /** Seller Dialog boxes */
  const handeAddSeller = row => {
    setOpenDialogForSelectingSeller(false);
    if (row) {
      delete error["seller"];
      setError(error => ({
        ...error
      }));
      setFormState(formState => ({
        ...formState,
        seller: row.id,
        gst_no: row.gst_no,
        seller_name: row.seller_name
      }));
    } else {
      setSnackBar(snackBar => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Invalid Seller"
      }));
    }
  };

  const handleCloseDialogForSeller = () => {
    setOpenDialogForSelectingSeller(false);
  };

  const handleAddRawMaterial = (row, nameObject) => {
    setOpenDialogForSelectingRawMaterial(false);
    if (row) {
      delete error["raw_material"];
      setError(error => ({
        ...error
      }));
      setFormState(formState => ({
        ...formState,
        raw_material: row.id,
        raw_material_name: nameObject.name,
        raw_material_department: nameObject.department,
        raw_material_color: nameObject.color,
        raw_material_category: nameObject.category,
        raw_material_size: nameObject.size,
        raw_material_balance: nameObject.bal,
        raw_material_name_value: row.name_value
      }));
    } else {
      setSnackBar(snackBar => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Invalid Raw Material"
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
           the quantity will be deducted from the raw material`,
          `Are you sure you
        want to proceed ?`
        ]}
      ></DialogBox>
      <DialogBoxForSelectingRawMaterial
        handleCancel={handleCloseDialogForRawMaterial}
        handleClose={handleCloseDialogForRawMaterial}
        handleAddRawMaterial={handleAddRawMaterial}
        open={openDialogForSelectingRawMaterial}
      />
      <DialogForSelectingSeller
        handleCancel={handleCloseDialogForSeller}
        handleClose={handleCloseDialogForSeller}
        handleAddSeller={handeAddSeller}
        open={openDialogForSelectingSeller}
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
                      <GridItem xs={12} sm={12} md={8}>
                        <b>Id : </b>{" "}
                        {formState.raw_material ? formState.raw_material : ""}
                      </GridItem>
                    </GridContainer>
                    <GridContainer style={{ dispay: "flex" }}>
                      <GridItem xs={12} sm={12} md={8}>
                        <b>Name : </b> {formState.raw_material_name}
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={8}>
                        <b>Department : </b>
                        {formState.raw_material_department}
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={8}>
                        <b>Category : </b>
                        {formState.raw_material_category}
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={8}>
                        <b>Color :</b> {formState.raw_material_color}
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={8}>
                        <b>Size : </b>
                        {formState.raw_material_size}
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={8}>
                        <b>Balance : </b>
                        {formState.raw_material_balance}
                      </GridItem>
                    </GridContainer>
                  </GridItem>
                  {isView || isEdit ? null : (
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
                            setOpenDialogForSelectingRawMaterial(true);
                          }}
                        >
                          {formState.raw_material
                            ? "Change Raw Material"
                            : "Select Raw Material"}
                        </Button>
                      </GridItem>
                      {hasError("raw_material", error) ? (
                        <GridItem xs={12} sm={12} md={12}>
                          <FormHelperText
                            id={"raw_material_helpertext_id"}
                            error={hasError("raw_material", error)}
                          >
                            {hasError("raw_material", error)
                              ? error["raw_material"].map(error => {
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
              <GridItem xs={12} sm={12} md={6}>
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
                        <b>Sell To </b>
                      </GridItem>
                    </GridContainer>
                    <br />
                    <GridContainer style={{ dispay: "flex" }}>
                      <GridItem xs={12} sm={12} md={8}>
                        <b>Name : </b> {formState.seller_name}
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={8}>
                        <b>Gst No : </b>
                        {formState.gst_no}
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
                            setOpenDialogForSelectingSeller(true);
                          }}
                        >
                          {formState.seller ? "Change Seller" : "Select Seller"}
                        </Button>
                      </GridItem>
                      {hasError("seller", error) ? (
                        <GridItem xs={12} sm={12} md={12}>
                          <FormHelperText
                            id={"seller_helpertext_id"}
                            error={hasError("seller", error)}
                          >
                            {hasError("seller", error)
                              ? error["seller"].map(error => {
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
            <GridContainer>
              <GridItem xs={12} sm={12} md={3}>
                <DatePicker
                  onChange={event => handleStartDateChange(event)}
                  label="Purchase Date"
                  name="date"
                  disabled={isView || isEdit}
                  value={formState.date || new Date()}
                  id="date"
                  formControlProps={{
                    fullWidth: true
                  }}
                  style={{
                    marginTop: "1.5rem",
                    width: "100%"
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  onChange={event => handleChange(event)}
                  type="number"
                  disabled={isView || isEdit}
                  labelText="Selling Quantity"
                  name="quantity"
                  value={formState.quantity}
                  id="purchase_quantity"
                  formControlProps={{
                    fullWidth: true
                  }}
                  /** For setting errors */
                  helperTextId={"helperText_quantity"}
                  isHelperText={hasError("quantity", error)}
                  helperText={
                    hasError("quantity", error)
                      ? error["quantity"].map(error => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("quantity", error)}
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
                  onChange={event => handleChange(event)}
                  value={formState.notes}
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    multiline: true,
                    rows: 3
                  }}
                />
              </GridItem>
            </GridContainer>
          </CardBody>
          {isView ? null : (
            <CardFooter>
              <Button color="primary" onClick={e => submit(e)}>
                Save
              </Button>
            </CardFooter>
          )}
        </Card>
        <Backdrop className={classes.backdrop} open={openBackDrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </GridItem>

      {formState.raw_material ? (
        <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardBody>
              <GridItem xs={12} sm={12} md={12}>
                <b>Raw Material Details</b>
              </GridItem>
              <br />
              <GridItem xs={12} sm={12} md={12}>
                <Muted>Id :{formState.raw_material}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted>Name :{formState.raw_material_name}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted> Department : {formState.raw_material_department}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted> Category : {formState.raw_material_category}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted> Color : {formState.raw_material_color}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted> Size : {formState.raw_material_size}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted>
                  Balance :{" "}
                  {isEmptyString(formState.raw_material_balance)
                    ? "0"
                    : formState.raw_material_balance}
                </Muted>
              </GridItem>
              {formState.raw_material_name_value.map(nv => (
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
