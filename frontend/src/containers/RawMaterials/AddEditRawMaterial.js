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
import { RAWMATERIALSVIEW } from "../../paths";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import { useEffect } from "react";
import { providerForGet, providerForPost } from "../../api";
import {
  backend_departments,
  backend_raw_materials,
  backend_units
} from "../../constants";
import { useState } from "react";
import { Backdrop, CircularProgress, InputAdornment } from "@material-ui/core";

const useStyles = makeStyles(styles);

export default function AddEditRawMaterial(props) {
  const classes = useStyles();
  const history = useHistory();
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    color: "",
    size: "",
    balance: 0,
    costing: 0,
    department: null,
    unit: null,
    unit_name: ""
  });

  useEffect(() => {
    getDepartmentData();
    getUnits();
  }, []);

  const getUnits = async () => {
    setBackDrop(true);
    await providerForGet(
      backend_units,
      {
        pageSize: -1
      },
      Auth.getToken()
    )
      .then(res => {
        setUnits(res.data.data);
        setBackDrop(false);
      })
      .catch(err => {});
  };

  const getDepartmentData = async () => {
    setBackDrop(true);
    await providerForGet(
      backend_departments,
      {
        pageSize: -1
      },
      Auth.getToken()
    )
      .then(res => {
        setDepartments(res.data.data);
        setBackDrop(false);
      })
      .catch(err => {});
  };

  console.log(formState);

  const handleChangeAutoComplete = async (name, event, value) => {
    console.log(name, value);
    if (value === null) {
      if (name === "unit") {
        setFormState(formState => ({
          ...formState,
          [name]: null,
          unit_name: ""
        }));
      } else {
        setFormState(formState => ({
          ...formState,
          [name]: null
        }));
      }
    } else {
      if (name === "unit") {
        setFormState(formState => ({
          ...formState,
          [name]: value.id,
          unit_name: value.name
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

  const onBackClick = () => {
    history.push(RAWMATERIALSVIEW);
  };

  const addButton = async () => {
    setBackDrop(true);
    await providerForPost(
      backend_raw_materials,
      {
        name: formState.name,
        department: formState.department,
        size: formState.size,
        color: formState.color,
        unit: formState.unit,
        costing: formState.costing,
        unit_name: formState.unit_name
      },
      Auth.getToken()
    )
      .then(res => {
        history.push(RAWMATERIALSVIEW);
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
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  onChange={event => handleChange(event)}
                  labelText="Name"
                  name="name"
                  value={formState.name}
                  id="name"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <CustomAutoComplete
                  id="department-name"
                  labelText="Department"
                  autocompleteId={"department"}
                  optionKey={"name"}
                  options={departments}
                  formControlProps={{
                    fullWidth: true
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
                />
              </GridItem>
            </GridContainer>

            <GridContainer>
              <GridItem xs={12} sm={12} md={4}>
                <CustomInput
                  onChange={event => handleChange(event)}
                  labelText="Size"
                  name="size"
                  value={formState.size}
                  id="size"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={4}>
                <CustomInput
                  onChange={event => handleChange(event)}
                  labelText="Color"
                  name="color"
                  value={formState.color}
                  id="color"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={4}>
                <CustomAutoComplete
                  id="unit-name"
                  labelText="Unit"
                  autocompleteId={"unit-id"}
                  optionKey={"name"}
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
                    fullWidth: true
                  }}
                />
              </GridItem>
            </GridContainer>

            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  onChange={event => handleChange(event)}
                  name="costing"
                  labelText="Costing"
                  id="costing"
                  formControlProps={{
                    fullWidth: true
                  }}
                  value={formState.costing}
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
                  name="balance"
                  labelText="Balance"
                  id="balance"
                  disabled
                  value={formState.balance}
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={4}>
                <CustomInput
                  labelText="Name"
                  id="name"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={4}>
                <CustomInput
                  labelText="Value"
                  id="value"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
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
                  onClick={() => {}}
                >
                  <AddIcon />
                </FAB>
              </GridItem>
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
                  onClick={() => {}}
                >
                  <DeleteIcon />
                </FAB>
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
    </GridContainer>
  );
}
