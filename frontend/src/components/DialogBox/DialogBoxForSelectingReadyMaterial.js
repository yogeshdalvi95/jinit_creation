import React, { useState } from "react";
// @material-ui/core components
import {
  Auth,
  Button,
  CustomInput,
  GridContainer,
  GridItem,
  Table,
} from "../../components";
// core components
import { apiUrl, backend_ready_materials } from "../../constants";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
  Typography,
} from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import no_image_icon from "../../assets/img/no_image_icon.png";

import { convertNumber, isEmptyString } from "../../Utils";
import { useEffect } from "react";
const useStyles = makeStyles(styles);

export default function DialogBoxForSelectingReadyMaterial(props) {
  const tableRef = React.createRef();
  const [openBackDrop, setBackDrop] = useState(false);
  const classes = useStyles();
  const [selectedReadyMaterial, setSeletedReadyMaterial] = useState([]);
  const [filter, setFilter] = useState({
    _sort: "id:desc",
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
      title: "Available Quantity",
      field: "total_quantity",
    },
    {
      title: "Price",
      field: "final_cost",
      render: (rowData) => convertNumber(rowData.final_cost, true),
    },
  ];

  useEffect(() => {
    setBackDrop(true);
    let arr = [];
    if (props?.selectedReadyMaterial?.length) {
      arr = props.selectedReadyMaterial.map((r) => {
        return r.ready_material.id;
      });
    }
    setSeletedReadyMaterial(arr);
    setBackDrop(false);
  }, []);

  const getReadyMaterialsData = async (page, pageSize) => {
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
      fetch(backend_ready_materials + "?" + new URLSearchParams(params), {
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

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="select-raw-material-title"
        aria-describedby="select-raw-material-dialog-description"
        maxWidth={"lg"}
      >
        <DialogTitle id="dialog-title">Select Ready Material</DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            <>
              <GridContainer>
                <GridItem xs={12} sm={3} md={4}>
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

                <GridItem xs={12} sm={12} md={8}>
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
                  return await getReadyMaterialsData(
                    query.page + 1,
                    query.pageSize
                  );
                }}
                actions={[
                  (rowData) => ({
                    icon: () =>
                      selectedReadyMaterial.includes(rowData.id) ||
                      (props.noAddAvailableQuantites &&
                        !parseInt(rowData.total_quantity)) ? null : (
                        <Button color="primary">Select</Button>
                      ),
                    tooltip: selectedReadyMaterial.includes(rowData.id)
                      ? "Already added"
                      : "Select this ready material",
                    onClick: (event, rowData) => {
                      if (
                        !(
                          selectedReadyMaterial.includes(rowData.id) ||
                          (props.noAddAvailableQuantites &&
                            !parseInt(rowData.total_quantity))
                        )
                      ) {
                        if (props.isHandleKey) {
                          props.handleAddReadyMaterial(
                            "ready_material",
                            rowData,
                            props.gridKey
                          );
                        } else {
                          props.handleAddReadyMaterial(rowData);
                        }
                      }
                    },
                  }),
                ]}
                options={{
                  pageSize: 10,
                  search: false,
                  sorting: true,
                  thirdSortClick: false,
                  rowStyle: (rowData) => ({
                    backgroundColor:
                      selectedReadyMaterial.includes(rowData.id) ||
                      (props.noAddAvailableQuantites &&
                        !parseInt(rowData.total_quantity))
                        ? "#F3F3F3"
                        : "#FFFFFF",
                  }),
                }}
                onOrderChange={(orderedColumnId, orderDirection) => {
                  orderFunc(orderedColumnId, orderDirection);
                }}
              />
            </>
          </DialogContentText>
        </DialogContent>
        <Backdrop className={classes.backdrop} open={openBackDrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </Dialog>
    </div>
  );
}
