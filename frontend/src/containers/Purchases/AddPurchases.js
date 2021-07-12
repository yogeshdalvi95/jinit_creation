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
  GridItem,
  Muted
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
import { convertNumber, isEmptyString } from "../../Utils";

const useStyles = makeStyles(styles);

export default function AddPurchases(props) {
  console.log(props);
  const classes = useStyles();
  const history = useHistory();
  const [rawMaterial, setRawMaterial] = useState([]);
  const [seller, setSeller] = useState([]);
  /** VIMP to check if the data is used for viewing */
  const [isView] = useState(
    props.location.state ? props.location.state.view : false
  );
  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    seller: null,
    type_of_bill: "",
    cgst_percent: 0,
    sgst_percent: 0,
    gst_no: "",
    total_amt_with_tax: 0,
    total_amt_without_tax: 0,
    total_amt_with_tax_formatted: 0,
    total_amt_without_tax_formatted: 0,
    notes: "",
    date: new Date()
  });

  const kachhaPurchaseDetails = {
    id: null,
    raw_material: null,
    purchase_cost: 0,
    purchase_quantity: 0,
    purchase_unit: "",
    total_purchase_cost: 0,
    total_purchase_cost_formatted: 0
  };

  const pakkaPurchaseDetails = {
    id: null,
    name: "",
    purchase_cost: 0,
    purchase_quantity: 0,
    total_purchase_cost: 0,
    total_purchase_cost_formatted: 0
  };

  const [individualKachhaPurchase, setIndividualKachhaPurchase] = useState([
    kachhaPurchaseDetails
  ]);

  const [individualPakkaPurchase, setIndividualPakkaPurchase] = useState([
    pakkaPurchaseDetails
  ]);

  const [rawMaterialDetails, setRawMaterialDetails] = useState({
    name: "",
    department: "",
    color: "",
    size: "",
    balance: ""
  });

  useEffect(() => {
    if (
      props.location.state &&
      props.location.state.view &&
      props.location.state.data
    ) {
      setData(props.location.state.data);
    }
    getRawMaterial();
    getSellerName();
  }, []);

  const setData = data => {
    setFormState(formState => ({
      ...formState,
      seller: data.purchase.seller ? data.purchase.seller.id : null,
      type_of_bill: data.purchase.type_of_bill,
      cgst_percent: data.purchase.cgst_percent,
      sgst_percent: data.purchase.sgst_percent,
      gst_no: data.purchase.gst_no,
      total_amt_with_tax: data.purchase.total_amt_with_tax,
      total_amt_without_tax: data.purchase.total_amt_without_tax,
      total_amt_with_tax_formatted: convertNumber(
        data.purchase.total_amt_with_tax,
        true
      ),
      total_amt_without_tax_formatted: convertNumber(
        data.purchase.total_amt_without_tax,
        true
      ),
      notes: data.purchase.notes,
      date: new Date(data.purchase.date)
    }));

    let arr = [];
    arr = data.individualPurchase.map(d => {
      let object = {
        id: d.id,
        purchase_cost: d.purchase_cost,
        purchase_quantity: d.purchase_quantity,
        total_purchase_cost: d.total_purchase_cost,
        total_purchase_cost_formatted: convertNumber(
          d.total_purchase_cost,
          true
        )
      };
      if (data.purchase.type_of_bill === "Kachha") {
        object = {
          ...object,
          raw_material: d.raw_material ? d.raw_material.id : null,
          purchase_unit: d.unit
        };
      } else {
        object = {
          ...object,
          name: d.name
        };
      }
      return object;
    });
    if (data.purchase.type_of_bill === "Kachha") {
      setIndividualKachhaPurchase(arr);
    } else {
      setIndividualPakkaPurchase(arr);
    }
  };

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

  const handleChange = event => {
    setFormState(formState => ({
      ...formState,
      [event.target.name]: event.target.value
    }));
  };

  /** This function calculate the total cost when we add value for
   * purchase cost or purchase quantity per raw material
   **/
  const calculateTotalCost = (name, value, object, arr, k) => {
    let costPerRawMaterial = 0;
    let totalCostWithTax = 0;
    let totalCostWithOutTax = 0;
    let perRawMaterialFormatted = "0";
    let totalCostWithTaxFormatted = "0";
    let totalCostWithOutTaxFormatted = "0";

    let valueToMultiply = 0;
    if (isEmptyString(value)) {
      value = 0;
    }
    if (name === "purchase_cost") {
      valueToMultiply = object["purchase_quantity"];
      if (isEmptyString(valueToMultiply)) {
        valueToMultiply = 0;
      }
    } else if (name === "purchase_quantity") {
      valueToMultiply = object["purchase_cost"];
      if (isEmptyString(valueToMultiply)) {
        valueToMultiply = 0;
      }
    }

    costPerRawMaterial = parseFloat(valueToMultiply) * parseFloat(value);
    /** Convert number to amount format */
    perRawMaterialFormatted = convertNumber(
      costPerRawMaterial.toFixed(2),
      true
    );

    arr.map((Ip, key) => {
      if (key !== k) {
        totalCostWithOutTax =
          totalCostWithOutTax + parseFloat(Ip.total_purchase_cost);
      }
      return null;
    });

    totalCostWithOutTax = totalCostWithOutTax + costPerRawMaterial;
    totalCostWithOutTaxFormatted = convertNumber(
      totalCostWithOutTax.toFixed(2),
      true
    );

    /** Calculate tax */
    let cgst_percent = formState.cgst_percent;
    if (isEmptyString(cgst_percent)) {
      cgst_percent = 0;
    }

    let sgst_percent = formState.sgst_percent;
    if (isEmptyString(sgst_percent)) {
      sgst_percent = 0;
    }

    let cgst = (parseFloat(cgst_percent) / 100) * totalCostWithOutTax;
    let sgst = (parseFloat(sgst_percent) / 100) * totalCostWithOutTax;
    totalCostWithTax = totalCostWithOutTax + cgst + sgst;
    totalCostWithTaxFormatted = convertNumber(
      totalCostWithTax.toFixed(2),
      true
    );

    return {
      perRawMaterial: costPerRawMaterial,
      totalCostWithTax: totalCostWithTax,
      totalCostWithOutTax: totalCostWithOutTax,
      perRawMaterialFormatted: perRawMaterialFormatted,
      totalCostWithTaxFormatted: totalCostWithTaxFormatted,
      totalCostWithOutTaxFormatted: totalCostWithOutTaxFormatted
    };
  };

  /** Handle change for repetable compoment */
  const handleChangeAutoCompleteForRepetableComponent = (name, value, key) => {
    if (formState.type_of_bill === "Kachha") {
      let object = individualKachhaPurchase[key];
      if (value === null) {
        object[name] = null;
        if (name === "raw_material") {
          object["purchase_unit"] = "";
        }
      } else {
        object[name] = value.id;
        if (name === "raw_material") {
          object["purchase_unit"] = value.unit ? value.unit.name : "unit";
        }
      }
      setIndividualKachhaPurchase([
        ...individualKachhaPurchase.slice(0, key),
        object,
        ...individualKachhaPurchase.slice(key + 1)
      ]);

      if (name === "raw_material") {
        if (value) {
          setRawMaterialDetails(rawMaterialDetails => ({
            ...rawMaterialDetails,
            name: value ? value.name : "",
            department: value ? value.department.name : "",
            size: value ? value.size : "",
            balance: value ? value.balance : "",
            color: value ? value.color : ""
          }));
        } else {
          setRawMaterialDetails(rawMaterialDetails => ({
            ...rawMaterialDetails,
            name: null,
            department: null,
            size: null,
            balance: null,
            color: null
          }));
        }
      }
    }
  };

  /** Handle change for repetable compoment */
  const handleChangeForRepetableComponent = (event, key) => {
    let name = event.target.name;
    let value = event.target.value;
    let object = {};
    let purchaseArr = [];
    if (formState.type_of_bill === "Kachha") {
      object = individualKachhaPurchase[key];
      purchaseArr = individualKachhaPurchase;
      object[name] = value;
    } else {
      object = individualPakkaPurchase[key];
      purchaseArr = individualPakkaPurchase;
      object[name] = value;
    }
    /** Calculating total cost per raw material and total cost with tax and total cost without tax */
    if (name === "purchase_cost" || name === "purchase_quantity") {
      const {
        perRawMaterial,
        totalCostWithTax,
        totalCostWithOutTax,
        perRawMaterialFormatted,
        totalCostWithTaxFormatted,
        totalCostWithOutTaxFormatted
      } = calculateTotalCost(
        name,
        event.target.value,
        object,
        purchaseArr,
        key
      );

      setFormState(formState => ({
        ...formState,
        total_amt_with_tax: totalCostWithTax,
        total_amt_without_tax: totalCostWithOutTax,
        total_amt_with_tax_formatted: totalCostWithTaxFormatted,
        total_amt_without_tax_formatted: totalCostWithOutTaxFormatted
      }));

      object = {
        ...object,
        total_purchase_cost: perRawMaterial,
        total_purchase_cost_formatted: perRawMaterialFormatted
      };
    }

    /** Depending on kachha and pakka bill add data */
    if (formState.type_of_bill === "Kachha") {
      setIndividualKachhaPurchase([
        ...individualKachhaPurchase.slice(0, key),
        object,
        ...individualKachhaPurchase.slice(key + 1)
      ]);
    } else {
      setIndividualPakkaPurchase([
        ...individualPakkaPurchase.slice(0, key),
        object,
        ...individualPakkaPurchase.slice(key + 1)
      ]);
    }
  };

  const onBackClick = () => {
    history.push(PURCHASES);
  };

  const addButton = async () => {
    setBackDrop(true);
    await providerForPost(
      backend_purchases,
      {
        purchases: formState,
        kachhaPurchase: individualKachhaPurchase,
        pakkaPurchase: individualPakkaPurchase
      },
      Auth.getToken()
    )
      .then(res => {
        history.push(PURCHASES);
        setBackDrop(false);
      })
      .catch(err => {});
  };

  const addNewPurchase = type => {
    if (type === "Kachha") {
      setIndividualKachhaPurchase([
        ...individualKachhaPurchase,
        kachhaPurchaseDetails
      ]);
    } else {
      setIndividualPakkaPurchase([
        ...individualPakkaPurchase,
        pakkaPurchaseDetails
      ]);
    }
  };

  return (
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
              <GridItem xs={12} sm={12} md={4}>
                <CustomDropDown
                  id="type_of_bill"
                  disabled={isView}
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
                      disabled={isView}
                      labelText="Seller"
                      autocompleteId={"seller-id"}
                      optionKey={"seller_name"}
                      options={seller}
                      onChange={(event, value) => {
                        if (value === null) {
                          setFormState(formState => ({
                            ...formState,
                            seller: null
                          }));
                        } else {
                          setFormState(formState => ({
                            ...formState,
                            seller: value.id
                          }));
                        }
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
                        marginTop: "2.7rem",
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
                    disabled={isView}
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
                    type="number"
                    disabled={isView}
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
                    disabled={isView}
                    type="number"
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
                  {formState.type_of_bill === "Kachha" ? (
                    <GridItem xs={12} sm={12} md={4}>
                      <CustomInput
                        labelText="Total amount in rupees"
                        name="total_amt_without_tax"
                        disabled
                        value={formState.total_amt_without_tax_formatted}
                        id="total_amt_without_tax"
                        formControlProps={{
                          fullWidth: true
                        }}
                      />
                    </GridItem>
                  ) : (
                    <>
                      <GridItem xs={12} sm={12} md={4}>
                        <CustomInput
                          labelText="Total amount in rupees(with tax)"
                          name="total_amt_with_tax"
                          disabled
                          value={formState.total_amt_with_tax_formatted}
                          id="total_amt_with_tax"
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={4}>
                        <CustomInput
                          labelText="Total amount in rupees(without tax)"
                          name="total_amt_without_tax"
                          disabled
                          value={formState.total_amt_without_tax_formatted}
                          id="total_amt_without_tax"
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                    </>
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
                          disabled={isView}
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

                          // }}
                          onChange={(event, value) => {
                            handleChangeAutoCompleteForRepetableComponent(
                              "raw_material",
                              value,
                              key
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
                          onChange={event =>
                            handleChangeForRepetableComponent(event, key)
                          }
                          type="number"
                          disabled={isView}
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
                                {!isEmptyString(Ip.purchase_unit)
                                  ? "/" + Ip.purchase_unit
                                  : ""}
                              </InputAdornment>
                            )
                          }}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          onChange={event =>
                            handleChangeForRepetableComponent(event, key)
                          }
                          type="number"
                          disabled={isView}
                          labelText="Purchase Quantity"
                          name="purchase_quantity"
                          value={Ip.purchase_quantity}
                          id="purchase_quantity"
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          labelText="Total Purchase Cost"
                          disabled
                          name="total_purchase_cost"
                          value={Ip.total_purchase_cost_formatted}
                          id="quantity"
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                  </GridItem>
                  {!isView && key === individualKachhaPurchase.length - 1 ? (
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
                        onClick={() => addNewPurchase("Kachha")}
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
                          onChange={event =>
                            handleChangeForRepetableComponent(event, key)
                          }
                          labelText="Item Name"
                          name="name"
                          disabled={isView}
                          value={Ip.name}
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
                          onChange={event =>
                            handleChangeForRepetableComponent(event, key)
                          }
                          labelText="Purchase cost per unit"
                          type="number"
                          disabled={isView}
                          name="purchase_cost"
                          value={Ip.purchase_cost}
                          id="purchase_cost"
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <CustomInput
                          labelText="Purchase Quantity"
                          type="number"
                          disabled={isView}
                          name="purchase_quantity"
                          value={Ip.purchase_quantity}
                          onChange={event =>
                            handleChangeForRepetableComponent(event, key)
                          }
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
                          disabled
                          labelText="Total Purchase Cost"
                          name="total_purchase_cost"
                          value={Ip.total_purchase_cost_formatted}
                          id="quantity"
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                  </GridItem>

                  {!isView && key === individualKachhaPurchase.length - 1 ? (
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
                        onClick={() => addNewPurchase("Pakka")}
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
          {isView ? null : (
            <CardFooter>
              <Button color="primary" onClick={() => addButton()}>
                Add
              </Button>
            </CardFooter>
          )}
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
                <Muted>Name :{rawMaterialDetails.name}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted> Department : {rawMaterialDetails.department}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted> Color : {rawMaterialDetails.color}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted> Size : {rawMaterialDetails.size}</Muted>
              </GridItem>
              <GridItem xs={12} sm={12} md={12}>
                <Muted>
                  Balance :{" "}
                  {isEmptyString(rawMaterialDetails.balance)
                    ? "0"
                    : rawMaterialDetails.balance}
                </Muted>
              </GridItem>
            </CardBody>
          </Card>
        </GridItem>
      ) : null}
    </GridContainer>
  );
}
