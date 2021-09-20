import React, { useState } from "react";

import { makeStyles } from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { convertNumber, plainDate } from "../../Utils";
import { backend_order } from "../../constants";
import {
  Auth,
  Card,
  CardBody,
  CardHeader,
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent,
  Table
} from "../../components";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";
import { ADDORDER, EDITORDER, VIEWORDER } from "../../paths";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { providerForGet } from "../../api";

const useStyles = makeStyles(styles);

export default function ViewOrders(props) {
  const classes = useStyles();
  const tableRef = React.createRef();
  const history = useHistory();
  const [openBackDrop, setBackDrop] = useState(false);
  const [filter, setFilter] = useState({
    _sort: "created_at:desc"
  });

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: ""
  });

  const columns = [
    {
      title: "Order Id",
      field: "order_id",
      render: rowData => "#" + rowData.order_id
    },
    {
      title: "Order Date",
      field: "created_at",
      render: rowData => plainDate(new Date(rowData.created_at))
    },
    {
      title: "Material",
      sorting: false,
      field: "ready_material",
      render: rowData =>
        rowData.ready_material ? rowData.ready_material.material_no : "----"
    },
    {
      title: "Party",
      field: "party",
      sorting: false,
      render: rowData => (rowData.party ? rowData.party.party_name : "----")
    },
    {
      title: "Quantity",
      field: "quantity"
    },
    {
      title: "Quantity saved for later",
      field: "buffer quantity"
    },
    { title: "Completed Quantity", field: "completed_quantity" },

    {
      title: "Total Price",
      field: "total_price"
    },
    {
      title: "Status",
      render: rowData => {
        if (rowData.processing) {
          if (rowData.partial_completed) {
            return "Partial Completed";
          } else {
            return "Processing";
          }
        } else if (rowData.fully_completed) {
          return "Fully Completed";
        } else {
          return "Cancelled";
        }
      }
    }
  ];

  const getOrderData = async (page, pageSize) => {
    let params = {
      page: page,
      pageSize: pageSize
    };

    Object.keys(filter).map(res => {
      if (!params.hasOwnProperty(res)) {
        params[res] = filter[res];
      }
    });

    return new Promise((resolve, reject) => {
      fetch(backend_order + "?" + new URLSearchParams(params), {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + Auth.getToken()
        }
      })
        .then(response => response.json())
        .then(result => {
          resolve({
            data: result.data,
            page: result.page - 1,
            totalCount: result.totalCount
          });
        })
        .catch(err => {
          setSnackBar(snackBar => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: "Error"
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
    setFilter(filter => ({
      ...filter,
      _sort: orderBy
    }));
    tableRef.current.onQueryChange();
  };

  const snackBarHandleClose = () => {
    setSnackBar(snackBar => ({
      ...snackBar,
      show: false,
      severity: "",
      message: ""
    }));
  };

  const handleAdd = () => {
    history.push(ADDORDER);
  };

  const handleTableAction = async (row, isView) => {
    setBackDrop(true);
    await providerForGet(backend_order + "/" + row.id, {}, Auth.getToken())
      .then(res => {
        setBackDrop(false);
        if (isView) {
          history.push(VIEWORDER, { data: res.data, view: true });
        } else {
          history.push(EDITORDER, { data: res.data, edit: true });
        }
      })
      .catch(err => {
        setBackDrop(false);
        setSnackBar(snackBar => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error viewing/editing order"
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
                <GridItem xs={12} sm={12} md={12}>
                  <Table
                    tableRef={tableRef}
                    title="Departments"
                    columns={columns}
                    data={async query => {
                      return await getOrderData(query.page + 1, query.pageSize);
                    }}
                    localization={{
                      body: {
                        editRow: {
                          deleteText: `Are you sure you want to delete this Admin User?`,
                          saveTooltip: "Delete"
                        }
                      }
                    }}
                    actions={[
                      rowData => ({
                        icon: () => <EditIcon fontSize="small" />,
                        tooltip: "Edit",
                        onClick: (event, rowData) => {
                          handleTableAction(rowData, false);
                        }
                      }),
                      rowData => ({
                        icon: () => <VisibilityIcon fontSize="small" />,
                        tooltip: "View",
                        onClick: (event, rowData) => {
                          handleTableAction(rowData, true);
                        }
                      })
                    ]}
                    options={{
                      pageSize: 10,
                      actionsColumnIndex: -1,
                      search: false,
                      sorting: true,
                      thirdSortClick: false
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
    </>
  );
}
