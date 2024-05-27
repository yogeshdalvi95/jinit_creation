import React, { useState } from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
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
import AddIcon from "@material-ui/icons/Add";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import {
  backend_color,
  backend_plating,
  frontendServerUrl,
} from "../../../constants";
import ListAltIcon from "@material-ui/icons/ListAlt";

import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { ADDCOLOR, ADDPLATING, EDITCOLOR, EDITPLATING } from "../../../paths";
import { Backdrop, CircularProgress } from "@material-ui/core";
import { providerForDelete, providerForGet } from "../../../api";
import { isEmptyString, whiteColorID } from "../../../Utils";

const useStyles = makeStyles(styles);

export default function Plating() {
  const history = useHistory();
  const classes = useStyles();
  const [openBackDrop, setBackDrop] = useState(false);
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "name:asc",
  });

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const columns = [{ title: "Name", field: "name" }];

  const getPlatingData = async (page, pageSize) => {
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
      fetch(backend_plating + "?" + new URLSearchParams(params), {
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
        .catch((err) => {
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error",
          }));
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
    history.push(ADDPLATING);
  };

  const handleTableAction = async (row, isView) => {
    setBackDrop(true);
    await providerForGet(backend_plating + "/" + row.id, {}, Auth.getToken())
      .then((res) => {
        setBackDrop(false);
        history.push(EDITPLATING, { data: res.data, edit: true });
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error",
        }));
      });
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
                <GridItem xs={12} sm={3} md={3}>
                  <CustomInput
                    onChange={(e) => {
                      if (isEmptyString(e.target.value)) {
                        delete filter["name_contains"];
                        setFilter((filter) => ({
                          ...filter,
                        }));
                      } else {
                        setFilter((filter) => ({
                          ...filter,
                          name_contains: e.target.value,
                        }));
                      }
                    }}
                    type="text"
                    labelText="Plating Name"
                    name="name_contains"
                    noMargin
                    value={filter["name_contains"] || ""}
                    id="name_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>

                <GridItem xs={12} sm={12} md={4}>
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
                      delete filter["name_contains"];
                      setFilter((filter) => ({
                        ...filter,
                      }));
                      tableRef.current.onQueryChange();
                    }}
                  >
                    Cancel
                  </Button>
                </GridItem>
              </GridContainer>
              <br />
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <Table
                    tableRef={tableRef}
                    title="Plating"
                    columns={columns}
                    data={async (query) => {
                      return await getPlatingData(
                        query.page + 1,
                        query.pageSize
                      );
                    }}
                    localization={{
                      body: {
                        editRow: {
                          deleteText: `Are you sure you want to delete this Plating?`,
                          saveTooltip: "Delete",
                        },
                      },
                    }}
                    actions={[
                      (rowData) => ({
                        icon: () => <EditOutlinedIcon fontSize="small" />,
                        tooltip: "Edit",
                        disabled:
                          rowData.name.toLowerCase() === whiteColorID
                            ? true
                            : false,
                        onClick: (event, rowData) => {
                          handleTableAction(rowData, false);
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
                </GridItem>
              </GridContainer>
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
