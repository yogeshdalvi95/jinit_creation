import React, { useEffect, useState } from "react";
import { Table } from "../../components";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { rawMaterials } from "../../constants";

export default function RawMaterials() {
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "Name:asc"
  });

  let columns = [
    { title: "Name", field: "Name" },
    { title: "Size", field: "Size" },
    { title: "Color", field: "Color" }
  ];

  useEffect(() => {}, []);

  const getRawMaterialData = async (page, pageSize) => {
    /**
     ** It sets the page and pageSize in filter variable
     ** so as to keep the record of what page and pageSize was set
     */
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
      fetch(rawMaterials + "?" + new URLSearchParams(params), {
        method: "GET",
        headers: {
          "content-type": "application/json"
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

  const handleClickOpen = (event, row) => {};

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
      columns={columns}
      data={async query => {
        return await getRawMaterialData(query.page + 1, query.pageSize);
      }}
      localization={{
        body: {
          editRow: {
            deleteText: `Are you sure you want to delete this Raw Material?`,
            saveTooltip: "Delete"
          }
        }
      }}
      actions={[
        rowData => ({
          icon: () => <EditOutlinedIcon />,
          tooltip: "Edit",
          onClick: (event, rowData) => {
            handleClickOpen(rowData);
          }
        })
      ]}
      editable={{}}
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
