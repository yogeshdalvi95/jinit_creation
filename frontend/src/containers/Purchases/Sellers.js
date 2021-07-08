import React, { useState } from "react";
// @material-ui/core components
import { Auth, Table } from "../../components";
// core components
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { backend_sellers } from "../../constants";

import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { ADDPURCHASES } from "../../paths";

export default function Sellers() {
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "created_at:asc"
  });

  const columns = [
    { title: "Seller Name", field: "seller_name" },
    { title: "Seller Email", field: "seller_email" },
    { title: "Phone", field: "phone_1" },
    { title: "Alt. Phone", field: "phone_2" }
  ];

  const history = useHistory();
  const onAddClick = () => {
    history.push(ADDPURCHASES);
  };

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
      fetch(backend_sellers + "?" + new URLSearchParams(params), {
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
