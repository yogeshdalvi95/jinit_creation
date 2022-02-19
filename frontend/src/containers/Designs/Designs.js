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
} from "../../components";
// core components
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { apiUrl, backend_designs } from "../../constants";
import { ADDDESIGN, EDITDESIGN, VIEWDESIGN } from "../../paths";
import { useHistory } from "react-router-dom";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";
import { convertNumber, isEmptyString } from "../../Utils";
import no_image_icon from "../../assets/img/no_image_icon.png";

const useStyles = makeStyles(styles);
export default function Designs() {
  const classes = useStyles();
  const tableRef = React.createRef();
  const [openBackDrop, setBackDrop] = useState(false);
  const history = useHistory();
  const [filter, setFilter] = useState({
    _sort: "created_at:desc",
  });
  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const columns = [
    { title: "Material No", field: "material_no" },
    {
      title: "Image",
      render: (rowData) => (
        <div className={classes.imageDivInTable}>
          {rowData.images && rowData.images.length && rowData.images[0].url ? (
            <img
              alt="ready_material_photo"
              src={apiUrl + rowData.images[0].url}
              loader={<CircularProgress />}
              style={{
                height: "5rem",
                width: "10rem",
              }}
              className={classes.UploadImage}
            />
          ) : (
            <img
              src={no_image_icon}
              alt="ready_material_photo"
              style={{
                height: "5rem",
                width: "10rem",
              }}
              loader={<CircularProgress />}
              className={classes.DefaultNoImage}
            />
          )}
        </div>
      ),
    },
    {
      title: "Price",
      field: "total_price",
      render: (rowData) => convertNumber(rowData.total_price, true),
    },
  ];

  const getDesignData = async (page, pageSize) => {
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
      fetch(backend_designs + "?" + new URLSearchParams(params), {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + Auth.getToken(),
        },
      })
        .then((response) => response.json())
        .then((result) => {
          resolve({
            data: result.data,
            page: result.page - 1,
            totalCount: result.totalCount,
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
    history.push(ADDDESIGN);
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
                        delete filter["material_no_contains"];
                        setFilter((filter) => ({
                          ...filter,
                        }));
                      } else {
                        setFilter((filter) => ({
                          ...filter,
                          material_no_contains: e.target.value,
                        }));
                      }
                    }}
                    type="text"
                    labelText="Material Number"
                    name="material_no_contains"
                    noMargin
                    value={filter["material_no_contains"] || ""}
                    id="material_no_contains"
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
                      delete filter["material_no_contains"];
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
              <Table
                tableRef={tableRef}
                title="Ready Materials"
                columns={columns}
                data={async (query) => {
                  return await getDesignData(query.page + 1, query.pageSize);
                }}
                actions={[
                  (rowData) => ({
                    icon: () => <EditIcon fontSize="small" />,
                    tooltip: "Edit",
                    onClick: (event, rowData) => {
                      history.push(`${EDITDESIGN}/${rowData.id}`);
                    },
                  }),
                  (rowData) => ({
                    icon: () => <VisibilityIcon fontSize="small" />,
                    tooltip: "View",
                    onClick: (event, rowData) => {
                      history.push(`${VIEWDESIGN}/${rowData.id}`);
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
