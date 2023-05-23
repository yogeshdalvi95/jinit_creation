import React, { useState, useEffect, useRef } from "react";
import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  makeStyles,
  Switch,
  Tooltip,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useHistory } from "react-router-dom";
import { Link } from "@mui/material";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";

// @material-ui/core components
import {
  Auth,
  Button,
  CustomInput,
  DialogBoxForSelectingRawMaterial,
  DialogBoxForSelectingReadyMaterial,
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent,
  Table,
  RawMaterialDetail,
  DialogForSelectingCategory,
  CustomAutoComplete,
  RawMaterialList,
  DialogBox,
} from "../../components";
import {
  backend_departments,
  backend_designs_and_materials,
  frontendServerUrl,
} from "../../constants";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { convertNumber, isEmptyString, validateNumber } from "../../Utils";
import {
  providerForDelete,
  providerForGet,
  providerForPost,
  providerForPut,
} from "../../api";
import { EDITDESIGN, VIEWRAWMATERIALS } from "../../paths";
import { Box, useMediaQuery, useTheme } from "@mui/material";

export default function DesignMaterials(props) {
  const childRef = useRef();
  const useStyles = makeStyles(styles);
  const theme = useTheme();
  const classes = useStyles();
  const [error, setError] = React.useState({});
  const history = useHistory();
  const tableRef = React.createRef();
  const [openBackDrop, setOpenBackDrop] = useState(false);
  const [openDialogToAcceptQuantity, setOpenDialogToAcceptQuantity] =
    useState(false);
  const [departments, setDepartments] = useState([]);
  const [rawMaterialName, setRawMaterialName] = useState("");
  const [colors] = useState(props?.designData?.colors);
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedRawMaterial, setSelectedRawmaterial] = useState({
    rawMaterial: null,
    quantity: 1,
  });
  const [filter, setFilter] = useState({
    _sort: "updated_at:desc",
    isRawMaterial: props?.isRawMaterial,
    isColor: false,
    design: props?.id,
  });

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const [
    openDialogForSelectingRawMaterial,
    setOpenDialogForSelectingRawMaterial,
  ] = useState(false);

  const [
    openDialogForSelectingReadyMaterial,
    setOpenDialogForSelectingReadyMaterial,
  ] = useState(false);

  const [openDialogForSelectingCategory, setOpenDialogForSelectingCategory] =
    useState(false);

  const [filterData, setFilterData] = useState({});

  useEffect(() => {
    getDepartmentData();
  }, []);

  const getDepartmentData = async () => {
    setOpenBackDrop(true);
    await providerForGet(
      backend_departments,
      {
        pageSize: -1,
      },
      Auth.getToken()
    )
      .then((res) => {
        setDepartments(res.data.data);
        setOpenBackDrop(false);
      })
      .catch((err) => {});
  };

  const columnsForRawMaterial = [
    {
      title: "Raw Material",
      editable: "never",
      sorting: false,
      align: "center",
      render: (rowData) =>
        rowData?.totalRow ? (
          ""
        ) : rowData?.raw_material?.id ? (
          <Link
            href={`${frontendServerUrl}${VIEWRAWMATERIALS}/${rowData.raw_material.id}`}
            underline="always"
            target="_blank"
          >
            {rowData.raw_material.name}
          </Link>
        ) : (
          "---"
        ),
    },
    {
      title: `Price Per Piece`,
      editable: "never",
      sorting: false,
      headerStyle: {
        textAlign: "center",
      },
      cellStyle: {
        textAlign: "right",
      },
      render: (rowData) => {
        let unit = rowData?.raw_material?.unit?.name;
        let value = "";
        if (rowData?.totalRow) {
          value = "";
        } else {
          if (
            !rowData?.price_per_piece ||
            isEmptyString(rowData?.price_per_piece)
          ) {
            value = convertNumber(
              rowData?.raw_material?.costing,
              true,
              true,
              " /" + unit
            );
          } else {
            value = rowData?.price_per_piece;
          }
        }
        return value;
      },
    },
    {
      title: "Quantity",
      field: "quantity",
      headerStyle: {
        textAlign: "center",
      },
      cellStyle: {
        textAlign: "right",
      },
      sorting: false,
      render: (rowData) => {
        let unit = rowData?.raw_material?.unit?.name;
        return rowData?.totalRow ? "" : rowData.quantity + " (" + unit + ")";
      },
      editComponent: (props) => {
        let unit = props.rowData?.raw_material?.unit?.name;
        return (
          <CustomInput
            onChange={(e) => props.onChange(e.target.value)}
            type="number"
            labelText="Quantity"
            name="quantity"
            value={props.value}
            id="quantity"
            noMargin
            formControlProps={{
              fullWidth: true,
            }}
            inputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {!isEmptyString(unit) ? unit : ""}
                </InputAdornment>
              ),
            }}
          />
        );
      },
    },
    {
      title: "Total Cost",
      editable: "never",
      headerStyle: {
        textAlign: "center",
      },
      cellStyle: {
        textAlign: "right",
      },
      sorting: false,
      render: (rowData) => convertNumber(rowData.total_price, true),
    },
  ];

  const columnsForReadyMaterial = [
    {
      title: "Ready Material",
      editable: "never",
      sorting: false,
      render: (rowData) =>
        rowData?.totalRow ? "" : rowData?.ready_material?.material_no,
    },
    {
      title: `Price Per Piece`,
      editable: "never",
      sorting: false,
      render: (rowData) => {
        let value = "";
        if (rowData?.totalRow) {
          value = "";
        } else {
          if (
            !rowData?.price_per_piece ||
            isEmptyString(rowData?.price_per_piece)
          ) {
            value = rowData?.ready_material?.price_per_piece;
          } else {
            value = rowData?.price_per_piece;
          }
        }
        return value;
      },
    },
    {
      title: "Quantity",
      sorting: false,
      render: (rowData) => (rowData?.totalRow ? "" : rowData.quantity),
      editComponent: (props) => (
        <CustomInput
          onChange={(e) => props.onChange(e.target.value)}
          type="number"
          labelText="Quantity"
          name="quantity"
          value={props.value}
          id="quantity"
          noMargin
          formControlProps={{
            fullWidth: true,
          }}
        />
      ),
    },
    {
      title: "Total Cost",
      editable: "never",
      sorting: false,
      render: (rowData) => convertNumber(rowData?.total_price, true),
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
      fetch(backend_designs_and_materials + "?" + new URLSearchParams(params), {
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
            data: [
              ...result.data,
              // {
              //   totalRow: true,
              //   total_price: props?.designData?.material_price,
              // },
            ],
            page: result.page - 1,
            totalCount: result.totalCount,
          });
        })
        .catch((error) => {
          throw error;
        });
    });
  };

  const updateQuantity = async (newData, oldData) => {
    let setRef = tableRef.current;
    let num = validateNumber(newData.quantity);
    let isError = false;
    if (!isNaN(num)) {
      if (num <= 0) {
        isError = true;
      }
    } else {
      isError = true;
    }
    if (isError) {
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: "Quantity should be a positive number",
      }));
    } else {
      let obj = {
        total_price: num * validateNumber(newData?.raw_material?.costing),
        quantity: num,
      };
      await providerForPut(
        backend_designs_and_materials,
        newData.id,
        obj,
        Auth.getToken()
      )
        .then((res) => {
          if (setRef) {
            setRef.onQueryChange();
          }
          props.updateDesign();
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "success",
            message: "Successfully updated " + oldData?.raw_material?.name,
          }));
        })
        .catch((err) => {
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message:
              "Error updating quantity of " + oldData?.raw_material?.name,
          }));
        });
    }
  };

  const onRowDelete = async (oldData) => {
    let setRef = tableRef.current;
    await providerForDelete(
      backend_designs_and_materials,
      oldData.id,
      Auth.getToken()
    )
      .then(async (res) => {
        if (setRef) {
          setRef.onQueryChange();
        }
        props.updateDesign();
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "success",
          message: "Successfully deleted " + oldData?.raw_material?.name,
        }));
      })
      .catch((err) => {
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error deleting " + oldData?.raw_material?.name,
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

  const handleAddDesignMaterial = () => {
    if (filter.isRawMaterial) {
      setOpenDialogForSelectingRawMaterial(true);
    } else {
      setOpenDialogForSelectingReadyMaterial(true);
    }
  };

  const handleCloseDialogForDesignMaterial = () => {
    if (filter.isRawMaterial) {
      setOpenDialogForSelectingRawMaterial(false);
    } else {
      setOpenDialogForSelectingReadyMaterial(false);
    }
  };

  const addDesign = async (val, pcs = 1) => {
    let setRef = tableRef.current;
    handleCloseDialogForDesignMaterial();
    setOpenBackDrop(true);
    if (filter.design) {
      let quantity = validateNumber(pcs) ? validateNumber(pcs) : 1;
      let data = {
        raw_material: val.id,
        ready_material: null,
        design: filter.design,
        color: filter?.isColor ? filter.color : null,
        quantity: quantity,
        price_per_piece: validateNumber(val.costing),
        total_price: validateNumber(val.costing) * quantity,
        isRawMaterial: filter?.isRawMaterial ? true : false,
        isColor: filter?.isColor ? true : false,
      };

      await providerForPost(
        backend_designs_and_materials,
        data,
        Auth.getToken()
      )
        .then((res) => {
          setOpenBackDrop(false);
          if (setRef) {
            setRef.onQueryChange();
          }
          props.updateDesign();
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "success",
            message: `${
              filter.isRawMaterial ? "Raw" : "Ready"
            } Material added successfully`,
          }));
        })
        .catch((err) => {
          let error = "";
          if (err.response.data.hasOwnProperty("message")) {
            error = err.response.data.message;
          } else {
            error = `Error adding ${
              filter.isRawMaterial ? "Raw" : "Ready"
            } Material`;
          }
          setSnackBar((snackBar) => ({
            ...snackBar,
            show: true,
            severity: "error",
            message: error,
          }));
          setOpenBackDrop(false);
        });
    } else {
      setOpenBackDrop(false);
      setSnackBar((snackBar) => ({
        ...snackBar,
        show: true,
        severity: "error",
        message: `${filter.isRawMaterial ? "Raw" : "Ready"} Material Not added`,
      }));
    }
  };

  const handleAddCategory = (row) => {
    delete error["category"];
    setError((error) => ({
      ...error,
    }));
    setFilterData((filterData) => ({
      ...filterData,
      categoryName: row.name,
    }));
    setFilter((filter) => ({
      ...filter,
      "raw_material.category": row.id,
    }));
    setOpenDialogForSelectingCategory(false);
  };

  const handleSelectRawMaterial = (rawMaterial) => {
    setSelectedRawmaterial({
      quantity: 1,
      rawMaterial: rawMaterial,
    });
    setOpenDialogToAcceptQuantity(true);
  };

  return (
    <>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <DialogForSelectingCategory
        handleCancel={() => setOpenDialogForSelectingCategory(false)}
        handleClose={() => setOpenDialogForSelectingCategory(false)}
        handleAddCategory={handleAddCategory}
        open={openDialogForSelectingCategory}
      />
      <DialogBoxForSelectingRawMaterial
        handleCancel={handleCloseDialogForDesignMaterial}
        handleClose={handleCloseDialogForDesignMaterial}
        handleAddRawMaterial={addDesign}
        open={openDialogForSelectingRawMaterial}
        filterId={filter.design}
        filterBy="design"
        isAcceptQuantity
      />
      <DialogBoxForSelectingReadyMaterial
        handleCancel={handleCloseDialogForDesignMaterial}
        handleClose={handleCloseDialogForDesignMaterial}
        handleAddReadyMaterial={addDesign}
        open={openDialogForSelectingReadyMaterial}
        filterId={filter.design}
        filterBy="design"
      />
      <DialogBox
        open={openDialogToAcceptQuantity}
        dialogTitle={"Add Raw Material Quantity"}
        cancelButton={"Cancel"}
        acceptButton={"OK"}
        handleAccept={() => {
          setOpenDialogToAcceptQuantity(false);
          addDesign(
            selectedRawMaterial.rawMaterial,
            selectedRawMaterial.quantity
          );
        }}
        handleCancel={() => {
          setOpenDialogToAcceptQuantity(false);
          addDesign(selectedRawMaterial.rawMaterial, 1);
        }}
        handleClose={() => {
          setOpenDialogToAcceptQuantity(false);
          addDesign(selectedRawMaterial.rawMaterial, 1);
        }}
      >
        <CustomInput
          onChange={(event) => {
            setSelectedRawmaterial((selectedRawMaterial) => ({
              ...selectedRawMaterial,
              quantity: event.target.value,
            }));
          }}
          labelText="Raw material quantity"
          name="name"
          value={selectedRawMaterial.quantity}
          id="name"
          autoComplete="off"
          formControlProps={{
            fullWidth: true,
          }}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {selectedRawMaterial.rawMaterial &&
                !isEmptyString(selectedRawMaterial.rawMaterial.unit.name)
                  ? "/" + selectedRawMaterial.rawMaterial.unit.name
                  : ""}
              </InputAdornment>
            ),
          }}
        />
      </DialogBox>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <GridContainer>
            <GridItem
              xs={12}
              sm={12}
              md={12}
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <FAB
                color="primary"
                align={"start"}
                size={"small"}
                toolTip={"Back to design"}
                onClick={() => {
                  history.push({
                    pathname: `${EDITDESIGN}/${filter.design}`,
                  });
                }}
              >
                <ArrowBackIcon />
              </FAB>
              <FAB
                color="primary"
                align={"end"}
                size={"small"}
                toolTip={"Add ready material"}
                onClick={() => handleAddDesignMaterial()}
              >
                <AddIcon />
              </FAB>
            </GridItem>
          </GridContainer>
          <GridContainer>
            <GridItem xs={12} sm={12} md={6}></GridItem>
            <GridItem xs={12} sm={12} md={6}>
              <CustomInput
                onChange={(event) => {
                  setRawMaterialName(event.target.value);
                  childRef.current.handleChangeFunction(event.target.value);
                }}
                labelText="Type for a raw material to add in design"
                name="name"
                value={rawMaterialName}
                id="name"
                autoComplete="off"
                formControlProps={{
                  fullWidth: true,
                }}
              />
              <RawMaterialList
                isView={false}
                ref={childRef}
                handleSelectRawMaterial={handleSelectRawMaterial}
              />
            </GridItem>
          </GridContainer>
          <GridContainer>
            <GridItem
              xs={12}
              sm={12}
              md={3}
              style={{
                marginLeft: "auto",
              }}
            >
              <CustomAutoComplete
                id="color"
                labelText="Select Color"
                autocompleteId={"color"}
                optionKey={"name"}
                options={colors}
                formControlProps={{
                  fullWidth: true,
                }}
                noMarginTop
                onChange={(event, value) => {
                  if (value !== null) {
                    setFilter((filter) => ({
                      ...filter,
                      isColor: true,
                      color: value.id,
                    }));
                    props.setColor(true, value);
                  } else {
                    delete filter.color;
                    setFilter((filter) => ({
                      ...filter,
                      isColor: false,
                    }));
                    props.setColor(false, null);
                  }
                  tableRef.current.onQueryChange();
                }}
                value={
                  colors[
                    colors.findIndex(function (item, i) {
                      return item.id === filter.color;
                    })
                  ] || null
                }
              />
            </GridItem>
          </GridContainer>
          <br />
          <GridContainer>
            {filter.isRawMaterial ? (
              <>
                <GridItem xs={12} sm={2} md={2}>
                  <CustomInput
                    onChange={(e) => {
                      if (isEmptyString(e.target.value)) {
                        delete filter["raw_material.name_contains"];
                        setFilter((filter) => ({
                          ...filter,
                        }));
                      } else {
                        setFilter((filter) => ({
                          ...filter,
                          "raw_material.name_contains": e.target.value,
                        }));
                      }
                    }}
                    type="text"
                    labelText="Raw Material Name"
                    name="raw_material.name_contains"
                    noMargin
                    value={filter["raw_material.name_contains"]}
                    id="raw_material.name_contains"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomAutoComplete
                    id="department-name"
                    labelText="Department"
                    autocompleteId={"department"}
                    optionKey={"name"}
                    options={departments}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    noMarginTop
                    onChange={(event, value) => {
                      if (value !== null) {
                        setFilter((filter) => ({
                          ...filter,
                          "raw_material.department": value.id,
                        }));
                      } else {
                        delete filter.department;
                        setFilter((filter) => ({
                          ...filter,
                        }));
                      }
                    }}
                    value={
                      departments[
                        departments.findIndex(function (item, i) {
                          return item.id === filter["raw_material.department"];
                        })
                      ] || null
                    }
                  />
                </GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={3}
                  style={{
                    padding: "0px 15px",
                    marginTop: isSmallerScreen ? "20px" : "0px",
                  }}
                >
                  <GridContainer
                    style={{
                      border: "1px solid #C0C0C0",
                      borderRadius: "10px",
                    }}
                  >
                    <GridItem
                      xs={8}
                      sm={8}
                      md={8}
                      style={{
                        margin: "15px 0px 0px",
                      }}
                    >
                      <GridContainer style={{ dispay: "flex" }}>
                        <GridItem xs={12} sm={12} md={12}>
                          <b>Category : </b> {filterData?.categoryName}
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                    <GridItem xs={1} sm={1} md={1}>
                      <Tooltip
                        title={
                          filter["raw_material.category"]
                            ? "Change Category "
                            : "Select Category"
                        }
                      >
                        <IconButton
                          onClick={() => {
                            setOpenDialogForSelectingCategory(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </GridItem>
                    <GridItem xs={1} sm={1} md={1}>
                      <IconButton
                        onClick={() => {
                          delete filterData["categoryName"];
                          setFilterData((filterData) => ({
                            ...filterData,
                          }));
                          delete filter["raw_material.category"];
                          setFilter((filter) => ({
                            ...filter,
                          }));
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </GridItem>
                  </GridContainer>
                </GridItem>
                <GridItem xs={12} sm={2} md={2} className={classes.switchBox}>
                  <div className={classes.block}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filter["raw_material.is_die"] ? true : false}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setFilter((filter) => ({
                                ...filter,
                                "raw_material.is_die": event.target.checked,
                              }));
                            } else {
                              delete filter["raw_material.is_die"];
                              setFilter((filter) => ({
                                ...filter,
                              }));
                            }
                          }}
                          classes={{
                            switchBase: classes.switchBase,
                            checked: classes.switchChecked,
                            thumb: classes.switchIcon,
                            track: classes.switchBar,
                          }}
                        />
                      }
                      classes={{
                        label: classes.label,
                      }}
                      label="Search Only Die's"
                    />
                  </div>
                </GridItem>
              </>
            ) : null}

            <GridItem xs={12} sm={12} md={3}>
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
                  delete filter["raw_material.is_die"];
                  delete filter["raw_material.name_contains"];
                  delete filter["raw_material.department"];
                  delete filter["raw_material.category"];
                  delete filterData["categoryName"];
                  setFilterData((filterData) => ({
                    ...filterData,
                  }));
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
            title="Raw Materials"
            columns={
              filter.isRawMaterial
                ? columnsForRawMaterial
                : columnsForReadyMaterial
            }
            data={async (query) => {
              return await getDesignData(query.page + 1, query.pageSize);
            }}
            localization={{
              body: {
                editRow: {
                  deleteText: `Are you sure you want to delete this ${
                    filter?.isRawMaterial ? "Raw" : "Ready"
                  } Material?`,
                  saveTooltip: "Save",
                },
              },
            }}
            editable={{
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve, reject) => {
                  setTimeout(async () => {
                    updateQuantity(newData, oldData);
                    resolve();
                  }, 1000);
                }),
              onRowDelete: (oldData) =>
                new Promise((resolve) => {
                  setTimeout(async () => {
                    onRowDelete(oldData);
                    resolve();
                  }, 1000);
                }),
            }}
            detailPanel={(rowData) => {
              if (rowData.totalRow) {
                return null;
              } else {
                return (
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={6}>
                      <RawMaterialDetail raw_material={rowData.raw_material} />
                    </GridItem>
                  </GridContainer>
                );
              }
            }}
            options={{
              pageSizeOptions: [20],
              pageSize: 20,
              actionsColumnIndex: -1,
              search: false,
              sorting: true,
              thirdSortClick: false,
              headerStyle: {
                fontFamily: "Montserrat",
                fontWeight: 500,
                color: "#8A8A97",
                borderBottom: "solid #E0E0E0 2px",
                fontSize: "1rem",
              },
              paginationStyle: {
                justifyContent: "center",
              },
              rowStyle: (rowData) => {
                let isZeroPage = false;
                let data = {};
                if (tableRef?.current?.state?.currentPage === 0) {
                  isZeroPage = true;
                  if (tableRef.current.state.data?.length) {
                    data = tableRef.current.state.data[0];
                  }
                }
                return {
                  backgroundColor:
                    isZeroPage && data?.id && data.id === rowData.id
                      ? "#d3d2d2"
                      : "#FFFFFF",
                };
              },
            }}
          />
        </GridItem>
      </GridContainer>
      <Backdrop className={classes.backdrop} open={openBackDrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
