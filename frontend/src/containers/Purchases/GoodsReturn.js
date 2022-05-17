import React, { useState } from "react";
// @material-ui/core components
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
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
  backend_goods_return,
  backend_sellers,
  backend_raw_materials,
} from "../../constants";
import { convertNumber, isEmptyString, plainDate } from "../../Utils";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { ADDGOODRETURN, VIEWGOODRETURN, EDITGOODRETURN } from "../../paths";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";
import moment from "moment";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { providerForDelete } from "../../api";

const useStyles = makeStyles(styles);
export default function GoodsReturn() {
  const classes = useStyles();
  const history = useHistory();
  const [openBackDrop, setBackDrop] = useState(false);
  const [selectedSeller, setSelectedSeller] = React.useState(null);
  const [selectedRawMaterial, setSelectedRawMaterial] = React.useState(null);

  const tableRef = React.createRef();

  const [filter, setFilter] = useState({
    _sort: "date:desc",
  });
  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const columns = [
    {
      title: "Raw Material",
      field: "raw_material",
      render: (rowData) =>
        rowData.raw_material ? rowData.raw_material.name : "",
    },
    {
      title: "Sold To",
      field: "seller",
      render: (rowData) => (rowData.seller ? rowData.seller.seller_name : ""),
    },
    {
      title: "Quantity Sold",
      field: "quantity",
      render: (rowData) =>
        isEmptyString(rowData.quantity) ? "0" : rowData.quantity,
    },
    {
      title: "Selling Price",
      field: "total_price",
      render: (rowData) => convertNumber(rowData.total_price, true),
    },
    {
      title: "Selling Date",
      field: "date",
      render: (rowData) => plainDate(new Date(rowData.date)),
    },
  ];

  const getGoodReturnData = async (page, pageSize) => {
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
      fetch(backend_goods_return + "?" + new URLSearchParams(params), {
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
    history.push(ADDGOODRETURN);
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
    } else {
      endDate = new Date(endDate).toISOString();
    }
    setFilter((filter) => ({
      ...filter,
      date_lte: endDate,
    }));
  };

  /** Handle Start Date filter change */
  const handleStartDateChange = (event) => {
    let startDate = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (startDate === "Invalid date") {
      startDate = null;
    } else {
      startDate = new Date(startDate).toISOString();
    }
    setFilter((filter) => ({
      ...filter,
      date_gte: startDate,
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

  const setRawMaterial = (raw_material) => {
    if (raw_material && raw_material.value) {
      setFilter((filter) => ({
        ...filter,
        raw_material: raw_material.value,
      }));
      setSelectedRawMaterial(raw_material);
    } else {
      delete filter["raw_material"];
      setFilter((filter) => ({
        ...filter,
      }));
      setSelectedRawMaterial(null);
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
                <GridItem
                  xs={12}
                  sm={12}
                  md={3}
                  style={{ marginTop: "2.2rem" }}
                >
                  <RemoteAutoComplete
                    setSelectedData={setRawMaterial}
                    searchString={"name"}
                    apiName={backend_raw_materials}
                    placeholder="Select Raw Material"
                    selectedValue={selectedRawMaterial}
                    isRawMaterial={true}
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
                    placeholder="Select Seller"
                    selectedValue={selectedSeller}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <DatePicker
                    onChange={(event) => handleStartDateChange(event)}
                    label="Sell Date From"
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
                    label="Sell Date To"
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
                <GridItem
                  xs={12}
                  sm={12}
                  md={3}
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
                      setSelectedRawMaterial(null);
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
                title="Goods Return"
                columns={columns}
                data={async (query) => {
                  return await getGoodReturnData(
                    query.page + 1,
                    query.pageSize
                  );
                }}
                actions={[
                  (rowData) => ({
                    icon: () => <EditIcon fontSize="small" />,
                    tooltip: "Edit",
                    onClick: (event, rowData) => {
                      history.push(EDITGOODRETURN + "/" + rowData.id);
                    },
                  }),
                  (rowData) => ({
                    icon: () => (
                      <VisibilityIcon fontSize="small" color="primary" />
                    ),
                    tooltip: "View",
                    onClick: (event, rowData) => {
                      history.push(VIEWGOODRETURN + "/" + rowData.id);
                    },
                  }),
                ]}
                localization={{
                  body: {
                    editRow: {
                      deleteText: `Are you sure you want to delete this goods return info ?`,
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
                          backend_goods_return,
                          oldData.id,
                          Auth.getToken()
                        )
                          .then(async (res) => {
                            setSnackBar((snackBar) => ({
                              ...snackBar,
                              show: true,
                              severity: "success",
                              message: "Successfully deleted goods return info",
                            }));
                          })
                          .catch((err) => {
                            setSnackBar((snackBar) => ({
                              ...snackBar,
                              show: true,
                              severity: "error",
                              message: "Error deleting goods return info",
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

      <Backdrop className={classes.backdrop} open={openBackDrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
