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
  CardHeader,
  FAB,
  CardBody,
  Card,
  CustomMaterialUITable,
  CustomTableHead,
  CustomTableRow,
  CustomTableCell,
  CustomTableBody,
  CustomCheckBox,
  CardFooter,
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
  apiUrl,
  backend_parties,
  backend_sales,
  frontendServerUrl,
} from "../../constants";
import {
  convertNumber,
  isEmptyString,
  plainDate,
  validateNumber,
} from "../../Utils";
import classNames from "classnames";
import moment from "moment";
import { SnackBarComponent } from "../Snackbar";
import {
  addQueryParam,
  formatDate,
  removeAllQueryParams,
  removeParamFromUrl,
  setAllQueryParamsForSearch,
  setAllQueryParamsFromUrl,
} from "../../Utils/CommonUtils";
import IconButton from "@mui/material/IconButton";
import SweetAlert from "react-bootstrap-sweetalert";
import CloseIcon from "@mui/icons-material/Close";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { Link, Paper, TableContainer } from "@mui/material";
import { VIEWPARTY, VIEWSALERETURN, VIEWSALES } from "../../paths";
import { providerForGet } from "../../api";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import no_image_icon from "../../assets/img/no_image_icon.png";
import buttonStyles from "../../assets/jss/material-dashboard-react/components/buttonStyle.js";

const useStyles = makeStyles(styles);
const buttonUseStyles = makeStyles(buttonStyles);

