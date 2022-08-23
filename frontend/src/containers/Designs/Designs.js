import React, { useState } from "react";
// @material-ui/core components
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  CustomInput,
  DialogBoxForDuplicatingDesign,
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent,
  StockData,
  Table,
} from "../../components";
// core components
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { apiUrl, backend_designs, frontendServerUrl } from "../../constants";
import { ADDDESIGN, EDITDESIGN, VIEWDESIGN } from "../../paths";
import { useHistory } from "react-router-dom";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";
import { isEmptyString } from "../../Utils";
import no_image_icon from "../../assets/img/no_image_icon.png";
import { providerForDelete, providerForDownload } from "../../api";
import DownloadIcon from "@mui/icons-material/Download";
import { backend_download_designs } from "../../constants/UrlConstants";

const useStyles = makeStyles(styles);
export default function Designs() {
  const classes = useStyles();
  const tableRef = React.createRef();
  const [openDuplicateDialog, setOpenDuplicateDialog] = useState({
    status: false,
    designNumber: "",
    designId: null,
  });
  const history = useHistory();
  const [filter, setFilter] = useState({
    _sort: "updated_at:desc",
  });
  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });
  const [openBackDrop, setBackDrop] = useState(false);

  const columns = [
    {
      title: "Material No",
      field: "material_no",
      sorting: false,
      align: "center",
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
        if (rowData.color_price && rowData.color_price.length) {
          let array = rowData.color_price;
          output = <StockData data={array} />;
        } else {
          output = rowData.stock;
        }
        return output;
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

  const onRowDelete = async (data) => {
    let setRef = tableRef.current;
    await providerForDelete(backend_designs, data.id, Auth.getToken())
      .then((res) => {
        if (setRef) {
          setRef.onQueryChange();
        }
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "success",
          message: "Successfully deleted design " + data?.material_no,
        }));
      })
      .catch((err) => {
        console.log("err ", err);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error deleting design " + data?.material_no,
        }));
      });
  };

  const downloadDesign = async (data) => {
    setBackDrop(true);
    await providerForDownload(
      backend_download_designs,
      {
        downloadAll: true,
        color: null,
        id: data.id,
      },
      Auth.getToken()
    )
      .then((res) => {
        const url = URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );
        const pdfNewWindow = window.open();
        pdfNewWindow.location.href = url;
        setBackDrop(false);
      })
      .catch((err) => {
        console.log("Error => ".err);
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error while downloading order data",
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
      <DialogBoxForDuplicatingDesign
        handleCancel={() => setOpenDuplicateDialog(false)}
        handleClose={() => setOpenDuplicateDialog(false)}
        open={openDuplicateDialog.status}
        designNumber={openDuplicateDialog.designNumber}
        designId={openDuplicateDialog.designId}
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
                    icon: () => <EditIcon fontSize="small" />,
                    tooltip: "Edit",
                    onClick: (event, rowData) => {
                      history.push(`${EDITDESIGN}/${rowData.id}`);
                    },
                  }),
                  (rowData) => ({
                    icon: () => (
                      <VisibilityIcon fontSize="small" color="primary" />
                    ),
                    tooltip: "View",
                    onClick: (event, rowData) => {
                      history.push(`${VIEWDESIGN}/${rowData.id}`);
                    },
                  }),
                  (rowData) => ({
                    icon: () => <FileCopyIcon fontSize="small" />,
                    tooltip: "Duplicate",
                    onClick: (event, rowData) => {
                      setOpenDuplicateDialog((openDuplicateDialog) => ({
                        ...openDuplicateDialog,
                        status: true,
                        designNumber: rowData.material_no,
                        designId: rowData.id,
                      }));
                    },
                  }),
                  (rowData) => ({
                    icon: () => <DownloadIcon fontSize="small" />,
                    tooltip: "Download All Designs",
                    onClick: (event, rowData) => {
                      downloadDesign(rowData);
                    },
                  }),
                ]}
                editable={{
                  onRowDelete: (oldData) =>
                    new Promise((resolve) => {
                      setTimeout(async () => {
                        onRowDelete(oldData);
                        resolve();
                      }, 1000);
                    }),
                }}
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
