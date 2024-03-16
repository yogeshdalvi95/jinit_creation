import {
  makeStyles,
  Backdrop,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import buttonStyles from "../../../assets/jss/material-dashboard-react/components/buttonStyle.js";
import {
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent,
  Card,
  CardHeader,
  CardBody,
  RemoteAutoComplete,
  SellerDetails,
  DatePicker,
  CustomDropDown,
  CustomInput,
  CardFooter,
  Button,
  Auth,
} from "../../../components";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import { ALLPURCHASEPAYEMENTS } from "../../../paths";
import { backend_purchase_payment, backend_sellers } from "../../../constants";
import moment from "moment";
import { hasError, validateNumber, convertNumber } from "../../../Utils";
import classNames from "classnames";
import SweetAlert from "react-bootstrap-sweetalert";
import { providerForGet, providerForPost, providerForPut } from "../../../api";

const useStyles = makeStyles(styles);
const buttonUseStyles = makeStyles(buttonStyles);

const AddEditViewPayments = (props) => {
  const classes = useStyles();
  const buttonClasses = buttonUseStyles();
  const history = useHistory();
  const [sellerInfo, setSellerInfo] = useState(null);
  const [openBackDrop, setBackDrop] = useState(false);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState({});
  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [id] = useState(props.id ? props.id : null);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const [formState, setFormState] = useState({
    amount: 0,
    comment: "",
    payment_date: new Date(),
    payment_type: "bank_transfer",
    kachha_ledger: false,
    pakka_ledger: true,
  });

  useEffect(() => {
    if (isEdit || isView) {
      getPaymentData();
    }
  }, []);

  const getPaymentData = async () => {
    setBackDrop(true);
    await providerForGet(
      backend_purchase_payment + "/" + id,
      {},
      Auth.getToken()
    )
      .then((res) => {
        let paymentInfo = res.data;
        if (paymentInfo && paymentInfo.seller) {
          let data = {
            ...res.data,
          };
          setFormState({
            amount: data.amount,
            comment: data.comment,
            payment_date: new Date(data.payment_date),
            payment_type: data.payment_type,
            kachha_ledger: data.kachha_ledger,
            pakka_ledger: data.pakka_ledger,
          });
          setSellerInfo({
            label: paymentInfo.seller.seller_name,
            value: paymentInfo.seller.id,
            allData: paymentInfo.seller,
          });
          setBackDrop(false);
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
          message: "Error getting payment info",
        }));
      });
  };

  const onBackClick = () => {
    history.push(ALLPURCHASEPAYEMENTS);
  };

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  const setSelectedSeller = (seller) => {
    delete error["seller"];
    setError((error) => ({
      ...error,
    }));
    setSellerInfo(seller);
  };

  const handleDate = (event) => {
    let date = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (date === "Invalid date") {
      date = null;
    } else {
      date = new Date(date).toISOString();
    }
    setFormState((formState) => ({
      ...formState,
      payment_date: date,
    }));
  };

  const handleCheckValidation = () => {
    let error = {};
    if (!sellerInfo || !sellerInfo.value) {
      error = {
        ...error,
        seller: ["Please select seller"],
      };
    }

    let amount = validateNumber(formState.amount);
    if (!amount) {
      error = {
        ...error,
        amount: ["amount cannot be zero"],
      };
    } else if (amount < 0) {
      error = {
        ...error,
        amount: ["amount cannot be negative"],
      };
    }
    setError(error);

    if (!Object.keys(error).length) {
      submit();
    }
  };

  const handleCloseDialog = () => {
    setAlert(null);
  };

  const handleAcceptDialog = () => {
    setAlert(null);
    addEditData();
  };

  const submit = () => {
    const confirmBtnClasses = classNames({
      [buttonClasses.button]: true,
      [buttonClasses["success"]]: true,
    });

    const cancelBtnClasses = classNames({
      [buttonClasses.button]: true,
      [buttonClasses["danger"]]: true,
    });
    let message = "";
    if (isEdit) {
      message = `Are you sure you want to edit the payment made to ${
        sellerInfo?.allData?.seller_name
      } of ${convertNumber(formState.amount, true)}?`;
    } else {
      message = `Are you sure you want to make a payment of ${convertNumber(
        formState.amount,
        true
      )} towards seller ${sellerInfo?.allData?.seller_name} ?`;
    }
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
        style={{
          position: "initial",
        }}
      >
        {message}
      </SweetAlert>
    );
  };

  const addEditData = async () => {
    setBackDrop(true);
    if (id) {
      await providerForPut(
        backend_purchase_payment,
        id,
        {
          ...formState,
          seller: sellerInfo.value,
        },
        Auth.getToken()
      )
        .then((res) => {
          history.push(ALLPURCHASEPAYEMENTS);
          setBackDrop(false);
        })
        .catch((err) => {
          setBackDrop(false);
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error saving payment info",
          }));
        });
    } else {
      await providerForPost(
        backend_purchase_payment,
        {
          ...formState,
          seller: sellerInfo.value,
        },
        Auth.getToken()
      )
        .then((res) => {
          history.push(ALLPURCHASEPAYEMENTS);
          setBackDrop(false);
        })
        .catch((err) => {
          setBackDrop(false);
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error saving payment info",
          }));
        });
    }
  };

  return (
    <React.Fragment>
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
                {!isView && (
                  <GridItem xs={12} sm={12} md={6}>
                    <RemoteAutoComplete
                      setSelectedData={setSelectedSeller}
                      selectedData={sellerInfo}
                      searchString={"seller_name"}
                      apiName={backend_sellers}
                      placeholder="Select Seller..."
                      selectedValue={sellerInfo}
                      isError={error.seller}
                      errorText={"Please select a seller"}
                      isSeller={true}
                    />
                  </GridItem>
                )}
                {sellerInfo && sellerInfo.value && sellerInfo.allData && (
                  <GridItem xs={12} sm={12} md={6}>
                    <SellerDetails seller={sellerInfo.allData} />
                  </GridItem>
                )}
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={3}>
                  <DatePicker
                    onChange={(event) => handleDate(event)}
                    label="Payment Date"
                    name="payment_date"
                    disabled={isView}
                    value={formState.payment_date}
                    id="payment_date"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    style={{
                      width: "100%",
                      marginTop: "1.8rem",
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_payment_date"}
                    isHelperText={hasError("payment_date", error)}
                    helperText={
                      hasError("payment_date", error)
                        ? error["payment_date"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    error={hasError("payment_date", error)}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomDropDown
                    id="payment_type"
                    disabled={isView}
                    onChange={(event) => {
                      delete error["payment_type"];
                      setError((error) => ({
                        ...error,
                      }));
                      let kachha_ledger = formState.kachha_ledger;
                      let pakka_ledger = formState.pakka_ledger;

                      if (event.target.value === "cash") {
                        kachha_ledger = true;
                        pakka_ledger = false;
                      } else {
                        kachha_ledger = false;
                        pakka_ledger = true;
                      }
                      setFormState((formState) => ({
                        ...formState,
                        payment_type: event.target.value,
                        kachha_ledger: kachha_ledger,
                        pakka_ledger: pakka_ledger,
                      }));
                    }}
                    labelText="Type of Payment"
                    name="payment_type"
                    value={formState.payment_type}
                    nameValue={[
                      { name: "Bank Transfer", value: "bank_transfer" },
                      { name: "Cash", value: "cash" },
                    ]}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_payment_type"}
                    isHelperText={hasError("payment_type", error)}
                    helperText={
                      hasError("payment_type", error)
                        ? error["payment_type"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    error={hasError("payment_type", error)}
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
                          disabled={formState.payment_type === "cash" || isView}
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
                      label="Add Payment Info in Kachha Ledger?"
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
                          disabled={
                            formState.payment_type === "bank_transfer" ||
                            formState.payment_type === "cash" ||
                            isView
                          }
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
                      label="Add Payment Info in Pakka Ledger?"
                    />
                  </div>
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInput
                    onChange={(event) => {
                      let value = event.target.value;
                      let formattedNumber = validateNumber(value);
                      if (formattedNumber < 0) {
                        setError((error) => ({
                          ...error,
                          amount: ["Amount cannot be negative"],
                        }));
                      } else {
                        delete error["amount"];
                        setError((error) => ({
                          ...error,
                        }));
                      }
                      setFormState((formState) => ({
                        ...formState,
                        amount: value,
                      }));
                    }}
                    type="number"
                    disabled={isView}
                    labelText="Amount"
                    name="amount"
                    value={formState.amount}
                    id="amount"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_amount"}
                    isHelperText={hasError("amount", error)}
                    helperText={
                      hasError("amount", error)
                        ? error["amount"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    error={hasError("amount", error)}
                  />
                </GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={3}
                  style={{
                    marginTop: "3rem",
                  }}
                >
                  {convertNumber(formState.amount, true)}
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={6}>
                  <CustomInput
                    onChange={(event) => {
                      setFormState((formState) => ({
                        ...formState,
                        comment: event.target.value,
                      }));
                    }}
                    type="text"
                    disabled={isView}
                    labelText="Comment"
                    name="comment"
                    value={formState.comment}
                    id="comment"
                    multiline
                    minRows={4}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    /** For setting errors */
                    helperTextId={"helperText_comment"}
                    isHelperText={hasError("comment", error)}
                    helperText={
                      hasError("comment", error)
                        ? error["comment"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    error={hasError("comment", error)}
                  />
                </GridItem>
              </GridContainer>
            </CardBody>
            {isView ? null : (
              <CardFooter>
                <Button
                  color="primary"
                  onClick={(e) => handleCheckValidation()}
                >
                  Save
                </Button>
              </CardFooter>
            )}
          </Card>
        </GridItem>
      </GridContainer>
      <Backdrop className={classes.backdrop} open={openBackDrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </React.Fragment>
  );
};

export default AddEditViewPayments;