export default function DialogForSelectingSale(props) {
  const classes = useStyles();
  const buttonClasses = buttonUseStyles();
  const [alert, setAlert] = useState(null);
  const [openBackDrop, setOpenBackDrop] = useState(false);
  const [selectedparty, setSelectedParty] = React.useState(null);
  const [selectedDesign, setSelectedDesign] = React.useState(null);
  const [saleId, setSaleId] = useState(null);
  const [formState, setFormState] = useState(null);
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

  useEffect(() => {
    let filterObject = {
      ...filter,
    };
    filterObject = setAllQueryParamsFromUrl(filterObject, allFilters, "osd");
    setFilter(filterObject);
    /** Set sale */
    const queryParams = new URLSearchParams(window.location.search);
    let params = Object.fromEntries(queryParams);
    // if (params && params["osdsD"] && !isNaN(parseInt(params["osdsD"]))) {
    //   selectedSale(parseInt(params["osdsD"]));
    // }
  }, [props]);

  useEffect(() => {
    if (tableRef && tableRef.current && tableRef.current.dataManager) {
      // tableRef.current.onQueryChange({
      //   ...
      // })
      //      console.log("tablerre => ", tableRef.current);
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
    await providerForGet(
      backend_sales + "/" + id + "?check=true",
      {},
      Auth.getToken()
    )
      .then((res) => {
        if (res.status === 200) {
          convertData(res.data);
        } else {
          isError = true;
        }
      })
      .catch((err) => {
        setOpenBackDrop(false);
        console.log("err.response.data => ", err.response.data);
        if (
          err.response.data &&
          err.response.data.message &&
          err.response.data.message.reason &&
          err.response.data.message.reason === -1
        ) {
          handleShowAlert(err.response.data.message.saleReturnData);
        } else {
          isError = true;
        }
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

  const handleShowAlert = (saleReturnData) => {
    const confirmBtnClasses = classNames({
      [buttonClasses.button]: true,
      [buttonClasses["success"]]: true,
    });

    const cancelBtnClasses = classNames({
      [buttonClasses.button]: true,
      [buttonClasses["danger"]]: true,
    });

    setAlert(
      <SweetAlert
        warning
        confirmBtnText="OK"
        confirmBtnCssClass={confirmBtnClasses}
        confirmBtnBsStyle="outline-{variant}"
        title="Heads up!"
        onConfirm={() => {
          setAlert(null);
        }}
        focusCancelBtn
      >
        Sale Return for this sale is already present! <br></br>Click{" "}
        {
          <b>
            <Link
              href={`${frontendServerUrl}${VIEWSALERETURN}/${saleReturnData.id}`}
              underline="always"
              target="_blank"
            >
              {"here"}
            </Link>
          </b>
        }{" "}
        to check the data
      </SweetAlert>
    );
    //setOpenDialog(true);
  };

  const convertData = (data) => {
    setOpenBackDrop(true);
    let saleData = {
      id: data.id,
      bill_no: data.bill_no,
      date: new Date(data.date),
      type_of_bill: data.type_of_bill,
      total_price: validateNumber(data.total_price),
      total_price_of_all_design: validateNumber(data.total_price_of_all_design),
    };

    let partyData = {
      gst_no: data.party.gst_no,
      id: data.party.id,
      party_name: data.party.party_name,
      party_address: data.party.party_address,
    };

    let saleReadyMaterial = {};
    data.sale_ready_material.forEach((el) => {
      let designId = el.design?.id;
      let colorId = el.color?.id;
      let design = el.design;
      /** ----------------------------------------- */
      let colorData = {
        id: el.id,
        design: designId,
        colorData: el.color,
        color: colorId,
        quantity: validateNumber(el.quantity),
        returned_quantity: 0,
        price_per_unit: validateNumber(el.price_per_unit),
        return_price_per_unit: validateNumber(el.return_price_per_unit),
        total_price: validateNumber(el.total_price),
        return_total_price: 0,
        previousQuantity: 0,
        quantity_to_add_deduct: 0,
        availableQuantity: el.color_price?.stock ? el.color_price?.stock : 0,
        selected: false,
      };

      if (designId) {
        if (saleReadyMaterial[designId]) {
          let allColors = saleReadyMaterial[designId].allColors;
          allColors.push(colorData);
          saleReadyMaterial = {
            ...saleReadyMaterial,
            [designId]: {
              ...saleReadyMaterial[designId],
              allColors: allColors,
            },
          };
        } else {
          saleReadyMaterial = {
            ...saleReadyMaterial,
            [designId]: {
              material_no: design.material_no,
              material_price: design.material_price,
              add_price: validateNumber(design.add_price),
              images: design.images,
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
            id: el.id,
            designId: null,
            images: [],
            colorsPresent: [],
            allColors: [],
            name: el.name,
            quantity: validateNumber(el.quantity),
            returned_quantity: 0,
            price_per_unit: validateNumber(el.price_per_unit),
            return_price_per_unit: validateNumber(el.return_price_per_unit),
            total_price: validateNumber(el.total_price),
            return_total_price: 0,
            previousQuantity: 0,
            is_ready_material: false,
            are_ready_materials_clubbed: true,
          },
        };
      }
    });

    props.setPartyAndSaleData(partyData, saleReadyMaterial, saleData);
    setOpenBackDrop(false);
    handleClose();
  };

  const onBackClick = () => {
    setSelectedDesign(null);
    setFormState(null);
    setSaleId(null);
    setSelectedParty(null);
    removeParamFromUrl("osdsD");
  };

  const onSelectCheckBox = (event, colorKey, designKey) => {
    let currObject = selectedDesign[designKey];
    if (colorKey !== null && colorKey !== undefined && colorKey >= 0) {
      let colorObj = currObject.allColors[colorKey];
      colorObj = {
        ...colorObj,
        selected: event.target.checked,
      };
      setSelectedDesign((selectedDesign) => ({
        ...selectedDesign,
        [designKey]: {
          ...selectedDesign[designKey],
          allColors: [
            ...selectedDesign[designKey].allColors.slice(0, colorKey),
            colorObj,
            ...selectedDesign[designKey].allColors.slice(colorKey + 1),
          ],
        },
      }));
    }
  };

  const submit = () => {
    console.log("selectedDesign => ", selectedDesign);
  };

  return (
    <>
      {alert}
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
          {saleId ? "Sale Details" : "Select Sale"}
        </BootstrapDialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            {saleId && formState && selectedparty && selectedDesign ? (
              <>
                <React.Fragment>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                      <FAB align={"start"} size={"small"} onClick={onBackClick}>
                        <KeyboardArrowLeftIcon />
                      </FAB>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={12}>
                      <Card>
                        <CardHeader
                          color="primary"
                          className={classes.cardHeaderStyles}
                        >
                          <h4 className={classes.cardTitleWhite}>Sale Data</h4>
                          <p className={classes.cardCategoryWhite}></p>
                        </CardHeader>
                        <CardBody>
                          <GridContainer>
                            <GridItem xs={12} sm={12} md={6}>
                              <b>Sale Details :-</b>
                              <GridContainer>
                                <GridItem xs={12} sm={12} md={12}>
                                  <b>Bill No : </b>
                                  {formState.bill_no}{" "}
                                  {
                                    <Link
                                      href={`${frontendServerUrl}${VIEWSALES}/${saleId}`}
                                      underline="always"
                                      target="_blank"
                                    >
                                      Check sale data here
                                    </Link>
                                  }
                                </GridItem>
                                <GridItem xs={12} sm={12} md={12}>
                                  <b>Date : </b> {formatDate(formState.date)}
                                </GridItem>
                                <GridItem xs={12} sm={12} md={12}>
                                  <b>Type : </b> {formState.type_of_bill}
                                </GridItem>
                                <GridItem xs={12} sm={12} md={12}>
                                  <b>Total Price : </b>{" "}
                                  {convertNumber(formState.total_price, true)}
                                </GridItem>
                              </GridContainer>
                            </GridItem>
                            <GridItem xs={12} sm={12} md={6}>
                              <b>Party Name : </b>
                              {selectedparty.party_name}{" "}
                              {
                                <Link
                                  href={`${frontendServerUrl}${VIEWPARTY}/${saleId}`}
                                  underline="always"
                                  target="_blank"
                                >
                                  Check party data here
                                </Link>
                              }
                            </GridItem>
                          </GridContainer>

                          <GridContainer>
                            <GridItem xs={12} sm={12} md={6}>
                              <Button color="primary" onClick={(e) => submit()}>
                                Done
                              </Button>
                            </GridItem>
                          </GridContainer>

                          <GridContainer>
                            <GridItem xs={12} sm={12} md={12}>
                              <TableContainer
                                component={Paper}
                                sx={{
                                  marginTop: 3,
                                }}
                              >
                                <CustomMaterialUITable
                                  sx={{ textAlignLast: "center" }}
                                  aria-label="sale-table"
                                >
                                  <CustomTableHead>
                                    <CustomTableRow>
                                      <CustomTableCell>
                                        Is Ready Material?
                                      </CustomTableCell>
                                      <CustomTableCell>Select</CustomTableCell>
                                      <CustomTableCell>
                                        Ratio Name
                                      </CustomTableCell>
                                      <CustomTableCell align="left">
                                        Pcs Sold
                                      </CustomTableCell>
                                      <CustomTableCell align="left">
                                        Selling Price Per Piece
                                      </CustomTableCell>
                                    </CustomTableRow>
                                  </CustomTableHead>
                                  <CustomTableBody>
                                    {selectedDesign &&
                                      Object.keys(selectedDesign).map(
                                        (Ip, designKey) => {
                                          let isNoDesign =
                                            Ip.includes("NoDesign");
                                          return (
                                            <>
                                              <CustomTableRow
                                                key={Ip}
                                                height={20}
                                              >
                                                <CustomTableCell
                                                  align="center"
                                                  rowSpan={
                                                    (isNoDesign &&
                                                      selectedDesign[Ip]
                                                        .is_ready_material) ||
                                                    selectedDesign[Ip]
                                                      .are_ready_materials_clubbed
                                                      ? 1
                                                      : 1 +
                                                        selectedDesign[Ip]
                                                          .allColors.length
                                                  }
                                                >
                                                  {selectedDesign[Ip]
                                                    .is_ready_material
                                                    ? "Yes"
                                                    : "No"}
                                                </CustomTableCell>
                                                {(isNoDesign &&
                                                  selectedDesign[Ip]
                                                    .is_ready_material) ||
                                                selectedDesign[Ip]
                                                  .are_ready_materials_clubbed ? (
                                                  <>
                                                    <CustomTableCell align="left">
                                                      {" "}
                                                      ----
                                                    </CustomTableCell>
                                                    <CustomTableCell align="left">
                                                      {selectedDesign[Ip].name}
                                                    </CustomTableCell>
                                                    <CustomTableCell align="left">
                                                      {
                                                        selectedDesign[Ip]
                                                          .quantity
                                                      }
                                                    </CustomTableCell>
                                                    <CustomTableCell align="right">
                                                      {
                                                        selectedDesign[Ip]
                                                          .price_per_unit
                                                      }
                                                    </CustomTableCell>
                                                  </>
                                                ) : (
                                                  <CustomTableCell
                                                    align="center"
                                                    colSpan={4}
                                                  >
                                                    <GridItem
                                                      xs={12}
                                                      sm={12}
                                                      md={12}
                                                    >
                                                      <GridContainer
                                                        style={{
                                                          dispay: "flex",
                                                        }}
                                                      >
                                                        <GridItem
                                                          xs={12}
                                                          sm={12}
                                                          md={12}
                                                        >
                                                          <div
                                                            className={
                                                              classes.imageDivInTable
                                                            }
                                                          >
                                                            {selectedDesign[Ip]
                                                              .images &&
                                                            selectedDesign[Ip]
                                                              .images.length &&
                                                            selectedDesign[Ip]
                                                              .images[0].url ? (
                                                              <img
                                                                alt="ready_material_photo"
                                                                src={
                                                                  apiUrl +
                                                                  selectedDesign[
                                                                    Ip
                                                                  ].images[0]
                                                                    .url
                                                                }
                                                                loader={
                                                                  <CircularProgress />
                                                                }
                                                                style={{
                                                                  height:
                                                                    "5rem",
                                                                  width:
                                                                    "10rem",
                                                                }}
                                                                className={
                                                                  classes.UploadImage
                                                                }
                                                              />
                                                            ) : (
                                                              <img
                                                                src={
                                                                  no_image_icon
                                                                }
                                                                alt="ready_material_photo"
                                                                style={{
                                                                  height:
                                                                    "5rem",
                                                                  width:
                                                                    "10rem",
                                                                }}
                                                                loader={
                                                                  <CircularProgress />
                                                                }
                                                                className={
                                                                  classes.DefaultNoImage
                                                                }
                                                              />
                                                            )}
                                                          </div>
                                                        </GridItem>
                                                      </GridContainer>
                                                      <GridContainer>
                                                        <GridItem
                                                          xs={12}
                                                          sm={12}
                                                          md={12}
                                                        >
                                                          <b>Material No : </b>
                                                          {
                                                            selectedDesign[Ip]
                                                              .material_no
                                                          }
                                                        </GridItem>
                                                      </GridContainer>
                                                    </GridItem>
                                                  </CustomTableCell>
                                                )}
                                              </CustomTableRow>
                                              {selectedDesign[Ip].allColors &&
                                                selectedDesign[
                                                  Ip
                                                ].allColors.map(
                                                  (c, colorKey) => (
                                                    <>
                                                      <CustomTableRow
                                                        key={Ip + "-" + c.color}
                                                        sx={{
                                                          "&:last-child td, &:last-child th":
                                                            {
                                                              border: 0,
                                                            },
                                                          backgroundColor:
                                                            c.isDeleted
                                                              ? "#e7e7e7"
                                                              : "transparent",
                                                          textDecoration:
                                                            c.isDeleted
                                                              ? "line-through"
                                                              : "none",
                                                        }}
                                                      >
                                                        <CustomTableCell
                                                          align="left"
                                                          sx={{
                                                            p: 0,
                                                          }}
                                                        >
                                                          <CustomCheckBox
                                                            onChange={(
                                                              event
                                                            ) => {
                                                              onSelectCheckBox(
                                                                event,
                                                                colorKey,
                                                                Ip
                                                              );
                                                            }}
                                                            noMargin
                                                            labelText=""
                                                            name="select_ready_material"
                                                            checked={c.selected}
                                                            id="select_ready_material"
                                                          />
                                                        </CustomTableCell>
                                                        <CustomTableCell align="left">
                                                          {c.colorData.name}
                                                        </CustomTableCell>
                                                        <CustomTableCell align="left">
                                                          {c.quantity}
                                                        </CustomTableCell>

                                                        <CustomTableCell align="left">
                                                          {c.price_per_unit}
                                                        </CustomTableCell>
                                                      </CustomTableRow>
                                                    </>
                                                  )
                                                )}
                                            </>
                                          );
                                        }
                                      )}
                                  </CustomTableBody>
                                </CustomMaterialUITable>
                              </TableContainer>
                            </GridItem>
                          </GridContainer>
                        </CardBody>
                        <CardFooter>
                          <Button color="primary" onClick={(e) => submit()}>
                            Done
                          </Button>
                        </CardFooter>
                      </Card>
                    </GridItem>
                  </GridContainer>
                </React.Fragment>
              </>
            ) : (
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
                            setAllQueryParamsForSearch(
                              filter,
                              "osd",
                              allFilters
                            );
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
                      return await getSaleData(query.page + 1, query.pageSize);
                    }}
                    actions={[
                      (rowData) => ({
                        icon: () => <Button color="primary">Select</Button>,
                        tooltip: "Select this Seller",
                        onClick: (event, rowData) => {
                          addQueryParam("osdsD", rowData.id);
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
            )}
          </DialogContentText>
        </DialogContent>
        <Backdrop className={classes.backdrop} open={openBackDrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </Dialog>
    </>
  );
}
