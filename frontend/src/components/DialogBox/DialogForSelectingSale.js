import React, { useEffect, useState } from "react";
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
} from "..";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
// core components
import {
  backend_parties,
  backend_sales,
  frontendServerUrl,
} from "../../constants";
import {
  checkIFValidDateObject,
  convertNumber,
  isEmptyString,
  plainDate,
  validateNumber,
} from "../../Utils";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { SnackBarComponent } from "../Snackbar";
import {
  addQueryParam,
  removeAllQueryParams,
  removeParamFromUrl,
  setAllQueryParamsForSearch,
  setAllQueryParamsFromUrl,
} from "../../Utils/CommonUtils";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { Link } from "@mui/material";
import { VIEWSALES } from "../../paths";
import { providerForGet } from "../../api";
const useStyles = makeStyles(styles);

export default function DialogForSelectingSale(props) {
  const classes = useStyles();
  const [openBackDrop, setOpenBackDrop] = useState(false);
  const [selectedparty, setSelectedParty] = React.useState(null);
  const [selectedDesign, setSelectedDesign] = React.useState({});
  const [remoteData, setRemoteData] = useState([]);
  const [saleId, setSaleId] = useState(null);
  const [formState, setFormState] = useState(null);
  const history = useHistory();
  const tableRef = React.createRef();
  const [party, setParty] = useState(null);
  const [filter, setFilter] = useState({
    _sort: "date:desc",
  });

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const setPartyValue = (value) => {
    setParty({
      value: value,
    });
  };

  useEffect(() => {
    const allFilters = [
      { name: "type_of_bill", type: "string" },
      { name: "bill_no_contains", type: "string" },
      { name: "date_gte", type: "start_date" },
      { name: "date_lte", type: "end_date" },
      { name: "total_price_gte", type: "number" },
      { name: "total_price_lte", type: "number" },
      {
        name: "party",
        type: "number",
        isCallBack: true,
        callBack: setPartyValue,
      },
    ];
    let filterObject = {
      ...filter,
    };
    filterObject = setAllQueryParamsFromUrl(filterObject, allFilters, "osd");
    setFilter(filterObject);
  }, [props]);

  useEffect(() => {
    if (tableRef && tableRef.current && tableRef.current.dataManager) {
      // tableRef.current.onQueryChange({
      //   ...
      // })
      console.log("tablerre => ", tableRef.current);
      // tableRef.current.dataManager.changeCurrentPage(1);
      // let tableState = tableRef.current.dataManager.getRenderState();
      // tableRef.current.setState(tableState);
    }
  }, [tableRef]);

  const columns = [
    { title: "Type of sale", field: "type_of_bill" },
    {
      title: "Sale date",
      field: "date",
      render: (rowData) => plainDate(new Date(rowData.date)),
    },
    {
      title: "Invoice / Bill Number",
      field: "bill_no",
    },
    {
      title: "Sold To",
      field: "party",
      render: (rowData) => (rowData.party ? rowData.party.party_name : ""),
    },
    {
      title: "Total Price",
      field: "total_price",
      render: (rowData) => convertNumber(rowData.total_price, true),
    },
  ];

  const getSaleData = async (page, pageSize) => {
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
      fetch(backend_sales + "?" + new URLSearchParams(params), {
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

  const handleChange = (event, param) => {
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

  const handleClose = () => {
    removeAllQueryParams(filter, "osd");
    props.handleClose();
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

  function BootstrapDialogTitle(props) {
    const { children, onClose, ...other } = props;

    return (
      <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
        {children}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
    );
  }

  const onSearch = () => {
    setAllQueryParamsForSearch(filter, "osd");
    tableRef.current.onQueryChange();
  };

  const selectedSale = async (id) => {
    setOpenBackDrop(true);
    let isError = false;
    await providerForGet(backend_sales + "/" + id, {}, Auth.getToken())
      .then((res) => {
        setSaleId(id);
        if (res.status === 200) {
          convertData(res.data);
        } else {
          isError = true;
        }
      })
      .catch((err) => {
        setOpenBackDrop(false);
        isError = true;
      });
    if (isError) {
      // history.push(NOTFOUNDPAGE);
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Error fetching sale data",
      }));
    }
  };

  const convertData = (data) => {
    setOpenBackDrop(true);
    setFormState((formState) => ({
      ...formState,
      bill_no: data.bill_no,
      date: new Date(data.date),
      type_of_bill: data.type_of_bill,
      total_price_of_all_design: validateNumber(data.total_price_of_all_design),
      total_price_without_gst: validateNumber(data.total_price_with_add_cost),
      add_cost: validateNumber(data.add_cost),
      total_price: validateNumber(data.total_price),
      sgst: validateNumber(data.sgst),
      cgst: validateNumber(data.cgst),
      igst: validateNumber(data.igst),
      party: data.party.id,
    }));

    setSelectedParty({
      gst_no: data.party.gst_no,
      id: data.party.id,
      party_name: data.party.party_name,
      address: data.party.party_address,
      is_retailer: data.party.party_address,
      is_whole_seller: data.party.is_whole_seller,
    });

    let saleReadyMaterial = {};
    data.sale_ready_material.forEach((el) => {
      let designId = el.design?.id;
      let colorId = el.color?.id;
      let design = el.design;
      /** ----------------------------------------- */
      let colorData = {
        design: designId,
        colorData: el.color,
        color: colorId,
        quantity: validateNumber(el.quantity),
        previousQuantity: validateNumber(el.quantity),
        quantity_to_add_deduct: 0,
        price_per_unit: validateNumber(el.price_per_unit),
        total_price: validateNumber(el.total_price),
        availableQuantity: el.color_price?.stock ? el.color_price?.stock : 0,
        isDeleted: false,
        isCannotDelete: true,
        message: "",
      };

      if (designId) {
        if (saleReadyMaterial[designId]) {
          let colorsPresent = saleReadyMaterial[designId].colorsPresent;
          let allColors = saleReadyMaterial[designId].allColors;
          colorsPresent.push(colorId);
          allColors.push(colorData);
          saleReadyMaterial = {
            ...saleReadyMaterial,
            [designId]: {
              ...saleReadyMaterial[designId],
              colorsPresent: colorsPresent,
              allColors: allColors,
              isNew: false,
            },
          };
        } else {
          saleReadyMaterial = {
            ...saleReadyMaterial,
            [designId]: {
              material_no: design.material_no,
              material_price: design.material_price,
              add_price: validateNumber(design.add_price),
              designId: design.id,
              images: design.images,
              stock: design.stock,
              colorsPresent: [colorId],
              allColors: [colorData],
              is_ready_material: true,
              are_ready_materials_clubbed: false,
            },
          };
        }
      } else {
        saleReadyMaterial = {
          ...saleReadyMaterial,
          [["NoDesign-" + Math.floor(new Date().valueOf() * Math.random())]]: {
            designId: null,
            images: [],
            colorsPresent: [],
            allColors: [],
            name: el.name,
            quantity: validateNumber(el.quantity),
            price_per_unit: validateNumber(el.price_per_unit),
            total_price: validateNumber(el.total_price),
            previousQuantity: validateNumber(el.quantity),
            isNew: false,
            isDeleted: false,
            isCannotDelete: true,
            is_ready_material: false,
            are_ready_materials_clubbed: true,
          },
        };
      }
    });

    setSelectedDesign(saleReadyMaterial);
    setOpenBackDrop(false);
  };

  console.log("filter => ", filter);

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
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          Select Sale
        </BootstrapDialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <form onSubmit={onSearch}>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={2}>
                      <CustomDropDown
                        id="type_of_bill"
                        onChange={(event) => handleChange(event)}
                        labelText="Type of Sale"
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
                      style={{ marginTop: "2.3rem" }}
                    >
                      <RemoteAutoComplete
                        setSelectedData={setPartyData}
                        searchString={"party_name"}
                        apiName={backend_parties}
                        placeholder="Select Party..."
                        selectedValue={party}
                        isParty={true}
                      />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3}>
                      <CustomInput
                        onChange={(event) => handleChange(event)}
                        labelText="Bill/Invoice Number"
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
                        label="Sell date from"
                        name="date_gte"
                        value={filter.date_gte || null}
                        id="date_gte"
                        formControlProps={{
                          fullWidth: true,
                        }}
                        style={{
                          marginTop: "1.65rem",
                          width: "100%",
                        }}
                      />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={2}>
                      <DatePicker
                        onChange={(event) => handleEndDateChange(event)}
                        label="Sale date to"
                        name="date_lte"
                        value={filter.date_lte || null}
                        id="date_lte"
                        formControlProps={{
                          fullWidth: true,
                        }}
                        style={{
                          marginTop: "1.65rem",
                          width: "100%",
                        }}
                      />
                    </GridItem>

                    <GridItem xs={12} sm={12} md={2}>
                      <CustomInput
                        onChange={(event) => handleChange(event)}
                        labelText="Total Price From"
                        value={filter.total_price_gte || ""}
                        name="total_price_gte"
                        id="total_price_gte"
                        formControlProps={{
                          fullWidth: true,
                        }}
                      />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={2}>
                      <CustomInput
                        onChange={(event) => handleChange(event)}
                        labelText="Total Price To"
                        value={filter.total_price_lte || ""}
                        name="total_price_lte"
                        id="total_price_lte"
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
                          setAllQueryParamsForSearch(filter, "osd");
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
                          removeAllQueryParams(filter, "osd");
                          tableRef.current.onQueryChange();
                        }}
                      >
                        Cancel
                      </Button>
                    </GridItem>
                  </GridContainer>
                </form>
                <br />
                <Table
                  tableRef={tableRef}
                  title="Purchases"
                  columns={columns}
                  data={async (query) => {
                    console.log("page => ", query.page);
                    console.log("pageSize => ", query.pageSize);
                    return await getSaleData(query.page + 1, query.pageSize);
                  }}
                  actions={[
                    (rowData) => ({
                      icon: () => <Button color="primary">Select</Button>,
                      tooltip: "Select this Seller",
                      onClick: (event, rowData) => {
                        selectedSale(rowData.id);
                      },
                    }),
                  ]}
                  onRowClick={(event, rowData) => {
                    window.open(
                      `${frontendServerUrl}${VIEWSALES}/${rowData.id}`,
                      "_blank"
                    );
                  }}
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
          </DialogContentText>
        </DialogContent>
        <Backdrop className={classes.backdrop} open={openBackDrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </Dialog>
    </>
  );
}
