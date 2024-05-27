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
import { PLATING, SELLERS } from "../../../paths";
import { useState } from "react";
import form from "./form/Plating.json";
import { checkEmpty, hasError, setErrors } from "../../../Utils";
import { Backdrop, CircularProgress } from "@material-ui/core";
import { providerForPost, providerForPut } from "../../../api";
import { useEffect } from "react";
import { COLORS } from "../../../paths";
import { backend_plating } from "../../../constants";

const useStyles = makeStyles(styles);

export default function AddEditPlating(props) {
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
    name: "",
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
      name: data.name,
    }));
  };

  const onBackClick = () => {
    history.push(PLATING);
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

  const handSubmit = async () => {
    /** Api call over here to save data */
    let data = {
      name: formState.name.trim().toUpperCase(),
    };
    if (isEdit) {
      await providerForPut(backend_plating, formState.id, data, Auth.getToken())
        .then((res) => {
          history.push(PLATING);
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
      await providerForPost(backend_plating, data, Auth.getToken())
        .then((res) => {
          history.push(PLATING);
          setLoading(false);
        })
        .catch((error) => {
          console.log("Error ", error);
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
              {isEdit ? "Edit Plating" : "Add New Plating"}
            </h4>
            <p className={classes.cardCategoryWhite}></p>
          </CardHeader>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="Plating Name"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={(event) => handleChange(event)}
                  formControlProps={{
                    fullWidth: true,
                  }}
                  /** For setting errors */
                  helperTextId={"helperText_name"}
                  isHelperText={hasError("name", error)}
                  helperText={
                    hasError("name", error)
                      ? error["name"].map((error) => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("name", error)}
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
