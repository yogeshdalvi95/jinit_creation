import React, { useState } from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import {
  Auth,
  Card,
  CardBody,
  CardHeader,
  FAB,
  GridContainer,
  GridItem,
  Table
} from "../../components";
// core components
import AddIcon from "@material-ui/icons/Add";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { backend_departments } from "../../constants";

import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { ADDDEPARTMENTS } from "../../paths";

const useStyles = makeStyles(styles);

export default function Departments() {
  const classes = useStyles();
  const tableRef = React.createRef();
  const [filter, setFilter] = useState({
    _sort: "name:asc"
  });

  const columns = [{ title: "Name", field: "name" }];

  const history = useHistory();
  const onAddClick = () => {
    history.push(ADDDEPARTMENTS);
  };

  const getAdminUserData = async (page, pageSize) => {
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
      fetch(backend_departments + "?" + new URLSearchParams(params), {
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
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Card plain>
          <CardHeader plain color="primary">
            <h4 className={classes.cardTitleWhite}>Departments</h4>
            <p className={classes.cardCategoryWhite}>List of all departments</p>
          </CardHeader>
          <CardBody>
            <Table
              tableRef={tableRef}
              title="Departments"
              columns={columns}
              data={async query => {
                return await getAdminUserData(query.page + 1, query.pageSize);
              }}
              localization={{
                body: {
                  editRow: {
                    deleteText: `Are you sure you want to delete this Admin User?`,
                    saveTooltip: "Delete"
                  }
                }
              }}
              actions={[]}
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
          </CardBody>
        </Card>
      </GridItem>
    </GridContainer>
  );
}
