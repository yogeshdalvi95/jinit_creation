import React, { useState } from "react";
// @material-ui/core components
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  CustomAutoComplete,
  CustomInput,
  DatePicker,
  DialogBoxForSelectingRawMaterial,
  DialogForSelectingSeller,
  GridContainer,
  GridItem,
  RawMaterialDetail,
  SellerDetails,
  SnackBarComponent,
  Table,
} from "../../components";
// core components
import ClearIcon from "@material-ui/icons/Clear";
import {
  backend_individual_kachha_purchase,
  backend_sellers_for_autocomplete,
} from "../../constants";
import {
  convertNumber,
  dateToDDMMYYYY,
  isEmptyString,
  plainDate,
} from "../../Utils";
import {
  Backdrop,
  CircularProgress,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { providerForGet } from "../../api";
import { useHistory } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";
import { useEffect } from "react";
import moment from "moment";

const useStyles = makeStyles(styles);
export default function KachhaPurchaseDetails() {
  const classes = useStyles();
  const history = useHistory();
  const [openBackDrop, setBackDrop] = useState(false);
  const tableRef = React.createRef();
  const [rawMaterialDetails, setRawMaterialDetails] = useState({
    id: "",
    name: "",
  });

  const [sellerDetails, setSellerDetails] = useState({
    id: "",
    name: "",
  });

  const [
    openDialogForSelectingRawMaterial,
    setOpenDialogForSelectingRawMaterial,
  ] = useState(false);
  const [openDialogForSelectingSeller, setOpenDialogForSelectingSeller] =
    useState(false);

  const [filter, setFilter] = useState({
    _sort: "date:desc",
  });
  const [seller, setSeller] = useState([]);
  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const columns = [
    {
      title: "Purchase Date",
      field: "date",
      render: (rowData) => dateToDDMMYYYY(new Date(rowData.date)),
    },
    /** Transaction type */
    {
      title: "Purchased From",
      field: "seller",
      width: "100%",
      render: (rowData) => rowData.seller.name,
    },
    {
      title: "Raw Material",
      field: "raw_material",
      headerStyle: {
        width: 120,
        minWidth: 200,
      },
      render: (rowData) => (
        <>
          <GridContainer style={{ dispay: "flex" }}>
            <GridItem xs={12} sm={12} md={8}>
              <b>Id : </b>
              {`# ${rowData.raw_material.id}`}
            </GridItem>
          </GridContainer>
          <GridContainer style={{ dispay: "flex" }}>
            <GridItem xs={12} sm={12} md={8}>
              {rowData.raw_material.name}
            </GridItem>
          </GridContainer>
        </>
      ),
    },

    {
      title: "Purchase Cost Per Raw Material",
      field: "purchase_cost",
      width: "1rem",
      render: (rowData) =>
        convertNumber(rowData.purchase_cost, true) +
        "/" +
        rowData.raw_material.unit,
    },
    {
      title: "Purchase Quantity",
      field: "purchase_quantity",
      width: "10%",
    },
    {
      title: "Total Purchase Cost",
      field: "total_purchase_cost",
      width: "10%",
      render: (rowData) => convertNumber(rowData.total_purchase_cost, true),
    },
  ];

  useEffect(() => {
    getSellerNames();
  }, []);

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
      fetch(
        backend_individual_kachha_purchase + "?" + new URLSearchParams(params),
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: "Bearer " + Auth.getToken(),
          },
        }
      )
        .then((response) => response.json())
        .then((result) => {
          resolve({
            data: convertData(result.data),
            page: result.page - 1,
            totalCount: result.totalCount,
          });
        });
    });
  };

  const convertData = (allData) => {
    let x = [];
    allData.map((data) => {
      let bill_no = "";
      let raw_material = {
        id: "",
        name: "",
        color: "",
        category: "",
        size: "",
        unit: "",
        department: "",
      };
      let seller = {
        name: "",
        gst_no: "",
      };
      if (data.raw_material) {
        raw_material = {
          ...raw_material,
          id: data.raw_material.id,
          name: data.raw_material.name,
          color: data.raw_material.color ? data.raw_material.color.name : "",
          category: data.raw_material.category
            ? data.raw_material.category.name
            : "",
          size: data.raw_material.size,
          unit: data.raw_material.unit ? data.raw_material.unit.name : "--",
          department: data.raw_material.department
            ? data.raw_material.department.name
            : "--",
          balance: data.raw_material.balance,
        };
      }
      if (data.seller) {
        seller = {
          name: data.seller.seller_name,
          gst_no: data.seller.gst_no,
        };
      }
      if (data.purchase) {
        bill_no = data.purchase.bill_no;
      }
      let dataToSend = {
        bill_no: bill_no,
        raw_material: raw_material,
        seller: seller,
        purchase_cost: isEmptyString(data.purchase_cost)
          ? 0
          : data.purchase_cost,
        purchase_quantity: isEmptyString(data.purchase_quantity)
          ? 0
          : data.purchase_quantity,
        total_purchase_cost: isEmptyString(data.total_purchase_cost)
          ? 0
          : data.total_purchase_cost,
        date: data.date,
      };
      x.push(dataToSend);
    });
    return x;
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

  const handleClickOpenIndividualPurchase = async (row, isView) => {};

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  const getSellerNames = (value) => {
    let paginationFilter = {
      pageSize: -1,
    };
    providerForGet(
      backend_sellers_for_autocomplete,
      paginationFilter,
      Auth.getToken()
    )
      .then((res) => {
        setSeller(res.data.data);
      })
      .catch((err) => {
        console.log(err);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error getting seller info",
        }));
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

  const handleCloseDialogForSeller = () => {
    setOpenDialogForSelectingSeller(false);
  };

  /** Seller Dialog boxes */
  const handeAddSeller = (row) => {
    setOpenDialogForSelectingSeller(false);
    if (row) {
      setFilter((filter) => ({
        ...filter,
        seller: row.id,
      }));
      setSellerDetails((sellerDetails) => ({
        ...sellerDetails,
        id: row.id,
        name: row.seller_name,
      }));
    } else {
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Invalid Seller",
      }));
    }
  };

  const handleAddRawMaterial = (row, nameObject) => {
    setOpenDialogForSelectingRawMaterial(false);
    if (row) {
      setFilter((filter) => ({
        ...filter,
        raw_material: row.id,
      }));
      setRawMaterialDetails((rawMaterialDetails) => ({
        ...rawMaterialDetails,
        id: row.id,
        name: nameObject.name,
      }));
    } else {
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Invalid Raw Material",
      }));
    }
  };

  /** Dialogs for raw material */
  const handleCloseDialogForRawMaterial = () => {
    setOpenDialogForSelectingRawMaterial(false);
  };

  const cancelFilters = () => {
    setFilter({
      _sort: "date:desc",
    });
    setSellerDetails((sellerDetails) => ({
      ...sellerDetails,
      id: null,
      name: "",
    }));
    setRawMaterialDetails((rawMaterialDetails) => ({
      ...rawMaterialDetails,
      id: null,
      name: "",
    }));
    tableRef.current.onQueryChange();
  };

  return (
    <>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <DialogBoxForSelectingRawMaterial
        handleCancel={handleCloseDialogForRawMaterial}
        handleClose={handleCloseDialogForRawMaterial}
        handleAddRawMaterial={handleAddRawMaterial}
        open={openDialogForSelectingRawMaterial}
      />
      <DialogForSelectingSeller
        handleCancel={handleCloseDialogForSeller}
        handleClose={handleCloseDialogForSeller}
        handleAddSeller={handeAddSeller}
        open={openDialogForSelectingSeller}
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
                <GridItem
                  xs={12}
                  sm={12}
                  md={5}
                  style={{
                    margin: "27px 0px 0px",
                  }}
                >
                  <GridContainer
                    style={{
                      border: "1px solid #C0C0C0",
                      borderRadius: "10px",
                    }}
                  >
                    <GridItem
                      xs={12}
                      sm={12}
                      md={5}
                      style={{
                        margin: "15px 0px 0px",
                      }}
                    >
                      <GridContainer style={{ dispay: "flex" }}>
                        <GridItem xs={12} sm={12} md={12}>
                          <b>Name : </b> {rawMaterialDetails.name}
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={5}>
                      <Button
                        color="primary"
                        onClick={() => {
                          setOpenDialogForSelectingRawMaterial(true);
                        }}
                      >
                        {filter.raw_material
                          ? "Change Raw Material "
                          : "Select Raw Material"}
                      </Button>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={2}>
                      <IconButton
                        onClick={() => {
                          setRawMaterialDetails((rawMaterialDetails) => ({
                            ...rawMaterialDetails,
                            id: null,
                            name: "",
                          }));
                          delete filter["raw_material"];
                          setFilter((filter) => ({
                            ...filter,
                          }));
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </GridItem>
                  </GridContainer>
                </GridItem>
                <GridItem xs={12} sm={12} md={1}></GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={5}
                  style={{
                    margin: "27px 0px 0px",
                  }}
                >
                  <GridContainer
                    style={{
                      border: "1px solid #C0C0C0",
                      borderRadius: "10px",
                    }}
                  >
                    <GridItem
                      xs={12}
                      sm={12}
                      md={6}
                      style={{
                        margin: "15px 0px 0px",
                      }}
                    >
                      <GridContainer style={{ dispay: "flex" }}>
                        <GridItem xs={12} sm={12} md={12}>
                          <b>Name : </b> {sellerDetails.name}
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                      <Button
                        color="primary"
                        onClick={() => {
                          setOpenDialogForSelectingSeller(true);
                        }}
                      >
                        {filter.seller ? "Change Seller" : "Select Seller"}
                      </Button>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={2}>
                      <IconButton
                        onClick={() => {
                          setSellerDetails((sellerDetails) => ({
                            ...sellerDetails,
                            id: null,
                            name: "",
                          }));
                          delete filter["seller"];
                          setFilter((filter) => ({
                            ...filter,
                          }));
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </GridItem>
                  </GridContainer>
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Purchase Quantity"
                    value={filter.purchase_quantity_contains || ""}
                    name="purchase_quantity_contains"
                    id="purchase_quantity_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Total purchase cost"
                    value={filter.total_purchase_cost_contains || ""}
                    name="total_purchase_cost_contains"
                    id="total_purchase_cost_contains"
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
                      cancelFilters();
                    }}
                  >
                    Cancel
                  </Button>
                </GridItem>
              </GridContainer>

              <br />
              <Table
                tableRef={tableRef}
                title="Kachha Purchase Details"
                columns={columns}
                data={async (query) => {
                  return await getPurchasesData(query.page + 1, query.pageSize);
                }}
                detailPanel={(rowData) => {
                  return (
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6}>
                        <RawMaterialDetail
                          raw_material={rowData.raw_material}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6}>
                        <SellerDetails seller={rowData.seller} />
                      </GridItem>
                    </GridContainer>
                  );
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
