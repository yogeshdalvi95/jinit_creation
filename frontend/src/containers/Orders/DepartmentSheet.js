import {
  Backdrop,
  CircularProgress,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import React from "react";
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CustomInput,
  DatePicker,
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent,
} from "../../components";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import ListAltIcon from "@material-ui/icons/ListAlt";
import { useEffect } from "react";
import { ORDERS } from "../../paths";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import {
  plainDate,
  isEmptyString,
  getValidDate,
  validateNumber,
} from "../../Utils";
import moment from "moment";
import { providerForGet, providerForPost } from "../../api";
import { backend_order_to_get_department_sheet } from "../../constants";

const useStyles = makeStyles(styles);

const departmentUseStyles = makeStyles((theme) => ({
  inputClass: {
    width: "80px",
  },
  trRoot: {
    overflow: "auto",
  },
  label: {
    fontSize: "small",
    paddingLeft: 20,
  },
  cardTitleStyle: {
    fontFamily: "Montserrat",
    fontWeight: 600,
    fontSize: "1rem",
    color: "#8A8A97",
    padding: "1rem !important",
  },
  tableRowStyle: {},
  tableCellStyle: {
    fontFamily: "Montserrat",
    fontWeight: 500,
    fontSize: "0.9375rem",
    color: "#110F48",
    padding: 0,
    backgroundColor: "#f4f8ff",
  },
  borderNone: {
    padding: 0,
    border: "2px solid rgb(109 101 101)",
  },

  inputRoot: {
    "& .MuiOutlinedInput-input": {
      textAlign: "center",
      padding: "0.875rem !important",
    },
    "& .MuiOutlinedInput-root": {
      margin: "8px 0px",
    },
    "& .MuiInputBase-root": {
      fontFamily: "Montserrat",
      fontWeight: 700,
      fontSize: "1rem",
      color: "#110F48",
    },
  },
  checkBoxStyle: {
    "& .MuiCheckbox-colorSecondary.Mui-checked": {
      color: "#1C4979",
    },
  },
  cardHeaderStyle: {
    fontFamily: "Montserrat",
    fontWeight: 500,
    fontSize: "1rem",
    color: "#110F48",
    textAlign: "center",
    paddingLeft: "44%",
  },
  paddingStyle: {
    padding: 30,
    paddingRight: 0,
    paddingBottom: 0,
  },
  radioButtonStyle: {
    "& .MuiFormControlLabel-label": {
      fontFamily: "Montserrat",
      fontWeight: 500,
      fontSize: "0.9375rem",
      color: "#000000",
      textAlign: "center",
    },
    "& .MuiRadio-colorSecondary.Mui-checked": {
      color: "#1C4979",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.2rem",
    },
  },
  responsiveContainerWrap: {
    overflow: "auto",
    height: "270px",
    "& > div": {
      margin: "0 auto",
    },
  },
  root: {
    "& .MuiOutlinedInput-notchedOutline": {
      border: "0px",
    },
  },
  tableCurveCellStyle: {
    fontFamily: "Montserrat",
    fontWeight: 500,
    fontSize: "0.9375rem",
    color: "#110F48",
    textAlign: "center",
    border: "2px solid rgb(109 101 101)",
  },
}));

