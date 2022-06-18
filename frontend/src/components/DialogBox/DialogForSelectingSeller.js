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
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { backend_sellers, frontendServerUrl } from "../../constants";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { isEmptyString } from "../../Utils";

export default function DialogForSelectingSeller(props) {
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "seller_name:asc",
  });

  const columns = [
    { title: "Seller Name", field: "seller_name" },
    { title: "GSTIN/UIN", field: "gst_no" },
    { title: "Phone", field: "phone" },
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
      fetch(backend_sellers + "?" + new URLSearchParams(params), {
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
            if (response.status === 403) {
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
        <DialogTitle id="dialog-title">Select Seller</DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={6}>
                    <CustomInput
                      onChange={(event) => handleChange(event)}
                      labelText="Seller Name"
                      value={filter.seller_name_contains || ""}
                      name="seller_name_contains"
                      id="seller_name_contains"
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
                        delete filter["seller_name_contains"];
                        setFilter((filter) => ({
                          ...filter,
                          _sort: "seller_name:asc",
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
                        props.handleAddSeller(rowData);
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
