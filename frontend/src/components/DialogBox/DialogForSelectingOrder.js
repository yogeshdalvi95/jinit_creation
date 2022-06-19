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
import { backend_parties, frontendServerUrl } from "../../constants";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { convertNumber, dateToDDMMYYYY, isEmptyString } from "../../Utils";

export default function DialogForSelectingOrder(props) {
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "party_name:asc",
  });

  const columns = [
    {
      title: "Order Date",
      field: "date",
      render: (rowData) => dateToDDMMYYYY(new Date(rowData.date)),
    },
    {
      title: "Order Number",
      field: "order_id",
      render: (rowData) => "#" + rowData.order_id,
    },
    {
      title: "Product",
      sorting: false,
      field: "ready_material",
      render: (rowData) =>
        rowData.ready_material ? rowData.ready_material.material_no : "----",
    },
    {
      title: "Party",
      field: "party",
      sorting: false,
      render: (rowData) => (rowData.party ? rowData.party.party_name : "----"),
    },
    {
      title: "Party Number",
      field: "party_no",
    },
    {
      title: "Quantity",
      field: "quantity",
    },
    {
      title: "Quantity saved for later",
      field: "buffer_quantity",
    },
    { title: "Completed Quantity", field: "completed_quantity" },

    {
      title: "Total Price",
      field: "total_price",
      render: (rowData) => convertNumber(rowData.total_price, true),
    },
    {
      title: "Status",
      render: (rowData) => {
        if (rowData.processing) {
          if (rowData.partial_completed) {
            return "Partial Completed";
          } else {
            return "Processing";
          }
        } else if (rowData.fully_completed) {
          return "Fully Completed";
        } else {
          return "Cancelled";
        }
      },
    },
  ];

  const getPurchasesData = async (page, pageSize) => {
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
      fetch(backend_parties + "?" + new URLSearchParams(params), {
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
        <DialogTitle id="dialog-title">Select Party</DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={6}>
                    <CustomInput
                      onChange={(event) => handleChange(event)}
                      labelText="Party Name"
                      value={filter.party_name_contains || ""}
                      name="party_name_contains"
                      id="party_name_contains"
                      formControlProps={{
                        fullWidth: true,
                      }}
                    />
                  </GridItem>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={6}
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
                        delete filter["party_name_contains"];
                        setFilter((filter) => ({
                          ...filter,
                          _sort: "party_name:asc",
                        }));
                        tableRef.current.onQueryChange();
                      }}
                    >
                      Cancel
                    </Button>
                  </GridItem>
                </GridContainer>

                <Table
                  tableRef={tableRef}
                  title="Purchases"
                  columns={columns}
                  data={async (query) => {
                    return await getPurchasesData(
                      query.page + 1,
                      query.pageSize
                    );
                  }}
                  actions={[
                    (rowData) => ({
                      icon: () => <Button color="primary">Select</Button>,
                      tooltip: "Select this Seller",
                      onClick: (event, rowData) => {
                        props.handleAddParties(rowData);
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
              </GridItem>
            </GridContainer>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
}
