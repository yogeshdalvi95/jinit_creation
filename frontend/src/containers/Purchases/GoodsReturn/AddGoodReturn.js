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
  CustomDropDown,
  CustomInput,
  DatePicker,
  DialogBox,
  DialogBoxForSelectingRawMaterial,
  DialogForSelectingPurchase,
  DialogForSelectingSeller,
  FAB,
  GridContainer,
  GridItem,
  RawMaterialDetail,
  SellerDetails,
  SnackBarComponent,
} from "../../../components";
import moment from "moment";
import SweetAlert from "react-bootstrap-sweetalert";
import validationForm from "../form/GoodsReturn.json";

// core components
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { GOODRETURNLIST, VIEWPURCHASES } from "../../../paths";
import { useEffect } from "react";
import { providerForGet, providerForPost, providerForPut } from "../../../api";
import { useState } from "react";
import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Switch,
} from "@material-ui/core";
import {
  checkEmpty,
  hasError,
  setErrors,
  validateNumber,
} from "../../../Utils";
import buttonStyles from "../../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import classNames from "classnames";
import {
  backend_goods_return,
  backend_purchases,
  backend_raw_materials,
  backend_sellers,
  frontendServerUrl,
} from "../../../constants";
import auth from "../../../components/Auth";

const buttonUseStyles = makeStyles(buttonStyles);

const useStyles = makeStyles(styles);

