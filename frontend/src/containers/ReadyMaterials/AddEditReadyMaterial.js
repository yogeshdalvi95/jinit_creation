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
  Table,
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
  backend_ready_materials_change_color_dependency,
  frontendServerUrl,
} from "../../constants";
import { useState } from "react";
import { Backdrop, CircularProgress, Input } from "@material-ui/core";
import {
  checkEmpty,
  convertNumber,
  hasError,
  isEmptyString,
  setErrors,
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
    _sort: "updated_at:desc",
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
    message: "",
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
    isColorVariationAvailable: false,
  });
  const [error, setError] = React.useState({});

  const columns = [
    {
      title: "Raw Material Id",
      field: "raw_material.id",
      editable: "never",
      sorting: false,
      render: (rowData) =>
        rowData.raw_material ? "# " + rowData.raw_material.id : "---",
    },
    {
      title: "Name",
      editable: "never",
      sorting: false,
      render: (rowData) => (rowData.name ? rowData.name : "---"),
    },
    {
      title: "Die ? ",
      field: "is_die",
      editable: "never",
      sorting: false,
      render: (rowData) =>
        rowData.raw_material && rowData.raw_material.is_die ? "Yes" : "No",
    },
    {
      title: "Cost Per Raw Material",
      field: "costPerPiece",
      editable: "never",
      sorting: false,
      render: (rowData) =>
        rowData.costPerPiece + " / " + rowData.raw_material.unit,
    },
    {
      title: "Quantity",
      field: "quantity",
      sorting: false,
      render: (rowData) => rowData.quantity,
      editComponent: (props) => (
        <CustomInput
          onChange={(e) => props.onChange(e.target.value)}
          type="number"
          labelText="Quantity"
          name="quantity"
          value={props.value}
          id="quantity"
          noMargin
          formControlProps={{
            fullWidth: true,
          }}
        />
      ),
    },
    {
      title: "Total Cost",
      field: "totalCost",
      editable: "never",
      sorting: false,
      render: (rowData) => convertNumber(rowData.totalCost, true),
    },
    {
      title: "Color Dependent",
      field: "isColorDependent",
      editable: "never",
      sorting: false,
      render: (rowData) => {
        return rowData.isColorDependent ? "true" : "false";
      },
    },

    // {
    //   title: "Price per unit",
    //   field: "raw_material.unit",
    //   sorting: false,
    //   render: rowData => (isEmptyString(rowData.size) ? "---" : rowData.size)
    // }
  ];

  const [
    openDialogForSelectingRawMaterial,
    setOpenDialogForSelectingRawMaterial,
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

  const setData = (data) => {
    let isImagePresent =
      data.images && data.images.length && data.images[0].url ? true : false;
    setFormState((formState) => ({
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
      isColorVariationAvailable: data.isColorVariationAvailable,
    }));

    filter["ready_material"] = data.id;
    setFilter((filter) => ({
      ...filter,
    }));
    tableRef.current.onQueryChange();
  };

  const handleRemoveImage = () => {
    setFormState((formState) => ({
      ...formState,
      image: null,
      showAddPreviewImage: true,
      showEditPreviewImage: false,
      addNewImageUrl: null,
    }));
  };

  const handleChange = (event) => {
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
      setFormState((formState) => ({
        ...formState,
        final_cost: final_cost,
        add_cost: val,
        final_cost_formatted: convertNumber(final_cost.toFixed(2), true),
      }));
    }

    if (isValid) {
      delete error[event.target.name];
      setError((error) => ({
        ...error,
      }));
      setFormState((formState) => ({
        ...formState,
        [event.target.name]: event.target.value,
      }));
    }
  };

  const handleCheckValidation = (event) => {
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

  const createFormData = (body) => {
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
      isColorVariationAvailable: formState.isColorVariationAvailable,
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
        .then((res) => {
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "success",
            message: "Ready Material Edited Successfully",
          }));
          setFormState((formState) => ({
            ...formState,
            id: res.data.id,
          }));
        })
        .catch((err) => {
          let error = "";
          if (err.response.data.hasOwnProperty("message")) {
            error = err.response.data.message;
          } else {
            error = "Error Adding Raw Material";
          }
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: error,
          }));
        });
    } else {
      let setRef = tableRef.current;
      await providerForPost(backend_ready_materials, obj, Auth.getToken())
        .then((res) => {
          setFilter((filter) => ({
            ready_material: res.data.id,
            ...filter,
          }));
          setFormState((formState) => ({
            ...formState,
            id: res.data.id,
          }));
          setRef.onQueryChange();
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "success",
            message: "Ready Material Added Successfully",
          }));
        })
        .catch((err) => {
          setRef.onQueryChange();
          let error = "";
          if (err.response.data.hasOwnProperty("message")) {
            error = err.response.data.message;
          } else {
            error = "Error Adding Raw Material";
          }
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: error,
          }));
        });
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
        quantity: 0,
      };
      await providerForPost(
        backend_raw_material_and_quantity_for_ready_material,
        data,
        Auth.getToken()
      )
        .then((res) => {
          setBackDrop(false);
        })
        .catch((err) => {
          let error = "";
          if (err.response.data.hasOwnProperty("message")) {
            error = err.response.data.message;
          } else {
            error = "Error Adding Raw Material";
          }
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: error,
          }));
          setBackDrop(false);
        });
      setRef.onQueryChange();
    } else {
      setBackDrop(false);
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Ready Material Not added",
      }));
    }
  };

  const onBackClick = () => {
    history.push(LISTREADYMATERIAL);
  };

  const getRawMaterialsData = async (page, pageSize) => {
    let params = {
      page: page,
      pageSize: pageSize,
    };

    Object.keys(filter).map((res) => {
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
            Authorization: "Bearer " + Auth.getToken(),
          },
        }
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            if (response.status === 403) {
              Auth.clearAppStorage();
              window.location.href = `${frontendServerUrl}/login`;
            } else {
              throw new Error("Something went wrong");
            }
          }
        })
        .then((result) => {
          resolve({
            data: convertData(result.data, page),
            page: result.page - 1,
            totalCount: result.totalCount,
          });
        })
        .catch((error) => {
          throw error;
        });
    });
  };

  const convertData = (allData, page) => {
    let x = [];
    let count = 0;
    allData.map((data) => {
      let raw_material = {
        id: "",
        name: "",
        color: "",
        size: "",
        unit: "",
        department: "",
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
          is_die: data.raw_material.is_die,
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
        isColorDependent: data.isColorDependent,
      };
      count = count + 1;
      x.push(dataToSend);
    });
    return x;
  };

  const handleFileChange = async (event) => {
    event.persist();
    if (
      event.target.files[0].type === "image/png" ||
      event.target.files[0].type === "image/jpeg" ||
      event.target.files[0].type === "image/jpg"
    ) {
      let file = event.target.files[0];
      let imagePreview = URL.createObjectURL(event.target.files[0]);
      if (event.target.files[0].size <= 1100000) {
        imagePreview = URL.createObjectURL(event.target.files[0]);
      } else {
        setBackDrop(true);
        imagePreview = await resizeImage(event.target.files[0]);
        setBackDrop(false);
        imagePreview = imagePreview.data.link;
      }
      setFormState((formState) => ({
        ...formState,
        image: file,
        addNewImageUrl: imagePreview,
        showAddPreviewImage: true,
        showEditPreviewImage: false,
      }));
    } else {
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Image should be in PNG,JPG,JPEG format",
      }));
    }
  };

  const resizeImage = async (file) =>
    new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      let img = new Image();
      reader.onload = function (e) {
        img.src = this.result;
      };
      img.onload = function () {
        // Zoom the canvas needed for the image (you can also define the canvas tag directly in the DOM
        // so that the compressed image can be directly displayed without going to base64)
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");

        // image original size
        var originWidth = this.width;
        var originHeight = this.height;

        // Maximum size limit, you can achieve image compression by setting the width and height
        var maxWidth = 400,
          maxHeight = 500;
        // target size
        var targetWidth = originWidth,
          targetHeight = originHeight;
        // Image size exceeds 300x300 limit
        if (originWidth > maxWidth || originHeight > maxHeight) {
          if (originWidth / originHeight > maxWidth / maxHeight) {
            // wider, size limited by width
            targetWidth = maxWidth;
            targetHeight = Math.round(maxWidth * (originHeight / originWidth));
          } else {
            targetHeight = maxHeight;
            targetWidth = Math.round(maxHeight * (originWidth / originHeight));
          }
        }
        // canvas scales the image
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        // clear the canvas
        context.clearRect(0, 0, targetWidth, targetHeight);
        // Image Compression
        context.drawImage(img, 0, 0, targetWidth, targetHeight);
        // The first parameter is the created img object; the second three parameters are the upper left corner coordinates
        // and the second two are the canvas area width and height

        // compressed image to base64 url
        /*canvas.toDataURL(mimeType, qualityArgument), mimeType The default value is 'image/png';
         * qualityArgument indicates the quality of the exported image. This parameter is valid only when exported to jpeg and webp formats. The default value is 0.92*/
        var newUrl = canvas.toDataURL("image/jpeg", 0.3); //base64 format

        resolve({
          data: {
            link: newUrl,
          },
        });
      };
    });

  const handleChangeIsColorDependent = async (row) => {
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
        id: row.dataId,
      };
      await providerForPost(
        backend_ready_materials_change_color_dependency,
        data,
        Auth.getToken()
      )
        .then((res) => {
          setBackDrop(false);
        })
        .catch((err) => {
          let error = "";
          if (err.response.data.hasOwnProperty("message")) {
            error = err.response.data.message;
          } else {
            error = "Error Adding Changing Color Status";
          }
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: error,
          }));
          setBackDrop(false);
        });
      setRef.onQueryChange();
    } else {
      setBackDrop(false);
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Error",
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
                  onChange={(event) => handleChange(event)}
                  labelText="Material Number"
                  name="material_no"
                  disabled={isView}
                  value={formState.material_no}
                  id="material_no"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  /** For setting errors */
                  helperTextId={"helperText_material_no"}
                  isHelperText={hasError("material_no", error)}
                  helperText={
                    hasError("material_no", error)
                      ? error["material_no"].map((error) => {
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
                    fullWidth: true,
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  onChange={(event) => handleChange(event)}
                  type="number"
                  labelText="Additional Cost"
                  name="add_cost"
                  disabled={isView}
                  value={formState.add_cost}
                  id="add_cost"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  helperTextId={"helperText_add_cost"}
                  isHelperText={hasError("add_cost", error)}
                  helperText={
                    hasError("add_cost", error)
                      ? error["add_cost"].map((error) => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("add_cost", error)}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  onChange={(event) => handleChange(event)}
                  type="number"
                  labelText="Total Quantity"
                  name="total_quantity"
                  disabled={isView}
                  value={formState.total_quantity}
                  id="total_quantity"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  helperTextId={"helperText_total_quantity"}
                  isHelperText={hasError("total_quantity", error)}
                  helperText={
                    hasError("total_quantity", error)
                      ? error["total_quantity"].map((error) => {
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
                        onChange={(event) => {
                          setFormState((formState) => ({
                            ...formState,
                            isColorVariationAvailable: event.target.checked,
                          }));
                        }}
                        disabled={isView}
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
                        width: "30rem",
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
                        width: "30rem",
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
                          width: "30rem",
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
                    onClick={(event) => {
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
            {isView ? null : (
              <CardFooter>
                <Button
                  color="primary"
                  onClick={(e) => handleCheckValidation(e)}
                >
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
              <br />
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
