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
  DialogBoxForSelectingRawMaterial,
  FAB,
  GridContainer,
  GridItem,
  RawMaterialDetail,
  SnackBarComponent,
  Table
} from "../../components";
import AddOutlinedIcon from "@material-ui/icons/AddOutlined";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
// core components
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { LISTREADYMATERIAL } from "../../paths";
import AddIcon from "@material-ui/icons/Add";
import { useEffect } from "react";
import { providerForPost, providerForPut } from "../../api";
import {
  backend_raw_material_and_quantity_for_ready_material,
  backend_ready_materials,
  backend_raw_material_and_quantity_for_ready_material_for_update_quantity,
  backend_raw_material_and_quantity_for_ready_material_for_delete_raw_materials,
  apiUrl,
  backend_ready_materials_change_color_dependency
} from "../../constants";
import { useState } from "react";
import { Backdrop, CircularProgress, Input } from "@material-ui/core";
import {
  checkEmpty,
  convertNumber,
  hasError,
  isEmptyString,
  setErrors
} from "../../Utils";
import validationForm from "./validationform.json";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import no_image_icon from "../../assets/img/no_image_icon.png";

const useStyles = makeStyles(styles);

export default function AddEditReadyMaterial(props) {
  const classes = useStyles();
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    ready_material: null,
    _sort: "updated_at:desc"
  });
  const history = useHistory();
  /** VIMP to check if the data is used for viewing */
  const [isView] = useState(
    props.location.state ? props.location.state.view : false
  );

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
    material_no: "",
    final_cost: 0,
    add_cost: 0,
    notes: "",
    final_cost_formatted: 0,
    total_quantity: 0,
    image: null,
    addNewImageUrl: null,
    showEditPreviewImage: false,
    showAddPreviewImage: true,
    isColorVariationAvailable: false
  });
  const [error, setError] = React.useState({});

  const columns = [
    {
      title: "Raw Material Id",
      field: "raw_material.id",
      editable: "never",
      sorting: false,
      render: rowData =>
        rowData.raw_material ? "# " + rowData.raw_material.id : "---"
    },
    {
      title: "Name",
      editable: "never",
      sorting: false,
      render: rowData => (rowData.name ? rowData.name : "---")
    },
    {
      title: "Die ? ",
      field: "is_die",
      editable: "never",
      sorting: false,
      render: rowData =>
        rowData.raw_material && rowData.raw_material.is_die ? "Yes" : "No"
    },
    {
      title: "Cost Per Raw Material",
      field: "costPerPiece",
      editable: "never",
      sorting: false,
      render: rowData =>
        rowData.costPerPiece + " / " + rowData.raw_material.unit
    },
    {
      title: "Quantity",
      field: "quantity",
      sorting: false,
      render: rowData => rowData.quantity,
      editComponent: props => (
        <CustomInput
          onChange={e => props.onChange(e.target.value)}
          type="number"
          labelText="Quantity"
          name="quantity"
          value={props.value}
          id="quantity"
          noMargin
          formControlProps={{
            fullWidth: true
          }}
        />
      )
    },
    {
      title: "Total Cost",
      field: "totalCost",
      editable: "never",
      sorting: false,
      render: rowData => convertNumber(rowData.totalCost, true)
    },
    {
      title: "Color Dependent",
      field: "isColorDependent",
      editable: "never",
      sorting: false,
      render: rowData => {
        return rowData.isColorDependent ? "true" : "false";
      }
    }

    // {
    //   title: "Price per unit",
    //   field: "raw_material.unit",
    //   sorting: false,
    //   render: rowData => (isEmptyString(rowData.size) ? "---" : rowData.size)
    // }
  ];

  const [
    openDialogForSelectingRawMaterial,
    setOpenDialogForSelectingRawMaterial
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
    let isImagePresent =
      data.images && data.images.length && data.images[0].url ? true : false;
    setFormState(formState => ({
      ...formState,
      material_no: data.material_no,
      total_quantity: data.total_quantity,
      add_cost: data.add_cost,
      final_cost: data.final_cost,
      final_cost_formatted: convertNumber(
        parseFloat(data.final_cost).toFixed(2),
        true
      ),
      id: data.id,
      notes: data.notes,
      image: isImagePresent ? data.images[0].url : null,
      showAddPreviewImage: isImagePresent ? false : true,
      showEditPreviewImage: isImagePresent ? true : false,
      isColorVariationAvailable: data.isColorVariationAvailable
    }));

    filter["ready_material"] = data.id;
    setFilter(filter => ({
      ...filter
    }));
    tableRef.current.onQueryChange();
  };

  const handleRemoveImage = () => {
    setFormState(formState => ({
      ...formState,
      image: null,
      showAddPreviewImage: true,
      showEditPreviewImage: false,
      addNewImageUrl: null
    }));
  };

  const handleChange = event => {
    let isValid = true;
    let final_cost = formState.final_cost;
    let val = 0;
    if (event.target.name === "add_cost") {
      if (parseFloat(event.target.value) < 0) {
        isValid = false;
      } else if (!isNaN(parseFloat(event.target.value))) {
        val = parseFloat(event.target.value);
      }
      let oldValue = formState.add_cost;
      final_cost = final_cost - oldValue;
      final_cost = final_cost + val;
      setFormState(formState => ({
        ...formState,
        final_cost: final_cost,
        add_cost: val,
        final_cost_formatted: convertNumber(final_cost.toFixed(2), true)
      }));
    }

    if (isValid) {
      delete error[event.target.name];
      setError(error => ({
        ...error
      }));
      setFormState(formState => ({
        ...formState,
        [event.target.name]: event.target.value
      }));
    }
  };

  const handleCheckValidation = event => {
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
      submit();
    }
  };

  const createFormData = body => {
    const data = new FormData();
    data.append("files.images", formState.image);
    data.append("data", JSON.stringify(body));
    return data;
  };

  const submit = async () => {
    let obj = {
      material_no: formState.material_no,
      total_quantity: formState.total_quantity,
      final_cost: isEmptyString(formState.final_cost)
        ? 0
        : formState.final_cost,
      add_cost: isEmptyString(formState.add_cost) ? 0 : formState.add_cost,
      notes: formState.notes,
      isColorVariationAvailable: formState.isColorVariationAvailable
    };

    if (
      formState.showAddPreviewImage &&
      formState.image &&
      formState.addNewImageUrl
    ) {
      obj = createFormData(obj);
    }

    if (formState.id) {
      await providerForPut(
        backend_ready_materials,
        formState.id,
        obj,
        Auth.getToken()
      )
        .then(res => {
          setSnackBar(snackBar => ({
            ...snackBar,
            show: true,
            severity: "success",
            message: "Ready Material Edited Successfully"
          }));
          setFormState(formState => ({
            ...formState,
            id: res.data.id
          }));
        })
        .catch(err => {
          let error = "";
          if (err.response.data.hasOwnProperty("message")) {
            error = err.response.data.message;
          } else {
            error = "Error Adding Raw Material";
          }
          setSnackBar(snackBar => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: error
          }));
        });
    } else {
      let setRef = tableRef.current;
      await providerForPost(backend_ready_materials, obj, Auth.getToken())
        .then(res => {
          setFilter(filter => ({
            ready_material: res.data.id,
            ...filter
          }));
          setFormState(formState => ({
            ...formState,
            id: res.data.id
          }));
          setRef.onQueryChange();
          setSnackBar(snackBar => ({
            ...snackBar,
            show: true,
            severity: "success",
            message: "Ready Material Added Successfully"
          }));
        })
        .catch(err => {
          setRef.onQueryChange();
          let error = "";
          if (err.response.data.hasOwnProperty("message")) {
            error = err.response.data.message;
          } else {
            error = "Error Adding Raw Material";
          }
          setSnackBar(snackBar => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: error
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

  const handleCloseDialogForRawMaterial = () => {
    setOpenDialogForSelectingRawMaterial(false);
  };

  const handleAcceptDialogForRawMaterial = async (val, obj) => {
    let setRef = tableRef.current;
    handleCloseDialogForRawMaterial();
    setBackDrop(true);
    if (formState.id) {
      let data = {
        ready_material: formState.id,
        raw_material: val.id,
        quantity: 0
      };
      await providerForPost(
        backend_raw_material_and_quantity_for_ready_material,
        data,
        Auth.getToken()
      )
        .then(res => {
          setBackDrop(false);
        })
        .catch(err => {
          let error = "";
          if (err.response.data.hasOwnProperty("message")) {
            error = err.response.data.message;
          } else {
            error = "Error Adding Raw Material";
          }
          setSnackBar(snackBar => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: error
          }));
          setBackDrop(false);
        });
      setRef.onQueryChange();
    } else {
      setBackDrop(false);
      setSnackBar(snackBar => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Ready Material Not added"
      }));
    }
  };

  const onBackClick = () => {
    history.push(LISTREADYMATERIAL);
  };

  const getRawMaterialsData = async (page, pageSize) => {
    let params = {
      page: page,
      pageSize: pageSize
    };

    Object.keys(filter).map(res => {
      if (!params.hasOwnProperty(res)) {
        params[res] = filter[res];
      }
    });

    return new Promise((resolve, reject) => {
      fetch(
        backend_raw_material_and_quantity_for_ready_material +
          "?" +
          new URLSearchParams(params),
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: "Bearer " + Auth.getToken()
          }
        }
      )
        .then(response => response.json())
        .then(result => {
          resolve({
            data: convertData(result.data, page),
            page: result.page - 1,
            totalCount: result.totalCount
          });
        });
    });
  };

  const convertData = (allData, page) => {
    let x = [];
    let count = 0;
    allData.map(data => {
      let raw_material = {
        id: "",
        name: "",
        color: "",
        size: "",
        unit: "",
        department: ""
      };
      let unit = data.raw_material.unit ? data.raw_material.unit.name : "--";
      let department = data.raw_material.department
        ? data.raw_material.department.name
        : "--";
      let color = data.raw_material.color ? data.raw_material.color.name : "";
      let category = data.raw_material.category
        ? data.raw_material.category.name
        : "";
      if (data.raw_material) {
        raw_material = {
          ...raw_material,
          id: data.raw_material.id,
          name: data.raw_material.name,
          category: category,
          color: color,
          size: data.raw_material.size,
          unit: unit,
          department: department,
          balance: data.raw_material.balance,
          is_die: data.raw_material.is_die
        };
      }
      let quantity = 0;
      let costPerPiece = 0;
      if (!isEmptyString(data.quantity)) {
        quantity = parseFloat(data.quantity);
      }
      if (!isEmptyString(data.raw_material.costing)) {
        costPerPiece = parseFloat(data.raw_material.costing);
      }
      let totalCost = quantity * costPerPiece;
      totalCost = totalCost.toFixed(2);

      let dataToSend = {
        dataId: data.id,
        isLatest: page === 1 && !count ? true : false,
        name: raw_material.name,
        raw_material: raw_material,
        quantity: isEmptyString(data.quantity) ? 0 : data.quantity,
        costPerPiece: isEmptyString(data.raw_material.costing)
          ? 0
          : data.raw_material.costing,
        totalCost: totalCost,
        isColorDependent: data.isColorDependent
      };
      count = count + 1;
      x.push(dataToSend);
    });
    return x;
  };

  const handleEditRawMaterial = () => {};

  const orderFunc = (columnId, direction) => {
    let orderByColumn;
    let orderBy = "";
    if (columnId >= 0) {
      orderByColumn = columns[columnId]["field"];
    }
    orderBy = orderByColumn + ":" + direction;
    setFilter(filter => ({
      ...filter,
      _sort: orderBy
    }));
    tableRef.current.onQueryChange();
  };

  const handleFileChange = event => {
    event.persist();
    if (event.target.files[0].size <= 1100000) {
      if (
        event.target.files[0].type === "image/png" ||
        event.target.files[0].type === "image/jpeg" ||
        event.target.files[0].type === "image/jpg"
      ) {
        setFormState(formState => ({
          ...formState,
          image: event.target.files[0],
          addNewImageUrl: URL.createObjectURL(event.target.files[0]),
          showAddPreviewImage: true,
          showEditPreviewImage: false
        }));
      } else {
        setFormState(formState => ({
          ...formState,
          alert: true,
          severity: "error",
          errorMessage: "Image should be in PNG,JPG,JPEG format"
        }));
      }
    } else {
      setFormState(formState => ({
        ...formState,
        alert: true,
        severity: "error",
        errorMessage: "File size must be less than or equal to 1mb"
      }));
    }
  };

  const handleChangeIsColorDependent = async row => {
    let setRef = tableRef.current;
    setBackDrop(true);
    let status = false;
    if (row.isColorDependent) {
      status = false;
    } else {
      status = true;
    }
    if (row.dataId) {
      let data = {
        status: status,
        id: row.dataId
      };
      await providerForPost(
        backend_ready_materials_change_color_dependency,
        data,
        Auth.getToken()
      )
        .then(res => {
          setBackDrop(false);
        })
        .catch(err => {
          let error = "";
          if (err.response.data.hasOwnProperty("message")) {
            error = err.response.data.message;
          } else {
            error = "Error Adding Changing Color Status";
          }
          setSnackBar(snackBar => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: error
          }));
          setBackDrop(false);
        });
      setRef.onQueryChange();
    } else {
      setBackDrop(false);
      setSnackBar(snackBar => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Error"
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
      {alert}
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <DialogBoxForSelectingRawMaterial
        handleCancel={handleCloseDialogForRawMaterial}
        handleClose={handleCloseDialogForRawMaterial}
        handleAddRawMaterial={handleAcceptDialogForRawMaterial}
        open={openDialogForSelectingRawMaterial}
      />

      <GridItem xs={12} sm={12} md={10}>
        <Card>
          <CardHeader color="primary" className={classes.cardHeaderStyles}>
            <h4 className={classes.cardTitleWhite}>{props.header}</h4>
            <p className={classes.cardCategoryWhite}></p>
          </CardHeader>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  onChange={event => handleChange(event)}
                  labelText="Material Number"
                  name="material_no"
                  disabled={isView}
                  value={formState.material_no}
                  id="material_no"
                  formControlProps={{
                    fullWidth: true
                  }}
                  /** For setting errors */
                  helperTextId={"helperText_material_no"}
                  isHelperText={hasError("material_no", error)}
                  helperText={
                    hasError("material_no", error)
                      ? error["material_no"].map(error => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("material_no", error)}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  labelText="Final Cost"
                  name="final_cost_formatted"
                  disabled
                  value={formState.final_cost_formatted}
                  id="final_cost_formatted"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  onChange={event => handleChange(event)}
                  type="number"
                  labelText="Additional Cost"
                  name="add_cost"
                  disabled={isView}
                  value={formState.add_cost}
                  id="add_cost"
                  formControlProps={{
                    fullWidth: true
                  }}
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
                  type="number"
                  labelText="Total Quantity"
                  name="total_quantity"
                  disabled={isView}
                  value={formState.total_quantity}
                  id="total_quantity"
                  formControlProps={{
                    fullWidth: true
                  }}
                  helperTextId={"helperText_total_quantity"}
                  isHelperText={hasError("total_quantity", error)}
                  helperText={
                    hasError("total_quantity", error)
                      ? error["total_quantity"].map(error => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("total_quantity", error)}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={3} md={3} className={classes.switchBox}>
                <div className={classes.block}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          formState.isColorVariationAvailable ? true : false
                        }
                        onChange={event => {
                          setFormState(formState => ({
                            ...formState,
                            isColorVariationAvailable: event.target.checked
                          }));
                        }}
                        disabled={isView}
                        classes={{
                          switchBase: classes.switchBase,
                          checked: classes.switchChecked,
                          thumb: classes.switchIcon,
                          track: classes.switchBar
                        }}
                      />
                    }
                    classes={{
                      label: classes.label
                    }}
                    label="Is Color Variation Available?"
                  />
                </div>
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} md={12} lg={12}>
                <div className={classes.imageDiv}>
                  {!formState.showEditPreviewImage &&
                  formState.showAddPreviewImage &&
                  formState.image ? (
                    <img
                      src={formState.addNewImageUrl}
                      alt="ready_material_photo"
                      style={{
                        height: "15rem",
                        width: "30rem"
                      }}
                      loader={<CircularProgress />}
                      className={classes.UploadImage}
                    />
                  ) : !formState.showEditPreviewImage &&
                    formState.showAddPreviewImage &&
                    !formState.image ? (
                    <img
                      src={no_image_icon}
                      alt="ready_material_photo"
                      style={{
                        height: "15rem",
                        width: "30rem"
                      }}
                      loader={<CircularProgress />}
                      className={classes.DefaultNoImage}
                    />
                  ) : formState.showEditPreviewImage && formState.image ? (
                    <>
                      <img
                        alt="ready_material_photo"
                        src={apiUrl + formState.image}
                        loader={<CircularProgress />}
                        style={{
                          height: "15rem",
                          width: "30rem"
                        }}
                        className={classes.UploadImage}
                      />
                    </>
                  ) : null}
                </div>
              </GridItem>
              {isView ? null : (
                <GridItem xs={12} md={12} lg={12}>
                  <Input
                    fullWidth
                    id={"ready_material_photo"}
                    name={"ready_material_photo"}
                    onClick={event => {
                      event.target.value = null;
                    }}
                    onChange={handleFileChange}
                    required
                    type={"file"}
                    inputProps={{ accept: "image/*" }}
                    variant="outlined"
                    className={classes.inputFile}
                  />
                  <GridContainer>
                    <GridItem xs={12} md={2} lg={2}>
                      <label htmlFor={"ready_material_photo"}>
                        <Button
                          variant="contained"
                          color="primary"
                          component="span"
                          startIcon={<AddOutlinedIcon />}
                        >
                          Add / Update Image{""}
                        </Button>
                      </label>
                    </GridItem>
                    {/* <GridItem xs={12} md={2} lg={2}>
                      <Button
                        variant="contained"
                        color="whiteColor"
                        component="span"
                        onClick={handleRemoveImage}
                      >
                        Remove Image
                      </Button>
                    </GridItem> */}
                  </GridContainer>
                </GridItem>
              )}
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
            {isView ? null : (
              <CardFooter>
                <Button color="primary" onClick={e => handleCheckValidation(e)}>
                  {formState.id ? "Save" : "Save and Add Raw Materials"}
                </Button>
              </CardFooter>
            )}
            {isView || !formState.id ? null : (
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <FAB
                    color="primary"
                    size={"medium"}
                    variant="extended"
                    onClick={() => {
                      setOpenDialogForSelectingRawMaterial(true);
                    }}
                  >
                    <AddIcon className={classes.extendedIcon} />
                    <h5>Add New Raw Material</h5>
                  </FAB>
                </GridItem>
              </GridContainer>
            )}
            <>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <div className={classes.typo1}>
                    <h5 className={classes.h5}>Raw Material List</h5>
                  </div>
                </GridItem>
              </GridContainer>

              {formState.id ? (
                <GridContainer>
                  <GridItem xs={12} sm={3} md={3} className={classes.switchBox}>
                    <div className={classes.block}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={
                              filter["raw_material.is_die"] ? true : false
                            }
                            onChange={event => {
                              if (event.target.checked) {
                                setFilter(filter => ({
                                  ...filter,
                                  "raw_material.is_die": event.target.checked
                                }));
                              } else {
                                delete filter["raw_material.is_die"];
                                setFilter(filter => ({
                                  ...filter
                                }));
                              }
                            }}
                            classes={{
                              switchBase: classes.switchBase,
                              checked: classes.switchChecked,
                              thumb: classes.switchIcon,
                              track: classes.switchBar
                            }}
                          />
                        }
                        classes={{
                          label: classes.label
                        }}
                        label="Search Only Die's"
                      />
                    </div>
                  </GridItem>
                  <GridItem xs={12} sm={3} md={3} className={classes.switchBox}>
                    <div className={classes.block}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={filter["isColorDependent"] ? true : false}
                            onChange={event => {
                              if (event.target.checked) {
                                setFilter(filter => ({
                                  ...filter,
                                  isColorDependent: event.target.checked
                                }));
                              } else {
                                delete filter["isColorDependent"];
                                setFilter(filter => ({
                                  ...filter
                                }));
                              }
                            }}
                            classes={{
                              switchBase: classes.switchBase,
                              checked: classes.switchChecked,
                              thumb: classes.switchIcon,
                              track: classes.switchBar
                            }}
                          />
                        }
                        classes={{
                          label: classes.label
                        }}
                        label="Search Color Dependent Raw Material"
                      />
                    </div>
                  </GridItem>
                  <GridItem xs={12} sm={3} md={3}>
                    <CustomInput
                      onChange={e => {
                        if (isEmptyString(e.target.value)) {
                          delete filter["raw_material.name_contains"];
                          setFilter(filter => ({
                            ...filter
                          }));
                        } else {
                          setFilter(filter => ({
                            ...filter,
                            "raw_material.name_contains": e.target.value
                          }));
                        }
                      }}
                      type="text"
                      labelText="Raw Material Name"
                      name="raw_material.name_contains"
                      noMargin
                      value={filter["raw_material.name_contains"]}
                      id="raw_material.name_contains"
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={4}>
                    <Button
                      color="primary"
                      onClick={() => {
                        tableRef.current.onQueryChange();
                      }}
                    >
                      Search
                    </Button>
                    <Button
                      color="primary"
                      onClick={() => {
                        delete filter["raw_material.is_die"];
                        delete filter["isColorDependent"];
                        delete filter["raw_material.name_contains"];
                        setFilter(filter => ({
                          ...filter
                        }));
                        tableRef.current.onQueryChange();
                      }}
                    >
                      Cancel
                    </Button>
                  </GridItem>
                </GridContainer>
              ) : null}
              <br />
              <Table
                tableRef={tableRef}
                title="Raw Materials"
                columns={columns}
                data={async query => {
                  return await getRawMaterialsData(
                    query.page + 1,
                    query.pageSize
                  );
                }}
                detailPanel={rowData => {
                  return (
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <RawMaterialDetail
                          raw_material={rowData.raw_material}
                        />
                      </GridItem>
                    </GridContainer>
                  );
                }}
                localization={{
                  body: {
                    editRow: {
                      deleteText: `Are you sure you want to delete this Raw Material?`,
                      saveTooltip: "Save"
                    }
                  }
                }}
                actions={
                  !isView
                    ? [
                        rowData => ({
                          icon: () =>
                            rowData.raw_material.color !== "" ? (
                              rowData.isColorDependent ? (
                                <ClearIcon color="error" />
                              ) : (
                                <CheckIcon />
                              )
                            ) : (
                              <CheckIcon color="disabled" />
                            ),
                          disabled:
                            !rowData.raw_material.color ||
                            rowData.raw_material.color === "",
                          tooltip:
                            rowData.raw_material.color !== ""
                              ? rowData.isColorDependent
                                ? "Uncheck if not color dependent"
                                : "Check if color dependent"
                              : "Cannot check as raw material doesn't have any color",
                          onClick: (event, rowData) =>
                            !rowData.raw_material.color ||
                            rowData.raw_material.color === ""
                              ? null
                              : handleChangeIsColorDependent(rowData)
                        })
                      ]
                    : null
                }
                editable={
                  isView
                    ? null
                    : {
                        onRowUpdate: (newData, oldData) =>
                          new Promise((resolve, reject) => {
                            setTimeout(async () => {
                              let num = parseFloat(newData.quantity);
                              let isError = false;
                              if (!isNaN(num)) {
                                if (num <= 0) {
                                  isError = true;
                                }
                              } else {
                                isError = true;
                              }
                              if (isError) {
                                setSnackBar(snackBar => ({
                                  ...snackBar,
                                  show: true,
                                  severity: "error",
                                  message:
                                    "Quantity should be a positive number"
                                }));
                              } else {
                                let obj = {
                                  id: newData.dataId,
                                  newQuantity: newData.quantity,
                                  oldQuantity: oldData.quantity,
                                  costPerPiece: newData.costPerPiece,
                                  ready_material: formState.id
                                };
                                await providerForPost(
                                  backend_raw_material_and_quantity_for_ready_material_for_update_quantity,
                                  obj,
                                  Auth.getToken()
                                )
                                  .then(res => {
                                    setFormState(formState => ({
                                      ...formState,
                                      final_cost: res.data.final_cost,
                                      final_cost_formatted: convertNumber(
                                        parseFloat(res.data.final_cost).toFixed(
                                          2
                                        ),
                                        true
                                      )
                                    }));
                                  })
                                  .catch(err => {
                                    setSnackBar(snackBar => ({
                                      ...snackBar,
                                      show: true,
                                      severity: "error",
                                      message:
                                        "Error updating quantity of " +
                                        oldData.name
                                    }));
                                  });
                              }
                              resolve();
                            }, 1000);
                          }),
                        onRowDelete: oldData =>
                          new Promise(resolve => {
                            setTimeout(async () => {
                              let body = {
                                id: oldData.dataId,
                                quantity: oldData.quantity,
                                costPerPiece: oldData.costPerPiece,
                                ready_material: formState.id
                              };
                              await providerForPost(
                                backend_raw_material_and_quantity_for_ready_material_for_delete_raw_materials,
                                body,
                                Auth.getToken()
                              )
                                .then(async res => {
                                  setSnackBar(snackBar => ({
                                    ...snackBar,
                                    show: true,
                                    severity: "success",
                                    message:
                                      "Successfully deleted " + oldData.name
                                  }));
                                  setFormState(formState => ({
                                    ...formState,
                                    final_cost: res.data.final_cost,
                                    final_cost_formatted: convertNumber(
                                      parseFloat(res.data.final_cost).toFixed(
                                        2
                                      ),
                                      true
                                    )
                                  }));
                                })
                                .catch(err => {
                                  setSnackBar(snackBar => ({
                                    ...snackBar,
                                    show: true,
                                    severity: "error",
                                    message: "Error deleting " + oldData.name
                                  }));
                                });
                              resolve();
                            }, 1000);
                          })
                      }
                }
                options={{
                  pageSizeOptions: [20],
                  pageSize: 20,
                  actionsColumnIndex: -1,
                  search: false,
                  sorting: true,
                  thirdSortClick: false,
                  headerStyle: {
                    fontFamily: "Montserrat",
                    fontWeight: 500,
                    color: "#8A8A97",
                    borderBottom: "solid #E0E0E0 2px",
                    fontSize: "1rem"
                  },
                  paginationStyle: {
                    justifyContent: "center"
                  },
                  rowStyle: rowData => ({
                    backgroundColor:
                      !isView && rowData.isLatest ? "#F3F3F3" : "#FFFFFF"
                  })
                }}
                onOrderChange={(orderedColumnId, orderDirection) => {
                  orderFunc(orderedColumnId, orderDirection);
                }}
              />
            </>
          </CardBody>
        </Card>
        <Backdrop className={classes.backdrop} open={openBackDrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </GridItem>
    </GridContainer>
  );
}
