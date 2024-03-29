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
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent
} from "../../components";
// core components
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { SELLERS } from "../../paths";
import { useState } from "react";
import form from "./form/SellerForm.json";
import { checkEmpty, hasError, setErrors } from "../../Utils";
import { Backdrop, CircularProgress } from "@material-ui/core";
import { providerForGet, providerForPost, providerForPut } from "../../api";
import {
  backend_check_seller_duplicate,
  backend_sellers
} from "../../constants";
import { useEffect } from "react";

const useStyles = makeStyles(styles);

export default function AddSeller(props) {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = React.useState({});

  /** VIMP to check if the data is used for editing */
  const [isEdit] = useState(
    props.location.state ? props.location.state.edit : false
  );

  /** This is a snack bar to display error is api call returned an error */
  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: ""
  });

  const [formState, setFormState] = useState({
    id: null,
    seller_name: "",
    seller_email: "",
    phone: "",
    seller_address: "",
    gst_no: "",
    extra_details: ""
  });

  useEffect(() => {
    if (
      props.location.state &&
      props.location.state.edit &&
      props.location.state.data
    ) {
      setData(props.location.state.data);
    }
  }, []);

  /** Function that sets data during editing  */
  const setData = data => {
    setFormState(formState => ({
      ...formState,
      id: data.id,
      seller_name: data.seller_name,
      seller_email: data.seller_email,
      phone: data.phone,
      seller_address: data.seller_address,
      gst_no: data.gst_no,
      extra_details: data.extra_details
    }));
  };

  const onBackClick = () => {
    history.push(SELLERS);
  };

  const handleChange = event => {
    setFormState(formState => ({
      ...formState,
      [event.target.name]: event.target.value
    }));
    if (error.hasOwnProperty(event.target.name)) {
      delete error[event.target.name];
      setError(error => ({
        ...error
      }));
    }
  };

  const addButton = async event => {
    event.preventDefault();
    setLoading(true);
    let isValid = false;
    let error = {};
    /** This will set errors as per validations defined in form */
    error = setErrors(formState, form);
    /** If no errors then isValid is set true */
    if (checkEmpty(error)) {
      /** Check gst no and seller name duplicate */
      error = await checkIfDuplicate();
      /** If no duplicate then isValid is set true and then we proceed to add/edit data */
      if (error && checkEmpty(error)) {
        isValid = true;
      } else {
        setLoading(false);
        /** Api might also return null so 1st check if its not null */
        setError(error ? error : {});
      }
    } else {
      setLoading(false);
      setError(error);
    }
    /** If valid i.e there are no validations then call the api to save or edit data */
    if (isValid) {
      handSubmit();
    }
  };

  /** Function to check in database whether seller name and gst number is duplicate or not*/
  const checkIfDuplicate = async () => {
    let result = "";
    await providerForGet(
      backend_check_seller_duplicate,
      {
        isEdit: isEdit,
        editId: formState.id,
        seller_name: formState.seller_name,
        gst_no: formState.gst_no
      },
      Auth.getToken()
    )
      .then(res => {
        result = res.data;
      })
      .catch(err => {
        setSnackBar(snackBar => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error adding data"
        }));
        setLoading(false);
        result = null;
      });
    return result;
  };

  const handSubmit = async () => {
    /** Api call over here to save data */
    let data = {
      seller_name: formState.seller_name,
      seller_email: formState.seller_email,
      phone: formState.phone,
      seller_address: formState.seller_address,
      gst_no: formState.gst_no,
      extra_details: formState.extra_details
    };
    if (isEdit) {
      await providerForPut(backend_sellers, formState.id, data, Auth.getToken())
        .then(res => {
          history.push(SELLERS);
          setLoading(false);
        })
        .catch(error => {
          setSnackBar(snackBar => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error saving data"
          }));
          setLoading(false);
        });
    } else {
      await providerForPost(backend_sellers, data, Auth.getToken())
        .then(res => {
          history.push(SELLERS);
          setLoading(false);
        })
        .catch(error => {
          setSnackBar(snackBar => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error saving data"
          }));
          setLoading(false);
        });
    }
  };

  /** Close function called when we click on cancel button of snackbar */
  const snackBarHandleClose = () => {
    setSnackBar(snackBar => ({
      ...snackBar,
      show: false,
      severity: "",
      message: ""
    }));
  };

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <FAB align={"start"} size={"small"} onClick={onBackClick}>
          <KeyboardArrowLeftIcon />
        </FAB>
      </GridItem>

      {/** Snackbar component that displays error */}
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />

      <GridItem xs={12} sm={12} md={8}>
        <Card>
          <CardHeader color="primary" className={classes.cardHeaderStyles}>
            <h4 className={classes.cardTitleWhite}>
              {isEdit ? "Edit Seller" : "Add New Seller"}
            </h4>
            <p className={classes.cardCategoryWhite}></p>
          </CardHeader>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="Seller Name"
                  id="seller_name"
                  name="seller_name"
                  value={formState.seller_name}
                  onChange={event => handleChange(event)}
                  formControlProps={{
                    fullWidth: true
                  }}
                  /** For setting errors */
                  helperTextId={"helperText_seller_name"}
                  isHelperText={hasError("seller_name", error)}
                  helperText={
                    hasError("seller_name", error)
                      ? error["seller_name"].map(error => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("seller_name", error)}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="GSTIN/UIN"
                  id="gst_no"
                  name="gst_no"
                  value={formState.gst_no}
                  onChange={event => handleChange(event)}
                  formControlProps={{
                    fullWidth: true
                  }}
                  /** For setting errors */
                  helperTextId={"helperText_gst_no"}
                  isHelperText={hasError("gst_no", error)}
                  helperText={
                    hasError("gst_no", error)
                      ? error["gst_no"].map(error => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("gst_no", error)}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="Email"
                  id="seller_email"
                  name="seller_email"
                  value={formState.seller_email}
                  onChange={event => handleChange(event)}
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="Phone"
                  id="phone"
                  name="phone"
                  value={formState.phone}
                  onChange={event => handleChange(event)}
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <CustomInput
                  labelText="Seller Address"
                  id="seller_address"
                  name="seller_address"
                  value={formState.seller_address}
                  onChange={event => handleChange(event)}
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    multiline: true,
                    rows: 5
                  }}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <CustomInput
                  labelText="Extra Info"
                  id="extra_details"
                  name="extra_details"
                  value={formState.extra_details}
                  onChange={event => handleChange(event)}
                  formControlProps={{
                    fullWidth: true
                  }}
                  inputProps={{
                    multiline: true,
                    rows: 5
                  }}
                />
              </GridItem>
            </GridContainer>
          </CardBody>
          <CardFooter>
            <Button color="primary" onClick={e => addButton(e)}>
              Save
            </Button>
          </CardFooter>
        </Card>
      </GridItem>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </GridContainer>
  );
}
