import React, { useEffect, useState } from "react";
// @material-ui/core components
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  CustomMaterialUITable,
  CustomRadioButton,
  CustomTableBody,
  CustomTableCell,
  CustomTableHead,
  CustomTableRow,
  DatePicker,
  GridContainer,
  GridItem,
  RemoteAutoComplete,
  SnackBarComponent,
} from "../../components";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
// core components
import {
  backend_download_sale_ledger,
  backend_parties,
  backend_sale_ledger,
  frontendServerUrl,
} from "../../constants";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { providerForDownload, providerForGet } from "../../api";
import ListAltIcon from "@material-ui/icons/ListAlt";
import moment from "moment";
import {
  checkIFValidDateObject,
  convertNumber,
  getMonth,
  getMonthDifference,
  hasError,
  isEmptyString,
} from "../../Utils";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@material-ui/icons/Visibility";
import EditIcon from "@material-ui/icons/Edit";
import {
  SALELEDGER,
  VIEWSALEPAYEMENT,
  VIEWSALERETURN,
  VIEWSALES,
  EDITSALES,
  EDITSALEPAYEMENT,
} from "../../paths";

const useStyles = makeStyles(styles);
export default function Ledger() {
  const classes = useStyles();
  const [openBackDrop, setBackDrop] = useState(false);
  const [partyInfo, setPartyInfo] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [filter, setFilter] = useState({});
  const [error, setError] = useState({});
  const [monthYearObject, setMonthYearObject] = useState([]);
  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let startDate = urlParams.get("sd");
    let endDate = urlParams.get("ed");
    let party_id = urlParams.get("s");
    let type_of_bill = urlParams.get("tol");
    let filter = {};

    /** Check dates */
    let sd = new Date(startDate);
    let ed = new Date(endDate);
    if (startDate && !isEmptyString(startDate) && checkIFValidDateObject(sd)) {
      let year = sd.getFullYear();
      let month = sd.getMonth();
      startDate = new Date(year, month, 1);
    } else {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth();
      if (month < 3) {
        year = year - 1;
      }
      startDate = new Date(year, 3, 1);
    }

    if (endDate && !isEmptyString(endDate) && checkIFValidDateObject(ed)) {
      let year = ed.getFullYear();
      let month = ed.getMonth();
      endDate = moment(new Date(year, month + 1, 0).toISOString())
        .endOf("day")
        .format("YYYY-MM-DDT23:59:59.999Z");
    } else {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth();
      endDate = moment(new Date(year, month + 1, 0).toISOString())
        .endOf("day")
        .format("YYYY-MM-DDT23:59:59.999Z");
    }

    filter = {
      ...filter,
      date_gte: startDate,
      date_lte: endDate,
      type_of_bill: type_of_bill ? type_of_bill : "Kachha",
    };
    setFilter(filter);
    if (party_id) {
      getPartyInfo(party_id, filter);
      window.history.pushState(
        "",
        "Ledger",
        `${frontendServerUrl}${SALELEDGER}?sd=${filter.date_gte}&ed=${filter.date_lte}&s=${party_id}&tol=${type_of_bill}`
      );
    } else {
      window.history.pushState(
        "",
        "Ledger",
        `${frontendServerUrl}${SALELEDGER}?sd=${filter.date_gte}&ed=${filter.date_lte}&tol=${type_of_bill}`
      );
    }
  }, []);

  const getPartyInfo = async (partyId, filter) => {
    await providerForGet(backend_parties + "/" + partyId, {}, Auth.getToken())
      .then((res) => {
        console.log("res ", res);
        setPartyInfo({
          value: partyId,
          label: res.data.party_name,
          allData: res.data,
        });
        getLedgerDetails(filter, {
          value: partyId,
          label: res.data.party_name,
          allData: res.data,
        });
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
      });
  };

  const downloadLedger = async () => {
    setBackDrop(true);
    await providerForDownload(
      backend_download_sale_ledger,
      {
        ...filter,
        partyId: partyInfo?.value,
      },
      Auth.getToken()
    )
      .then((res) => {
        const url = URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );
        console.log("url =>", url);
        const pdfNewWindow = window.open();
        pdfNewWindow.location.href = url;
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
      });
  };

  const checkIfFiltersPresent = (callback) => {
    let error = {};
    let isValidStartDate = false;
    let isValidEndDate = false;
    /** Check date */
    let gteDate = new Date(filter.date_gte);
    let lteDate = new Date(filter.date_lte);
    if (!checkIFValidDateObject(gteDate)) {
      error = {
        ...error,
        date_gte: ["Not a valid start date"],
      };
    } else {
      isValidStartDate = true;
    }

    if (!checkIFValidDateObject(lteDate)) {
      error = {
        ...error,
        date_lte: ["Not a valid end date"],
      };
    } else {
      isValidEndDate = true;
    }

    if (!filter.type_of_bill) {
      error = {
        ...error,
        type_of_bill: ["Please select type of ledger"],
      };
    }

    if (!partyInfo || !partyInfo.value) {
      error = {
        ...error,
        party: ["Please select party"],
      };
    }

    setError(error);

    if (!Object.keys(error).length) {
      callback();
    }
  };

  const getLedgerDetails = async (
    searchFilters = filter,
    party = partyInfo
  ) => {
    window.history.pushState(
      "",
      "Ledger",
      `${frontendServerUrl}${SALELEDGER}?sd=${searchFilters.date_gte}&ed=${searchFilters.date_lte}&s=${party?.value}&tol=${searchFilters.type_of_bill}`
    );
    setBackDrop(true);
    let monthYearObject = [];
    let dateToCheckFrom = new Date(searchFilters.date_gte);
    let dateToCheckTo = new Date(searchFilters.date_lte);
    let diffOfMonths = getMonthDifference(dateToCheckFrom, dateToCheckTo) + 1;

    let monthDiffArray = Array.from({ length: diffOfMonths }, (v, i) => i);

    monthDiffArray.forEach((m_no) => {
      let getMiddleDate = new Date(dateToCheckFrom.setDate(15));
      let correspondingDate = new Date(
        getMiddleDate.setMonth(getMiddleDate.getMonth() + m_no)
      );
      let correspondingMonth = correspondingDate.getMonth() + 1;
      let correspondingYear = correspondingDate.getFullYear();
      let key = `${getMonth(correspondingMonth - 1)}, ${correspondingYear}`;
      monthYearObject.push(key);
    });
    setMonthYearObject(monthYearObject);

    await providerForGet(
      backend_sale_ledger,
      {
        ...searchFilters,
        partyId: party?.value,
      },
      Auth.getToken()
    )
      .then((res) => {
        setLedgerData(res.data);
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
      });
  };

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  /** Handle End Date filter change */
  const handleEndDateChange = (event) => {
    delete error["date_lte"];
    setError((error) => ({
      ...error,
    }));
    let date = new Date(event);
    let year = date.getFullYear();
    let month = date.getMonth();
    let endDate = moment(new Date(year, month + 1, 0).toISOString())
      .endOf("day")
      .format("YYYY-MM-DDT23:59:59.999Z");

    setFilter((filter) => ({
      ...filter,
      date_lte: new Date(endDate),
    }));
  };

  /** Handle Start Date filter change */
  const handleStartDateChange = (event) => {
    let date = new Date(event);
    let year = date.getFullYear();
    let month = date.getMonth();

    delete error["date_gte"];
    setError((error) => ({
      ...error,
    }));
    setFilter((filter) => ({
      ...filter,
      date_gte: new Date(year, month, 1),
    }));
  };

  const cancelFilters = () => {
    setFilter({});
    setLedgerData([]);
    setMonthYearObject([]);
    setError({});
  };

  const setSelectedParty = (party) => {
    delete error["party"];
    setError((error) => ({
      ...error,
    }));
    setPartyInfo(party);
  };

  const editTxn = (id, txnType) => {
    let url = "";
    if (txnType === "Sale") {
      url = EDITSALES;
    } else if (txnType === "Payment") {
      url = EDITSALEPAYEMENT;
    } else if (txnType === "Sale return") {
      url = EDITSALEPAYEMENT;
    }
    window.open(`${frontendServerUrl}${url}/${id}`, "_blank");
  };

  const viewTxn = (id, txnType) => {
    let url = "";
    if (txnType === "Sale") {
      url = VIEWSALES;
    } else if (txnType === "Payment") {
      url = VIEWSALEPAYEMENT;
    } else if (txnType === "Sale return") {
      url = VIEWSALERETURN;
    }
    window.open(`${frontendServerUrl}${url}/${id}`, "_blank");
  };

  const deleteTxn = (id, txnType) => {};

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
                <GridItem xs={12} sm={12} md={2}>
                  <CustomRadioButton
                    onChange={(event) => {
                      if (event.target.checked) {
                        setFilter((filter) => ({
                          ...filter,
                          type_of_bill: "Kachha",
                        }));
                      }
                    }}
                    labelText="Kachha"
                    checked={filter.type_of_bill === "Kachha" || false}
                    id="type_of_bill1"
                  />

                  <CustomRadioButton
                    onChange={(event) => {
                      if (event.target.checked) {
                        setFilter((filter) => ({
                          ...filter,
                          type_of_bill: "Pakka",
                        }));
                      }
                    }}
                    labelText="Pakka"
                    checked={filter.type_of_bill === "Pakka" || false}
                    id="type_of_bill2"
                  />
                </GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={2}
                  style={{ marginTop: "2.2rem" }}
                >
                  <RemoteAutoComplete
                    setSelectedData={setSelectedParty}
                    selectedValue={partyInfo}
                    searchString={"party_name"}
                    apiName={backend_parties}
                    placeholder="Select Party..."
                    isError={error.party}
                    errorText={"Please select a party"}
                    isParty={true}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <DatePicker
                    variant="inline"
                    openTo="month"
                    views={["year", "month"]}
                    onChange={(event) => handleStartDateChange(event)}
                    label="Month/Year from"
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
                    /** For setting errors */
                    helperTextId={"helperText_date_gte"}
                    isHelperText={hasError("date_gte", error)}
                    helperText={
                      hasError("date_gte", error)
                        ? error["date_gte"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    error={hasError("date_gte", error)}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <DatePicker
                    views={["year", "month"]}
                    onChange={(event) => handleEndDateChange(event)}
                    label="Month/Year to"
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
                    /** For setting errors */
                    helperTextId={"helperText_date_lte"}
                    isHelperText={hasError("date_lte", error)}
                    helperText={
                      hasError("date_lte", error)
                        ? error["date_lte"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    error={hasError("date_lte", error)}
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
                      checkIfFiltersPresent(getLedgerDetails);
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
              <br />
              {monthYearObject && monthYearObject.length ? (
                <GridItem
                  xs={12}
                  sm={12}
                  md={12}
                  style={{
                    display: "flex",
                    justifyContent: "right",
                  }}
                >
                  <Button
                    color="primary"
                    onClick={() => {
                      checkIfFiltersPresent(downloadLedger);
                    }}
                  >
                    Download
                  </Button>
                </GridItem>
              ) : null}
              <GridItem xs={12} sm={12} md={12}>
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                  <TableContainer sx={{ maxHeight: 600 }}>
                    <CustomMaterialUITable
                      sx={{ minWidth: 650 }}
                      aria-label="simple table"
                      stickyHeader
                    >
                      <CustomTableHead>
                        <CustomTableRow>
                          <CustomTableCell>Date</CustomTableCell>
                          <CustomTableCell>Particulars</CustomTableCell>
                          <CustomTableCell>Type</CustomTableCell>
                          <CustomTableCell>Bill/Invoice No</CustomTableCell>
                          <CustomTableCell>Debit</CustomTableCell>
                          <CustomTableCell>Credit</CustomTableCell>
                          <CustomTableCell>Edit</CustomTableCell>
                          <CustomTableCell>View</CustomTableCell>
                          <CustomTableCell>Delete</CustomTableCell>
                        </CustomTableRow>
                      </CustomTableHead>
                      <CustomTableBody>
                        {monthYearObject && monthYearObject.length ? (
                          monthYearObject.map((monthYear) => (
                            <>
                              <CustomTableRow>
                                <CustomTableCell
                                  colSpan={9}
                                  sx={{
                                    textAlign: "center",
                                    backgroundColor: "#dfdfdf !important",
                                  }}
                                >
                                  <b>{monthYear}</b>
                                </CustomTableCell>
                              </CustomTableRow>
                              {/** -------- */}
                              <CustomTableRow>
                                <CustomTableCell>-----</CustomTableCell>
                                <CustomTableCell>
                                  <b>Opening Balance</b>
                                </CustomTableCell>
                                <CustomTableCell>-----</CustomTableCell>
                                <CustomTableCell>-----</CustomTableCell>
                                {ledgerData[monthYear]?.opening_balance
                                  ?.finalOpeningBalance < 0 ? (
                                  <>
                                    <CustomTableCell>
                                      <b>----</b>
                                    </CustomTableCell>
                                    <CustomTableCell
                                      sx={{
                                        backgroundColor: "yellow",
                                      }}
                                    >
                                      <b>
                                        {" "}
                                        {convertNumber(
                                          Math.abs(
                                            ledgerData[monthYear]
                                              ?.opening_balance
                                              ?.finalOpeningBalance
                                          ),
                                          true
                                        )}
                                      </b>
                                    </CustomTableCell>
                                  </>
                                ) : ledgerData[monthYear]?.opening_balance
                                    ?.finalOpeningBalance > 0 ? (
                                  <>
                                    <CustomTableCell
                                      sx={{
                                        backgroundColor: "yellow",
                                      }}
                                    >
                                      <b>
                                        {convertNumber(
                                          Math.abs(
                                            ledgerData[monthYear]
                                              ?.opening_balance
                                              ?.finalOpeningBalance
                                          ),
                                          true
                                        )}
                                      </b>
                                    </CustomTableCell>
                                    <CustomTableCell>
                                      <b>----</b>
                                    </CustomTableCell>
                                  </>
                                ) : (
                                  <>
                                    <CustomTableCell>
                                      <b>{convertNumber(0, true)}</b>
                                    </CustomTableCell>
                                    <CustomTableCell>
                                      <b>{convertNumber(0, true)}</b>
                                    </CustomTableCell>
                                  </>
                                )}
                                <CustomTableCell>---</CustomTableCell>
                                <CustomTableCell>---</CustomTableCell>
                                <CustomTableCell>---</CustomTableCell>
                              </CustomTableRow>
                              {ledgerData[monthYear]?.data &&
                              ledgerData[monthYear].data.length
                                ? ledgerData[monthYear].data.map((l) => (
                                    <CustomTableRow>
                                      <CustomTableCell>
                                        {l.date}
                                      </CustomTableCell>
                                      <CustomTableCell>
                                        {l.particulars}
                                      </CustomTableCell>
                                      <CustomTableCell>
                                        {l.type}
                                      </CustomTableCell>
                                      <CustomTableCell>
                                        {l.bill_invoice_no}
                                      </CustomTableCell>
                                      <CustomTableCell>
                                        {l.debit}
                                      </CustomTableCell>
                                      <CustomTableCell>
                                        {l.credit}
                                      </CustomTableCell>
                                      <CustomTableCell>
                                        <IconButton
                                          aria-label="edit"
                                          disabled={l.type === "Sale return"}
                                          onClick={() => editTxn(l.id, l.type)}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </CustomTableCell>
                                      <CustomTableCell>
                                        <IconButton
                                          aria-label="view"
                                          onClick={() => viewTxn(l.id, l.type)}
                                        >
                                          <VisibilityIcon
                                            fontSize="small"
                                            color="primary"
                                          />
                                        </IconButton>
                                      </CustomTableCell>
                                      <CustomTableCell>
                                        <IconButton
                                          color="error"
                                          aria-label="delete"
                                          onClick={() =>
                                            deleteTxn(l.id, l.type)
                                          }
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </CustomTableCell>
                                    </CustomTableRow>
                                  ))
                                : null}

                              <CustomTableRow>
                                <CustomTableCell>-----</CustomTableCell>
                                <CustomTableCell>
                                  <b>Closing Balance</b>
                                </CustomTableCell>
                                <CustomTableCell>-----</CustomTableCell>
                                <CustomTableCell>-----</CustomTableCell>
                                {ledgerData[monthYear]?.closing_balance
                                  ?.finalClosing < 0 ? (
                                  <>
                                    <CustomTableCell
                                      sx={{
                                        backgroundColor: "yellow",
                                      }}
                                    >
                                      <b>
                                        {" "}
                                        {convertNumber(
                                          Math.abs(
                                            ledgerData[monthYear]
                                              ?.closing_balance?.finalClosing
                                          ),
                                          true
                                        )}
                                      </b>
                                    </CustomTableCell>
                                    <CustomTableCell>
                                      <b>----</b>
                                    </CustomTableCell>
                                  </>
                                ) : ledgerData[monthYear]?.closing_balance
                                    ?.finalClosing > 0 ? (
                                  <>
                                    <CustomTableCell>
                                      <b>----</b>
                                    </CustomTableCell>
                                    <CustomTableCell
                                      sx={{
                                        backgroundColor: "yellow",
                                      }}
                                    >
                                      <b>
                                        {convertNumber(
                                          Math.abs(
                                            ledgerData[monthYear]
                                              ?.closing_balance?.finalClosing
                                          ),
                                          true
                                        )}
                                      </b>
                                    </CustomTableCell>
                                  </>
                                ) : (
                                  <>
                                    <CustomTableCell>
                                      <b>{convertNumber(0, true)}</b>
                                    </CustomTableCell>
                                    <CustomTableCell>
                                      <b>{convertNumber(0, true)}</b>
                                    </CustomTableCell>
                                  </>
                                )}
                                <CustomTableCell>---</CustomTableCell>
                                <CustomTableCell>---</CustomTableCell>
                                <CustomTableCell>---</CustomTableCell>
                              </CustomTableRow>

                              {/** Total Row */}
                              <CustomTableRow>
                                <CustomTableCell>-----</CustomTableCell>
                                <CustomTableCell>
                                  <b>Total</b>
                                </CustomTableCell>
                                <CustomTableCell>-----</CustomTableCell>
                                <CustomTableCell>-----</CustomTableCell>
                                <CustomTableCell>
                                  <b>
                                    {" "}
                                    {convertNumber(
                                      ledgerData[monthYear]?.totalDebit,
                                      true
                                    )}
                                  </b>
                                </CustomTableCell>
                                <CustomTableCell>
                                  <b>
                                    {convertNumber(
                                      ledgerData[monthYear]?.totalCredit,
                                      true
                                    )}
                                  </b>
                                </CustomTableCell>
                                <CustomTableCell>---</CustomTableCell>
                                <CustomTableCell>---</CustomTableCell>
                                <CustomTableCell>---</CustomTableCell>
                              </CustomTableRow>
                            </>
                          ))
                        ) : (
                          <>
                            <CustomTableRow>
                              <CustomTableCell
                                colSpan={9}
                                rowSpan={5}
                                sx={{
                                  border: "none !Important",
                                  textAlign: "center",
                                }}
                              >
                                No Data to show
                              </CustomTableCell>
                            </CustomTableRow>
                          </>
                        )}
                      </CustomTableBody>
                    </CustomMaterialUITable>
                  </TableContainer>
                </Paper>
              </GridItem>
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
