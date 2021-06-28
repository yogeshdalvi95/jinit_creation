import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardBody,
  CardHeader,
  CustomTable,
  GridContainer,
  GridItem,
  Table
} from "../../components";
// core components

const styles = {
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0"
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF"
    }
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1"
    }
  }
};

const useStyles = makeStyles(styles);

export default function Dashboard() {
  const classes = useStyles();
  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Card plain>
          <CardHeader plain color="primary">
            <h4 className={classes.cardTitleWhite}>
              Table on Plain Background
            </h4>
            <p className={classes.cardCategoryWhite}>
              Here is a subtitle for this table
            </p>
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
