import React, { useState } from "react";
// @material-ui/core components
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  GridContainer,
  GridItem,
  SnackBarComponent,
} from "../../components";
// core components
import ClearIcon from "@material-ui/icons/Clear";
import {
  backend_sellers_for_autocomplete,
  backend_individual_purchase_ledger,
} from "../../constants";
import {
  Backdrop,
  CircularProgress,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { providerForGet } from "../../api";
import { useHistory } from "react-router-dom";
import ListAltIcon from "@material-ui/icons/ListAlt";
import { useEffect } from "react";
import moment from "moment";

const useStyles = makeStyles(styles);
export default function Ledger() {
  const classes = useStyles();
  const history = useHistory();
  const [openBackDrop, setBackDrop] = useState(false);
  const tableRef = React.createRef();

  const [filter, setFilter] = useState({
    _sort: "date:desc",
  });

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  useEffect(() => {
    // getSellerNames();
  }, []);

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  /** Handle End Date filter change */
  const handleEndDateChange = (event) => {
    let endDate = moment(event).endOf("day").format("YYYY-MM-DDT23:59:59.999Z");
    if (endDate === "Invalid date") {
      endDate = null;
    } else {
      endDate = new Date(endDate).toISOString();
    }
    setFilter((filter) => ({
      ...filter,
      date_lte: endDate,
    }));
  };

  /** Handle Start Date filter change */
  const handleStartDateChange = (event) => {
    let startDate = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (startDate === "Invalid date") {
      startDate = null;
    } else {
      startDate = new Date(startDate).toISOString();
    }
    setFilter((filter) => ({
      ...filter,
      date_gte: startDate,
    }));
  };

  const cancelFilters = () => {
    setFilter({
      _sort: "date:desc",
    });
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
                <GridItem xs={12} sm={12} md={2}>
                  <DatePicker
                    views={["year", "month"]}
                    onChange={(event) => handleStartDateChange(event)}
                    label="Month and Year From"
                    name="date_gte"
                    value={filter.date_gte || null}
                    id="date_gte"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    style={{
                      marginTop: "1.5rem",
                      width: "100%",
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <DatePicker
                    views={["year", "month"]}
                    onChange={(event) => handleEndDateChange(event)}
                    label="Month and Year To"
                    name="date_lte"
                    value={filter.date_lte || null}
                    id="date_lte"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    style={{
                      marginTop: "1.5rem",
                      width: "100%",
                    }}
                  />
                </GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={4}
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
                  <Button
                    color="primary"
                    onClick={() => {
                      cancelFilters();
                    }}
                  >
                    Cancel
                  </Button>
                </GridItem>
              </GridContainer>
              <br />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>

      <Backdrop className={classes.backdrop} open={openBackDrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
