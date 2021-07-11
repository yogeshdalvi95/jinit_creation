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
  CustomDropDown,
  CustomInput,
  DatePicker,
  FAB,
  GridContainer,
  GridItem
} from "../../components";
// core components
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { PURCHASES } from "../../paths";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import { useEffect } from "react";
import { providerForGet, providerForPost } from "../../api";
import {
  backend_purchases,
  backend_raw_materials,
  backend_sellers
} from "../../constants";
import { useState } from "react";
import { Backdrop, CircularProgress, InputAdornment } from "@material-ui/core";
import { convertNumberToAmount } from "../../Utils";

const useStyles = makeStyles(styles);

export default function AddPurchases(props) {
  const classes = useStyles();
  const history = useHistory();
  const [rawMaterial, setRawMaterial] = useState([]);
  const [seller, setSeller] = useState([]);
  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    seller: null,
    type_of_bill: "",
    cgst_percent: 0,
    sgst_percent: 0,
    gst_no: "",
    total_amt_with_tax: 0,
    total_amt_without_tax: 0,
    notes: "",
    date: new Date()
  });

  const [individualKachhaPurchase, setIndividualKachhaPurchase] = useState([
    {
      id: null,
      raw_material: null,
      purchase_cost: 0,
      purchase_quantity: 0,
      total_purchase_cost: 0
    }
  ]);

  const [individualPakkaPurchase, setIndividualPakkaPurchase] = useState([
    {
      id: null,
      name: "",
      purchase_cost: 0,
      purchase_quantity: 0,
      total_purchase_cost: 0
    }
  ]);

  const [rawMaterialDetails, setRawMaterialDetails] = useState({
    name: "",
    department: "",
    color: "",
    size: "",
    balance: ""
  });

  useEffect(() => {
    getRawMaterial();
    getSellerName();
  }, []);

  const getSellerName = async () => {
    setBackDrop(true);
    await providerForGet(
      backend_sellers,
      {
        pageSize: -1
      },
      Auth.getToken()
    )
      .then(res => {
        setSeller(res.data.data);
        setBackDrop(false);
      })
      .catch(err => {});
  };

  const getRawMaterial = async () => {
    setBackDrop(true);
    await providerForGet(
      backend_raw_materials,
      {
        pageSize: -1
      },
      Auth.getToken()
    )
      .then(res => {
        setRawMaterial(res.data.data);
        setBackDrop(false);
      })
      .catch(err => {});
  };

  const handleChangeAutoComplete = async (name, event, value) => {
    if (value === null) {
      if (name === "raw_material") {
        setFormState(formState => ({
          ...formState,
          [name]: null
        }));
      } else {
        setFormState(formState => ({
          ...formState,
          [name]: null
        }));
      }
    } else {
      if (name === "raw_material") {
        setFormState(formState => ({
          ...formState,
          [name]: value.id
        }));
      } else {
        setFormState(formState => ({
          ...formState,
          [name]: value.id
        }));
      }
    }
  };

  const handleChange = event => {
    setFormState(formState => ({
      ...formState,
      [event.target.name]: event.target.value
    }));
  };

  console.log(formState);

  const onBackClick = () => {
    history.push(PURCHASES);
  };

  const addButton = async () => {
    setBackDrop(true);
    await providerForPost(
      backend_purchases,
      {
        raw_material: formState.raw_material,
        seller: formState.seller,
        purchase_cost: formState.purchase_cost,
        quantity: formState.quantity,
        notes: formState.notes
      },
      Auth.getToken()
    )
      .then(res => {
        history.push(PURCHASES);
        setBackDrop(false);
      })
      .catch(err => {});
  };

  const addNewPurchase = () => {
    setIndividualKachhaPurchase([
      {
        id: null,
        raw_material: null,
        purchase_cost: 0,
        purchase_quantity: 0,
        total_purchase_cost: 0
      },
      ...individualKachhaPurchase
    ]);
  };

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <FAB align={"start"} size={"small"} onClick={onBackClick}>
          <KeyboardArrowLeftIcon />
        </FAB>
      </GridItem>
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
                  id="type_of_bill"
                  onChange={event => handleChange(event)}
                  labelText="Type of Purchase"
                  name="type_of_bill"
                  value={formState.type_of_bill}
                  nameValue={[
                    { name: "Pakka", value: "Pakka" },
                    { name: "Kachha", value: "Kachha" }
                  ]}
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
              {formState.type_of_bill && formState.type_of_bill !== "" ? (
                <>
                  <GridItem xs={12} sm={12} md={4}>
                    <CustomAutoComplete
                      id="seller-name"
                      labelText="Seller"
                      autocompleteId={"seller-id"}
                      optionKey={"seller_name"}
                      options={seller}
                      onChange={(event, value) => {
                        handleChangeAutoComplete("seller", event, value);
                      }}
                      value={
                        seller[
                          seller.findIndex(function (item, i) {
                            return item.id === formState.seller;
                          })
                        ] || null
                      }
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={4}>
                    <DatePicker
                      onChange={event => handleChange(event)}
                      labelText="Purchase Date"
                      name="date"
                      value={new Date()}
                      id="date"
                      formControlProps={{
                        fullWidth: true
                      }}
                      disabled
                      style={{
                        marginTop: "2.5rem",
                        width: "100%"
                      }}
                    />
                  </GridItem>
                </>
              ) : null}
            </GridContainer>
            {formState.type_of_bill && formState.type_of_bill === "Pakka" ? (
              <GridContainer>
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    onChange={event => handleChange(event)}
                    labelText="GST No."
                    name="gst_no"
                    value={formState.gst_no}
                    id="gst_no"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    onChange={event => handleChange(event)}
                    labelText="CGST(%)"
                    name="cgst_percent"
                    disabled
                    value={formState.cgst_percent}
                    id="cgst_percent"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    onChange={event => handleChange(event)}
                    labelText="SGST(%)"
                    name="sgst_percent"
                    disabled
                    value={formState.sgst_percent}
                    id="sgst_percent"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
            ) : null}
            {formState.type_of_bill && formState.type_of_bill !== "" ? (
              <>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={4}>
                    <CustomInput
                      onChange={event => handleChange(event)}
                      labelText="Total amount in rupees"
                      name="total_amt_with_tax"
                      disabled
                      value={
                        formState.total_amt_with_tax
                          ? convertNumberToAmount(formState.total_amt_with_tax)
                          : "0"
                      }
                      id="total_amt_with_tax"
                      formControlProps={{
                        fullWidth: true
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
                      onChange={event => handleChange(event)}
                      value={formState.notes}
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
              </>
            ) : null}

            {/** Should get executed only when the bill is pakka bill */}
            {formState.type_of_bill &&
              formState.type_of_bill === "Kachha" &&
              individualKachhaPurchase.map((Ip, key) => (
                <GridContainer key={key}>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={9}
                    className={classes.componentBorder}
                  >
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={12}>
                        <CustomAutoComplete
                          id="raw_material"
                          labelText="Raw Material"
                          autocompleteId={"raw_material_id"}
                          optionKey={"name"}
                          getOptionLabel={option => {
                            let bal = "0";
                            if (!option.balance) {
                              bal = "0";
                            } else {
                              bal = option.balance;
                            }
                            return (
                              option.name +
                              ", Department: " +
                              option.department.name +
                              ", Color: " +
                              option.color +
                              ", Size: " +
                              option.size +
                              ", Balance: " +
                              bal
                            );
                          }}
                          options={rawMaterial}
                          formControlProps={{
                            fullWidth: true
                          }}
                          // onHighlightChange={(event, value) => {
                          //   console.log("Name :- ", value ? value.name : "");
                          //   if (value) {
                          //     setRawMaterialDetails(rawMaterialDetails => ({
                          //       ...rawMaterialDetails,
                          //       name: value ? value.name : "",
                          //       department: value ? value.department.name : "",
                          //       size: value ? value.size : "",
                          //       balance: value ? value.balance : "",
                          //       color: value ? value.color : ""
                          //     }));
                          //   } else {
                          //     setRawMaterialDetails(rawMaterialDetails => ({
                          //       ...rawMaterialDetails,
                          //       name: null,
                          //       department: null,
                          //       size: null,
                          //       balance: null,
                          //       color: null
                          //     }));
                          //   }
                          // }}
                          onChange={(event, value) => {
                            handleChangeAutoComplete(
                              "raw_material",
                              event,
                              value
                            );
                          }}
                          value={
                            rawMaterial[
                              rawMaterial.findIndex(function (item, i) {
                                return item.id === Ip.raw_material;
                              })
                            ] || null
                          }
                        />
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          onChange={event => handleChange(event)}
                          labelText="Purchase Cost"
                          name="purchase_cost"
                          value={Ip.purchase_cost}
                          id="purchase_cost"
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {formState.unit_name !== ""
                                  ? "/" + formState.unit_name
                                  : ""}
                              </InputAdornment>
                            )
                          }}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          onChange={event => handleChange(event)}
                          labelText="Purchase Quantity"
                          name="quantity"
                          value={Ip.purchase_quantity}
                          id="quantity"
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          onChange={event => handleChange(event)}
                          labelText="Total Purchase Cost"
                          name="total_purchase_cost"
                          value={Ip.total_purchase_cost}
                          id="quantity"
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                  </GridItem>
                  {key === individualKachhaPurchase.length - 1 ? (
                    <GridItem
                      xs={12}
                      sm={12}
                      md={2}
                      className={classes.addDeleteFabButon}
                    >
                      <FAB
                        color="primary"
                        align={"end"}
                        size={"small"}
                        onClick={() => addNewPurchase()}
                      >
                        <AddIcon />
                      </FAB>
                      <FAB
                        color="primary"
                        align={"end"}
                        size={"small"}
                        onClick={() => {}}
                      >
                        <DeleteIcon />
                      </FAB>
                    </GridItem>
                  ) : null}

                  {/* <GridItem
                xs={6}
                sm={6}
                md={2}
                className={classes.addDeleteFabButon}
              >
                
              </GridItem> */}
                </GridContainer>
              ))}

            {/** Should get executed only when the bill is pakka bill */}
            {formState.type_of_bill &&
              formState.type_of_bill === "Pakka" &&
              individualPakkaPurchase.map((Ip, key) => (
                <GridContainer key={key}>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={9}
                    className={classes.componentBorder}
                  >
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={12}>
                        <CustomInput
                          onChange={event => handleChange(event)}
                          labelText="Item Name"
                          name="name"
                          value={Ip.purchase_quantity}
                          id={"item_name" + key}
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          onChange={event => handleChange(event)}
                          labelText="Purchase Cost"
                          name="purchase_cost"
                          value={Ip.purchase_cost}
                          id="purchase_cost"
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {formState.unit_name !== ""
                                  ? "/" + formState.unit_name
                                  : ""}
                              </InputAdornment>
                            )
                          }}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          onChange={event => handleChange(event)}
                          labelText="Purchase Quantity"
                          name="quantity"
                          value={Ip.purchase_quantity}
                          id="quantity"
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          onChange={event => handleChange(event)}
                          labelText="Total Purchase Cost"
                          name="total_purchase_cost"
                          value={Ip.total_purchase_cost}
                          id="quantity"
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                  </GridItem>
                  {key === individualKachhaPurchase.length - 1 ? (
                    <GridItem
                      xs={12}
                      sm={12}
                      md={2}
                      className={classes.addDeleteFabButon}
                    >
                      <FAB
                        color="primary"
                        align={"end"}
                        size={"small"}
                        onClick={() => addNewPurchase()}
                      >
                        <AddIcon />
                      </FAB>
                      <FAB
                        color="primary"
                        align={"end"}
                        size={"small"}
                        onClick={() => {}}
                      >
                        <DeleteIcon />
                      </FAB>
                    </GridItem>
                  ) : null}

                  {/* <GridItem
                xs={6}
                sm={6}
                md={2}
                className={classes.addDeleteFabButon}
              >
                
              </GridItem> */}
                </GridContainer>
              ))}
          </CardBody>
          <CardFooter>
            <Button color="primary" onClick={() => addButton()}>
              Add
            </Button>
          </CardFooter>
        </Card>
        <Backdrop className={classes.backdrop} open={openBackDrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </GridItem>

      {rawMaterialDetails.name ? (
        <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardBody>
              <GridItem xs={12} sm={12} md={12}>
                Name : {rawMaterialDetails.name}
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                Department : {rawMaterialDetails.department}
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                Color : {rawMaterialDetails.color}
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                Size : {rawMaterialDetails.size}
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                Balance : {rawMaterialDetails.balance}
              </GridItem>
            </CardBody>
          </Card>
        </GridItem>
      ) : null}
    </GridContainer>
  );
}
