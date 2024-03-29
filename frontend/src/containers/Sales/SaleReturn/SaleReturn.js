import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import { saveAs } from "file-saver";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  DialogForSelectingParties,
  FAB,
  GridContainer,
  GridItem,
  RemoteAutoComplete,
  SnackBarComponent,
  Table,
} from "../../../components";
import ListAltIcon from "@material-ui/icons/ListAlt";
import {
  ADDSALERETURN,
  EDITSALERETURN,
  VIEWPARTY,
  VIEWSALERETURN,
  VIEWSALES,
} from "../../../paths";
import AddIcon from "@material-ui/icons/Add";
import {
  convertNumber,
  hasError,
  isEmptyString,
  plainDate,
  dateToDDMMYYYY,
} from "../../../Utils";
import { backend_sale_return, frontendServerUrl } from "../../../constants";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import moment from "moment";
import { providerForDelete, providerForGet } from "../../../api";
import {
  backend_parties,
  backend_sales_export_data,
} from "../../../constants/UrlConstants";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "@mui/material";

const useStyles = makeStyles(styles);
export default function SaleReturn() {
  const tableRef = React.createRef();
  const history = useHistory();
  const [filter, setFilter] = useState({
    _sort: "date:desc",
  });
  const classes = useStyles();
  const [openBackDrop, setBackDrop] = useState(false);
  const [party, setParty] = useState(null);
  const [error, setError] = useState({});

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const [openDialogForSelectingParties, setOpenDialogForSelectingParties] =
    useState(false);

  const columns = [
    {
      title: "Return Date",
      field: "date",
      render: (rowData) => plainDate(new Date(rowData.date)),
    },
    {
      title: "Party Name",
      field: "party.party_name",
      render: (rowData) =>
        rowData?.party?.id ? (
          <Link
            href={`${frontendServerUrl}${VIEWPARTY}/${rowData.party.id}`}
            underline="always"
            target="_blank"
          >
            {rowData.party.party_name}
          </Link>
        ) : (
          "----"
        ),
    },
    {
      title: "Sale",
      field: "sale.bill_no",
      render: (rowData) =>
        rowData?.sale?.id ? (
          <Link
            href={`${frontendServerUrl}${VIEWSALES}/${rowData.sale.id}`}
            underline="always"
            target="_blank"
          >
            {rowData.sale.bill_no}
          </Link>
        ) : (
          "----"
        ),
    },
    {
      title: "Total Returned Amount",
      field: "total_price",
      render: (rowData) => convertNumber(rowData.total_price, true),
    },
  ];

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  const handleAdd = () => {
    history.push(ADDSALERETURN);
  };

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
      fetch(backend_sale_return + "?" + new URLSearchParams(params), {
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
    delete error["date_lte"];
    setError((error) => ({
      ...error,
    }));
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
    delete error["date_gte"];
    setError((error) => ({
      ...error,
    }));
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

  const handleAddParties = (data) => {
    setParty((party) => ({
      ...party,
      gst_no: data.gst_no,
      id: data.id,
      party_name: data.party_name,
      address: data.party_address,
    }));
    setFilter((filter) => ({
      ...filter,
      party: data.id,
    }));
    handleCloseDialogForParties();
  };

  const handleCloseDialogForParties = () => {
    setOpenDialogForSelectingParties(false);
  };

  const downloadExcelData = async () => {
    let isDatePresent = true;
    if (!filter.hasOwnProperty("date_gte")) {
      setError((error) => ({
        ...error,
        date_gte: ["Please select from date"],
      }));
      isDatePresent = false;
    } else {
      delete error["date_gte"];
      setError((error) => ({
        ...error,
      }));
    }
    if (!filter.hasOwnProperty("date_lte")) {
      setError((error) => ({
        ...error,
        date_lte: ["Please select to date"],
      }));
      isDatePresent = false;
    }
    if (isDatePresent) {
      if (new Date(filter["date_gte"]) < new Date(filter["date_lte"])) {
        setBackDrop(true);
        await providerForGet(
          backend_sales_export_data,
          {
            fromDate: filter["date_gte"],
            toDate: filter["date_lte"],
          },
          Auth.getToken()
        )
          .then((res) => {
            saveAs(
              new Blob([s2ab(res.data)], { type: "application/octet-stream" }),
              `sales_data_from_${dateToDDMMYYYY(
                filter["date_gte"]
              )}_to_${dateToDDMMYYYY(filter["date_lte"])}.xlsx`
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
      } else {
        setError((error) => ({
          ...error,
          date_gte: ["From date cannot be greater than to date"],
        }));
      }
    }
  };

  //s2ab method
  function s2ab(s) {
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf); //create uint8array as viewer
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
    return buf;
  }

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

  return (
    <>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <DialogForSelectingParties
        handleCancel={handleCloseDialogForParties}
        handleClose={handleCloseDialogForParties}
        handleAddParties={handleAddParties}
        open={openDialogForSelectingParties}
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
                <GridItem xs={12} sm={12} md={3}>
                  <DatePicker
                    onChange={(event) => handleStartDateChange(event)}
                    label="Return date from"
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
                <GridItem xs={12} sm={12} md={3}>
                  <DatePicker
                    onChange={(event) => handleEndDateChange(event)}
                    label="Return date to"
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
                  md={3}
                  style={{ marginTop: "2.3rem" }}
                >
                  <RemoteAutoComplete
                    setSelectedData={setPartyData}
                    searchString={"party_name"}
                    apiName={backend_parties}
                    placeholder="Select Party..."
                    selectedValue={party}
                  />
                </GridItem>
                <GridItem
                  style={{
                    marginTop: "27px",
                  }}
                >
                  <Button
                    color="primary"
                    onClick={() => {
                      setError([]);
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
                      tableRef.current.onQueryChange();
                    }}
                  >
                    Cancel
                  </Button>
                </GridItem>
              </GridContainer>
              <GridContainer></GridContainer>
              <br />
              <Table
                tableRef={tableRef}
                title="Sales"
                columns={columns}
                data={async (query) => {
                  return await getSaleData(query.page + 1, query.pageSize);
                }}
                actions={[
                  (rowData) => ({
                    icon: () => (
                      <VisibilityIcon fontSize="small" color="primary" />
                    ),
                    tooltip: "View",
                    onClick: (event, rowData) => {
                      history.push(`${VIEWSALERETURN}/${rowData.id}`);
                    },
                  }),
                ]}
                icons={{
                  Delete: () => <DeleteIcon style={{ color: "red" }} />,
                }}
                editable={{
                  onRowDelete: (oldData) =>
                    new Promise((resolve) => {
                      setTimeout(async () => {
                        await providerForDelete(
                          backend_sale_return,
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
                  pageSizeOptions: [10, 20, 50],
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
