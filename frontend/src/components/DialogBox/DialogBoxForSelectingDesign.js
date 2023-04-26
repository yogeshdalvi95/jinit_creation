import React, { useState } from "react";
// @material-ui/core components
import {
  Auth,
  Button,
  CustomInput,
  GridContainer,
  GridItem,
  Table,
  RemoteAutoComplete,
} from "..";
// core components
import { apiUrl, backend_designs, frontendServerUrl } from "../../constants";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import no_image_icon from "../../assets/img/no_image_icon.png";
import { isEmptyString } from "../../Utils";
import { useEffect } from "react";
import { PartyData, StockData } from "../DesignData";
import { Grid, Link, Typography } from "@mui/material";
import { VIEWDESIGN } from "../../paths";
const useStyles = makeStyles(styles);

export default function DialogBoxForSelectingDesign(props) {
  const tableRef = React.createRef();
  const [openBackDrop, setBackDrop] = useState(false);
  const [design, setDesign] = useState(null);
  const classes = useStyles();
  const [filter, setFilter] = useState({
    _sort: "id:desc",
  });
  const [selectedDesign, setSelectedDesign] = useState({});

  useEffect(() => {
    setSelectedDesign(props.selectedDesign);
  }, [props]);

  const columns = [
    {
      title: "Material No",
      field: "material_no",
      sorting: false,
      align: "center",
      render: (rowData) =>
        rowData?.material_no ? (
          <Link
            href={`${frontendServerUrl}${VIEWDESIGN}/${rowData.id}`}
            underline="always"
            target="_blank"
          >
            {rowData.material_no}
          </Link>
        ) : (
          "----"
        ),
    },
    {
      title: "Image",
      sorting: false,
      align: "center",
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
      title: "Available Stock",
      cellStyle: {
        width: 300,
        minWidth: 300,
      },
      render: (rowData) => {
        let output = "";
        if (props.selectMultiColors) {
          output = generateSelectColorComponent(rowData);
        } else {
          if (rowData.color_price && rowData.color_price.length) {
            let array = rowData.color_price;
            output = <StockData data={array} />;
          } else {
            output = rowData.stock;
          }
        }

        return output;
      },
    },
    {
      title: "Order placed for party",
      cellStyle: {
        width: 300,
        minWidth: 300,
      },
      render: (rowData) => {
        if (rowData.partyDetails && rowData.partyDetails.length) {
          return <PartyData data={rowData.partyDetails} />;
        } else {
          return "";
        }
      },
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

  const setDesignData = (design) => {
    console.log("design => ", design);
    if (design && design.value) {
      setFilter((filter) => ({
        ...filter,
        id: design.value,
      }));
      setDesign(design);
    } else {
      delete filter["id"];
      setFilter((filter) => ({
        ...filter,
      }));
      setDesign(null);
    }
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

  const generateSelectColorComponent = (design) => {
    let output = null;
    if (design.color_price && design.color_price.length) {
      let array = design.color_price;
      output = array.map((el) => {
        let colorsPresent = selectedDesign[el.design]?.colorsPresent;
        return (
          <Grid container>
            <Grid item>
              {el.stock ? (
                <Button
                  color="primary"
                  onClick={() => {
                    props.selectDesign(el, design);
                  }}
                  disabled={
                    (colorsPresent &&
                      colorsPresent.length &&
                      colorsPresent.includes(el.color.id)) ||
                    !el.stock
                  }
                >
                  Select
                </Button>
              ) : (
                <Button color="danger" disabled={true}>
                  Stock not present
                </Button>
              )}
            </Grid>
            <Grid
              item
              sx={{
                ml: 2,
                mt: 2,
              }}
            >
              <Typography variant="body2" gutterBottom>
                <b>{el.color?.name}: </b> {el.stock}
              </Typography>
            </Grid>
          </Grid>
        );
      });
    } else {
      output = "";
    }
    return output;
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
        <DialogTitle id="dialog-title">
          {props.title ? props.title : "Select Designs"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={4}>
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
                      labelText="Type Ready Materal..."
                      name="material_no_contains"
                      noMargin
                      value={filter["material_no_contains"] || ""}
                      id="material_no_contains"
                      formControlProps={{
                        fullWidth: true,
                      }}
                    />
                  </GridItem>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={1}
                    style={{
                      marginTop: "auto",
                      marginBottom: "auto",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    OR
                  </GridItem>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={4}
                    style={{ marginTop: "auto", marginBottom: "auto" }}
                  >
                    <RemoteAutoComplete
                      setSelectedData={setDesignData}
                      searchString={"material_no"}
                      apiName={backend_designs}
                      placeholder="Select Ready Material..."
                      selectedValue={design}
                    />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6}>
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
                        setFilter((filter) => ({
                          _sort: "id:desc",
                        }));
                        setDesign(null);
                        tableRef.current.onQueryChange();
                      }}
                    >
                      Cancel
                    </Button>
                  </GridItem>
                </GridContainer>
                <br />
                {props.selectMultiColors ? (
                  <Table
                    tableRef={tableRef}
                    title="Ready Materials"
                    columns={columns}
                    data={async (query) => {
                      return await getDesignData(
                        query.page + 1,
                        query.pageSize
                      );
                    }}
                    localization={{
                      body: {
                        editRow: {
                          deleteText: `Are you sure you want to delete this design?`,
                          saveTooltip: "Save",
                        },
                      },
                    }}
                    // detailPanel={(rowData) => {
                    //   let output = generateSelectColorComponent(rowData);
                    //   return output;
                    // }}
                    options={{
                      pageSize: 10,
                      search: false,
                      sorting: true,
                      thirdSortClick: false,
                    }}
                    onOrderChange={(orderedColumnId, orderDirection) => {
                      orderFunc(orderedColumnId, orderDirection);
                    }}
                  />
                ) : (
                  <Table
                    tableRef={tableRef}
                    title="Ready Materials"
                    columns={columns}
                    data={async (query) => {
                      return await getDesignData(
                        query.page + 1,
                        query.pageSize
                      );
                    }}
                    localization={{
                      body: {
                        editRow: {
                          deleteText: `Are you sure you want to delete this design?`,
                          saveTooltip: "Save",
                        },
                      },
                    }}
                    actions={[
                      (rowData) => ({
                        icon: () => (
                          <Button
                            color="primary"
                            //disabled={selectedDesign.includes(rowData.id)}
                          >
                            Select
                          </Button>
                        ),
                        // tooltip: selectedDesign.includes(rowData.id)
                        //   ? "Already added"
                        //   : "Select this Ready Material",
                        onClick: (event, rowData) => {
                          if (props.isHandleKey) {
                            props.handleAddDesign(
                              "design",
                              props.gridKey,
                              rowData
                            );
                          } else {
                            props.handleAddDesign(rowData);
                          }
                        },
                      }),
                    ]}
                    options={{
                      pageSize: 10,
                      search: false,
                      sorting: true,
                      thirdSortClick: false,
                    }}
                    onOrderChange={(orderedColumnId, orderDirection) => {
                      orderFunc(orderedColumnId, orderDirection);
                    }}
                  />
                )}
              </GridItem>
            </GridContainer>
          </DialogContentText>
        </DialogContent>
        <Backdrop className={classes.backdrop} open={openBackDrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </Dialog>
    </div>
  );
}
