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
  DialogBox,
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
import { providerForGet, providerForPost, providerForPut } from "../../api";
import {
  backend_departments,
  backend_raw_materials,
  backend_units
} from "../../constants";
import { useState } from "react";
import { Backdrop, CircularProgress, InputAdornment } from "@material-ui/core";
import { isEmptyString } from "../../Utils";

const useStyles = makeStyles(styles);

export default function AddEditRawMaterial(props) {
  const classes = useStyles();
  const history = useHistory();
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({
    id: null,
    name: "",
    color: "",
    size: "",
    balance: 0,
    costing: 0,
    department: null,
    unit: null,
    unit_name: "",
    is_die: false,
    name_value: []
  });
  const [openDialog, setOpenDialog] = useState(false);

  /** VIMP to check if the data is used for viewing */
  const [isView] = useState(
    props.location.state ? props.location.state.view : false
  );

  /** VIMP to check if the data is used for editing */
  const [isEdit] = useState(
    props.location.state ? props.location.state.edit : false
  );

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

  const setData = data => {
    setFormState(formState => ({
      ...formState,
      id: data.id,
      name: data.name,
      color: data.color,
      size: data.size,
      balance: data.balance,
      costing: data.costing,
      department: data.department ? data.department.id : null,
      unit: data.unit ? data.unit.id : null,
      unit_name: data.unit ? data.unit.name : "",
      is_die: data.is_die,
      name_value: data.name_value
    }));
  };

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

  const handleChangeAutoComplete = async (name, event, value) => {
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

  const filterOutWrongValuesInNameValue = () => {
    let arr = formState.name_value;
    let newArr = [];
    arr.map(nv => {
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
            value: nv.value
          });
        } else {
          newArr.push({
            name: nv.name,
            value: nv.value
          });
        }
      }
    });
    setFormState(formState => ({
      ...formState,
      name_value: newArr
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
          unit: formState.unit,
          costing: formState.costing,
          unit_name: formState.unit_name,
          is_die: formState.is_die,
          name_value: arr
        },
        Auth.getToken()
      )
        .then(res => {
          history.push(RAWMATERIALSVIEW);
          setBackDrop(false);
        })
        .catch(err => {});
    } else {
      await providerForPost(
        backend_raw_materials,
        {
          name: formState.name,
          department: formState.department,
          size: formState.size,
          color: formState.color,
          unit: formState.unit,
          costing: formState.costing,
          balance: formState.balance,
          unit_name: formState.unit_name,
          is_die: formState.is_die,
          name_value: arr
        },
        Auth.getToken()
      )
        .then(res => {
          history.push(RAWMATERIALSVIEW);
          setBackDrop(false);
        })
        .catch(err => {});
    }
  };

  const addNewValue = () => {
    setFormState(formState => ({
      ...formState,
      name_value: [
        {
          id: null,
          name: "",
          value: ""
        },
        ...formState.name_value
      ]
    }));
  };

  const handleChangeRepeatableComponent = (e, k) => {
    let obj = formState.name_value[k];
    obj = {
      ...obj,
      [e.target.name]: e.target.value
    };
    setFormState(formState => ({
      ...formState,
      name_value: [
        ...formState.name_value.slice(0, k),
        obj,
        ...formState.name_value.slice(k + 1)
      ]
    }));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAcceptDialog = () => {
    setOpenDialog(false);
    addButton();
  };

  const submit = () => {
    if (isEdit) {
      addButton();
    } else {
      setOpenDialog(true);
    }
  };

  return (
    <>
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
          `Please make sure you have added the right Initial balance as balance once added cannot be edited from here.`,
          `Are you sure you
        want to proceed ?`
        ]}
      ></DialogBox>
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
                <GridItem xs={12} sm={12} md={5}>
                  <CustomInput
                    onChange={event => handleChange(event)}
                    labelText="Name"
                    disabled={isView}
                    name="name"
                    value={formState.name}
                    id="name"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={5}>
                  <CustomAutoComplete
                    id="department-name"
                    labelText="Department"
                    disabled={isView}
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
                <GridItem xs={12} sm={12} md={2}>
                  <CustomCheckBox
                    onChange={event => {
                      setFormState(formState => ({
                        ...formState,
                        is_die: event.target.checked
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
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    onChange={event => handleChange(event)}
                    labelText="Size"
                    name="size"
                    disabled={isView}
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
                    disabled={isView}
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
                    disabled={isView}
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
                    labelText={isView || isEdit ? "Balance" : "Initial Balance"}
                    id="balance"
                    disabled={isView || isEdit}
                    value={formState.balance}
                    formControlProps={{
                      fullWidth: true
                    }}
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
                      onChange={event =>
                        handleChangeRepeatableComponent(event, key)
                      }
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={4}>
                    <CustomInput
                      labelText="Value"
                      id="value"
                      name="value"
                      disabled={isView}
                      onChange={event =>
                        handleChangeRepeatableComponent(event, key)
                      }
                      value={formState.name_value[key].value || ""}
                      formControlProps={{
                        fullWidth: true
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
                          setFormState(formState => ({
                            ...formState,
                            name_value: [
                              ...formState.name_value.slice(0, key),
                              ...formState.name_value.slice(key + 1)
                            ]
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
                <Button color="primary" onClick={() => submit()}>
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
