import React, { useState } from "react";
// @material-ui/core components
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  CustomAutoComplete,
  CustomCheckBox,
  CustomInput,
  FAB,
  GridContainer,
  GridItem,
  RemoteAutoComplete,
  SnackBarComponent,
  Table,
} from "../../components";
// core components
import EditIcon from "@material-ui/icons/Edit";
import {
  backend_category,
  backend_color,
  backend_departments,
  backend_raw_materials,
  frontendServerUrl,
} from "../../constants";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { providerForGet, providerForDelete } from "../../api";
import { useHistory } from "react-router-dom";
import {
  ADDRAWMATERIALS,
  EDITRAWMATERIALS,
  VIEWRAWMATERIALS,
  ADDRAWMATERIALUSAGE,
  RAWMATERIALSVIEW,
} from "../../paths";
import { convertNumber, isEmptyString } from "../../Utils";
import { useEffect } from "react";
import ListAltIcon from "@material-ui/icons/ListAlt";
import AddIcon from "@material-ui/icons/Add";
import DateRangeIcon from "@material-ui/icons/DateRange";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "@mui/material";

const useStyles = makeStyles(styles);
export default function RawMaterials() {
  const classes = useStyles();
  const tableRef = React.createRef();
  const [departments, setDepartments] = useState([]);
  const [autoCompleteObject, setAutoCompleteObject] = React.useState({});
  const history = useHistory();
  const [initialParams, setInitialParams] = useState(false);
  const [openBackDrop, setBackDrop] = useState(false);
  const [filter, setFilter] = useState({
    _sort: "updated_at:asc",
  });

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const columns = [
    {
      title: "Name",
      field: "name",
      render: (rowData) =>
        rowData?.name ? (
          <Link
            href={`${frontendServerUrl}${VIEWRAWMATERIALS}/${rowData.id}`}
            underline="always"
            target="_blank"
          >
            {rowData.name}
          </Link>
        ) : (
          "----"
        ),
    },
    {
      title: "Category",
      field: "category",
      sorting: false,
      render: (rowData) =>
        isEmptyString(rowData.category) ? "---" : rowData.category,
    },
    {
      title: "Color",
      field: "color",
      sorting: false,
      render: (rowData) =>
        isEmptyString(rowData.color) ? "---" : rowData.color,
    },
    {
      title: "Size",
      field: "size",
      render: (rowData) => (isEmptyString(rowData.size) ? "---" : rowData.size),
    },
    {
      title: "Department",
      field: "department",
      sorting: false,
      render: (rowData) =>
        isEmptyString(rowData.department) ? "---" : rowData.department,
    },
    {
      title: "Costing",
      field: "costing",
      render: (rowData) => {
        let unit = rowData?.unit;
        let value = convertNumber(rowData?.costing, true, true, " /" + unit);
        return value;
      },
    },
    {
      title: "Balance",
      field: "balance",
      render: (rowData) => {
        let unit = rowData?.unit;
        return rowData.balance + " (" + unit + ")";
      },
    },
  ];

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

  console.log("filter => ", filter);

  useEffect(() => {
    let url = `${frontendServerUrl}${RAWMATERIALSVIEW}`;
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

  useEffect(() => {
    getDepartmentData();
  }, []);

  const getDepartmentData = async () => {
    setBackDrop(true);
    await providerForGet(
      backend_departments,
      {
        pageSize: -1,
      },
      Auth.getToken()
    )
      .then((res) => {
        setDepartments(res.data.data);
        setBackDrop(false);
      })
      .catch((err) => {});
  };

  const getRawMaterialsData = async (page, pageSize) => {
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
      fetch(backend_raw_materials + "?" + new URLSearchParams(params), {
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
          let data = convertData(result.data);
          resolve({
            data: data,
            page: result.page - 1,
            totalCount: result.totalCount,
          });
        })
        .catch((error) => {
          throw error;
        });
    });
  };

  const convertData = (data) => {
    let arr = [];
    data.map((d) => {
      let unit = d.unit ? d.unit.name : "";
      let department = d.department.name;
      let color = d.color ? d.color.name : "";
      let category = d.category ? d.category.name : "";
      arr.push({
        id: d.id,
        name: d.name,
        category: category,
        color: color,
        size: d.size,
        department: department,
        costing: d.costing,
        balance: d.balance ? d.balance : "0",
        is_die: d.is_die,
        unit: unit,
      });
    });
    return arr;
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

  const handleChange = (event) => {
    if (isEmptyString(event.target.value)) {
      delete filter[event.target.name];
      setFilter((filter) => ({
        ...filter,
      }));
    } else {
      setFilter((filter) => ({
        ...filter,
        [event.target.name]: event.target.value,
      }));
    }
  };
  const handleAdd = () => {
    history.push(ADDRAWMATERIALS);
  };

  const handleAddDailyCount = (rowData) => {
    history.push(
      ADDRAWMATERIALUSAGE + "?d=" + new Date() + "&r_id=" + rowData.id
    );
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
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Name"
                    value={filter.name_contains || ""}
                    name="name_contains"
                    id="name"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={2}
                  style={{ marginTop: "2.2rem" }}
                >
                  <RemoteAutoComplete
                    setSelectedData={(data) =>
                      setAutoCompleteData(data, "category")
                    }
                    searchString={"name"}
                    apiName={backend_category}
                    placeholder="Select Category"
                    selectedValue={filter["category"]}
                  />
                </GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={2}
                  style={{ marginTop: "2.2rem" }}
                >
                  <RemoteAutoComplete
                    setSelectedData={(data) =>
                      setAutoCompleteData(data, "department")
                    }
                    searchString={"name"}
                    apiName={backend_departments}
                    placeholder="Select Department"
                    selectedValue={filter["department"]}
                  />
                </GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={2}
                  style={{ marginTop: "2.2rem" }}
                >
                  <RemoteAutoComplete
                    setSelectedData={(data) =>
                      setAutoCompleteData(data, "color")
                    }
                    searchString={"name"}
                    apiName={backend_color}
                    placeholder="Select Color"
                    selectedValue={filter["color"]}
                  />
                </GridItem>
                {/* <GridItem xs={12} sm={12} md={3}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Name"
                    value={filter.name_contains || ""}
                    name="name_contains"
                    id="name"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Category"
                    value={filter["category.name_contains"] || ""}
                    name="category.name_contains"
                    id="category"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Color"
                    value={filter["color.name_contains"] || ""}
                    name="color.name_contains"
                    id="color"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem> */}
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    onChange={(event) => handleChange(event)}
                    labelText="Size"
                    value={filter.size_contains || ""}
                    name="size_contains"
                    id="size"
                    formControlProps={{
                      fullWidth: true,
                    }}
                  />
                </GridItem>
                {/* <GridItem xs={12} sm={12} md={2}>
                  <CustomAutoComplete
                    id="department-name"
                    labelText="Department"
                    autocompleteId={"department"}
                    optionKey={"name"}
                    options={departments}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    onChange={(event, value) => {
                      if (value !== null) {
                        setFilter((filter) => ({
                          ...filter,
                          department: value.id,
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
                          return item.id === filter.department;
                        })
                      ] || null
                    }
                  />
                </GridItem> */}
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomCheckBox
                    onChange={(event) => {
                      if (event.target.checked) {
                        setFilter((filter) => ({
                          ...filter,
                          is_die: true,
                        }));
                      } else {
                        delete filter.is_die;
                        setFilter((filter) => ({
                          ...filter,
                        }));
                      }
                    }}
                    labelText="Die"
                    name="is_die"
                    checked={filter.is_die || false}
                    id="die"
                  />
                </GridItem>
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
                      //tableRef.current.onQueryChange();
                      tableRef.current.onQueryChange(
                        {
                          page: 1,
                          pageSize: 5,
                        },
                        () => {}
                      );
                    }}
                  >
                    Search
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      setFilter({
                        _sort: "updated_at:asc",
                      });
                      setAutoCompleteObject({});
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
                columns={columns}
                data={async (query) => {
                  console.log("query => ", query);
                  return await getRawMaterialsData(
                    query.page + 1,
                    query.pageSize
                  );
                }}
                actions={[
                  (rowData) => ({
                    icon: () => <EditIcon fontSize="small" />,
                    tooltip: "Edit",
                    onClick: (event, rowData) => {
                      history.push(EDITRAWMATERIALS + "/" + rowData.id);
                    },
                  }),
                  (rowData) => ({
                    icon: () => (
                      <VisibilityIcon fontSize="small" color="primary" />
                    ),
                    tooltip: "View",
                    onClick: (event, rowData) => {
                      history.push(VIEWRAWMATERIALS + "/" + rowData.id);
                    },
                  }),
                  (rowData) => ({
                    icon: () => <DateRangeIcon fontSize="small" />,
                    tooltip:
                      rowData.balance === "0"
                        ? "Balance is 0, cannot add daily usage"
                        : "Add Daily Usage",
                    disabled: rowData.balance === "0" ? true : false,
                    onClick: (event, rowData) => {
                      handleAddDailyCount(rowData);
                    },
                  }),
                ]}
                localization={{
                  body: {
                    editRow: {
                      deleteText: `Are you sure you want to delete this Raw Material?`,
                      saveTooltip: "Delete",
                    },
                  },
                }}
                icons={{
                  Delete: () => <DeleteIcon style={{ color: "red" }} />,
                }}
                editable={{
                  onRowDelete: (oldData) =>
                    new Promise((resolve) => {
                      setTimeout(async () => {
                        await providerForDelete(
                          backend_raw_materials,
                          oldData.id,
                          Auth.getToken()
                        )
                          .then(async (res) => {
                            setSnackBar((snackBar) => ({
                              ...snackBar,
                              show: true,
                              severity: "success",
                              message: "Successfully deleted " + oldData.name,
                            }));
                          })
                          .catch((err) => {
                            setSnackBar((snackBar) => ({
                              ...snackBar,
                              show: true,
                              severity: "error",
                              message: "Error deleting " + oldData.name,
                            }));
                          });
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