export default function AddGoodReturn(props) {
  const classes = useStyles();
  const buttonClasses = buttonUseStyles();
  const history = useHistory();
  const [error, setError] = React.useState({});
  const [alert, setAlert] = useState(null);
  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [id] = useState(props.id ? props.id : null);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    quantity: 0,
    notes: "",
    date: new Date(),
    total_price: 0,
    price_per_piece: 0,
    kachha_ledger: true,
    pakka_ledger: false,
    selected: "purchase",
  });

  const [rawMaterialData, setRawMaterialData] = useState(null);
  const [seller, setSeller] = useState(null);
  const [purchase, setPurchase] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [
    openDialogForSelectingRawMaterial,
    setOpenDialogForSelectingRawMaterial,
  ] = useState(false);
  const [openDialogForSelectingSeller, setOpenDialogForSelectingSeller] =
    useState(false);
  const [openDialogForSelectingPurchase, setOpenDialogForSelectingPurchase] =
    useState(false);

  useEffect(() => {
    const getGoodsReturnData = async () => {
      setBackDrop(true);
      console.log("id =>", id);
      await providerForGet(backend_goods_return + "/" + id, {}, Auth.getToken())
        .then((res) => {
          if (res && res.data && res.data.seller && res.data.raw_material) {
            let data = {
              ...res.data,
            };
            setFormState((formState) => ({
              ...formState,
              id: data.id,
              notes: data.notes,
              quantity: validateNumber(data.quantity),
              date: new Date(data.date),
              price_per_piece: validateNumber(data.price_per_piece),
              total_price: validateNumber(data.total_price),
              kachha_ledger: data.kachha_ledger,
              pakka_ledger: data.pakka_ledger,
              selected: data.purchase ? "purchase" : "raw_material",
            }));
            setRawMaterialData(data.raw_material);
            setSeller(data.seller);
            setPurchase(data.purchase);
            getDetailsAndPopulate(data.seller.id, data.raw_material.id);
          } else {
            throw new Error();
          }
        })
        .catch((err) => {
          setBackDrop(false);
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error getting goods return info",
          }));
        });
    };

    if (isEdit || isView) {
      getGoodsReturnData();
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      let purchaseId = urlParams.get("p");
      let sellerId = urlParams.get("s");
      let rawMaterialId = urlParams.get("r");
      let selected = null;
      if (purchaseId) {
        selected = "purchase";
        setPurchase(purchaseId);
      } else if (rawMaterialId || sellerId) {
        selected = "raw_material";
      }
      setFormState((formState) => ({
        ...formState,
        selected: selected,
      }));
      getDetailsAndPopulate(sellerId, rawMaterialId);
    }
  }, [isEdit, isView, id]);

  useEffect(() => {
    let total_price = 0;
    let price_per_piece = validateNumber(formState.price_per_piece);
    let quantity = validateNumber(formState.quantity);
    total_price = price_per_piece * quantity;
    setFormState((formState) => ({
      ...formState,
      total_price: total_price,
    }));
  }, [formState.price_per_piece, formState.quantity]);

  const getDetailsAndPopulate = async (sellerId, rawMaterialId) => {
    setBackDrop(true);
    if (sellerId) {
      await providerForGet(
        backend_sellers + "/" + sellerId,
        {},
        Auth.getToken()
      )
        .then((res) => {
          setSeller(res.data);
        })
        .catch((err) => {
          console.log("error ---> ", err);
        });
    }
    if (rawMaterialId) {
      await providerForGet(
        backend_raw_materials + "/" + rawMaterialId,
        {},
        Auth.getToken()
      )
        .then((res) => {
          setRawMaterialData(res.data);
        })
        .catch((err) => {
          console.log("error ---> ", err);
        });
    }
    setBackDrop(false);
  };

  const handleChange = (event) => {
    if (event.target.name === "selected") {
      setError(null);
      setRawMaterialData(null);
      setPurchase(null);
      setSeller(null);
      setFormState({
        quantity: 0,
        notes: "",
        date: new Date(),
        total_price: 0,
        kachha_ledger: true,
        pakka_ledger: false,
      });
    }

    delete error[event.target.name];
    setError((error) => ({
      ...error,
    }));
    setFormState((formState) => ({
      ...formState,
      [event.target.name]: event.target.value,
    }));
  };

  const onBackClick = () => {
    history.push(GOODRETURNLIST);
  };

  const submit = async (event) => {
    event.preventDefault();
    setBackDrop(true);
    let isValid = false;
    let error = {};
    /** This will set errors as per validations defined in form */

    if (!rawMaterialData) {
      error = {
        ...error,
        raw_material: ["Raw Material is required"],
      };
    }
    if (!seller) {
      error = {
        ...error,
        seller: ["Seller is required"],
      };
    }
    if (formState.selected === "purchase" && !purchase) {
      error = {
        ...error,
        purchase: ["Purchase is required"],
      };
    }
    if (!formState.quantity) {
      error = {
        ...error,
        quantity: ["Quantity is required"],
      };
    }
    if (!formState.price_per_piece) {
      error = {
        ...error,
        price_per_piece: ["Price per piece is required"],
      };
    }

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

  console.log("error => ", error);

  const handleAddEdit = () => {
    if (isEdit) {
      addEditData();
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
    let data = {
      raw_material: rawMaterialData.id,
      seller: seller.id,
      quantity: formState.quantity,
      date: new Date(formState.date),
      notes: formState.notes,
      total_price: formState.total_price,
      kachha_ledger: formState.kachha_ledger,
      pakka_ledger: formState.pakka_ledger,
      price_per_piece: formState.price_per_piece,
      purchase: purchase,
      isPurchasePresent: purchase ? true : false,
    };
    if (isEdit) {
      await providerForPut(backend_goods_return, id, data, auth.getToken())
        .then((res) => {
          setBackDrop(false);
          history.push(GOODRETURNLIST);
        })
        .catch((err) => {
          setBackDrop(false);
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error Saving",
          }));
        });
    } else {
      await providerForPost(backend_goods_return, data, auth.getToken())
        .then((res) => {
          setBackDrop(false);
          history.push(GOODRETURNLIST);
        })
        .catch((err) => {
          setBackDrop(false);
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error Saving",
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

  const handleStartDateChange = (event) => {
    let startDate = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (startDate === "Invalid date") {
      startDate = null;
    } else {
      startDate = new Date(startDate).toISOString();
    }
    setFormState((formState) => ({
      ...formState,
      date: startDate,
    }));
  };

  /** Seller Dialog boxes */
  const handeAddSeller = (row) => {
    setOpenDialogForSelectingSeller(false);
    if (row) {
      delete error["seller"];
      setError((error) => ({
        ...error,
      }));
      setSeller(row);
    } else {
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Invalid Seller",
      }));
    }
  };

  const handleCloseDialogForSeller = () => {
    setOpenDialogForSelectingSeller(false);
  };

  const handleAddRawMaterial = (row) => {
    setOpenDialogForSelectingRawMaterial(false);
    if (row) {
      delete error["raw_material"];
      setError((error) => ({
        ...error,
      }));
      setRawMaterialData(row);
    } else {
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Invalid Raw Material",
      }));
    }
  };

  const handleCloseDialogForPurchase = () => {
    setOpenDialogForSelectingPurchase(false);
  };

  const handleAddPurchase = (purchase, seller, raw_material, purchaseCost) => {
    setOpenDialogForSelectingPurchase(false);
    if (purchase && seller && raw_material) {
      let price_per_piece = validateNumber(purchaseCost);
      delete error["purchase"];
      setError((error) => ({
        ...error,
      }));
      setRawMaterialData(raw_material);
      setSeller(seller.allData);
      setPurchase(purchase);
      setFormState((formState) => ({
        ...formState,
        price_per_piece: price_per_piece,
        total_price: price_per_piece,
        quantity: 1,
      }));
    } else {
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Invalid Purchase",
      }));
    }
  };

  console.log("seller =>", seller, rawMaterialData);

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
           the quantity will be deducted from the raw material balance!`,
          `Are you sure you
        want to proceed ?`,
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
      <DialogForSelectingPurchase
        handleCancel={handleCloseDialogForPurchase}
        handleClose={handleCloseDialogForPurchase}
        handleAddPurchase={handleAddPurchase}
        open={openDialogForSelectingPurchase}
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
                <CustomDropDown
                  id="selected"
                  disabled={isView || isEdit}
                  onChange={(event) => handleChange(event)}
                  labelText="Select Purchase / Raw Material"
                  name="selected"
                  value={formState.selected}
                  nameValue={[
                    { name: "Purchase", value: "purchase" },
                    { name: "Raw Material", value: "raw_material" },
                  ]}
                  formControlProps={{
                    fullWidth: true,
                  }}
                />
              </GridItem>
            </GridContainer>
            {formState.selected === "raw_material" ? (
              <GridContainer>
                {/** Raw Material */}
                <GridItem
                  xs={12}
                  sm={12}
                  md={6}
                  className={classes.rootLabelButtonGridBorderRight}
                >
                  <GridContainer>
                    <GridItem
                      xs={12}
                      sm={12}
                      md={12}
                      className={classes.labelStylesForAddForm}
                    >
                      Raw Material
                    </GridItem>
                  </GridContainer>
                  {rawMaterialData && rawMaterialData.id ? (
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={9}>
                        <RawMaterialDetail raw_material={rawMaterialData} />
                      </GridItem>
                      {!isEdit && !isView && (
                        <GridItem xs={12} sm={12} md={3}>
                          <IconButton
                            onClick={() => {
                              setOpenDialogForSelectingRawMaterial(true);
                            }}
                          >
                            <EditOutlinedIcon fontSize="medium" />
                          </IconButton>
                        </GridItem>
                      )}
                    </GridContainer>
                  ) : (
                    <>
                      <GridItem
                        xs={12}
                        sm={12}
                        md={12}
                        className={classes.labelButtonStylesForAddForm}
                      >
                        <Button
                          color="primary"
                          onClick={() => {
                            setOpenDialogForSelectingRawMaterial(true);
                          }}
                        >
                          {rawMaterialData && rawMaterialData.id
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
                              ? error["raw_material"].map((error) => {
                                  return error + " ";
                                })
                              : null}
                          </FormHelperText>
                        </GridItem>
                      ) : null}
                    </>
                  )}
                </GridItem>
                {/** Sell to */}
                <GridItem xs={12} sm={12} md={6}>
                  <GridContainer>
                    <GridItem
                      xs={12}
                      sm={12}
                      md={12}
                      className={classes.labelStylesForAddForm}
                    >
                      Sell To
                    </GridItem>
                  </GridContainer>

                  {seller && seller.id ? (
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={9}>
                        <SellerDetails seller={seller} />
                      </GridItem>
                      {!isEdit && !isView && (
                        <GridItem xs={12} sm={12} md={3}>
                          <IconButton
                            onClick={() => {
                              setOpenDialogForSelectingSeller(true);
                            }}
                          >
                            <EditOutlinedIcon fontSize="medium" />
                          </IconButton>
                        </GridItem>
                      )}
                    </GridContainer>
                  ) : (
                    <>
                      <GridItem
                        xs={12}
                        sm={12}
                        md={12}
                        className={classes.labelButtonStylesForAddForm}
                      >
                        <Button
                          color="primary"
                          onClick={() => {
                            setOpenDialogForSelectingSeller(true);
                          }}
                        >
                          {seller && seller.id
                            ? "Change Seller"
                            : "Select Seller"}
                        </Button>
                      </GridItem>
                      {hasError("seller", error) ? (
                        <GridItem xs={12} sm={12} md={12}>
                          <FormHelperText
                            id={"seller_helpertext_id"}
                            error={hasError("seller", error)}
                          >
                            {hasError("seller", error)
                              ? error["seller"].map((error) => {
                                  return error + " ";
                                })
                              : null}
                          </FormHelperText>
                        </GridItem>
                      ) : null}
                    </>
                  )}
                </GridItem>
              </GridContainer>
            ) : formState.selected === "purchase" ? (
              <>
                <GridContainer>
                  <>
                    <GridItem
                      xs={12}
                      sm={12}
                      md={12}
                      className={classes.labelButtonStylesForAddForm}
                    >
                      {!isEdit && !isView && (
                        <Button
                          color="primary"
                          onClick={() => {
                            setOpenDialogForSelectingPurchase(true);
                          }}
                        >
                          {purchase ? "Change Purchase" : "Select Purchase"}
                        </Button>
                      )}

                      {purchase && (
                        <Button
                          color="primary"
                          onClick={() => {
                            window.open(
                              `${frontendServerUrl}${VIEWPURCHASES}/${purchase}?highlight=${rawMaterialData.id}`,
                              "_blank"
                            );
                          }}
                        >
                          View Purchase
                        </Button>
                      )}
                    </GridItem>
                    {hasError("purchase", error) ? (
                      <GridItem xs={12} sm={12} md={12}>
                        <FormHelperText
                          id={"seller_helpertext_id"}
                          error={hasError("purchase", error)}
                        >
                          {hasError("purchase", error)
                            ? error["purchase"].map((error) => {
                                return error + " ";
                              })
                            : null}
                        </FormHelperText>
                      </GridItem>
                    ) : null}
                  </>
                </GridContainer>
                <GridContainer>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={6}
                    className={classes.rootLabelButtonGridBorderRight}
                  >
                    <GridContainer>
                      <GridItem
                        xs={12}
                        sm={12}
                        md={12}
                        className={classes.labelStylesForAddForm}
                      >
                        Raw Material
                      </GridItem>
                    </GridContainer>
                    {rawMaterialData && rawMaterialData.id ? (
                      <GridContainer>
                        <GridItem>
                          <RawMaterialDetail raw_material={rawMaterialData} />
                        </GridItem>
                      </GridContainer>
                    ) : null}
                  </GridItem>
                  {/** Sell to */}
                  <GridItem xs={12} sm={12} md={6}>
                    <GridContainer>
                      <GridItem
                        xs={12}
                        sm={12}
                        md={12}
                        className={classes.labelStylesForAddForm}
                      >
                        Sell To
                      </GridItem>
                    </GridContainer>

                    {seller && seller.id ? (
                      <GridContainer>
                        <GridItem>
                          <SellerDetails seller={seller} />
                        </GridItem>
                      </GridContainer>
                    ) : null}
                  </GridItem>
                </GridContainer>
              </>
            ) : null}

            {/* <GridContainer>
              {isView || isEdit ? null : (
                <>
                  <GridItem xs={12} sm={12} md={12}>
                    <Button
                      color="primary"
                      onClick={() => {
                        setOpenDialogForSelectingRawMaterial(true);
                      }}
                    >
                      {rawMaterialData && rawMaterialData.id
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
                          ? error["raw_material"].map((error) => {
                              return error + " ";
                            })
                          : null}
                      </FormHelperText>
                    </GridItem>
                  ) : null}
                </>
              )}
              {rawMaterialData && rawMaterialData.id ? (
                <GridItem xs={12} sm={12} md={12}>
                  <RawMaterialDetail raw_material={rawMaterialData} />
                </GridItem>
              ) : null}
            </GridContainer>
            <GridContainer>
              <GridItem
                xs={12}
                sm={12}
                md={12}
                style={{
                  marginTop: "1.5rem",
                  color: "#C8C8C8",
                }}
              >
                <b>Sell To </b>
              </GridItem>
              {seller && seller.id && (
                <GridItem
                  xs={12}
                  sm={12}
                  md={12}
                  style={{ marginTop: "0.8rem" }}
                >
                  <SellerDetails seller={seller} />
                </GridItem>
              )}
              {isView || isEdit ? null : (
                <>
                  <GridItem xs={12} sm={12} md={12}>
                    <Button
                      color="primary"
                      onClick={() => {
                        setOpenDialogForSelectingSeller(true);
                      }}
                    >
                      {seller && seller.id ? "Change Seller" : "Select Seller"}
                    </Button>
                  </GridItem>
                  {hasError("seller", error) ? (
                    <GridItem xs={12} sm={12} md={12}>
                      <FormHelperText
                        id={"seller_helpertext_id"}
                        error={hasError("seller", error)}
                      >
                        {hasError("seller", error)
                          ? error["seller"].map((error) => {
                              return error + " ";
                            })
                          : null}
                      </FormHelperText>
                    </GridItem>
                  ) : null}
                </>
              )}
            </GridContainer> */}
            {formState.selected ? (
              <>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={3}>
                    <DatePicker
                      onChange={(event) => handleStartDateChange(event)}
                      label="Selling Date"
                      name="date"
                      disabled={isView}
                      value={formState.date || new Date()}
                      id="date"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      style={{
                        marginTop: "1.5rem",
                        width: "100%",
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <CustomInput
                      onChange={(event) => handleChange(event)}
                      type="number"
                      disabled={isView}
                      labelText="Quantity"
                      name="quantity"
                      value={formState.quantity}
                      id="purchase_quantity"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      /** For setting errors */
                      helperTextId={"helperText_quantity"}
                      isHelperText={hasError("quantity", error)}
                      helperText={
                        hasError("quantity", error)
                          ? error["quantity"].map((error) => {
                              return error + " ";
                            })
                          : null
                      }
                      error={hasError("quantity", error)}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <CustomInput
                      onChange={(event) => handleChange(event)}
                      type="number"
                      disabled={isView}
                      labelText="Price Per Piece"
                      name="price_per_piece"
                      value={formState.price_per_piece}
                      id="price_per_piece"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      /** For setting errors */
                      helperTextId={"helperText_price_per_piece"}
                      isHelperText={hasError("price_per_piece", error)}
                      helperText={
                        hasError("price_per_piece", error)
                          ? error["price_per_piece"].map((error) => {
                              return error + " ";
                            })
                          : null
                      }
                      error={hasError("price_per_piece", error)}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <CustomInput
                      onChange={(event) => handleChange(event)}
                      type="number"
                      disabled={true}
                      labelText="Total Price"
                      name="total_price"
                      value={formState.total_price.toFixed(2)}
                      id="total_price"
                      formControlProps={{
                        fullWidth: true,
                      }}
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
                <GridContainer>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={3}
                    className={classes.switchBoxInFilter}
                  >
                    <div className={classes.block}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formState.kachha_ledger}
                            disabled={isView}
                            onChange={(event) => {
                              setFormState((formState) => ({
                                ...formState,
                                kachha_ledger: event.target.checked,
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
                        label="Add in Kachha Ledger?"
                      />
                    </div>
                  </GridItem>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={3}
                    className={classes.switchBoxInFilter}
                  >
                    <div className={classes.block}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formState.pakka_ledger}
                            disabled={isView}
                            onChange={(event) => {
                              setFormState((formState) => ({
                                ...formState,
                                pakka_ledger: event.target.checked,
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
                        label="Add in Pakka Ledger?"
                      />
                    </div>
                  </GridItem>
                </GridContainer>
              </>
            ) : null}
          </CardBody>
          {isView || !formState.selected ? null : (
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
  );
}
