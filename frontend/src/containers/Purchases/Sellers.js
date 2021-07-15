import React, { useState } from "react";
// @material-ui/core components
import { Auth, SnackBarComponent, Table } from "../../components";
// core components
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { backend_sellers } from "../../constants";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import { providerForGet } from "../../api";
import { EDITSELLER } from "../../paths";

const useStyles = makeStyles(styles);
export default function Sellers() {
  const classes = useStyles();
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "seller_name:asc"
  });
  const [openBackDrop, setBackDrop] = useState(false);
  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: ""
  });

  const columns = [
    { title: "Seller Name", field: "seller_name" },
    { title: "GSTIN/UIN", field: "gst_no" },
    { title: "Phone", field: "phone" }
  ];

  const history = useHistory();

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
      fetch(backend_sellers + "?" + new URLSearchParams(params), {
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

  const handleEdit = async row => {
    setBackDrop(true);
    await providerForGet(backend_sellers + "/" + row.id, {}, Auth.getToken())
      .then(res => {
        setBackDrop(false);
        history.push(EDITSELLER, { data: res.data, edit: true });
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
            icon: () => <EditOutlinedIcon fontSize="small" />,
            tooltip: "Edit",
            onClick: (event, rowData) => {
              handleEdit(rowData);
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
