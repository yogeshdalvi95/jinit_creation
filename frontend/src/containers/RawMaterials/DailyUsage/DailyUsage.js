import React from "react";
import { useState } from "react";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CustomMaterialUITable,
  CustomTableBody,
  CustomTableCell,
  CustomTableHead,
  CustomTableRow,
  DatePicker,
  DialogBoxForSelectingRawMaterial,
  FAB,
  GridContainer,
  GridItem,
  SnackBarComponent,
} from "../../../components";
import DateRangeIcon from "@material-ui/icons/DateRange";
import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import {
  Backdrop,
  CircularProgress,
  makeStyles,
  Typography,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import moment from "moment";

const useStyles = makeStyles(styles);
const DailyUsage = (props) => {
  const classes = useStyles();
  const [filter, setFilter] = useState({
    _sort: "date:desc",
  });

  const [snackBar, setSnackBar] = useState({
    show: false,
    severity: "",
    message: "",
  });
  const [openBackDrop, setBackDrop] = useState(false);
  const [selectedRawMaterial, setSelectedRawMaterial] = useState(null);

  const [
    openDialogForSelectingRawMaterial,
    setOpenDialogForSelectingRawMaterial,
  ] = useState(false);

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  const changeRawMaterial = (key) => {
    setOpenDialogForSelectingRawMaterial(true);
  };

  const handleCloseDialogForRawMaterial = () => {
    setOpenDialogForSelectingRawMaterial(false);
  };

  const handleSelectRawMaterial = (value, obj) => {
    setSelectedRawMaterial(obj);
    handleCloseDialogForRawMaterial();
  };

  /** Handle End Date filter change */
  const handleEndDateChange = (event) => {
    let endDate = moment(event).endOf("day").format("YYYY-MM-DDT23:59:59.999Z");
    if (endDate === "Invalid date") {
      endDate = null;
      delete filter["date_lte"];
      setFilter((filter) => ({
        ...filter,
      }));
    } else {
      endDate = new Date(endDate).toISOString();
      setFilter((filter) => ({
        ...filter,
        date_lte: endDate,
      }));
    }
  };

  /** Handle Start Date filter change */
  const handleStartDateChange = (event) => {
    let startDate = moment(event).format("YYYY-MM-DDT00:00:00.000Z");
    if (startDate === "Invalid date") {
      startDate = null;
      delete filter["date_gte"];
      setFilter((filter) => ({
        ...filter,
      }));
    } else {
      startDate = new Date(startDate).toISOString();
      setFilter((filter) => ({
        ...filter,
        date_gte: startDate,
      }));
    }
  };

  return (
    <>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <DialogBoxForSelectingRawMaterial
        handleCancel={handleCloseDialogForRawMaterial}
        handleClose={handleCloseDialogForRawMaterial}
        handleAccept={handleCloseDialogForRawMaterial}
        handleAddRawMaterial={handleSelectRawMaterial}
        isHandleKey={false}
        gridKey={null}
        isBalanceCheck={true}
        open={openDialogForSelectingRawMaterial}
      />
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary" className={classes.cardHeaderStyles}>
              <DateRangeIcon fontSize="large" />
              <p className={classes.cardCategoryWhite}></p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <FAB
                    color="primary"
                    align={"end"}
                    size={"small"}
                    onClick={() => changeRawMaterial()}
                  >
                    <AddIcon />

                    {/* {selectedRawMaterial
                      ? "Change Raw Material"
                      : "Select Raw Material"} */}
                  </FAB>
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={2}>
                  <DatePicker
                    onChange={(event) => handleStartDateChange(event)}
                    label="From Date"
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
                    onChange={(event) => handleEndDateChange(event)}
                    label="To Date"
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
              </GridContainer>
              <GridContainer>
                <GridItem
                  xs={12}
                  sm={12}
                  md={4}
                  style={{
                    marginTop: "27px",
                  }}
                >
                  <Button color="primary" onClick={() => {}}>
                    Search
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      setFilter({
                        _sort: "date:desc",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </GridItem>
              </GridContainer>
              <br />
              <CustomMaterialUITable
                sx={{ minWidth: 650 }}
                aria-label="simple table"
              >
                <CustomTableHead>
                  <CustomTableRow>
                    <CustomTableCell>Raw Material</CustomTableCell>
                    <CustomTableCell>Total Used</CustomTableCell>
                  </CustomTableRow>
                </CustomTableHead>
                <CustomTableBody>

                </CustomTableBody>
                </CustomMaterialUITable>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </>
  );
};

export default DailyUsage;
