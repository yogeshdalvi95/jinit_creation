import React, { useState } from "react";
// @material-ui/core components
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
  RemoteAutoComplete,
  SnackBarComponent,
  Table,
} from "../../components";
// core components
import {
  backend_purchases,
  backend_sellers,
  frontendServerUrl,
} from "../../constants";
import { convertNumber, isEmptyString, plainDate } from "../../Utils";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { makeStyles } from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { providerForDelete } from "../../api";
import { useHistory } from "react-router-dom";
import { VIEWPURCHASES, EDITPURCHASES, ADDPURCHASES } from "../../paths";
import EditIcon from "@material-ui/icons/Edit";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";
import moment from "moment";
import DeleteIcon from "@mui/icons-material/Delete";

const useStyles = makeStyles(styles);
export default function Purchases() {
  const classes = useStyles();
  const history = useHistory();
  const tableRef = React.createRef();

  const [filter, setFilter] = useState({
    _sort: "date:desc",
  });
  const [selectedSeller, setSelectedSeller] = React.useState(null);
  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const columns = [
    { title: "Type of purchase", field: "type_of_bill" },
    {
      title: "Purchased From",
      field: "seller",
      render: (rowData) => (rowData.seller ? rowData.seller.seller_name : ""),
    },
    {
      title: "Invoice / Bill Number",
      field: "invoice_number",
      render: (rowData) =>
        rowData.type_of_bill === "Pakka"
          ? rowData.invoice_number
          : rowData.bill_no,
    },
    {
      title: "Total Amount",
      field: "total_amt_with_tax",
      render: (rowData) => convertNumber(rowData.total_amt_with_tax, true),
    },
    {
      title: "Purchase date",
      field: "date",
      render: (rowData) => plainDate(new Date(rowData.date)),
    },
  ];

  const getPurchasesData = async (page, pageSize) => {
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
      console.log("hererererere");
      fetch(backend_purchases + "?" + new URLSearchParams(params), {
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
              throw new Error("Something went wrong");
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
        .catch((error) => {
          throw error;
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
    history.push(ADDPURCHASES);
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

  const setSeller = (seller) => {
    if (seller && seller.value) {
      setFilter((filter) => ({
        ...filter,
        seller: seller.value,
      }));
      setSelectedSeller(seller);
    } else {
      delete filter["seller"];
      setFilter((filter) => ({
        ...filter,
      }));
      setSelectedSeller(null);
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
                  <CustomDropDown
                    id="type_of_bill"
                    onChange={(event) => handleChange(event)}
                    labelText="Type of Purchase"
                    name="type_of_bill"
                    value={filter.type_of_bill || ""}
                    nameValue={[
                      { name: "Pakka", value: "Pakka" },
                      { name: "Kachha", value: "Kachha" },
                    ]}
                    formControlProps={{
                      fullWidth: true,
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
                    setSelectedData={setSeller}
                    searchString={"seller_name"}
                    apiName={backend_sellers}
                    placeholder="Select Seller..."
                    selectedValue={selectedSeller}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Invoice Number"
                    value={filter.invoice_number_contains || ""}
                    name="invoice_number_contains"
                    id="invoice_number_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Bill Number"
                    value={filter.bill_no_contains || ""}
                    name="bill_no_contains"
                    id="bill_no_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <DatePicker
                    onChange={(event) => handleStartDateChange(event)}
                    label="Purchase Date From"
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
                    label="Purchase Date To"
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
                      setSelectedSeller(null);
                      tableRef.current.onQueryChange();
                    }}
                  >
                    Cancel
                  </Button>
                </GridItem>
              </GridContainer>

              <br />
              <Table
                tableRef={tableRef}
                title="Purchases"
                columns={columns}
                data={async (query) => {
                  return await getPurchasesData(query.page + 1, query.pageSize);
                }}
                actions={[
                  (rowData) => ({
                    icon: () => <EditIcon fontSize="small" />,
                    tooltip: "Edit",
                    onClick: (event, rowData) => {
                      history.push(EDITPURCHASES + "/" + rowData.id);
                    },
                  }),
                  (rowData) => ({
                    icon: () => (
                      <VisibilityIcon fontSize="small" color="primary" />
                    ),
                    tooltip: "View",
                    onClick: (event, rowData) => {
                      history.push(VIEWPURCHASES + "/" + rowData.id);
                    },
                  }),
                ]}
                localization={{
                  body: {
                    editRow: {
                      deleteText: `Are you sure you want to delete this Purchase Info?`,
                      saveTooltip: "Delete",
                    },
                  },
                }}
                icons={{
                  Delete: () => <DeleteIcon style={{ color: "red" }} />,
                }}
                editable={{
                  onRowDelete: (oldData) =>
                    new Promise((resolve) => {
                      setTimeout(async () => {
                        await providerForDelete(
                          backend_purchases,
                          oldData.id,
                          Auth.getToken()
                        )
                          .then(async (res) => {
                            setSnackBar((snackBar) => ({
                              ...snackBar,
                              show: true,
                              severity: "success",
                              message: "Successfully deleted purchase",
                            }));
                          })
                          .catch((err) => {
                            setSnackBar((snackBar) => ({
                              ...snackBar,
                              show: true,
                              severity: "error",
                              message: "Error deleting purchase",
                            }));
                          });
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
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </>
  );
}
