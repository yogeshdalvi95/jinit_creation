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
  Table
} from "../../components";
// core components
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { backend_sellers } from "../../constants";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import { providerForGet } from "../../api";
import { ADDSELLER, EDITSELLER } from "../../paths";
import { isEmptyString } from "../../Utils";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";

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

  const handleAdd = () => {
    history.push(ADDSELLER);
  };

  const handleChange = event => {
    if (isEmptyString(event.target.value)) {
      delete filter[event.target.name];
      setFilter(filter => ({
        ...filter
      }));
    } else {
      setFilter(filter => ({
        ...filter,
        [event.target.name]: event.target.value
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
                    onChange={event => handleChange(event)}
                    labelText="Seller Name"
                    value={filter.seller_name_contains || ""}
                    name="seller_name_contains"
                    id="seller_name_contains"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={4}
                  style={{
                    marginTop: "27px"
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
                      delete filter["seller_name_contains"];
                      setFilter(filter => ({
                        ...filter,
                        _sort: "seller_name:asc"
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
