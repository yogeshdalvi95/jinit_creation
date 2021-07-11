import React, { useState } from "react";
// @material-ui/core components
import { Auth, Table } from "../../components";
// core components
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { backend_raw_materials } from "../../constants";

export default function RawMaterials() {
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "name:asc"
  });

  const columns = [
    { title: "Name", field: "name" },
    { title: "Color", field: "color" },
    { title: "Size", field: "size" },
    { title: "Department", field: "department" },
    { title: "Costing", field: "costing" },
    { title: "Balance", field: "balance" }
  ];

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
          console.log(data);
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
        name: d.name,
        color: d.color,
        size: d.size,
        department: department,
        costing: costing,
        balance: d.balance ? d.balance : "0"
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

  return (
    <Table
      tableRef={tableRef}
      title="Raw Materials"
      columns={columns}
      data={async query => {
        return await getRawMaterialsData(query.page + 1, query.pageSize);
      }}
      actions={[
        rowData => ({
          icon: () => <EditOutlinedIcon fontSize="small" />,
          tooltip: "Edit",
          onClick: (event, rowData) => {
            //handleClickOpen(rowData);
          }
        })
      ]}
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
