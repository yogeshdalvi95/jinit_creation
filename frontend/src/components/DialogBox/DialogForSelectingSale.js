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
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  setAllSearchQueryParams,
} from "../../Utils/CommonUtils";

export default function DialogForSelectingSale(props) {
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

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    let filterObject = {};
    if (queryParams.has("osd_tos")) {
      let typeOfSale = queryParams.get("osd_tos");
      filterObject = {
        ...filterObject,
        type_of_bill: typeOfSale,
      };
    }
    if (queryParams.has("osd_p")) {
      let party = queryParams.get("osd_p");
      if (validateNumber(party)) {
        filterObject = {
          ...filterObject,
          party: party,
        };
        setParty({
          value: party,
        });
      }
    }
    if (queryParams.has("osd_tpf")) {
      let total_price_gte = queryParams.get("osd_tpf");
      total_price_gte = validateNumber(total_price_gte);
      if (total_price_gte || total_price_gte === 0) {
        filterObject = {
          ...filterObject,
          total_price_gte: total_price_gte,
        };
      }
    }
    if (queryParams.has("osd_tpt")) {
      let total_price_lte = queryParams.get("osd_tpt");
      total_price_lte = validateNumber(total_price_lte);
      if (total_price_lte || total_price_lte === 0) {
        filterObject = {
          ...filterObject,
          total_price_lte: total_price_lte,
        };
      }
    }
    if (queryParams.has("osd_bn")) {
      let billNo = queryParams.get("osd_bn");
      filterObject = {
        ...filterObject,
        bill_no_contains: billNo,
      };
    }

    if (queryParams.has("osd_sd")) {
      let startDate = queryParams.get("osd_sd");
      let sd = new Date(startDate);
      if (
        startDate &&
        !isEmptyString(startDate) &&
        checkIFValidDateObject(sd)
      ) {
        startDate = sd.toISOString();
      }
      filterObject = {
        ...filterObject,
        date_gte: startDate,
      };
    }
    if (queryParams.has("osd_ed")) {
      let endDate = queryParams.get("osd_ed");
      let ed = new Date(endDate);
      if (endDate && !isEmptyString(endDate) && checkIFValidDateObject(ed)) {
        endDate = moment(ed.toISOString())
          .endOf("day")
          .format("YYYY-MM-DDT23:59:59.999Z");
      }
      filterObject = {
        ...filterObject,
        date_lte: endDate,
      };
    }

    setFilter((filter) => ({
      ...filter,
      ...filterObject,
    }));
    //let colorId = urlParams.get("color");
  }, [props]);

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
      let queryParams = removeParamFromUrl("osd_ed");
      history.replace({
        search: queryParams.toString(),
      });
    } else {
      endDate = new Date(endDate).toISOString();
      setFilter((filter) => ({
        ...filter,
        date_lte: endDate,
      }));
      addQueryParam("osd_ed", endDate);
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
      let queryParams = removeParamFromUrl("osd_sd");
      history.replace({
        search: queryParams.toString(),
      });
    } else {
      startDate = new Date(startDate).toISOString();
      setFilter((filter) => ({
        ...filter,
        date_gte: startDate,
      }));
      addQueryParam("osd_sd", startDate);
    }
  };

  const handleClose = () => {
    props.handleClose();
  };

  const setPartyData = (party) => {
    if (party && party.value) {
      setFilter((filter) => ({
        ...filter,
        party: party.value,
      }));
      setParty(party);
      addQueryParam("osd_p", party.value);
    } else {
      delete filter["party"];
      setFilter((filter) => ({
        ...filter,
      }));
      setParty(null);
      let queryParams = removeParamFromUrl("osd_p");
      history.replace({
        search: queryParams.toString(),
      });
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
      <Dialog
        open={props.open}
        onClose={handleClose}
        aria-labelledby="select-raw-material-title"
        aria-describedby="select-raw-material-dialog-description"
        maxWidth={"lg"}
      >
        <DialogTitle id="dialog-title">Select Sale</DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
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
                        removeAllQueryParams(filter, "osd");
                        setAllSearchQueryParams(filter, "osd");
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
                <br />
                <Table
                  tableRef={tableRef}
                  title="Purchases"
                  columns={columns}
                  data={async (query) => {
                    console.log("query", query.page, query.pageSize);
                    return await getSaleData(query.page + 1, query.pageSize);
                  }}
                  actions={[
                    (rowData) => ({
                      icon: () => <Button color="primary">Select</Button>,
                      tooltip: "Select this Seller",
                      onClick: (event, rowData) => {},
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
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
}
