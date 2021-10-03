import { makeStyles } from "@material-ui/core";
import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  GridContainer,
  GridItem,
  SnackBarComponent
} from "../../components";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import ListAltIcon from "@material-ui/icons/ListAlt";
import { useEffect } from "react";

const useStyles = makeStyles(styles);
const DepartmentSheet = props => {
  const classes = useStyles();
  const [openBackDrop, setBackDrop] = useState(false);
  const history = useHistory();

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: ""
  });

  useEffect(() => {
    console.log(props.location.state);
  }, []);

  const snackBarHandleClose = () => {
    setSnackBar(snackBar => ({
      ...snackBar,
      show: false,
      severity: "",
      message: ""
    }));
  };

  return (
    <>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary" className={classes.cardHeaderStyles}>
              <ListAltIcon fontSize="large" />
              <p className={classes.cardCategoryWhite}></p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  Department Sheet
                </GridItem>
              </GridContainer>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </>
  );
};

export default DepartmentSheet;
