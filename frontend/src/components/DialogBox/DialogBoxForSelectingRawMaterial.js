import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Auth, Button } from "..";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import { GridContainer, GridItem } from "../Grid";
import { CustomInput } from "../CustomInput";
import { useState } from "react";
import { isEmptyString } from "../../Utils";
import { useEffect } from "react";
import { providerForGet } from "../../api";
import { backend_departments, backend_raw_materials } from "../../constants";
import { CustomAutoComplete } from "../CustomAutoComplete";
import { CustomCheckBox } from "../CustomCheckBox";
import { Table } from "../Table";
import commonStyles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";

const useStyles = makeStyles(commonStyles);
export default function DialogBoxForSelectingRawMaterial(props) {
  const classes = useStyles();
  const tableRef = React.createRef();
  const [departments, setDepartments] = useState([]);
  const [openBackDrop, setBackDrop] = useState(false);
  const [filter, setFilter] = useState({
    _sort: "id:asc"
  });

  const columns = [
    {
      title: "Id",
      field: "id",
      render: rowData => "#" + rowData.id
    },
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
        is_die: d.is_die,
        value: d
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
    <div>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="select-raw-material-title"
        aria-describedby="select-raw-material-dialog-description"
        maxWidth={"lg"}
      >
        <DialogTitle id="dialog-title">Select Raw Material</DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            {/* {props.isWarning ? (
              <div className={styles.AlertImageDiv}>
                <span className={styles.alertImageCircle}></span>
                <span className={styles.alertImageIcon}></span>
              </div>
            ) : null}

            <h2 className={styles.highLighter}>Are you sure?</h2>
            {props.text.map(t => (
              <div className={styles.secondText}>{t}</div>
            ))} */}
            <>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
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
                      md={10}
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
                          delete filter["is_die"];
                          setFilter(filter => ({
                            ...filter,
                            _sort: "id:asc"
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
                      return await getRawMaterialsData(
                        query.page + 1,
                        query.pageSize
                      );
                    }}
                    actions={[
                      rowData => ({
                        icon: () => <Button color="primary">Select</Button>,
                        tooltip: "Select this raw material",
                        onClick: (event, rowData) => {
                          let bal = "0";
                          if (!rowData.balance) {
                            bal = "0";
                          } else {
                            bal = rowData.balance;
                          }
                          let nameObject = {
                            id: "#" + rowData.id,
                            name: rowData.name,
                            department: rowData.department,
                            color: isEmptyString(rowData.color)
                              ? "---"
                              : rowData.color,
                            size: isEmptyString(rowData.size)
                              ? "---"
                              : rowData.size,
                            bal: bal
                          };
                          if (props.isHandleKey) {
                            props.handleAddRawMaterial(
                              "raw_material",
                              rowData.value,
                              props.gridKey,
                              nameObject
                            );
                          } else {
                            props.handleAddRawMaterial(
                              rowData.value,
                              nameObject
                            );
                          }
                        }
                      })
                    ]}
                    options={{
                      pageSize: 5,
                      search: false,
                      sorting: true,
                      thirdSortClick: false
                    }}
                    onOrderChange={(orderedColumnId, orderDirection) => {
                      orderFunc(orderedColumnId, orderDirection);
                    }}
                  />
                </GridItem>
              </GridContainer>
              <Backdrop className={classes.backdrop} open={openBackDrop}>
                <CircularProgress color="inherit" />
              </Backdrop>
            </>
          </DialogContentText>
        </DialogContent>
        <DialogActions
          style={{
            justifyContent: "center"
          }}
        >
          <Button onClick={props.handleCancel} color="danger">
            Cancel
          </Button>
          {/* <Button onClick={props.handleAccept} color="success" autoFocus>
            Add
          </Button> */}
        </DialogActions>
      </Dialog>
    </div>
  );
}
