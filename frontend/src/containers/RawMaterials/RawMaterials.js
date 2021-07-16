import React, { useState } from "react";
// @material-ui/core components
import {
  Auth,
  Button,
  CustomAutoComplete,
  CustomCheckBox,
  CustomInput,
  GridContainer,
  GridItem,
  SnackBarComponent,
  Table
} from "../../components";
// core components
import EditIcon from "@material-ui/icons/Edit";
import { backend_departments, backend_raw_materials } from "../../constants";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { providerForGet, providerForDelete } from "../../api";
import { useHistory } from "react-router-dom";
import { EDITRAWMATERIALS, VIEWRAWMATERIALS } from "../../paths";
import { isEmptyString } from "../../Utils";
import { useEffect } from "react";

const useStyles = makeStyles(styles);
export default function RawMaterials() {
  const classes = useStyles();
  const tableRef = React.createRef();
  const [departments, setDepartments] = useState([]);
  const history = useHistory();
  const [openBackDrop, setBackDrop] = useState(false);
  const [filter, setFilter] = useState({
    _sort: "name:asc"
  });

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: ""
  });

  const columns = [
    {
      title: "Name",
      field: "name",
      render: rowData => (isEmptyString(rowData.name) ? "---" : rowData.name)
    },
    {
      title: "Color",
      field: "color",
      render: rowData => (isEmptyString(rowData.color) ? "---" : rowData.color)
    },
    {
      title: "Size",
      field: "size",
      render: rowData => (isEmptyString(rowData.size) ? "---" : rowData.size)
    },
    {
      title: "Department",
      field: "department",
      render: rowData =>
        isEmptyString(rowData.department) ? "---" : rowData.department
    },
    { title: "Costing", field: "costing" },
    { title: "Balance", field: "balance" }
  ];

  useEffect(() => {
    getDepartmentData();
  }, []);

  const getDepartmentData = async () => {
    setBackDrop(true);
    await providerForGet(
      backend_departments,
      {
        pageSize: -1
      },
      Auth.getToken()
    )
      .then(res => {
        setDepartments(res.data.data);
        setBackDrop(false);
      })
      .catch(err => {});
  };

  const getRawMaterialsData = async (page, pageSize) => {
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
      fetch(backend_raw_materials + "?" + new URLSearchParams(params), {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + Auth.getToken()
        }
      })
        .then(response => response.json())
        .then(result => {
          let data = convertData(result.data);
          resolve({
            data: data,
            page: result.page - 1,
            totalCount: result.totalCount
          });
        });
    });
  };

  const convertData = data => {
    let arr = [];
    data.map(d => {
      let department = d.department.name;
      let costing = d.costing ? d.costing + "/" + d.unit_name : 0;

      arr.push({
        id: d.id,
        name: d.name,
        color: d.color,
        size: d.size,
        department: department,
        costing: costing,
        balance: d.balance ? d.balance : "0",
        is_die: d.is_die
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
    setFilter(filter => ({
      ...filter,
      _sort: orderBy
    }));
    tableRef.current.onQueryChange();
  };

  const handleTableAction = async (row, isView) => {
    setBackDrop(true);
    await providerForGet(
      backend_raw_materials + "/" + row.id,
      {},
      Auth.getToken()
    )
      .then(res => {
        setBackDrop(false);
        if (isView) {
          history.push(VIEWRAWMATERIALS, { data: res.data, view: true });
        } else {
          history.push(EDITRAWMATERIALS, { data: res.data, edit: true });
        }
      })
      .catch(err => {
        setBackDrop(false);
        setSnackBar(snackBar => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error viewing raw material"
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
        <GridItem xs={12} sm={12} md={3}>
          <CustomInput
            onChange={event => handleChange(event)}
            labelText="Name"
            value={filter.name_contains || ""}
            name="name_contains"
            id="name"
            formControlProps={{
              fullWidth: true
            }}
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={3}>
          <CustomInput
            onChange={event => handleChange(event)}
            labelText="Color"
            value={filter.color_contains || ""}
            name="color_contains"
            id="color"
            formControlProps={{
              fullWidth: true
            }}
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={3}>
          <CustomInput
            onChange={event => handleChange(event)}
            labelText="Size"
            value={filter.size_contains || ""}
            name="size_contains"
            id="size"
            formControlProps={{
              fullWidth: true
            }}
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={3}>
          <CustomAutoComplete
            id="department-name"
            labelText="Department"
            autocompleteId={"department"}
            optionKey={"name"}
            options={departments}
            formControlProps={{
              fullWidth: true
            }}
            onChange={(event, value) => {
              if (value !== null) {
                setFilter(filter => ({
                  ...filter,
                  department: value.id
                }));
              } else {
                delete filter.department;
                setFilter(filter => ({
                  ...filter
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
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={2}>
          <CustomInput
            onChange={event => handleChange(event)}
            labelText="Costing"
            value={filter.costing_contains || ""}
            name="costing_contains"
            type="number"
            id="costing"
            formControlProps={{
              fullWidth: true
            }}
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={2}>
          <CustomInput
            onChange={event => handleChange(event)}
            labelText="Balance From"
            value={filter.balance_gte || ""}
            name="balance_gte"
            type="number"
            id="balance"
            formControlProps={{
              fullWidth: true
            }}
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={2}>
          <CustomInput
            onChange={event => handleChange(event)}
            labelText="Balance To"
            value={filter.balance_lte || ""}
            name="balance_lte"
            type="number"
            id="balance"
            formControlProps={{
              fullWidth: true
            }}
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={2}>
          <CustomCheckBox
            onChange={event => {
              if (event.target.checked) {
                setFilter(filter => ({
                  ...filter,
                  is_die: true
                }));
              } else {
                delete filter.is_die;
                setFilter(filter => ({
                  ...filter
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
              delete filter["name_contains"];
              delete filter["color_contains"];
              delete filter["size_contains"];
              delete filter["department"];
              delete filter["costing_contains"];
              delete filter["balance_gte"];
              delete filter["balance_lte"];
              delete filter["is_die"];
              setFilter(filter => ({
                ...filter,
                _sort: "name:asc"
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
        columns={columns}
        data={async query => {
          return await getRawMaterialsData(query.page + 1, query.pageSize);
        }}
        actions={[
          rowData => ({
            icon: () => <EditIcon fontSize="small" />,
            tooltip: "Edit",
            onClick: (event, rowData) => {
              handleTableAction(rowData, false);
            }
          }),
          rowData => ({
            icon: () => <VisibilityIcon fontSize="small" />,
            tooltip: "View",
            onClick: (event, rowData) => {
              handleTableAction(rowData, true);
            }
          })
        ]}
        localization={{
          body: {
            editRow: {
              deleteText: `Are you sure you want to delete this Raw Material?`,
              saveTooltip: "Delete"
            }
          }
        }}
        editable={{
          onRowDelete: oldData =>
            new Promise(resolve => {
              setTimeout(async () => {
                await providerForDelete(
                  backend_raw_materials,
                  oldData.id,
                  Auth.getToken()
                )
                  .then(async res => {
                    setSnackBar(snackBar => ({
                      ...snackBar,
                      show: true,
                      severity: "success",
                      message: "Successfully deleted " + oldData.name
                    }));
                  })
                  .catch(err => {
                    setSnackBar(snackBar => ({
                      ...snackBar,
                      show: true,
                      severity: "error",
                      message: "Error deleting " + oldData.name
                    }));
                  });
                resolve();
              }, 1000);
            })
        }}
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
