import React, { useState } from "react";
// @material-ui/core components
import { Auth, Table } from "../../components";
// core components
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { backend_units } from "../../constants";

export default function Units() {
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "name:asc"
  });

  const columns = [{ title: "Name", field: "name" }];

  const getUnitsData = async (page, pageSize) => {
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
      fetch(backend_units + "?" + new URLSearchParams(params), {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + Auth.getToken()
        }
      })
        .then(response => response.json())
        .then(result => {
          resolve({
            data: result.data,
            page: result.page - 1,
            totalCount: result.totalCount
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
    setFilter(filter => ({
      ...filter,
      _sort: orderBy
    }));
    tableRef.current.onQueryChange();
  };

  return (
    <Table
      tableRef={tableRef}
      title="Raw Materials"
      columns={columns}
      data={async query => {
        return await getUnitsData(query.page + 1, query.pageSize);
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
  );
}
