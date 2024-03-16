import React, { useState } from "react";

import { saveAs } from "file-saver";
import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  Icon,
  makeStyles,
  Switch,
} from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { isEmptyString, dateToDDMMYYYY, s2ab } from "../../Utils";
import {
  backend_download_all_orders,
  backend_order,
  backend_order_check_raw_material_availibility_for_all_order,
  backend_download_orders_sheet,
  frontendServerUrl,
  backend_parties,
  backend_designs,
} from "../../constants";
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  CustomInput,
  DatePicker,
  FAB,
  GridContainer,
  GridItem,
  RemoteAutoComplete,
  SnackBarComponent,
  Table,
} from "../../components";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";
import {
  ADDORDER,
  EDITDEPARTMENTSHEET,
  EDITORDER,
  VIEWORDER,
} from "../../paths";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import moment from "moment";
import { validateNumber } from "../../Utils";
import {
  providerForDelete,
  providerForDownload,
  providerForGet,
} from "../../api";
import DownloadIcon from "@mui/icons-material/Download";

const useStyles = makeStyles(styles);

export default function ViewOrders(props) {
  const classes = useStyles();
  const tableRef = React.createRef();
  const history = useHistory();
  const [party, setParty] = useState(null);
  const [design, setDesign] = useState(null);
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
              el.color?.name +
              ": " +
              validateNumber(el.quantity_completed) +
              "/" +
              validateNumber(el.quantity);
            if (index === 0) {
              output = output + temp;
            } else {
              output = output + ", " + temp;
            }
            output = output + "\n\n";
          });
        } else {
          output = rowData.completed_quantity + "/" + rowData.quantity;
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
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            if (response.status === 401) {
              Auth.clearAppStorage();
              window.location.href = `${frontendServerUrl}/login`;
            } else {
            }
          }
        })
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
      history.push(`${VIEWORDER}/${row.id}`);
    } else {
      history.push(`${EDITORDER}/${row.id}`);
    }
  };

  const handleDepartmentSheet = async (row) => {
    history.push(`${EDITDEPARTMENTSHEET}/${row.id}`);
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

  const checkAvailibility = async () => {
    setBackDrop(true);
    providerForGet(
      backend_order_check_raw_material_availibility_for_all_order,
      filter,
      Auth.getToken()
    )
      .then((res) => {
        saveAs(
          new Blob([s2ab(res.data)], { type: "application/octet-stream" }),
          `raw_material_availibility.xlsx`
        );
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error while exporting data",
        }));
      });
  };

  const downloadOrder = async () => {
    setBackDrop(true);
    await providerForDownload(
      backend_download_all_orders,
      filter,
      Auth.getToken()
    )
      .then((res) => {
        const url = URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );
        const pdfNewWindow = window.open();
        pdfNewWindow.location.href = url;
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error while downloading order data",
        }));
      });
  };

  const downloadOrderSheet = async (rowData) => {
    setBackDrop(true);
    await providerForDownload(
      backend_download_orders_sheet,
      {
        id: rowData.id,
      },
      Auth.getToken()
    )
      .then((res) => {
        const url = URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );
        const pdfNewWindow = window.open();
        pdfNewWindow.location.href = url;
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
        console.log("error ", err);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error while downloading order data",
        }));
      });
  };

  const setPartyData = (party) => {
    if (party && party.value) {
      setFilter((filter) => ({
        ...filter,
        party: party.value,
      }));
      setParty(party);
    } else {
      delete filter["party"];
      setFilter((filter) => ({
        ...filter,
      }));
      setParty(null);
    }
  };

  const setDesignData = (design) => {
    console.log("design => ", design);
    if (design && design.value) {
      setFilter((filter) => ({
        ...filter,
        design: design.value,
      }));
      setDesign(design);
    } else {
      delete filter["design"];
      setFilter((filter) => ({
        ...filter,
      }));
      setDesign(null);
    }
  };

  const onRowDelete = async (data) => {
    let setRef = tableRef.current;
    await providerForDelete(
      `${backend_order}/${data.id}`,
      null,
      Auth.getToken()
    )
      .then((res) => {
        if (setRef) {
          setRef.onQueryChange();
        }
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "success",
          message: "Successfully deleted order",
        }));
      })
      .catch((err) => {
        console.log("err ", err);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error deleting order",
        }));
      });
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
                      marginTop: "1.8rem",
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
                      marginTop: "1.8rem",
                      width: "100%",
                    }}
                  />
                </GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={2}
                  style={{ marginTop: "2.2rem" }}
                >
                  <RemoteAutoComplete
                    setSelectedData={setDesignData}
                    searchString={"material_no"}
                    apiName={backend_designs}
                    placeholder="Select Design..."
                    selectedValue={design}
                  />
                </GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={2}
                  style={{ marginTop: "2.2rem" }}
                >
                  <RemoteAutoComplete
                    setSelectedData={setPartyData}
                    searchString={"party_name"}
                    apiName={backend_parties}
                    placeholder="Select Party..."
                    selectedValue={party}
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
                          checked={filter["completed"] ? true : false}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setFilter((filter) => ({
                                ...filter,
                                completed: event.target.checked,
                              }));
                            } else {
                              delete filter["completed"];
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
                          checked={filter["in_progress"] ? true : false}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setFilter((filter) => ({
                                ...filter,
                                in_progress: event.target.checked,
                              }));
                            } else {
                              delete filter["in_progress"];
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
                      label="In progress"
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
                  md={12}
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
                      setParty(null);
                      setDesign(null);
                      tableRef.current.onQueryChange();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button color="primary" onClick={() => checkAvailibility()}>
                    Check Stock Availability
                  </Button>
                  <Button color="primary" onClick={() => downloadOrder()}>
                    Download Order
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
                          deleteText: `Are you sure you want to delete this Order?`,
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
                        icon: () => (
                          <VisibilityIcon fontSize="small" color="primary" />
                        ),
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
                      (rowData) => ({
                        icon: () => <DownloadIcon fontSize="small" />,
                        tooltip: "Download Order Sheet",
                        onClick: (event, rowData) => {
                          downloadOrderSheet(rowData);
                        },
                      }),
                    ]}
                    editable={{
                      onRowDelete: (oldData) =>
                        new Promise((resolve) => {
                          setTimeout(async () => {
                            onRowDelete(oldData);
                            resolve();
                          }, 1000);
                        }),
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
      <Backdrop className={classes.backdrop} open={openBackDrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
