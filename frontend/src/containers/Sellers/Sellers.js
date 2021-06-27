import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import {
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

import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { ADDSELLER } from "../../paths";

const useStyles = makeStyles(styles);

export default function Sellers() {
  const classes = useStyles();
  const history = useHistory();
  const onAddClick = () => {
    history.push(ADDSELLER);
    console.log("button clicked");
  };
  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <FAB color="primary" align={"end"} size={"small"} onClick={onAddClick}>
          <AddIcon />
        </FAB>
      </GridItem>
      <GridItem xs={12} sm={12} md={12}>
        <Card plain>
          <CardHeader plain color="primary">
            <h4 className={classes.cardTitleWhite}>Sellers</h4>
            <p className={classes.cardCategoryWhite}>List of all sellers</p>
          </CardHeader>
          <CardBody>
            <Table
              title="Positioning Actions Column Preview"
              columns={[
                { title: "Name", field: "name" },
                { title: "Surname", field: "surname" },
                { title: "Birth Year", field: "birthYear", type: "numeric" },
                {
                  title: "Birth Place",
                  field: "birthCity",
                  lookup: { 34: "İstanbul", 63: "Şanlıurfa" }
                }
              ]}
              data={[
                {
                  name: "Mehmet",
                  surname: "Baran",
                  birthYear: 1987,
                  birthCity: 63
                },
                {
                  name: "Zerya Betül",
                  surname: "Baran",
                  birthYear: 2017,
                  birthCity: 34
                }
              ]}
              actions={[
                {
                  icon: "save",
                  tooltip: "Save User",
                  onClick: (event, rowData) =>
                    alert("You saved " + rowData.name)
                },
                rowData => ({
                  icon: "delete",
                  tooltip: "Delete User",
                  onClick: (event, rowData) => {},
                  disabled: rowData.birthYear < 2000
                })
              ]}
              options={{
                actionsColumnIndex: -1
              }}
            />
          </CardBody>
        </Card>
      </GridItem>
    </GridContainer>
  );
}
