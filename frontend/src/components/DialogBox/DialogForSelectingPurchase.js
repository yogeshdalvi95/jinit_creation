import React, { useState } from "react";
// @material-ui/core components
import {
  Auth,
  Button,
  CustomDropDown,
  CustomInput,
  DatePicker,
  GridContainer,
  GridItem,
  RemoteAutoComplete,
  Table,
} from "../../components";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
// core components
import {
  backend_purchases,
  backend_sellers,
  frontendServerUrl,
} from "../../constants";
import { convertNumber, isEmptyString, plainDate } from "../../Utils";
import { makeStyles } from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { ADDGOODRETURN } from "../../paths";
import moment from "moment";
import Stack from "@mui/material/Stack";
import { LinearProgress } from "@mui/material";
import { providerForGet } from "../../api";
import { SnackBarComponent } from "../Snackbar";
import {
  CustomMaterialUITable,
  CustomTableBody,
  CustomTableCell,
  CustomTableHead,
  CustomTableRow,
} from "../Table";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { FAB } from "../FAB";

const useStyles = makeStyles(styles);
export default function DialogForSelectingPurchase(props) {
  const classes = useStyles();
  const history = useHistory();
  const tableRef = React.createRef();
  const [loader, setLoader] = useState(false);
  const [purchaseId, setPurchaseId] = useState(null);
  const [billNumber, setBillNumber] = useState("");
  const [filter, setFilter] = useState({
    _sort: "date:desc",
  });
  const [selectedSeller, setSelectedSeller] = React.useState(null);
  const individualPurchaseObject = {
    id: null,
    raw_material: null,
    raw_material_obj: "",
    purchase_cost: 0,
    purchase_quantity: 0,
    purchase_unit: "",
    total_purchase_cost: 0,
    are_raw_material_clubbed: false,
    is_raw_material: true,
    name: null,
    isNew: true,
  };
  const [individualPurchase, setIndividualPurchase] = useState([
    individualPurchaseObject,
  ]);
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

  const handleClose = () => {
    setLoader(false);
    setPurchaseId(null);
    setIndividualPurchase([]);
    setBillNumber("");
    props.handleClose();
  };

  const getPurchaseInfo = async (id) => {
    setLoader(true);
    await providerForGet(backend_purchases + "/" + id, {}, Auth.getToken())
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: err,
        }));
      });
  };

  const setData = (data) => {
    if (data.purchase.type_of_bill === "Pakka") {
      setBillNumber(data.purchase.invoice_number);
    } else {
      setBillNumber(data.purchase.bill_no);
    }
    setSelectedSeller({
      label: data.purchase?.seller?.seller_name,
      value: data.purchase?.seller?.id,
      allData: data.purchase?.seller,
    });

    let arr = [];
    data.individualPurchase.forEach((d) => {
      let object = {
        id: d.id,
        purchase_cost: d.purchase_cost,
        purchase_quantity: d.purchase_quantity,
        are_raw_material_clubbed: d.are_raw_material_clubbed,
        is_raw_material: d.is_raw_material,
        name: d.name,
        raw_material: d.raw_material,
      };
      if (d.is_raw_material) {
        let bal = "0";
        if (!d.raw_material.balance) {
          bal = "0";
        } else {
          bal = d.raw_material.balance;
        }
        let category = d.raw_material.category
          ? d.raw_material.category.name
          : "";
        let color = d.raw_material.color ? d.raw_material.color.name : "";
        let rawMaterialObj = {
          id: "#" + d.raw_material.id,
          name: d.raw_material.name,
          department: d.raw_material.department
            ? d.raw_material.department.name
            : "---",
          category: isEmptyString(category) ? "---" : category,
          color: isEmptyString(color) ? "---" : color,
          size: isEmptyString(d.raw_material.size)
            ? "---"
            : d.raw_material.size,
          bal: bal,
        };
        object = {
          ...object,
          raw_material_obj: rawMaterialObj,
        };
      }
      arr.push(object);
    });
    setIndividualPurchase(arr);
    setLoader(false);
  };

  console.log("seller in dialog => ", selectedSeller);

  const selectRawMaterial = (rawMaterial, purchaseCost) => {
    window.history.pushState(
      "",
      "Ledger",
      `${frontendServerUrl}${ADDGOODRETURN}?p=${purchaseId}&s=${selectedSeller.value}&r=${rawMaterial.id}`
    );
    props.handleAddPurchase(
      purchaseId,
      selectedSeller,
      rawMaterial,
      purchaseCost
    );
  };

  return (
    <>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <Dialog
        open={props.open}
        onClose={handleClose}
        aria-labelledby="select-raw-material-title"
        aria-describedby="select-raw-material-dialog-description"
        maxWidth={"lg"}
      >
        <DialogTitle id="dialog-title">
          {purchaseId ? "Select Raw Material" : "Select Purchase"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            {loader ? (
              <GridContainer>
                <GridItem
                  xs={12}
                  sm={12}
                  md={12}
                  style={{
                    width: 500,
                    height: 500,
                  }}
                >
                  <Stack
                    sx={{ width: "100%", color: styles.primaryColor[0] }}
                    spacing={2}
                  >
                    <LinearProgress color="inherit" />
                  </Stack>
                </GridItem>
              </GridContainer>
            ) : purchaseId ? (
              <>
                <GridContainer>
                  <FAB
                    color="primary"
                    align={"start"}
                    size={"small"}
                    toolTip={"Back to select purchase"}
                    onClick={() => {
                      setPurchaseId(null);
                      setBillNumber("");
                      setIndividualPurchase([individualPurchaseObject]);
                      // tableRef.current.onQueryChange();
                    }}
                  >
                    <ArrowBackIcon />
                  </FAB>
                  <GridItem xs={12} sm={12} md={12}>
                    Invoice/Bill number:- {billNumber}
                  </GridItem>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomMaterialUITable aria-label="simple table">
                      <CustomTableHead>
                        <CustomTableRow>
                          <CustomTableCell>Action</CustomTableCell>
                          <CustomTableCell>Is Raw Material?</CustomTableCell>
                          <CustomTableCell>
                            Name/Select Raw Material
                          </CustomTableCell>
                          <CustomTableCell>Purchase Cost</CustomTableCell>
                          <CustomTableCell>Purchase Qty</CustomTableCell>
                        </CustomTableRow>
                      </CustomTableHead>
                      <CustomTableBody>
                        {!individualPurchase.length ? (
                          <CustomTableRow>
                            <CustomTableCell
                              colSpan={7}
                              sx={{
                                textAlign: "center",
                                backgroundColor: "#dfdfdf !important",
                              }}
                            >
                              <b>No Data</b>
                            </CustomTableCell>
                          </CustomTableRow>
                        ) : (
                          <>
                            {individualPurchase.map((Ip, key) => (
                              <>
                                <CustomTableRow>
                                  <CustomTableCell>
                                    <div className={classes.block}>
                                      <Button
                                        color="primary"
                                        disabled={!Ip.is_raw_material}
                                        onClick={(e) =>
                                          selectRawMaterial(
                                            Ip.raw_material,
                                            Ip.purchase_cost
                                          )
                                        }
                                      >
                                        Select
                                      </Button>
                                    </div>
                                  </CustomTableCell>
                                  <CustomTableCell>
                                    <div className={classes.block}>
                                      {Ip.is_raw_material ? "Yes" : "No"}
                                    </div>
                                  </CustomTableCell>
                                  <CustomTableCell>
                                    {Ip.is_raw_material ? (
                                      <GridContainer style={{ dispay: "flex" }}>
                                        <GridItem xs={12} sm={12} md={12}>
                                          <b>Name : </b>{" "}
                                          {Ip.raw_material_obj.name}
                                        </GridItem>
                                        <GridItem xs={12} sm={12} md={12}>
                                          <b>Department : </b>
                                          {Ip.raw_material_obj.department}
                                        </GridItem>
                                        <GridItem xs={12} sm={12} md={12}>
                                          <b>Category : </b>
                                          {Ip.raw_material_obj.category}
                                        </GridItem>
                                        <GridItem xs={12} sm={12} md={12}>
                                          <b>Color :</b>{" "}
                                          {Ip.raw_material_obj.color}
                                        </GridItem>
                                        <GridItem xs={12} sm={12} md={12}>
                                          <b>Size : </b>
                                          {Ip.raw_material_obj.size}
                                        </GridItem>
                                        <GridItem xs={12} sm={12} md={12}>
                                          <b>Balance : </b>
                                          {Ip.raw_material_obj.bal}
                                        </GridItem>
                                      </GridContainer>
                                    ) : (
                                      <b>{Ip.name}</b>
                                    )}
                                  </CustomTableCell>
                                  <CustomTableCell
                                    sx={{
                                      minWidth: "fit-content",
                                    }}
                                  >
                                    <b>
                                      {convertNumber(Ip.purchase_cost, true)}
                                    </b>
                                  </CustomTableCell>
                                  <CustomTableCell
                                    sx={{
                                      minWidth: "fit-content",
                                    }}
                                  >
                                    <b>{Ip.purchase_quantity}</b>
                                  </CustomTableCell>
                                </CustomTableRow>
                              </>
                            ))}
                          </>
                        )}
                      </CustomTableBody>
                    </CustomMaterialUITable>
                  </GridItem>
                  {/**
                   *
                   *
                   */}
                </GridContainer>
              </>
            ) : (
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
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
                      md={3}
                      style={{ marginTop: "2.2rem" }}
                    >
                      <RemoteAutoComplete
                        setSelectedData={setSeller}
                        searchString={"seller_name"}
                        apiName={backend_sellers}
                        placeholder="Select Seller..."
                        selectedValue={selectedSeller}
                        isSeller={true}
                      />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3}>
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
                    <GridItem xs={12} sm={12} md={3}>
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
                  </GridContainer>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={3}>
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
                    <GridItem xs={12} sm={12} md={3}>
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
                      return await getPurchasesData(
                        query.page + 1,
                        query.pageSize
                      );
                    }}
                    actions={[
                      (rowData) => ({
                        icon: () => <Button color="primary">Select</Button>,
                        tooltip: "Select this Seller",
                        onClick: (event, rowData) => {
                          // props.handleAddSeller(rowData);
                          getPurchaseInfo(rowData.id);
                          setLoader(true);
                          setPurchaseId(rowData.id);
                        },
                      }),
                    ]}
                    options={{
                      pageSize: 10,
                      actionsColumnIndex: 0,
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
            )}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
}
