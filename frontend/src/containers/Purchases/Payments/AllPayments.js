import { makeStyles } from "@material-ui/core";
import moment from "moment";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import {
  Auth,
  GridContainer,
  GridItem,
  SnackBarComponent,
  Card,
  CardHeader,
  CardBody,
  FAB,
  DatePicker,
  RemoteAutoComplete,
  CustomDropDown,
  Button,
  Table,
} from "../../../components";
import {
  backend_purchase_payment,
  backend_sellers,
  frontendServerUrl,
} from "../../../constants";
import {
  ADDPURCHASEPAYEMENT,
  EDITPURCHASEPAYEMENT,
  VIEWPURCHASEPAYEMENT,
} from "../../../paths";
import { convertNumber, plainDate } from "../../../Utils";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { providerForDelete } from "../../../api";
import DeleteIcon from "@mui/icons-material/Delete";

const useStyles = makeStyles(styles);
const AllPayments = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "payment_date:desc",
  });
  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });
  const [selectedSeller, setSelectedSeller] = React.useState(null);

  const columns = [
    {
      title: "Payment date",
      field: "payment_date",
      render: (rowData) => plainDate(new Date(rowData.payment_date)),
    },
    { title: "Seller", field: "seller.seller_name", sorting: false },
    {
      title: "Amount",
      field: "amount",
      render: (rowData) => convertNumber(rowData.amount, true),
    },
    {
      title: "Payment type",
      field: "payment_type",
      render: (rowData) =>
        rowData.payment_type === "cash" ? "Cash" : "Bank Transfer",
    },
    {
      title: "Show in kachha ledger",
      field: "kachha_ledger",
      render: (rowData) => (rowData.kachha_ledger ? "Yes" : "No"),
    },
    {
      title: "Show in Pakka ledger",
      field: "pakka_ledger",
      render: (rowData) => (rowData.pakka_ledger ? "Yes" : "No"),
    },
  ];

  const getPurchasePaymentData = async (page, pageSize) => {
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
      fetch(backend_purchase_payment + "?" + new URLSearchParams(params), {
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

  const handleAdd = () => {
    history.push(ADDPURCHASEPAYEMENT);
  };

  /** Handle End Date filter change */
  const handleEndDateChange = (event) => {
    let endDate = moment(event).endOf("day").format("YYYY-MM-DDT23:59:59.999Z");
    if (endDate === "Invalid date") {
      endDate = null;
      delete filter["payment_date_lte"];
      setFilter((filter) => ({
        ...filter,
      }));
    } else {
      endDate = new Date(endDate).toISOString();
      setFilter((filter) => ({
        ...filter,
        payment_date_lte: endDate,
      }));
    }
  };

  /** Handle Start Date filter change */
  const handleStartDateChange = (event) => {
    let startDate = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (startDate === "Invalid date") {
      startDate = null;
      delete filter["payment_date_gte"];
      setFilter((filter) => ({
        ...filter,
      }));
    } else {
      startDate = new Date(startDate).toISOString();
      setFilter((filter) => ({
        ...filter,
        payment_date_gte: startDate,
      }));
    }
  };

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
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
                  <DatePicker
                    onChange={(event) => handleStartDateChange(event)}
                    label="Payment Date From"
                    name="payment_date_gte"
                    value={filter.payment_date_gte || null}
                    id="payment_date_gte"
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
                    label="Payment Date To"
                    name="payment_date_lte"
                    value={filter.payment_date_lte || null}
                    id="payment_date_lte"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    style={{
                      marginTop: "1.5rem",
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
                    setSelectedData={setSeller}
                    searchString={"seller_name"}
                    apiName={backend_sellers}
                    placeholder="Select Seller..."
                    selectedValue={selectedSeller}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomDropDown
                    id="payment_type"
                    onChange={(event) => {
                      setFilter((filter) => ({
                        ...filter,
                        payment_type: event.target.value,
                      }));
                    }}
                    labelText="Type of Ledger"
                    name="payment_type"
                    value={filter.payment_type}
                    nameValue={[
                      { name: "Bank Transfer", value: "bank_transfer" },
                      { name: "Cash", value: "cash" },
                    ]}
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
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
                        _sort: "payment_date:desc",
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
                  return await getPurchasePaymentData(
                    query.page + 1,
                    query.pageSize
                  );
                }}
                actions={[
                  (rowData) => ({
                    icon: () => <EditIcon fontSize="small" />,
                    tooltip: "Edit",
                    onClick: (event, rowData) => {
                      history.push(EDITPURCHASEPAYEMENT + "/" + rowData.id);
                    },
                  }),
                  (rowData) => ({
                    icon: () => (
                      <VisibilityIcon fontSize="small" color="primary" />
                    ),
                    tooltip: "View",
                    onClick: (event, rowData) => {
                      history.push(VIEWPURCHASEPAYEMENT + "/" + rowData.id);
                    },
                  }),
                ]}
                localization={{
                  body: {
                    editRow: {
                      deleteText: `Are you sure you want to delete this Payment Info?`,
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
                          backend_purchase_payment,
                          oldData.id,
                          Auth.getToken()
                        )
                          .then(async (res) => {
                            setSnackBar((snackBar) => ({
                              ...snackBar,
                              show: true,
                              severity: "success",
                              message: "Successfully deleted payment",
                            }));
                          })
                          .catch((err) => {
                            setSnackBar((snackBar) => ({
                              ...snackBar,
                              show: true,
                              severity: "error",
                              message: "Error deleting payment info",
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
};

export default AllPayments;
