import React from "react";
import { useEffect } from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  CustomInput,
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent,
  MultiSelect,
} from "../../components";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
// core components

import {
  DESIGNS,
  EDITDESIGN,
  NOTFOUNDPAGE,
  SELECTRAWMATERIALS,
} from "../../paths";
import { providerForGet, providerForPost, providerForPut } from "../../api";
import { apiUrl, backend_color, backend_designs } from "../../constants";
import { useState } from "react";
import { Backdrop, CircularProgress, Grid, Input } from "@material-ui/core";
import { checkEmpty, hasError, isEmptyString, setErrors } from "../../Utils";
import validationForm from "./validationform.json";
import no_image_icon from "../../assets/img/no_image_icon.png";

const useStyles = makeStyles(styles);

export default function AddEditDesign(props) {
  const classes = useStyles();
  const history = useHistory();
  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [id, setId] = useState(props.id ? props.id : null);
  const [color, setColor] = useState([]);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    material_no: "",
    add_price: 0,
    notes: "",
    material_price: 0,
    colors: [],
    image: null,
    addNewImageUrl: null,
    showEditPreviewImage: false,
    showAddPreviewImage: true,
    color_price: [],
  });
  const [error, setError] = React.useState({});

  /** Use effect check if the data is for viewing or editing */
  useEffect(() => {
    if ((isEdit || isView) && id) {
      getEditViewData(id);
    }
    getColorList();
  }, []);

  const getColorList = async () => {
    setBackDrop(true);
    await providerForGet(backend_color, { pageSize: "-1" }, Auth.getToken())
      .then((res) => {
        setColor(res.data.data);
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
      });
  };

  const getEditViewData = async (id) => {
    setBackDrop(true);
    let isError = false;
    await providerForGet(backend_designs + "/" + id, {}, Auth.getToken())
      .then((res) => {
        if (res.status === 200) {
          convertData(res.data);
        } else {
          isError = true;
        }
      })
      .catch((err) => {
        setBackDrop(false);
        isError = true;
      });
    if (isError) {
      history.push(NOTFOUNDPAGE);
    }
  };

  /** Gets data for viewing and editing */
  const convertData = (data) => {
    let isImagePresent =
      data.images && data.images.length && data.images[0].url ? true : false;
    setFormState((formState) => ({
      ...formState,
      material_no: data.material_no,
      add_price: data.add_price,
      id: data.id,
      notes: data.notes,
      material_price: data.material_price,
      colors: data.colors,
      image: isImagePresent ? data.images[0].url : null,
      showAddPreviewImage: isImagePresent ? false : true,
      showEditPreviewImage: isImagePresent ? true : false,
      isColorVariationAvailable: data.isColorVariationAvailable,
      color_price: data.color_price,
    }));
  };

  const handleChange = (event) => {
    let isValid = true;
    if (event.target.name === "add_price") {
      if (
        isNaN(parseFloat(event.target.value)) ||
        (!isNaN(parseFloat(event.target.value)) &&
          parseFloat(event.target.value) < 0)
      ) {
        isValid = false;
        setError((error) => ({
          ...error,
          add_price: [
            "Additional price should be a number and cannot be negative",
          ],
        }));
      }
    }

    setFormState((formState) => ({
      ...formState,
      [event.target.name]: event.target.value,
    }));

    if (isValid) {
      delete error[event.target.name];
      setError((error) => ({
        ...error,
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
      total_price: isEmptyString(formState.total_price)
        ? 0
        : formState.total_price,
      add_price: isEmptyString(formState.add_price) ? 0 : formState.add_price,
      material_price: isEmptyString(formState.material_price)
        ? 0
        : formState.material_price,
      notes: formState.notes,
      colors: formState.colors,
    };

    // let colors = [...obj.colors];
    // let colorPrice = [...obj.color_price];

    // let colorArray = colors.map((element) => element.id);
    // let colorPriceArray = colorPrice.map((element) => element.color.id);
    // let noOfColorsNewlyAdded = colorArray.filter(
    //   (x) => !colorPriceArray.includes(x)
    // );
    // let noOfColorsRemoved = colorPriceArray.filter(
    //   (x) => !colorArray.includes(x)
    // );

    // obj = {
    //   ...obj,
    //   noOfColorsNewlyAdded: noOfColorsNewlyAdded,
    //   noOfColorsRemoved: noOfColorsRemoved,
    // };

    if (
      formState.showAddPreviewImage &&
      formState.image &&
      formState.addNewImageUrl
    ) {
      obj = createFormData(obj);
    }

    if (id) {
      await providerForPut(backend_designs, id, obj, Auth.getToken())
        .then((res) => {
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "success",
            message: "Design Edited Successfully",
          }));
          setId(id);
          getEditViewData(id);
          setBackDrop(false);
        })
        .catch((err) => {
          setBackDrop(false);
          let error = "";
          if (err.response.data.hasOwnProperty("message")) {
            error = err.response.data.message;
          } else {
            error = "Error Adding Design";
          }
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: error,
          }));
        });
    } else {
      await providerForPost(backend_designs, obj, Auth.getToken())
        .then((res) => {
          setId(res.data.id);
          getEditViewData(res.data.id);
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "success",
            message: "Design Added Successfully",
          }));
          setBackDrop(false);
        })
        .catch((err) => {
          setBackDrop(false);
          let error = "";
          if (err.response.data.hasOwnProperty("message")) {
            error = err.response.data.message;
          } else {
            error = "Error Adding Design";
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

  const onBackClick = () => {
    history.push(DESIGNS);
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

  const handleRemoveImage = (e) => {
    setFormState((formState) => ({
      ...formState,
      image: null,
      showAddPreviewImage: true,
      showEditPreviewImage: false,
      addNewImageUrl: null,
    }));
  };

  const handleChangeColor = (event, newValue) => {
    setFormState((formState) => ({
      ...formState,
      colors: newValue,
    }));
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

      <GridItem xs={12} sm={12} md={10}>
        <Card>
          <CardHeader color="primary" className={classes.cardHeaderStyles}>
            <h4 className={classes.cardTitleWhite}>{props.header}</h4>
            <p className={classes.cardCategoryWhite}></p>
          </CardHeader>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} md={12} lg={12} style={{ overflowX: "auto" }}>
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

                  <label htmlFor={"ready_material_photo"}>
                    <Button
                      component="span"
                      className={
                        formState.image
                          ? classes.editIconOnImage
                          : classes.addIconOnImage
                      }
                    >
                      {formState.image ? (
                        <EditIcon fontSize="small" />
                      ) : (
                        <AddIcon fontSize="small" />
                      )}
                    </Button>
                  </label>
                  {formState.image && (
                    <label htmlFor={""}>
                      <Button
                        component="span"
                        className={classes.deleteIconOnImage}
                        onClick={(e) => handleRemoveImage(e)}
                      >
                        <DeleteOutline fontSize="small" />
                      </Button>
                    </label>
                  )}
                </div>
              </GridItem>
              {isView ? null : <GridItem xs={12} md={12} lg={12}></GridItem>}
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  onChange={(event) => handleChange(event)}
                  labelText="Material / Design Number"
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
                  onChange={(event) => handleChange(event)}
                  type="number"
                  labelText="Additional Price"
                  name="add_price"
                  disabled={isView}
                  value={formState.add_price}
                  id="add_price"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  helperTextId={"helperText_add_price"}
                  isHelperText={hasError("add_price", error)}
                  helperText={
                    hasError("add_price", error)
                      ? error["add_price"].map((error) => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("add_price", error)}
                />
              </GridItem>
              {/* <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  labelText="Common Material Price"
                  name="material_price"
                  disabled
                  value={formState.material_price}
                  id="material_price"
                  formControlProps={{
                    fullWidth: true,
                  }}
                />
              </GridItem> */}
              {/* <GridItem xs={12} sm={12} md={3}>
                <CustomInput
                  labelText="Total Price"
                  name="total_price"
                  disabled
                  value={parseFloat(formState.material_price) + parseFloat()}
                  id="total_price"
                  formControlProps={{
                    fullWidth: true,
                  }}
                />
              </GridItem> */}
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={6} md={6}>
                <MultiSelect
                  disabled={isView}
                  options={color}
                  selected={formState.colors}
                  handleChange={handleChangeColor}
                  name="Select Color"
                  optionKey="name"
                  /** For setting errors */
                  helperTextId={"helperText_colors"}
                  isHelperText={hasError("colors", error)}
                  helperText={
                    hasError("colors", error)
                      ? error["colors"].map((error) => {
                          return error + " ";
                        })
                      : null
                  }
                  error={hasError("colors", error)}
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
              <GridContainer>
                <Grid item>
                  <Button
                    color="primary"
                    onClick={(e) => handleCheckValidation(e)}
                  >
                    {id ? "Save" : "Save and Add Materials"}
                  </Button>
                </Grid>

                {isEdit && id && (
                  <>
                    <Grid item>
                      <Button
                        color="primary"
                        onClick={(e) => {
                          history.push({
                            pathname: `${EDITDESIGN}${SELECTRAWMATERIALS}/${id}`,
                          });
                        }}
                      >
                        Select Raw Material
                      </Button>
                    </Grid>
                    {/* <Grid item>
                      <Button
                        color="primary"
                        onClick={(e) => {
                          history.push({
                            pathname: `${EDITDESIGN}${SELECTREADYMATERIALS}/${id}`,
                          });
                        }}
                      >
                        Select Ready Material
                      </Button>
                    </Grid> */}
                  </>
                )}
              </GridContainer>
            )}
          </CardBody>
        </Card>
        <Backdrop className={classes.backdrop} open={openBackDrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </GridItem>
    </GridContainer>
  );
}
