import React, { useState, useEffect } from "react";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import AddOutlinedIcon from "@material-ui/icons/AddOutlined";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  makeStyles,
  Switch,
} from "@material-ui/core";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";
import { useHistory } from "react-router-dom";

// @material-ui/core components
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  CustomInput,
  DialogBoxForSelectingRawMaterial,
  DialogBoxForSelectingReadyMaterial,
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent,
  Table,
} from "../../components";
import {
  apiUrl,
  backend_designs,
  backend_designs_and_materials,
} from "../../constants";
import { ADDDESIGN, EDITDESIGN, VIEWDESIGN } from "../../paths";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { checkEmpty, convertNumber, isEmptyString } from "../../Utils";
import { providerForPost } from "../../api";

export default function DesignMaterials(props) {
  const useStyles = makeStyles(styles);
  const classes = useStyles();
  const tableRef = React.createRef();
  const [openBackDrop, setOpenBackDrop] = useState(false);
  const history = useHistory();
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

  const columnsForRawMaterial = [
    {
      title: "Raw Material",
      editable: "never",
      sorting: false,
      render: (rowData) =>
        rowData?.raw_material?.name ? rowData?.raw_material?.name : "---",
    },
    {
      title: "Die?",
      field: "is_die",
      editable: "never",
      sorting: false,
      render: (rowData) => (rowData?.raw_material?.is_die ? "Yes" : "No"),
    },
    {
      title: `Price Per Piece`,
      editable: "never",
      sorting: false,
      render: (rowData) => {
        let value = "";
        if (
          !rowData?.price_per_piece ||
          isEmptyString(rowData?.price_per_piece)
        ) {
          value = rowData?.raw_material?.costing;
        } else {
          value = rowData?.price_per_piece;
        }
        return value;
      },
    },
    {
      title: "Quantity",
      field: "quantity",
      sorting: false,
      render: (rowData) => rowData.quantity,
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
      render: (rowData) => convertNumber(rowData.total_price, true),
    },
  ];

  const columnsForReadyMaterial = [
    {
      title: "Ready Material",
      editable: "never",
      sorting: false,
      render: (rowData) => rowData?.ready_material?.material_no,
    },
    {
      title: `Price Per Piece`,
      editable: "never",
      sorting: false,
      render: (rowData) => {
        let value = "";
        if (
          !rowData?.price_per_piece ||
          isEmptyString(rowData?.price_per_piece)
        ) {
          value = rowData?.ready_material?.price_per_piece;
        } else {
          value = rowData?.price_per_piece;
        }
        return value;
      },
    },
    {
      title: "Quantity",
      sorting: false,
      render: (rowData) => rowData.quantity,
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

  // const updateQuantity = async (newData, oldData) => {
  //   let num = parseFloat(newData.quantity);
  //   let isError = false;
  //   if (!isNaN(num)) {
  //     if (num <= 0) {
  //       isError = true;
  //     }
  //   } else {
  //     isError = true;
  //   }
  //   if (isError) {
  //     setSnackBar((snackBar) => ({
  //       ...snackBar,
  //       show: true,
  //       severity: "error",
  //       message: "Quantity should be a positive number",
  //     }));
  //   } else {
  //     let obj = {
  //       id: newData.dataId,
  //       newQuantity: newData.quantity,
  //       oldQuantity: oldData.quantity,
  //       costPerPiece: newData.costPerPiece,
  //       ready_material: formState.id,
  //     };
  //     await providerForPost(backend_designs_and_materials, obj, Auth.getToken())
  //       .then((res) => {
  //         setFormState((formState) => ({
  //           ...formState,
  //           final_cost: res.data.final_cost,
  //           final_cost_formatted: convertNumber(
  //             parseFloat(res.data.final_cost).toFixed(2),
  //             true
  //           ),
  //         }));
  //         tableRef.current.onQueryChange();
  //       })
  //       .catch((err) => {
  //         setSnackBar((snackBar) => ({
  //           ...snackBar,
  //           show: true,
  //           severity: "error",
  //           message: "Error updating quantity of " + oldData.name,
  //         }));
  //       });
  //   }
  // };

  // const onRowDelete = async (oldData) => {
  //   let body = {
  //     id: oldData.dataId,
  //     quantity: oldData.quantity,
  //     costPerPiece: oldData.costPerPiece,
  //     ready_material: formState.id,
  //   };
  //   await providerForPost(backend_designs_and_materials, body, Auth.getToken())
  //     .then(async (res) => {
  //       setSnackBar((snackBar) => ({
  //         ...snackBar,
  //         show: true,
  //         severity: "success",
  //         message: "Successfully deleted " + oldData.name,
  //       }));
  //       setFormState((formState) => ({
  //         ...formState,
  //         final_cost: res.data.final_cost,
  //         final_cost_formatted: convertNumber(
  //           parseFloat(res.data.final_cost).toFixed(2),
  //           true
  //         ),
  //       }));
  //     })
  //     .catch((err) => {
  //       setSnackBar((snackBar) => ({
  //         ...snackBar,
  //         show: true,
  //         severity: "error",
  //         message: "Error deleting " + oldData.name,
  //       }));
  //     });
  // };

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

  const addDesign = async (val, obj = {}) => {
    let setRef = tableRef.current;
    handleCloseDialogForDesignMaterial();
    setOpenBackDrop(true);
    if (filter.design) {
      let data = {
        raw_material: null,
        ready_material: null,
        design: filter.design,
        color: filter?.isColor ? filter?.color : null,
        quantity: 1,
        price_per_piece: filter?.isRawMaterial
          ? val.costing
          : val.price_per_piece,
        total_price: filter?.isRawMaterial ? val.costing : val.price_per_piece,
        isRawMaterial: filter?.isRawMaterial ? true : false,
        isColor: filter?.isColor ? true : false,
      };

      if (filter.isRawMaterial) {
        data = {
          ...data,
          raw_material: val.id,
        };
      } else {
        data = {
          ...data,
          ready_material: val.id,
        };
      }

      await providerForPost(
        backend_designs_and_materials,
        data,
        Auth.getToken()
      )
        .then((res) => {
          setOpenBackDrop(false);
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
      setRef.onQueryChange();
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

  return (
    <>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <DialogBoxForSelectingRawMaterial
        handleCancel={handleCloseDialogForDesignMaterial}
        handleClose={handleCloseDialogForDesignMaterial}
        handleAddRawMaterial={addDesign}
        open={openDialogForSelectingRawMaterial}
      />
      <DialogBoxForSelectingReadyMaterial
        handleCancel={handleCloseDialogForDesignMaterial}
        handleClose={handleCloseDialogForDesignMaterial}
        handleAddReadyMaterial={addDesign}
        open={openDialogForSelectingReadyMaterial}
      />
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
              <FAB
                color="primary"
                align={"end"}
                size={"small"}
                onClick={() => handleAddDesignMaterial()}
              >
                <AddIcon />
              </FAB>
            </GridItem>
          </GridContainer>
          <GridContainer>
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
            {filter.isRawMaterial ? (
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
            ) : null}

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
                  delete filter["raw_material.is_die"];
                  delete filter["isColorDependent"];
                  delete filter["raw_material.name_contains"];
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
                    //updateQuantity(newData, oldData);
                    resolve();
                  }, 1000);
                }),
              onRowDelete: (oldData) =>
                new Promise((resolve) => {
                  setTimeout(async () => {
                    //onRowDelete(oldData);
                    resolve();
                  }, 1000);
                }),
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
                      ? "#F3F3F3"
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