const DepartmentSheet = (props) => {
  const urlParams = new URLSearchParams(window.location.search);
  const classes = useStyles();
  const departmentClasses = departmentUseStyles();
  const [openBackDrop, setBackDrop] = useState(false);
  const history = useHistory();
  const [colorList, setColorList] = useState([]);
  const [orderDetail, setOrderDetail] = useState({
    order_id: null,
    nl_no: "",
    quantity: 0,
    order_date: "",
    order_no: "",
    platting: "",
    remarks: "",
  });
  const [departmentColorList, setDepartmentColorList] = useState([]);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const [isEdit] = useState(props.isEdit ? props.isEdit : null);
  const [isView] = useState(props.isView ? props.isView : null);
  const [id] = useState(props.id ? props.id : null);

  useEffect(() => {
    if (!id) {
      history.push(ORDERS);
    } else {
      getData();
    }
  }, []);

  const getData = async () => {
    setBackDrop(true);
    await providerForGet(
      backend_order_to_get_department_sheet + "/" + id,
      {},
      Auth.getToken()
    )
      .then((res) => {
        setBackDrop(false);
        setData(res.data);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error getting department sheet detail",
        }));
      });
  };

  const setData = (data) => {
    setColorList(data.colorList);
    setDepartmentColorList(data.departmentColorList);
    setOrderDetail((orderDetail) => ({
      ...orderDetail,
      order_id: data.order_id,
      nl_no: data.nl_no,
      order_no: data.order_no,
      order_date: data.order_date,
      platting: data.platting,
      remarks: data.remark,
      quantity: data.quantity,
    }));
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
    history.push(ORDERS);
  };

  /** Handle End Date filter change */
  const handleOutDate = (event, key) => {
    let endDate = moment(event).endOf("day").format("YYYY-MM-DDT23:59:59.999Z");
    if (endDate === "Invalid date") {
      endDate = null;
    } else {
      endDate = new Date(endDate).toISOString();
    }
    let outerObj = departmentColorList[key];
    outerObj = {
      ...outerObj,
      out_date: endDate,
    };
    setDepartmentColorList([
      ...departmentColorList.slice(0, key),
      outerObj,
      ...departmentColorList.slice(key + 1),
    ]);
  };

  /** Handle Start Date filter change */
  const handleInDate = (event, key) => {
    let startDate = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (startDate === "Invalid date") {
      startDate = null;
    } else {
      startDate = new Date(startDate).toISOString();
    }

    let outerObj = departmentColorList[key];
    outerObj = {
      ...outerObj,
      in_date: startDate,
    };
    setDepartmentColorList([
      ...departmentColorList.slice(0, key),
      outerObj,
      ...departmentColorList.slice(key + 1),
    ]);
  };

  const handleSave = async (event) => {
    setBackDrop(true);
    let dataToSend = {
      order_id: orderDetail.order_id,
      platting: orderDetail.platting,
      remark: orderDetail.remarks,
      departmentColorList: departmentColorList,
    };
    await providerForPost(
      backend_order_to_get_department_sheet,
      dataToSend,
      Auth.getToken()
    )
      .then((res) => {
        getData();
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
      });
  };

  const showRatioData = (data) => {
    let output = "";
    if (data) {
      let array = data ? data : [];
      array.forEach((el, index) => {
        const temp =
          el.name +
          ": " +
          validateNumber(el.quantityCompleted) +
          "/" +
          validateNumber(el.quantity);
        if (index === 0) {
          output = output + temp;
        } else {
          output = output + ", " + temp;
        }
        output = output + "\n\n";
      });
    }
    return output;
  };

  return (
    <>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary" className={classes.cardHeaderStyles}>
              <ListAltIcon fontSize="large" />
              <p className={classes.cardCategoryWhite}></p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <FAB align={"start"} size={"small"} onClick={onBackClick}>
                    <KeyboardArrowLeftIcon />
                  </FAB>
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <GridContainer style={{ dispay: "flex" }}>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>Order Number : </b> {orderDetail.order_no}
                    </GridItem>
                  </GridContainer>
                  <GridContainer style={{ dispay: "flex" }}>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>NL NO : </b>
                      {orderDetail.nl_no}
                    </GridItem>
                  </GridContainer>
                  <GridContainer style={{ dispay: "flex" }}>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>Quantity : </b>
                      {orderDetail.quantity}
                    </GridItem>
                  </GridContainer>
                  <GridContainer style={{ dispay: "flex" }}>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>Order Date : </b> {plainDate(orderDetail.order_date)}
                    </GridItem>
                  </GridContainer>
                  <GridContainer style={{ dispay: "flex" }}>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>Ratio</b> {showRatioData(colorList)}
                    </GridItem>
                  </GridContainer>
                </GridItem>
              </GridContainer>
              <GridContainer>
                {/* <GridItem xs={12} sm={12} md={4}>
                      <b>Platting : </b>
                    </GridItem> */}
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    labelText="Platting"
                    id="platting"
                    name="platting"
                    disabled={isView}
                    onChange={(e) => {
                      setOrderDetail((orderDetail) => ({
                        ...orderDetail,
                        platting: e.target.value,
                      }));
                    }}
                    value={orderDetail.platting}
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Remarks"
                    id="remarks"
                    name="remarks"
                    disabled={isView}
                    onChange={(e) => {
                      setOrderDetail((orderDetail) => ({
                        ...orderDetail,
                        remarks: e.target.value,
                      }));
                    }}
                    value={orderDetail.remarks}
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
                <Button color="primary" onClick={(e) => handleSave(e)}>
                  Save
                </Button>
              )}
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <div className={departmentClasses.trRoot}>
                    <Table className={departmentClasses.departmentTable}>
                      <TableHead>
                        <TableRow>
                          <TableCell className={departmentClasses.borderNone}>
                            <Typography
                              className={departmentClasses.cardTitleStyle}
                              align="center"
                            ></Typography>
                          </TableCell>
                          {colorList.map((c) => (
                            <TableCell className={departmentClasses.borderNone}>
                              <Typography
                                className={departmentClasses.cardTitleStyle}
                                align="center"
                              >
                                {`${c.name} (${c.quantity}/${c.quantityCompleted})`}
                              </Typography>
                            </TableCell>
                          ))}
                          <TableCell className={departmentClasses.borderNone}>
                            <Typography
                              className={departmentClasses.cardTitleStyle}
                              align="center"
                            >
                              In Date
                            </Typography>
                          </TableCell>
                          <TableCell className={departmentClasses.borderNone}>
                            <Typography
                              className={departmentClasses.cardTitleStyle}
                              align="center"
                            >
                              Out Date
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {departmentColorList.map((dc, key) => (
                          <>
                            <TableRow
                              className={departmentClasses.tableRowStyle}
                              hover={true}
                            >
                              <TableCell
                                className={
                                  departmentClasses.tableCurveCellStyle
                                }
                                align="center"
                              >
                                {dc.department.name}
                              </TableCell>

                              {dc.departmentsColor.map((d, dckey) => (
                                <TableCell
                                  className={
                                    departmentClasses.tableCurveCellStyle
                                  }
                                  align="center"
                                >
                                  <div className={departmentClasses.inputRoot}>
                                    <CustomInput
                                      disabled={isView}
                                      id={dc.department.id + "_" + d.color.id}
                                      onChange={(e) => {
                                        if (
                                          isEmptyString(e.target.value) ||
                                          (!isNaN(parseFloat(e.target.value)) &&
                                            parseFloat(e.target.value) >= 0)
                                        ) {
                                          let obj = dc.departmentsColor[dckey];
                                          obj = {
                                            ...obj,
                                            value: e.target.value,
                                          };
                                          let outerObj =
                                            departmentColorList[key];
                                          outerObj = {
                                            ...outerObj,
                                            departmentsColor: [
                                              ...outerObj.departmentsColor.slice(
                                                0,
                                                dckey
                                              ),
                                              obj,
                                              ...outerObj.departmentsColor.slice(
                                                dckey + 1
                                              ),
                                            ],
                                          };

                                          setDepartmentColorList([
                                            ...departmentColorList.slice(
                                              0,
                                              key
                                            ),
                                            outerObj,
                                            ...departmentColorList.slice(
                                              key + 1
                                            ),
                                          ]);
                                        }
                                      }}
                                      value={d.value || ""}
                                      placeholder="0"
                                      type="number"
                                      variant="outlined"
                                      noMargin={true}
                                      className={departmentClasses.inputClass}
                                      // size="small"
                                      InputProps={{
                                        style: { textAlign: "center" },
                                      }}
                                      formControlProps={{
                                        fullWidth: true,
                                      }}
                                    />
                                  </div>
                                </TableCell>
                              ))}
                              <TableCell
                                className={
                                  departmentClasses.tableCurveCellStyle
                                }
                                align="center"
                              >
                                <DatePicker
                                  disabled={isView}
                                  onChange={(event) => handleInDate(event, key)}
                                  label="In Date"
                                  name="in_date"
                                  value={getValidDate(dc.in_date)}
                                  id="date_gte"
                                  formControlProps={{
                                    fullWidth: true,
                                  }}
                                  noMargin={true}
                                  style={{
                                    width: "100%",
                                    marginTop: "0px !Important",
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                className={
                                  departmentClasses.tableCurveCellStyle
                                }
                                align="center"
                              >
                                <DatePicker
                                  disabled={isView}
                                  onChange={(event) =>
                                    handleOutDate(event, key)
                                  }
                                  label="Out Date"
                                  name="out_date"
                                  value={getValidDate(dc.out_date)}
                                  id="date_gte"
                                  formControlProps={{
                                    fullWidth: true,
                                  }}
                                  noMargin={true}
                                  style={{
                                    width: "100%",
                                    marginTop: "0px !Important",
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </GridItem>
              </GridContainer>
            </CardBody>
            {isView ? null : (
              <CardFooter>
                <Button color="primary" onClick={(e) => handleSave(e)}>
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
    </>
  );
};

export default DepartmentSheet;
