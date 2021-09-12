import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import {
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
import { ADDSALES } from "../../paths";
import AddIcon from "@material-ui/icons/Add";

const useStyles = makeStyles(styles);
export default function Sales() {
  const tableRef = React.createRef();
  const history = useHistory();
  const [filter, setFilter] = useState({
    _sort: "created_at:desc"
  });
  const classes = useStyles();
  const [openBackDrop, setBackDrop] = useState(false);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: ""
  });

  const snackBarHandleClose = () => {
    setSnackBar(snackBar => ({
      ...snackBar,
      show: false,
      severity: "",
      message: ""
    }));
  };

  const handleAdd = () => {
    history.push(ADDSALES);
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
              <br />
              {/* <Table
                tableRef={tableRef}
                title="Raw Materials"
                columns={}
                data={async query => {
                  return await getRawMaterialsData(
                    query.page + 1,
                    query.pageSize
                  );
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
                  }),
                  rowData => ({
                    icon: () => <DateRangeIcon fontSize="small" />,
                    tooltip:
                      rowData.balance === "0"
                        ? "Balance is 0, cannot add daily usage"
                        : "Add Daily Usage",
                    disabled: rowData.balance === "0" ? true : false,
                    onClick: (event, rowData) => {
                      handleAddDailyCount(rowData);
                    }
                  })
                ]}
                localization={{
                  body: {
                    editRow: {
                      deleteText: `Are you sure you want to delete this Raw Material?`,
                      saveTooltip: "Delete"
                    }
                  }
                }}
                editable={{
                  onRowDelete: oldData =>
                    new Promise(resolve => {
                      setTimeout(async () => {
                        await providerForDelete(
                          backend_raw_materials,
                          oldData.id,
                          Auth.getToken()
                        )
                          .then(async res => {
                            setSnackBar(snackBar => ({
                              ...snackBar,
                              show: true,
                              severity: "success",
                              message: "Successfully deleted " + oldData.name
                            }));
                          })
                          .catch(err => {
                            setSnackBar(snackBar => ({
                              ...snackBar,
                              show: true,
                              severity: "error",
                              message: "Error deleting " + oldData.name
                            }));
                          });
                        resolve();
                      }, 1000);
                    })
                }}
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
              /> */}
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
