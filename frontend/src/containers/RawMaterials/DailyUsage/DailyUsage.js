import React, { useEffect } from "react";
import { useState } from "react";
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  DialogBoxForSelectingRawMaterial,
  DialogForDownloadingDailyUsageData,
  FAB,
  GridContainer,
  GridItem,
  MonthYearPicker,
  RemoteAutoComplete,
  SnackBarComponent,
  Table,
} from "../../../components";
import VisibilityIcon from "@material-ui/icons/Visibility";
import DateRangeIcon from "@material-ui/icons/DateRange";
import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { makeStyles } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { useHistory } from "react-router-dom";
import {
  ADDRAWMATERIALUSAGE,
  RAWMATERIALUSAGE,
  VIEWRAWMATERIALS,
} from "../../../paths";
import {
  backend_category,
  backend_color,
  backend_departments,
  backend_monthly_sheet,
  backend_raw_materials,
  frontendServerUrl,
  backend_monthly_sheet_download_monthly_data,
} from "../../../constants";
import { getMonth, validateNumber } from "../../../Utils";
import { Link } from "@mui/material";
import { providerForDownload } from "../../../api";

const useStyles = makeStyles(styles);
const DailyUsage = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const tableRef = React.createRef();
  const [initialParams, setInitialParams] = useState(false);
  const [
    openDialogForDownloadingDailyUsageData,
    setOpenDialogForDownloadingDailyUsageData,
  ] = useState(false);
  const [autoCompleteObject, setAutoCompleteObject] = React.useState({});
  const [filter, setFilter] = useState({
    _sort: "updated_at:desc",
  });
  const [snackBar, setSnackBar] = useState({
    show: false,
    severity: "",
    message: "",
  });
  const [openBackDrop, setBackDrop] = useState(false);
  const [
    openDialogForSelectingRawMaterial,
    setOpenDialogForSelectingRawMaterial,
  ] = useState(false);

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  useEffect(() => {
    tableRef?.current?.onQueryChange();
  }, [initialParams]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let paramObj = {};
    for (var value of urlParams.keys()) {
      paramObj[value] = urlParams.get(value);
    }
    setFilter((filter) => ({
      ...filter,
      ...paramObj,
    }));
    setInitialParams(true);
  }, []);

  useEffect(() => {
    let url = `${frontendServerUrl}${RAWMATERIALUSAGE}`;
    let filterArr = Object.keys(filter);
    if (filterArr.length) {
      url = url + "?";
    }
    filterArr.forEach((d, key) => {
      url = url + `${d}=${filter[d]}`;
      if (filterArr.length !== key + 1) {
        url = url + "&";
      }
    });
    window.history.pushState("", "Daily usage", url);
  }, [filter, tableRef]);

  const columns = [
    {
      title: "Raw Material",
      field: "raw_material.name",
      render: (rowData) =>
        rowData?.raw_material?.name ? (
          <Link
            href={`${frontendServerUrl}${VIEWRAWMATERIALS}/${rowData.raw_material.id}`}
            underline="always"
            target="_blank"
          >
            {rowData.raw_material.name}
          </Link>
        ) : (
          "----"
        ),
    },
    {
      title: "Category",
      render: (rowData) =>
        rowData?.raw_material?.category?.name
          ? rowData.raw_material.category.name
          : "----",
    },
    {
      title: "Department",
      render: (rowData) =>
        rowData?.raw_material?.department?.name
          ? rowData.raw_material.department.name
          : "----",
    },
    {
      title: "Color",
      render: (rowData) =>
        rowData?.raw_material?.color?.name
          ? rowData.raw_material.color.name
          : "----",
    },
    { title: "Year", field: "year" },
    {
      title: "Month",
      field: "month",
      render: (rowData) => getMonth(rowData.month - 1),
    },
    { title: "Total Used", render: (rowData) => validateNumber(rowData.total) },
  ];

  const changeRawMaterial = (key) => {
    setOpenDialogForSelectingRawMaterial(true);
  };

  const handleCloseDialogForRawMaterial = () => {
    setOpenDialogForSelectingRawMaterial(false);
  };

  const getDailyUsage = async (page, pageSize) => {
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
      fetch(backend_monthly_sheet + "?" + new URLSearchParams(params), {
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

  const handleSelectRawMaterial = (value, obj) => {
    history.push(
      ADDRAWMATERIALUSAGE + "?d=" + new Date() + "&r_id=" + value.id
    );
    handleCloseDialogForRawMaterial();
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

  const setAutoCompleteData = (data, key) => {
    if (data && data.value) {
      setFilter((filter) => ({
        ...filter,
        [key]: data.value,
      }));
      setAutoCompleteObject((autoCompleteObject) => ({
        ...autoCompleteObject,
        [key]: data,
      }));
    } else {
      delete filter[key];
      delete autoCompleteObject[key];
      setFilter((filter) => ({
        ...filter,
      }));
      setAutoCompleteObject((autoCompleteObject) => ({
        ...autoCompleteObject,
      }));
    }
  };

  const downloadData = () => {
    setOpenDialogForDownloadingDailyUsageData(true);
  };

  const handleSelectOpenForDownloadingPDF = async (obj) => {
    handleCloseDialogForDailyUsage();
    setBackDrop(true);
    await providerForDownload(
      backend_monthly_sheet_download_monthly_data,
      obj,
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
        setBackDrop(false);
      });
  };

  const handleSelectOpenForDownloadingExcel = async (obj) => {
    handleCloseDialogForDailyUsage();
    setBackDrop(true);
    await providerForDownload(
      backend_monthly_sheet_download_monthly_data,
      obj,
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
        setBackDrop(false);
      });
  };

  const handleCloseDialogForDailyUsage = () => {
    setOpenDialogForDownloadingDailyUsageData(false);
  };

  return (
    <>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <DialogForDownloadingDailyUsageData
        open={openDialogForDownloadingDailyUsageData}
        handleCancel={handleCloseDialogForDailyUsage}
        handleClose={handleCloseDialogForDailyUsage}
        handleAccept={handleCloseDialogForDailyUsage}
        handleSelectOpenForDownloadingPDF={handleSelectOpenForDownloadingPDF}
        handleSelectOpenForDownloadingExcel={
          handleSelectOpenForDownloadingExcel
        }
      />
      <DialogBoxForSelectingRawMaterial
        handleCancel={handleCloseDialogForRawMaterial}
        handleClose={handleCloseDialogForRawMaterial}
        handleAccept={handleCloseDialogForRawMaterial}
        handleAddRawMaterial={handleSelectRawMaterial}
        isHandleKey={false}
        gridKey={null}
        isBalanceCheck={true}
        open={openDialogForSelectingRawMaterial}
      />
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary" className={classes.cardHeaderStyles}>
              <DateRangeIcon fontSize="large" />
              <p className={classes.cardCategoryWhite}></p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <FAB
                    color="primary"
                    align={"end"}
                    size={"small"}
                    onClick={() => changeRawMaterial()}
                  >
                    <AddIcon />

                    {/* {selectedRawMaterial
                      ? "Change Raw Material"
                      : "Select Raw Material"} */}
                  </FAB>
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={2}>
                  <MonthYearPicker
                    views={["year", "month"]}
                    onChange={(event) => {
                      console.log("event => ", event);
                      let date = new Date(event);
                      let year = date.getFullYear();
                      let month = date.getMonth();
                      setFilter((filter) => ({
                        ...filter,
                        month: month + 1,
                        year: year,
                      }));
                    }}
                    label="Month/Year"
                    name="date"
                    value={
                      filter.year && filter.month
                        ? new Date(filter.year, filter.month - 1, 1)
                        : null
                    }
                    id="date"
                    openTo="month"
                    style={{
                      marginTop: "-0.4rem",
                      width: "100%",
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                  <RemoteAutoComplete
                    setSelectedData={(data) =>
                      setAutoCompleteData(data, "raw_material")
                    }
                    searchString={"name"}
                    apiName={backend_raw_materials}
                    placeholder="Select Raw Material"
                    selectedValue={filter["raw_material"]}
                    isRawMaterial={true}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <RemoteAutoComplete
                    setSelectedData={(data) =>
                      setAutoCompleteData(data, "raw_material.category")
                    }
                    searchString={"name"}
                    apiName={backend_category}
                    placeholder="Select Category"
                    selectedValue={filter["raw_material.category"]}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <RemoteAutoComplete
                    setSelectedData={(data) =>
                      setAutoCompleteData(data, "raw_material.department")
                    }
                    searchString={"name"}
                    apiName={backend_departments}
                    placeholder="Select Department"
                    selectedValue={filter["raw_material.department"]}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <RemoteAutoComplete
                    setSelectedData={(data) =>
                      setAutoCompleteData(data, "raw_material.color")
                    }
                    searchString={"name"}
                    apiName={backend_color}
                    placeholder="Select Color"
                    selectedValue={filter["raw_material.color"]}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem
                  xs={12}
                  sm={12}
                  md={4}
                  style={{
                    marginTop: "27px",
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
                      setFilter({
                        _sort: "updated_at:desc",
                      });
                      setAutoCompleteObject({});
                      tableRef.current.onQueryChange();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      downloadData();
                    }}
                  >
                    Download
                  </Button>
                </GridItem>
              </GridContainer>
              <br />
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <Table
                    tableRef={tableRef}
                    title="Departments"
                    columns={columns}
                    data={async (query) => {
                      return await getDailyUsage(
                        query.page + 1,
                        query.pageSize
                      );
                    }}
                    localization={{
                      body: {
                        editRow: {
                          deleteText: `Are you sure you want to delete this Color?`,
                          saveTooltip: "Delete",
                        },
                      },
                    }}
                    actions={[
                      (rowData) => ({
                        icon: () => <VisibilityIcon fontSize="small" />,
                        tooltip: "View Usage Data",
                        onClick: (event, rowData) => {
                          history.push(
                            ADDRAWMATERIALUSAGE +
                              "?d=" +
                              new Date(rowData.year, rowData.month - 1, 1) +
                              "&r_id=" +
                              rowData.raw_material.id
                          );
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
                </GridItem>
              </GridContainer>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </>
  );
};

export default DailyUsage;
