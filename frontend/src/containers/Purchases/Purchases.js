import React, { useState } from "react";
// @material-ui/core components
import { Auth, Table } from "../../components";
// core components
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { backend_purchases } from "../../constants";
import { plainDate } from "../../Utils";

export default function Purchases() {
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "created_at:asc"
  });

  const columns = [
    { title: "Raw Material", field: "raw_material_name" },
    { title: "Department", field: "raw_material_department_name" },
    { title: "Seller Name", field: "seller_name" },
    { title: "Purchase cost", field: "purchase_cost" },
    { title: "Quantity", field: "quantity" },
    { title: "Purchase date", field: "created_at" }
  ];

  const getPurchasesData = async (page, pageSize) => {
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
      fetch(backend_purchases + "?" + new URLSearchParams(params), {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + Auth.getToken()
        }
      })
        .then(response => response.json())
        .then(result => {
          let finalData = [];
          if (result.data && result.data.length) {
            result.data.map(r => {
              console.log(r);
              let costing = r.purchase_cost
                ? r.purchase_cost + "/" + r.raw_material.unit.name
                : 0;

              let json = {
                id: r.id,
                created_at: plainDate(r.created_at),
                purchase_cost: r.purchase_cost,
                seller_name: r.seller_name,
                raw_material_department_name: r.raw_material_department_name,
                raw_material_name: r.raw_material_name,
                quantity: r.quantity
              };
              finalData.push(json);
            });
          }
          resolve({
            data: finalData,
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
      title="Purchases"
      columns={columns}
      data={async query => {
        return await getPurchasesData(query.page + 1, query.pageSize);
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
