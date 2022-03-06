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
import { backend_category } from "../../constants";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { isEmptyString } from "../../Utils";

export default function DialogForSelectingCategory(props) {
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "name:asc",
  });

  const columns = [{ title: "Category Name", field: "name" }];

  const getCategoryData = async (page, pageSize) => {
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
      fetch(backend_category + "?" + new URLSearchParams(params), {
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
        <DialogTitle id="dialog-title">Select Category</DialogTitle>
        <DialogContent>
          <DialogContentText id="dialog-description">
            <GridContainer>
              <GridItem xs={12} md={12}>
                <GridContainer>
                  <GridItem xs={12} md={6}>
                    <CustomInput
                      onChange={(event) => handleChange(event)}
                      labelText="Category Name"
                      value={filter.name_contains || ""}
                      name="name_contains"
                      id="name_contains"
                      formControlProps={{
                        fullWidth: true,
                      }}
                    />
                  </GridItem>
                  <GridItem
                    xs={12}
                    md={2}
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
                  </GridItem>
                  <GridItem
                    xs={12}
                    md={2}
                    style={{
                      marginTop: "27px",
                    }}
                  >
                    <Button
                      color="primary"
                      onClick={() => {
                        delete filter["name_contains"];
                        setFilter((filter) => ({
                          ...filter,
                          _sort: "name:asc",
                        }));
                        tableRef.current.onQueryChange();
                      }}
                    >
                      Cancel
                    </Button>
                  </GridItem>
                </GridContainer>
              </GridItem>
              <GridItem xs={12} md={12}>
                <Table
                  tableRef={tableRef}
                  title="Categories"
                  columns={columns}
                  data={async (query) => {
                    return await getCategoryData(
                      query.page + 1,
                      query.pageSize
                    );
                  }}
                  actions={[
                    (rowData) => ({
                      icon: () => <Button color="primary">Select</Button>,
                      tooltip: "Select this Category",
                      onClick: (event, rowData) => {
                        props.handleAddCategory(rowData);
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
