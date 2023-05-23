import React, { useRef } from "react";
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
  CustomCheckBox,
  CustomInput,
  FAB,
  GridContainer,
  GridItem,
  RawMaterialList,
  RemoteAutoComplete,
  SnackBarComponent,
} from "../../components";
// core components
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { EDITRAWMATERIALS, RAWMATERIALSVIEW } from "../../paths";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import { useEffect } from "react";
import { providerForGet, providerForPost, providerForPut } from "../../api";
import {
  backend_category,
  backend_color,
  backend_departments,
  backend_raw_materials,
  backend_units,
} from "../../constants";
import { useState } from "react";
import { Backdrop, CircularProgress, InputAdornment } from "@material-ui/core";
import { checkEmpty, hasError, isEmptyString, setErrors } from "../../Utils";
import SweetAlert from "react-bootstrap-sweetalert";
import classNames from "classnames";
import buttonStyles from "../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import validationForm from "./form/RawMaterialvalidation.json";
// import { SearchService } from "../../Utils/SearchService";

// const searchService = new SearchService();

const useStyles = makeStyles(styles);
const buttonUseStyles = makeStyles(buttonStyles);

export default function AddEditRawMaterial(props) {
  const childRef = useRef();
  const classes = useStyles();
  const [alert, setAlert] = useState(null);
  const history = useHistory();
  const [units, setUnits] = useState([]);
  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    id: null,
    name: "",
    color: null,
    category: null,
    size: "",
    balance: 0,
    costing: 0,
    department: null,
    unit: null,
    unit_name: "",
    is_die: false,
    name_value: [],
  });

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const buttonClasses = buttonUseStyles();
  const [error, setError] = React.useState({});
  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [id] = useState(props.id ? props.id : null);

  useEffect(() => {
    if (isEdit || isView) {
      getRawMaterialInfo();
    }
  }, []);

  useEffect(() => {
    getUnits();
  }, []);

  const getRawMaterialInfo = async () => {
    setBackDrop(true);
    await providerForGet(backend_raw_materials + "/" + id, {}, Auth.getToken())
      .then((res) => {
        setData(res.data);
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error getting raw material info",
        }));
      });
  };

  const setData = (data) => {
    setFormState((formState) => ({
      ...formState,
      id: data.id,
      name: data.name,
      color: data.color ? data.color.id : null,
      category: data.category ? data.category.id : null,
      size: data.size,
      balance: data.balance,
      costing: data.costing,
      department: data.department ? data.department.id : null,
      unit: data.unit ? data.unit.id : null,
      unit_name: data.unit ? data.unit.name : "",
      is_die: data.is_die,
      name_value: data.name_value,
    }));
  };

  const getUnits = async () => {
    setBackDrop(true);
    await providerForGet(
      backend_units,
      {
        pageSize: -1,
      },
      Auth.getToken()
    )
      .then((res) => {
        setUnits(res.data.data);
        setBackDrop(false);
      })
      .catch((err) => {});
  };

  const handleChangeAutoComplete = async (name, event, value) => {
    if (value === null) {
      if (name === "unit") {
        setFormState((formState) => ({
          ...formState,
          [name]: null,
          unit_name: "",
        }));
      } else {
        setFormState((formState) => ({
          ...formState,
          [name]: null,
        }));
      }
    } else {
      if (name === "unit") {
        setFormState((formState) => ({
          ...formState,
          [name]: value.id,
          unit_name: value.name,
        }));
      } else {
        setFormState((formState) => ({
          ...formState,
          [name]: value.id,
        }));
      }
    }
    delete error[name];
    setError((error) => ({
      ...error,
    }));
  };

  const handleChange = (event) => {
    delete error[event.target.name];
    setError((error) => ({
      ...error,
    }));
    setFormState((formState) => ({
      ...formState,
      [event.target.name]: event.target.value,
    }));

    if (event.target.name === "name") {
      childRef.current.handleChangeFunction(formState.name);
    }
  };

  const onBackClick = () => {
    history.push(RAWMATERIALSVIEW);
  };

  const filterOutWrongValuesInNameValue = () => {
    let arr = formState.name_value;
    let newArr = [];
    arr.map((nv) => {
      if (
        nv.name &&
        nv.value &&
        !isEmptyString(nv.name) &&
        !isEmptyString(nv.value)
      ) {
        if (nv.id) {
          newArr.push({
            id: nv.id,
            name: nv.name,
            value: nv.value,
          });
        } else {
          newArr.push({
            name: nv.name,
            value: nv.value,
          });
        }
      }
    });
    setFormState((formState) => ({
      ...formState,
      name_value: newArr,
    }));
    return newArr;
  };

  const addButton = async () => {
    let arr = filterOutWrongValuesInNameValue();
    setBackDrop(true);
    if (isEdit) {
      await providerForPut(
        backend_raw_materials,
        formState.id,
        {
          name: formState.name,
          department: formState.department,
          size: formState.size,
          color: formState.color,
          category: formState.category,
          unit: formState.unit,
          costing: formState.costing,
          balance: formState.balance,
          unit_name: formState.unit_name,
          is_die: formState.is_die,
          name_value: arr,
        },
        Auth.getToken()
      )
        .then((res) => {
          history.push(RAWMATERIALSVIEW);
          setBackDrop(false);
        })
        .catch((err) => {
          setBackDrop(false);
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: err.response.data.message
              ? err.response.data.message
              : "Error updating values",
          }));
        });
    } else {
      await providerForPost(
        backend_raw_materials,
        {
          name: formState.name,
          department: formState.department,
          size: formState.size,
          color: formState.color,
          category: formState.category,
          unit: formState.unit,
          costing: formState.costing,
          balance: formState.balance,
          unit_name: formState.unit_name,
          is_die: formState.is_die,
          name_value: arr,
        },
        Auth.getToken()
      )
        .then((res) => {
          history.push(RAWMATERIALSVIEW);
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
              : "Error updating values",
          }));
        });
    }
  };

  const addNewValue = () => {
    setFormState((formState) => ({
      ...formState,
      name_value: [
        {
          id: null,
          name: "",
          value: "",
        },
        ...formState.name_value,
      ],
    }));
  };

  const handleChangeRepeatableComponent = (e, k) => {
    let obj = formState.name_value[k];
    obj = {
      ...obj,
      [e.target.name]: e.target.value,
    };
    setFormState((formState) => ({
      ...formState,
      name_value: [
        ...formState.name_value.slice(0, k),
        obj,
        ...formState.name_value.slice(k + 1),
      ],
    }));
  };

  const handleCloseDialog = () => {
    setAlert(null);
  };

  const handleAcceptDialog = () => {
    setAlert(null);
    addButton();
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

    if (isValid) {
      if (isEdit) {
        addButton();
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
            Please make sure you have added the right Initial balance. Balance
            once added can be edited only if you haven't added any entry in the
            monthly sheet or in the purchases table for this particular raw
            material. Do you want to proceed?
          </SweetAlert>
        );
      }
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

  const handleSelectRawMaterial = (rawMaterial) => {
    setFormState((formState) => ({
      ...formState,
      color: rawMaterial?.color?.id ? rawMaterial.color.id : null,
      category: rawMaterial?.category?.id ? rawMaterial.category.id : null,
      size: rawMaterial?.size ? rawMaterial.size : "--",
      balance: 0,
      costing: rawMaterial?.costing ? rawMaterial.costing : 0,
      department: rawMaterial?.department?.id
        ? rawMaterial.department.id
        : null,
      unit: rawMaterial?.unit?.id ? rawMaterial.unit.id : null,
      is_die: rawMaterial?.is_die ? true : false,
      name_value: rawMaterial?.name_value ? rawMaterial.name_value : [],
    }));
  };

  const setAutoCompleteData = (data, key) => {
    delete error[key];
    setError((error) => ({
      ...error,
    }));
    if (data && data.value) {
      setFormState((formState) => ({
        ...formState,
        [key]: data.value,
      }));
    } else {
      delete formState[key];
      setFormState((formState) => ({
        ...formState,
      }));
    }
  };

  return (
    <>
      {alert}
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <FAB align={"start"} size={"small"} onClick={onBackClick}>
            <KeyboardArrowLeftIcon />
          </FAB>
        </GridItem>
        <GridItem xs={12} sm={12} md={8}>
          <Card>
            <CardHeader color="primary" className={classes.cardHeaderStyles}>
              <h4 className={classes.cardTitleWhite}>{props.header}</h4>
              <p className={classes.cardCategoryWhite}></p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Name"
                    disabled={isView}
                    name="name"
                    value={formState.name}
                    id="name"
                    autoComplete="off"
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
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <RawMaterialList
                    isView={isView}
                    ref={childRef}
                    handleSelectRawMaterial={handleSelectRawMaterial}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={4}>
                  <RemoteAutoComplete
                    setSelectedData={(data) =>
                      setAutoCompleteData(data, "category")
                    }
                    disabled={isView}
                    searchString={"name"}
                    apiName={backend_category}
                    placeholder="Select Category"
                    selectedValue={formState["category"]}
                    isError={hasError("category", error)}
                    errorText={
                      hasError("category", error)
                        ? error["category"].map((error) => {
                            return error + " ";
                          })
                        : ""
                    }
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                  <RemoteAutoComplete
                    setSelectedData={(data) =>
                      setAutoCompleteData(data, "department")
                    }
                    disabled={isView}
                    searchString={"name"}
                    apiName={backend_departments}
                    placeholder="Select Department"
                    selectedValue={formState["department"]}
                    isError={hasError("department", error)}
                    errorText={
                      hasError("department", error)
                        ? error["department"].map((error) => {
                            return error + " ";
                          })
                        : ""
                    }
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                  <RemoteAutoComplete
                    setSelectedData={(data) =>
                      setAutoCompleteData(data, "color")
                    }
                    disabled={isView}
                    searchString={"name"}
                    apiName={backend_color}
                    placeholder="Select Color"
                    selectedValue={formState["color"]}
                    isError={hasError("color", error)}
                    errorText={
                      hasError("color", error)
                        ? error["color"].map((error) => {
                            return error + " ";
                          })
                        : ""
                    }
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Size"
                    name="size"
                    disabled={isView}
                    value={formState.size}
                    id="size"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomAutoComplete
                    id="unit-name"
                    labelText="Unit"
                    autocompleteId={"unit-id"}
                    optionKey={"name"}
                    disabled={isView}
                    options={units}
                    onChange={(event, value) => {
                      handleChangeAutoComplete("unit", event, value);
                    }}
                    value={
                      units[
                        units.findIndex(function (item, i) {
                          return item.id === formState.unit;
                        })
                      ] || null
                    }
                    formControlProps={{
                      fullWidth: true,
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_unit"}
                    isHelperText={hasError("unit", error)}
                    helperText={
                      hasError("unit", error)
                        ? error["unit"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    error={hasError("unit", error)}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomCheckBox
                    onChange={(event) => {
                      setFormState((formState) => ({
                        ...formState,
                        is_die: event.target.checked,
                      }));
                    }}
                    disabled={isView}
                    labelText="Die"
                    name="is_die"
                    checked={formState.is_die || false}
                    id="is_die"
                  />
                </GridItem>
              </GridContainer>

              <GridContainer>
                <GridItem xs={12} sm={12} md={6}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    name="costing"
                    labelText="Costing"
                    id="costing"
                    disabled={isView}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    type="number"
                    value={formState.costing}
                    inputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {formState.unit_name !== ""
                            ? "/" + formState.unit_name
                            : ""}
                        </InputAdornment>
                      ),
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_costing"}
                    isHelperText={hasError("costing", error)}
                    helperText={
                      hasError("costing", error)
                        ? error["costing"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    error={hasError("costing", error)}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={6}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    name="balance"
                    type="number"
                    labelText={"Balance"}
                    id="balance"
                    disabled={isView}
                    value={formState.balance}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_balance"}
                    isHelperText={hasError("balance", error)}
                    helperText={
                      hasError("balance", error)
                        ? error["balance"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    error={hasError("balance", error)}
                  />
                </GridItem>
              </GridContainer>
              {isView ? null : (
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <FAB
                      color="primary"
                      size={"medium"}
                      variant="extended"
                      onClick={() => addNewValue()}
                    >
                      <AddIcon className={classes.extendedIcon} />
                      <h5>Add new value</h5>
                    </FAB>
                  </GridItem>
                </GridContainer>
              )}
              {formState.name_value.map((nv, key) => (
                <GridContainer key={key}>
                  <GridItem xs={12} sm={12} md={4}>
                    <CustomInput
                      labelText="Name"
                      id="name"
                      name="name"
                      disabled={isView}
                      value={formState.name_value[key].name || ""}
                      onChange={(event) =>
                        handleChangeRepeatableComponent(event, key)
                      }
                      formControlProps={{
                        fullWidth: true,
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={4}>
                    <CustomInput
                      labelText="Value"
                      id="value"
                      name="value"
                      disabled={isView}
                      onChange={(event) =>
                        handleChangeRepeatableComponent(event, key)
                      }
                      value={formState.name_value[key].value || ""}
                      formControlProps={{
                        fullWidth: true,
                      }}
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
                        onClick={() => {
                          setFormState((formState) => ({
                            ...formState,
                            name_value: [
                              ...formState.name_value.slice(0, key),
                              ...formState.name_value.slice(key + 1),
                            ],
                          }));
                        }}
                      >
                        <DeleteIcon />
                      </FAB>
                    </GridItem>
                  )}
                </GridContainer>
              ))}
            </CardBody>
            {isView ? (
              <CardFooter>
                <Button
                  color="primary"
                  onClick={(e) => {
                    history.push(EDITRAWMATERIALS + "/" + id);
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
    </>
  );
}
