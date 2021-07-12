import React, { useState } from "react";
// @material-ui/core components
import { Auth, SnackBarComponent, Table } from "../../components";
// core components
import { backend_purchases } from "../../constants";
import { convertNumber, plainDate } from "../../Utils";
import ViewListIcon from "@material-ui/icons/ViewList";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { providerForGet } from "../../api";
import { useHistory } from "react-router-dom";
import { VIEWPURCHASES } from "../../paths";

const useStyles = makeStyles(styles);
export default function Purchases() {
  const classes = useStyles();
  const history = useHistory();
  const [openBackDrop, setBackDrop] = useState(false);
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "created_at:asc"
  });
  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: ""
  });

  const columns = [
    { title: "Type of purchase", field: "type_of_bill" },
    {
      title: "Purchased From",
      field: "seller",
      render: rowData => rowData.seller.seller_name
    },
    {
      title: "Total Amount",
      field: "total_amt_with_tax",
      render: rowData => convertNumber(rowData.total_amt_with_tax, true)
    },
    { title: "GST No.", field: "gst_no" },
    {
      title: "Purchase date",
      field: "date",
      render: rowData => plainDate(new Date(rowData.date))
    }
  ];

  const getPurchasesData = async (page, pageSize) => {
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
      fetch(backend_purchases + "?" + new URLSearchParams(params), {
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

  const handleClickOpenIndividualPurchase = async row => {
    setBackDrop(true);
    await providerForGet(backend_purchases + "/" + row.id, {}, Auth.getToken())
      .then(res => {
        setBackDrop(false);
        history.push(VIEWPURCHASES, { data: res.data, view: true });
      })
      .catch(err => {
        setBackDrop(false);
        setSnackBar(snackBar => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error viewing purchase"
        }));
      });
  };

  const snackBarHandleClose = () => {
    setSnackBar(snackBar => ({
      ...snackBar,
      show: false,
      severity: "",
      message: ""
    }));
  };

  return (
    <>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <Table
        tableRef={tableRef}
        title="Purchases"
        columns={columns}
        data={async query => {
          return await getPurchasesData(query.page + 1, query.pageSize);
        }}
        actions={[
          rowData => ({
            icon: () => <ViewListIcon fontSize="small" />,
            tooltip: "View",
            onClick: (event, rowData) => {
              handleClickOpenIndividualPurchase(rowData);
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
      <Backdrop className={classes.backdrop} open={openBackDrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
