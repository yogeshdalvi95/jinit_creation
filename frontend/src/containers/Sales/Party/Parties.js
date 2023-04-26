import React, { useState } from "react";
// @material-ui/core components
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  CustomInput,
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent,
  Table,
} from "../../../components";
// core components
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { backend_parties, frontendServerUrl } from "../../../constants";
import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import { providerForGet } from "../../../api";
import { ADDPARTY, EDITPARTY, VIEWPARTY } from "../../../paths";
import { isEmptyString } from "../../../Utils";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";
import VisibilityIcon from "@material-ui/icons/Visibility";

const useStyles = makeStyles(styles);
export default function Parties() {
  const classes = useStyles();
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "party_name:asc",
  });
  const [openBackDrop, setBackDrop] = useState(false);
  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const columns = [
    { title: "Party Name", field: "party_name" },
    { title: "GSTIN/UIN", field: "gst_no" },
    { title: "Phone", field: "phone" },
  ];

  const history = useHistory();

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
      fetch(backend_parties + "?" + new URLSearchParams(params), {
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

  const handleEdit = async (row) => {
    setBackDrop(true);
    await providerForGet(backend_parties + "/" + row.id, {}, Auth.getToken())
      .then((res) => {
        setBackDrop(false);
        history.push(EDITPARTY, { data: res.data, edit: true });
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error viewing party",
        }));
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

  const handleAdd = () => {
    history.push(ADDPARTY);
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
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Party Name"
                    value={filter.party_name_contains || ""}
                    name="party_name_contains"
                    id="party_name_contains"
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
                      delete filter["party_name_contains"];
                      setFilter((filter) => ({
                        ...filter,
                        _sort: "party_name:asc",
                      }));
                      tableRef.current.onQueryChange();
                    }}
                  >
                    Cancel
                  </Button>
                </GridItem>
              </GridContainer>

              <Table
                tableRef={tableRef}
                title="Purchases"
                columns={columns}
                data={async (query) => {
                  return await getPurchasesData(query.page + 1, query.pageSize);
                }}
                actions={[
                  (rowData) => ({
                    icon: () => <EditOutlinedIcon fontSize="small" />,
                    tooltip: "Edit",
                    onClick: (event, rowData) => {
                      handleEdit(rowData);
                    },
                  }),
                  (rowData) => ({
                    icon: () => (
                      <VisibilityIcon fontSize="small" color="primary" />
                    ),
                    tooltip: "View",
                    onClick: (event, rowData) => {
                      history.push(VIEWPARTY + "/" + rowData.id);
                    },
                  }),
                ]}
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
