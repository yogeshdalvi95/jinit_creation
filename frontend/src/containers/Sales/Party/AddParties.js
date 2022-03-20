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
  SnackBarComponent,
} from "../../../components";
// core components
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { PARTIES } from "../../../paths";
import { useState } from "react";
import form from "../form/PartyForm.json";
import { checkEmpty, hasError, setErrors } from "../../../Utils";
import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import { providerForGet, providerForPost, providerForPut } from "../../../api";
import {
  backend_check_party_duplicate,
  backend_parties,
} from "../../../constants";
import { useEffect } from "react";

const useStyles = makeStyles(styles);

export default function AddParties(props) {
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
    message: "",
  });

  const [formState, setFormState] = useState({
    id: null,
    party_name: "",
    party_email: "",
    phone: "",
    party_address: "",
    gst_no: "",
    extra_details: "",
    is_whole_seller: false,
    is_retailer: false,
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
  const setData = (data) => {
    setFormState((formState) => ({
      ...formState,
      id: data.id,
      party_name: data.party_name,
      party_email: data.party_email,
      phone: data.phone,
      party_address: data.party_address,
      gst_no: data.gst_no,
      extra_details: data.extra_details,
      is_retailer: data.is_retailer,
      is_whole_seller: data.is_whole_seller,
    }));
  };

  const onBackClick = () => {
    history.push(PARTIES);
  };

  const handleChange = (event) => {
    setFormState((formState) => ({
      ...formState,
      [event.target.name]: event.target.value,
    }));
    if (error.hasOwnProperty(event.target.name)) {
      delete error[event.target.name];
      setError((error) => ({
        ...error,
      }));
    }
  };

  const addButton = async (event) => {
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
      backend_check_party_duplicate,
      {
        isEdit: isEdit,
        editId: formState.id,
        party_name: formState.party_name,
        gst_no: formState.gst_no,
      },
      Auth.getToken()
    )
      .then((res) => {
        result = res.data;
      })
      .catch((err) => {
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error adding data",
        }));
        setLoading(false);
        result = null;
      });
    return result;
  };

  const handSubmit = async () => {
    /** Api call over here to save data */
    let data = {
      party_name: formState.party_name,
      party_email: formState.party_email,
      phone: formState.phone,
      party_address: formState.party_address,
      gst_no: formState.gst_no,
      extra_details: formState.extra_details,
      is_whole_seller: formState.is_whole_seller,
      is_retailer: formState.is_retailer,
    };
    if (isEdit) {
      await providerForPut(backend_parties, formState.id, data, Auth.getToken())
        .then((res) => {
          history.push(PARTIES);
          setLoading(false);
        })
        .catch((error) => {
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error saving data",
          }));
          setLoading(false);
        });
    } else {
      await providerForPost(backend_parties, data, Auth.getToken())
        .then((res) => {
          history.push(PARTIES);
          setLoading(false);
        })
        .catch((error) => {
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error saving data",
          }));
          setLoading(false);
        });
    }
  };

  /** Close function called when we click on cancel button of snackbar */
  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
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
              {isEdit ? "Edit Party" : "Add New Party"}
            </h4>
            <p className={classes.cardCategoryWhite}></p>
          </CardHeader>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="Party Name"
                  id="party_name"
                  name="party_name"
                  value={formState.party_name}
                  onChange={(event) => handleChange(event)}
                  formControlProps={{
                    fullWidth: true,
                  }}
                  /** For setting errors */
                  helperTextId={"helperText_party_name"}
                  isHelperText={hasError("party_name", error)}
                  helperText={
                    hasError("party_name", error)
                      ? error["party_name"].map((error) => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("party_name", error)}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="GSTIN/UIN"
                  id="gst_no"
                  name="gst_no"
                  value={formState.gst_no}
                  onChange={(event) => handleChange(event)}
                  formControlProps={{
                    fullWidth: true,
                  }}
                  /** For setting errors */
                  helperTextId={"helperText_gst_no"}
                  isHelperText={hasError("gst_no", error)}
                  helperText={
                    hasError("gst_no", error)
                      ? error["gst_no"].map((error) => {
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
                  id="party_email"
                  name="party_email"
                  value={formState.party_email}
                  onChange={(event) => handleChange(event)}
                  formControlProps={{
                    fullWidth: true,
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="Phone"
                  id="phone"
                  name="phone"
                  value={formState.phone}
                  onChange={(event) => handleChange(event)}
                  formControlProps={{
                    fullWidth: true,
                  }}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <CustomInput
                  labelText="Party Address"
                  id="party_address"
                  name="party_address"
                  value={formState.party_address}
                  onChange={(event) => handleChange(event)}
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    multiline: true,
                    rows: 5,
                  }}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={4} md={4} className={classes.switchBox}>
                <div className={classes.block}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.is_whole_seller ? true : false}
                        onChange={(event) => {
                          setFormState((formState) => ({
                            ...formState,
                            is_whole_seller: event.target.checked
                              ? true
                              : false,
                            is_retailer: event.target.checked ? false : true,
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
                    label="Whole Seller"
                  />
                </div>
              </GridItem>
              <GridItem xs={12} sm={4} md={4} className={classes.switchBox}>
                <div className={classes.block}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.is_retailer ? true : false}
                        onChange={(event) => {
                          setFormState((formState) => ({
                            ...formState,
                            is_retailer: event.target.checked ? true : false,
                            is_whole_seller: event.target.checked
                              ? false
                              : true,
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
                    label="Retailer"
                  />
                </div>
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <CustomInput
                  labelText="Extra Info"
                  id="extra_details"
                  name="extra_details"
                  value={formState.extra_details}
                  onChange={(event) => handleChange(event)}
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    multiline: true,
                    rows: 5,
                  }}
                />
              </GridItem>
            </GridContainer>
          </CardBody>
          <CardFooter>
            <Button color="primary" onClick={(e) => addButton(e)}>
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
