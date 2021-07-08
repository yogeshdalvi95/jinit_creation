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
  CustomInput,
  FAB,
  GridContainer,
  GridItem
} from "../../components";
// core components
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { PURCHASES, RAWMATERIALSVIEW } from "../../paths";
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

const useStyles = makeStyles(styles);

export default function AddPurchases(props) {
  const classes = useStyles();
  const history = useHistory();
  const [rawMaterial, setRawMaterial] = useState([]);
  const [seller, setSeller] = useState([]);
  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    seller: "",
    seller_name: "",
    raw_material: "",
    raw_material_name: "",
    raw_material_department_name: "",
    purchase_cost: 0,
    quantity: 0,
    unit_name: "",
    notes: ""
  });

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
          [name]: null,
          unit_name: "",
          raw_material_name: "",
          raw_material_department_name: ""
        }));
      } else {
        setFormState(formState => ({
          ...formState,
          [name]: null,
          seller_name: ""
        }));
      }
    } else {
      if (name === "raw_material") {
        setFormState(formState => ({
          ...formState,
          [name]: value.id,
          unit_name: value.unit.name,
          raw_material_name: value.name,
          raw_material_department_name: value.department.name
        }));
      } else {
        setFormState(formState => ({
          ...formState,
          [name]: value.id,
          seller_name: value.seller_name
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
        raw_material_name: formState.raw_material_name,
        raw_material_department_name: formState.raw_material_department_name,
        seller_name: formState.seller_name,
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
                    handleChangeAutoComplete("raw_material", event, value);
                  }}
                  value={
                    rawMaterial[
                      rawMaterial.findIndex(function (item, i) {
                        return item.id === formState.raw_material;
                      })
                    ] || null
                  }
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
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
                <CustomInput
                  onChange={event => handleChange(event)}
                  labelText="Purchase Cost"
                  name="purchase_cost"
                  value={formState.purchase_cost}
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
              <GridItem xs={12} sm={12} md={4}>
                <CustomInput
                  onChange={event => handleChange(event)}
                  labelText="Purchase Quantity"
                  name="quantity"
                  value={formState.quantity}
                  id="quantity"
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
