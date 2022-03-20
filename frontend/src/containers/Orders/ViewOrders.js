import React, { useState } from "react";

import { FormControlLabel, Icon, makeStyles, Switch } from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { convertNumber, isEmptyString, dateToDDMMYYYY } from "../../Utils";
import {
  backend_order,
  backend_order_to_get_department_sheet,
} from "../../constants";
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  CustomDropDown,
  CustomInput,
  DatePicker,
  FAB,
  GridContainer,
  GridItem,
  RatioTable,
  SnackBarComponent,
  Table,
} from "../../components";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";
import { ADDORDER, DEPARTMENTSHEET, EDITORDER, VIEWORDER } from "../../paths";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { providerForGet } from "../../api";
import { useEffect } from "react";
import moment from "moment";
import { Typography } from "@mui/material";

const useStyles = makeStyles(styles);

export default function ViewOrders(props) {
  const classes = useStyles();
  const tableRef = React.createRef();
  const history = useHistory();
  const [openBackDrop, setBackDrop] = useState(false);
  const [filter, setFilter] = useState({
    _sort: "date:desc",
    in_progress: true,
  });

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const columns = [
    {
      title: "Order Date",
      field: "date",
      render: (rowData) => dateToDDMMYYYY(new Date(rowData.date)),
    },
    {
      title: "Order Number",
      field: "order_id",
      render: (rowData) => "#" + rowData.order_id,
    },
    {
      title: "Design",
      sorting: false,
      field: "design",
      render: (rowData) =>
        rowData.design?.material_no ? rowData.design?.material_no : "----",
    },
    {
      title: "Party",
      field: "party",
      sorting: false,
      render: (rowData) => (rowData.party ? rowData.party.party_name : "----"),
    },
    // {
    //   title: "Party Number",
    //   field: "party_no",
    // },
    {
      title: "Ratio",
      render: (rowData) => {
        let output = "";
        if (rowData.orderRatio && rowData.orderRatio.length) {
          let array = rowData.orderRatio;
          array.forEach((el, index) => {
            const temp =
              el.color?.name + ": " + el.quantity + "/" + el.quantity_completed;
            if (index === 0) {
              output = output + temp;
            } else {
              output = output + ", " + temp;
            }
            output = output + "\n\n";
          });
        } else {
          output = rowData.quantity + "/" + rowData.completed_quantity;
        }
        return output;
      },
    },
    // {
    //   title: "Quantity saved for later",
    //   field: "buffer_quantity",
    // },
    // { title: "Completed Quantity", field: "completed_quantity" },

    // {
    //   title: "Total Price",
    //   field: "total_price",
    //   render: (rowData) => convertNumber(rowData.total_price, true),
    // },
    {
      title: "Status",
      render: (rowData) => {
        if (rowData.in_progress) {
          return "In Progress";
        }
        if (rowData.completed) {
          return "Completed";
        }
        if (rowData.cancelled) {
          return "Cancelled";
        }
      },
    },
  ];

  const getOrderData = async (page, pageSize) => {
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
      fetch(backend_order + "?" + new URLSearchParams(params), {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + Auth.getToken(),
        },
      })
        .then((response) => response.json())
        .then((result) => {
          resolve({
            data: result.data,
            page: result.page - 1,
            totalCount: result.totalCount,
          });
        })
        .catch((err) => {
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error",
          }));
        });
    });
  };

  const orderFunc = (columnId, direction) => {
    let orderByColumn;
    let orderBy = "";
    if (columnId >= 0) {
      orderByColumn = columns[columnId]["field"];
    }
    orderBy = orderByColumn + ":" + direction;
    setFilter((filter) => ({
      ...filter,
      _sort: orderBy,
    }));
    tableRef.current.onQueryChange();
  };

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  const handleAdd = () => {
    history.push(ADDORDER);
  };

  const handleTableAction = async (row, isView) => {
    if (isView) {
      history.push({
        pathname: VIEWORDER,
        search: `?oid=${row.id}`,
        state: { view: true },
      });
    } else {
      history.push({
        pathname: EDITORDER,
        search: `?oid=${row.id}`,
        state: { edit: true },
      });
    }
  };

  const handleDepartmentSheet = async (row) => {
    history.push({
      pathname: DEPARTMENTSHEET,
      search: `?oid=${row.id}`,
    });
  };

  const handleChange = (event) => {
    if (isEmptyString(event.target.value)) {
      delete filter[event.target.name];
      setFilter((filter) => ({
        ...filter,
      }));
    } else {
      setFilter((filter) => ({
        ...filter,
        [event.target.name]: event.target.value,
      }));
    }
  };

  /** Handle End Date filter change */
  const handleEndDateChange = (event) => {
    let endDate = moment(event).endOf("day").format("YYYY-MM-DDT23:59:59.999Z");
    if (endDate === "Invalid date") {
      endDate = null;
      delete filter["date_lte"];
      setFilter((filter) => ({
        ...filter,
      }));
    } else {
      endDate = new Date(endDate).toISOString();
      setFilter((filter) => ({
        ...filter,
        date_lte: endDate,
      }));
    }
  };

  /** Handle Start Date filter change */
  const handleStartDateChange = (event) => {
    let startDate = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (startDate === "Invalid date") {
      startDate = null;
      delete filter["date_gte"];
      setFilter((filter) => ({
        ...filter,
      }));
    } else {
      startDate = new Date(startDate).toISOString();
      setFilter((filter) => ({
        ...filter,
        date_gte: startDate,
      }));
    }
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
                  <FAB
                    color="primary"
                    align={"end"}
                    size={"small"}
                    onClick={() => handleAdd()}
                  >
                    <AddIcon />
                  </FAB>
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Order Number"
                    value={filter.order_id_contains || ""}
                    name="order_id_contains"
                    id="order_id_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <DatePicker
                    onChange={(event) => handleStartDateChange(event)}
                    label="Order Date From"
                    name="date_gte"
                    value={filter.date_gte || null}
                    id="date_gte"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    style={{
                      marginTop: "1.5rem",
                      width: "100%",
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <DatePicker
                    onChange={(event) => handleEndDateChange(event)}
                    label="Order Date To"
                    name="date_lte"
                    value={filter.date_lte || null}
                    id="date_lte"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    style={{
                      marginTop: "1.5rem",
                      width: "100%",
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Material Number"
                    value={filter["ready_material.material_no_contains"] || ""}
                    name="ready_material.material_no_contains"
                    id="ready_material.material_no_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Party Name"
                    value={filter["party.party_name_contains"] || ""}
                    name="party.party_name_contains"
                    id="party.party_name_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Party Number"
                    value={filter["party_no_contains"] || ""}
                    name="party_no_contains"
                    id="party_no_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Quantity"
                    value={filter["quantity_contains"] || ""}
                    name="quantity_contains"
                    id="quantity_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Quantity saved for later"
                    value={filter["buffer_quantity_contains"] || ""}
                    name="buffer_quantity_contains"
                    id="buffer_quantity_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Completed Quantity"
                    value={filter["completed_quantity_contains"] || ""}
                    name="completed_quantity_contains"
                    id="completed_quantity_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Total Price"
                    value={filter["total_price_contains"] || ""}
                    name="total_price_contains"
                    id="total_price_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
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
                          checked={filter["fully_completed"] ? true : false}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setFilter((filter) => ({
                                ...filter,
                                fully_completed: event.target.checked,
                              }));
                            } else {
                              delete filter["fully_completed"];
                              setFilter((filter) => ({
                                ...filter,
                              }));
                            }
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
                      label="Completed orders"
                    />
                  </div>
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
                          checked={filter["partial_completed"] ? true : false}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setFilter((filter) => ({
                                ...filter,
                                partial_completed: event.target.checked,
                              }));
                            } else {
                              delete filter["partial_completed"];
                              setFilter((filter) => ({
                                ...filter,
                              }));
                            }
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
                      label="Partial completed orders"
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
                          checked={filter["cancelled"] ? true : false}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setFilter((filter) => ({
                                ...filter,
                                cancelled: event.target.checked,
                              }));
                            } else {
                              delete filter["cancelled"];
                              setFilter((filter) => ({
                                ...filter,
                              }));
                            }
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
                      label="Cancelled orders"
                    />
                  </div>
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem
                  xs={12}
                  sm={12}
                  md={4}
                  style={{
                    marginTop: "27px",
                  }}
                >
                  <Button
                    color="primary"
                    onClick={() => {
                      tableRef.current.onQueryChange();
                    }}
                  >
                    Search
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      setFilter({
                        _sort: "date:desc",
                      });
                      tableRef.current.onQueryChange();
                    }}
                  >
                    Cancel
                  </Button>
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <Table
                    tableRef={tableRef}
                    title="Departments"
                    columns={columns}
                    data={async (query) => {
                      return await getOrderData(query.page + 1, query.pageSize);
                    }}
                    localization={{
                      body: {
                        editRow: {
                          deleteText: `Are you sure you want to delete this Admin User?`,
                          saveTooltip: "Delete",
                        },
                      },
                    }}
                    actions={[
                      (rowData) => ({
                        icon: () => <EditIcon fontSize="small" />,
                        tooltip: "Edit",
                        onClick: (event, rowData) => {
                          handleTableAction(rowData, false);
                        },
                      }),
                      (rowData) => ({
                        icon: () => <VisibilityIcon fontSize="small" />,
                        tooltip: "View",
                        onClick: (event, rowData) => {
                          handleTableAction(rowData, true);
                        },
                      }),
                      (rowData) => ({
                        icon: () => <Icon fontSize="small">edit_note</Icon>,
                        tooltip: "Department Sheet",
                        onClick: (event, rowData) => {
                          handleDepartmentSheet(rowData);
                        },
                      }),
                    ]}
                    detailPanel={(rowData) => {
                      if (rowData.ratio.length) {
                        return (
                          <GridContainer className={classes.detailPanelGrid}>
                            <GridItem xs={12} sm={12} md={12}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                component="div"
                              >
                                Ratio
                              </Typography>
                            </GridItem>
                            <GridItem xs={12} sm={12} md={12}>
                              <RatioTable title="Ratio" rows={rowData.ratio} />
                            </GridItem>
                          </GridContainer>
                        );
                      } else {
                        return null;
                      }
                    }}
                    options={{
                      pageSize: 10,
                      actionsColumnIndex: -1,
                      search: false,
                      sorting: true,
                      thirdSortClick: false,
                    }}
                    onOrderChange={(orderedColumnId, orderDirection) => {
                      orderFunc(orderedColumnId, orderDirection);
                    }}
                  />
                </GridItem>
              </GridContainer>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </>
  );
}
