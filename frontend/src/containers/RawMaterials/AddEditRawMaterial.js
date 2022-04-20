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
  CustomAutoComplete,
  CustomCheckBox,
  CustomInput,
  DialogForSelectingCategory,
  DialogForSelectingColor,
  FAB,
  GridContainer,
  GridItem,
  RawMaterialList,
  SnackBarComponent,
} from "../../components";
// core components
import AsyncCreatableSelect from "react-select/async-creatable";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { RAWMATERIALSVIEW } from "../../paths";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import { useEffect } from "react";
import { providerForGet, providerForPost, providerForPut } from "../../api";
import {
  backend_departments,
  backend_raw_materials,
  backend_units,
} from "../../constants";
import { useState } from "react";
import {
  Backdrop,
  CircularProgress,
  FormHelperText,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@material-ui/core";
import { checkEmpty, hasError, isEmptyString, setErrors } from "../../Utils";
import SweetAlert from "react-bootstrap-sweetalert";
import classNames from "classnames";
import buttonStyles from "../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import validationForm from "./form/RawMaterialvalidation.json";
import SearchBar from "material-ui-search-bar";
import { BehaviorSubject, of, merge, throwError } from "rxjs";
import {
  debounceTime,
  map,
  distinctUntilChanged,
  filter,
  switchMap,
  catchError,
} from "rxjs/operators";

// import { SearchService } from "../../Utils/SearchService";

// const searchService = new SearchService();

const useStyles = makeStyles(styles);
const buttonUseStyles = makeStyles(buttonStyles);

export default function AddEditRawMaterial(props) {
  const classes = useStyles();
  const [alert, setAlert] = useState(null);
  const history = useHistory();
  const [departments, setDepartments] = useState([]);
  /** RXJS */
  const [state, setState] = useState({
    data: {
      data: [],
    },
    loading: false,
    errorMessage: "",
    noResults: false,
  });
  const [subject, setSubject] = useState(null);
  const [units, setUnits] = useState([]);
  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    id: null,
    name: "",
    color: null,
    category: null,
    colorName: "",
    categoryName: "",
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
  const [
    openDialogForSelectingCategory,
    setOpenDialogForSelectingCategory,
  ] = useState(false);
  const [
    openDialogForSelectingColor,
    setOpenDialogForSelectingColor,
  ] = useState(false);

  /** VIMP to check if the data is used for viewing */
  const [isView] = useState(
    props.location.state ? props.location.state.view : false
  );

  /** VIMP to check if the data is used for editing */
  const [isEdit] = useState(
    props.location.state ? props.location.state.edit : false
  );

  useEffect(() => {
    if (subject === null) {
      const sub = new BehaviorSubject("");
      setSubject(sub);
    } else {
      const observable = subject
        .pipe(
          map((s) => s.trim()),
          distinctUntilChanged(),
          filter((s) => s.length >= 2),
          debounceTime(200),
          switchMap((term) => {
            let params = {
              page: 1,
              pageSize: 20,
              name_contains: term,
            };
            return merge(
              of({ loading: true, errorMessage: "", noResults: false }),
              fetch(backend_raw_materials + "?" + new URLSearchParams(params), {
                method: "GET",
                headers: {
                  "content-type": "application/json",
                  Authorization: "Bearer " + Auth.getToken(),
                },
              }).then((response) => {
                if (response.ok) {
                  return response.json().then((data) => ({
                    data,
                    loading: false,
                    noResults: data.length === 0,
                  }));
                }
                return response.json().then((data) => ({
                  data: [],
                  loading: false,
                  errorMessage: data.title,
                }));
              })
            );
          }),
          catchError((e) => ({
            loading: false,
            errorMessage: "An application error occured",
          }))
        )
        .subscribe((newState) => {
          setState((s) => Object.assign({}, s, newState));
        });

      return () => {
        observable.unsubscribe();
        subject.unsubscribe();
      };
    }
  }, [subject]);

  useEffect(() => {
    if (
      props.location.state &&
      (props.location.state.view || props.location.state.edit) &&
      props.location.state.data
    ) {
      setData(props.location.state.data);
    }
    getDepartmentData();
    getUnits();
  }, []);

  const setData = (data) => {
    setFormState((formState) => ({
      ...formState,
      id: data.id,
      name: data.name,
      color: data.color ? data.color.id : null,
      category: data.category ? data.category.id : null,
      colorName: data.color ? data.color.name : "",
      categoryName: data.category ? data.category.name : "",
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

  const getDepartmentData = async () => {
    setBackDrop(true);
    await providerForGet(
      backend_departments,
      {
        pageSize: -1,
      },
      Auth.getToken()
    )
      .then((res) => {
        setDepartments(res.data.data);
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

  useEffect(() => {
    if (isEmptyString(formState.name)) {
      setState({
        data: {
          data: [],
        },
        loading: false,
        errorMessage: "",
        noResults: false,
      });
    }
  }, [formState.name]);

  const handleChange = (event) => {
    delete error[event.target.name];
    setError((error) => ({
      ...error,
    }));
    setFormState((formState) => ({
      ...formState,
      [event.target.name]: event.target.value,
    }));
    if (isEmptyString(event.target.value)) {
      setState({
        data: {
          data: [],
        },
        loading: false,
        errorMessage: "",
        noResults: false,
      });
    } else {
      if (subject) {
        return subject.next(event.target.value);
      }
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

  const handleCloseDialogForCategory = () => {
    setOpenDialogForSelectingCategory(false);
  };

  const handleCloseDialogForColor = () => {
    setOpenDialogForSelectingColor(false);
  };

  const handleAddColor = (row) => {
    handleCloseDialogForColor();
    setFormState((formState) => ({
      ...formState,
      color: row.id,
      colorName: row.name,
    }));
  };

  const handleAddCategory = (row) => {
    delete error["category"];
    setError((error) => ({
      ...error,
    }));
    handleCloseDialogForCategory();
    setFormState((formState) => ({
      ...formState,
      category: row.id,
      categoryName: row.name,
    }));
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
    setState({
      data: {
        data: [],
      },
      loading: false,
      errorMessage: "",
      noResults: false,
    });
    setFormState((formState) => ({
      ...formState,
      color: rawMaterial?.color?.id ? rawMaterial.color.id : null,
      category: rawMaterial?.category?.id ? rawMaterial.category.id : null,
      colorName: rawMaterial?.color?.name ? rawMaterial.color.name : "",
      categoryName: rawMaterial?.category?.name
        ? rawMaterial.category.name
        : null,
      size: rawMaterial?.size ? rawMaterial.size : "--",
      balance: 0,
      costing: rawMaterial?.costing ? rawMaterial.costing : 0,
      department: rawMaterial?.department?.id
        ? rawMaterial.department.id
        : null,
      unit: rawMaterial?.unit?.id ? rawMaterial.unit.id : null,
      unit_name: "",
      is_die: rawMaterial?.is_die ? true : false,
      name_value: rawMaterial?.name_value ? rawMaterial.name_value : [],
    }));
  };

  const filterData = (data) => {
    return data.map((d) => ({
      label: d.name,
      value: d.id,
    }));
  };

  const getRawMaterialsData = (inputValue) => {
    let params = {
      page: 1,
      pageSize: 20,
      name_contains: inputValue,
    };

    return new Promise((resolve, reject) => {
      fetch(backend_raw_materials + "?" + new URLSearchParams(params), {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + Auth.getToken(),
        },
      })
        .then((response) => response.json())
        .then((result) => {
          //console.log((result.data)
          resolve(filterData(result.data));
        });
    });
  };

  const handleChange1 = (newValue, actionMeta) => {
    console.group("Value Changed");
    console.log(newValue);
    console.log(`action: ${actionMeta.action}`);
    console.groupEnd();
  };
  const handleInputChange = (inputValue, actionMeta) => {
    console.group("Input Changed");
    console.log(inputValue);
    console.log(`action: ${actionMeta.action}`);
    console.groupEnd();
    setFormState((formState) => ({
      ...formState,
      name: inputValue,
    }));
  };

  console.log(formState);

  return (
    <>
      <DialogForSelectingCategory
        handleCancel={handleCloseDialogForCategory}
        handleClose={handleCloseDialogForCategory}
        handleAddCategory={handleAddCategory}
        open={openDialogForSelectingCategory}
      />
      <DialogForSelectingColor
        handleCancel={handleCloseDialogForColor}
        handleClose={handleCloseDialogForColor}
        handleAddColor={handleAddColor}
        open={openDialogForSelectingColor}
      />
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
                  <AsyncCreatableSelect
                    cacheOptions
                    loadOptions={getRawMaterialsData}
                    onChange={handleChange1}
                    onInputChange={handleInputChange}
                    // onChange={this.handleChange}
                    // onInputChange={(event) =>  setFormState((formState) => ({
                    //   ...formState,
                    //   name: event
                    // }))}
                    inputValue={formState.name}
                    value={formState.name}
                  />
                </GridItem>
              </GridContainer>

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
              {state.data && state.data.data && state.data.data.length ? (
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <RawMaterialList
                      data={state.data.data}
                      handleSelectRawMaterial={handleSelectRawMaterial}
                    />
                  </GridItem>
                </GridContainer>
              ) : (
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    No data
                  </GridItem>
                </GridContainer>
              )}
              <GridContainer>
                <GridItem
                  xs={12}
                  sm={12}
                  md={5}
                  style={{
                    margin: "27px 10px 0px 13px",
                  }}
                >
                  <GridContainer
                    style={{
                      border: "1px solid #C0C0C0",
                      borderRadius: "10px",
                    }}
                  >
                    <GridItem
                      xs={12}
                      sm={12}
                      md={8}
                      style={{
                        margin: "15px 0px 0px",
                      }}
                    >
                      <GridContainer style={{ dispay: "flex" }}>
                        <GridItem xs={12} sm={12} md={12}>
                          <b>Category : </b> {formState.categoryName}
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={1}>
                      <Tooltip
                        title={
                          formState.category
                            ? "Change Category "
                            : "Select Category"
                        }
                      >
                        <IconButton
                          onClick={() => {
                            setOpenDialogForSelectingCategory(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={1}>
                      <IconButton
                        onClick={() => {
                          delete error["category"];
                          setError((error) => ({
                            ...error,
                          }));
                          setFormState((formState) => ({
                            ...formState,
                            category: null,
                            categoryName: "",
                          }));
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </GridItem>
                  </GridContainer>
                  <GridContainer>
                    <GridItem>
                      {hasError("category", error) ? (
                        <GridItem xs={12} sm={12} md={12}>
                          <FormHelperText
                            id={"category_helpertext_id"}
                            error={hasError("category", error)}
                          >
                            {hasError("category", error)
                              ? error["category"].map((error) => {
                                  return error + " ";
                                })
                              : null}
                          </FormHelperText>
                        </GridItem>
                      ) : null}
                    </GridItem>
                  </GridContainer>
                </GridItem>
                <GridItem xs={12} sm={12} md={1}></GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={5}
                  style={{
                    margin: "27px 0px 0px",
                  }}
                >
                  <GridContainer
                    style={{
                      border: "1px solid #C0C0C0",
                      borderRadius: "10px",
                    }}
                  >
                    <GridItem
                      xs={12}
                      sm={12}
                      md={8}
                      style={{
                        margin: "15px 0px 0px",
                      }}
                    >
                      <GridContainer style={{ dispay: "flex" }}>
                        <GridItem xs={12} sm={12} md={12}>
                          <b>Color : </b> {formState.colorName}
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={1}>
                      <Tooltip
                        title={
                          formState.category ? "Change Color " : "Select Color"
                        }
                      >
                        <IconButton
                          onClick={() => {
                            setOpenDialogForSelectingColor(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={1}>
                      <IconButton
                        onClick={() => {
                          setFormState((formState) => ({
                            ...formState,
                            color: null,
                            colorName: "",
                          }));
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </GridItem>
                  </GridContainer>
                  <GridContainer>
                    <GridItem>
                      {hasError("color", error) ? (
                        <GridItem xs={12} sm={12} md={12}>
                          <FormHelperText
                            id={"color_helpertext_id"}
                            error={hasError("color", error)}
                          >
                            {hasError("color", error)
                              ? error["color"].map((error) => {
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
                  <CustomAutoComplete
                    id="department-name"
                    labelText="Department"
                    disabled={isView}
                    autocompleteId={"department"}
                    optionKey={"name"}
                    options={departments}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    onChange={(event, value) => {
                      handleChangeAutoComplete("department", event, value);
                    }}
                    value={
                      departments[
                        departments.findIndex(function (item, i) {
                          return item.id === formState.department;
                        })
                      ] || null
                    }
                    /** For setting errors */
                    helperTextId={"helperText_department"}
                    isHelperText={hasError("department", error)}
                    helperText={
                      hasError("department", error)
                        ? error["department"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    error={hasError("department", error)}
                  />
                </GridItem>
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
            {isView ? null : (
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
