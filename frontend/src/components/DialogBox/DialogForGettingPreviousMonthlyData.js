import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Auth, Button } from "..";
import { GridContainer, GridItem } from "../Grid";
import { CustomInput } from "../CustomInput";
import { useState } from "react";
import { getMonthName, isEmptyString } from "../../Utils";
import { backend_monthly_sheet, frontendServerUrl } from "../../constants";
import { Table } from "../Table";
import { useEffect } from "react";

export default function DialogForGettingPreviousMonthlyData(props) {
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "id:desc",
    raw_material: props ? props.selectedRawMaterialId : null,
  });

  useEffect(() => {
    setFilter((filter) => ({
      ...filter,
      raw_material: props ? props.selectedRawMaterialId : null,
    }));
  }, [props]);

  const columns = [
    {
      title: "Year",
      field: "year",
    },
    {
      title: "Month",
      field: "month",
      render: (rowData) => getMonthName(rowData.month),
    },
  ];

  const getMonthYearList = async (page, pageSize) => {
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
              throw new Error("Something went wrong");
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
          Check Past Usage for {props.rawMaterialName}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            <>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={3}>
                      <CustomInput
                        onChange={(event) => handleChange(event)}
                        labelText="Year"
                        value={filter.year_contains || ""}
                        name="year_contains"
                        id="year"
                        formControlProps={{
                          fullWidth: true,
                        }}
                      />
                    </GridItem>

                    <GridItem
                      xs={12}
                      sm={12}
                      md={10}
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
                          delete filter["year_contains"];
                          setFilter((filter) => ({
                            ...filter,
                            _sort: "id:desc",
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
                    data={async (query) => {
                      return await getMonthYearList(
                        query.page + 1,
                        query.pageSize
                      );
                    }}
                    actions={[
                      (rowData) => ({
                        icon: () => <Button color="primary">Select</Button>,
                        tooltip: "Select this month and year",
                        onClick: (event, rowData) => {
                          props.getPreviosMonthData(
                            rowData.year,
                            rowData.month
                          );
                        },
                      }),
                    ]}
                    options={{
                      pageSize: 5,
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
            </>
          </DialogContentText>
        </DialogContent>
        <DialogActions
          style={{
            justifyContent: "center",
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
