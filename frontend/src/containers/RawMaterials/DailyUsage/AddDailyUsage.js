import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import {
  Auth,
  Button,
  Card,
  CardBody,
  CardHeader,
  CustomInput,
  DialogBox,
  DialogBoxForSelectingRawMaterial,
  DialogForGettingPreviousMonthlyData,
  FAB,
  GridContainer,
  GridItem,
  MonthYearPicker,
  SnackBarComponent,
} from "../../../components";
import DateRangeIcon from "@material-ui/icons/DateRange";
import styles from "../../../assets/jss/material-dashboard-react/controllers/commonLayout";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import {
  Backdrop,
  CircularProgress,
  makeStyles,
  Typography,
} from "@material-ui/core";
import calenderStyles from "./CalenderStyles.module.css";
import { useEffect } from "react";
import { providerForGet, providerForPost } from "../../../api";
import {
  backend_monthly_sheet_add_update_entries,
  frontendServerUrl,
  backend_raw_materials,
  backend_monthly_sheet_get_monthly_data,
} from "../../../constants";
import {
  isEmptyString,
  formatDate,
  checkIFValidDateObject,
  validateNumber,
} from "../../../Utils";
import auth from "../../../components/Auth";
import { Children } from "react";
import { ADDRAWMATERIALUSAGE, RAWMATERIALUSAGE } from "../../../paths";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles(styles);
const localizer = momentLocalizer(moment);

const AddDailyUsage = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const [modal, setModal] = useState({
    open: false,
    date: new Date(),
    inputValue: 0,
    oldValue: 0,
    isEdit: false,
    text: "",
    diff: 0,
    disableOk: true,
    isDeduct: true,
  });

  const [monthlyData, setMonthlyData] = useState({
    data: [],
    currentMonth: new Date(),
    finalBalance: 0,
    total: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    isEditable: false,
  });

  const [openBackDrop, setBackDrop] = useState(false);
  const [selectedRawMaterial, setSelectedRawMaterial] = useState(null);

  const [
    openDialogForSelectingRawMaterial,
    setOpenDialogForSelectingRawMaterial,
  ] = useState(false);

  const [
    openDialogForSelectingPreviousMonth,
    setOpenDialogForSelectingPreviousMonth,
  ] = useState(false);

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let date = urlParams.get("d");
    let r_id = urlParams.get("r_id");

    /** Check dates */
    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1;
    let rawMaterialId = r_id;
    if (
      date &&
      !isEmptyString(date) &&
      checkIFValidDateObject(new Date(date))
    ) {
      currentDate = new Date(date);
      year = currentDate.getFullYear();
      month = currentDate.getMonth() + 1;
    }

    let sampleMonthlyData = {
      currentMonth: currentDate,
      month: month,
      year: year,
    };

    setMonthlyData((monthlyData) => ({
      ...monthlyData,
      ...sampleMonthlyData,
    }));

    if (rawMaterialId) {
      setBackDrop(true);
      getRawMaterialInfo(rawMaterialId);
      getMonthlyUsageData(rawMaterialId, month, year);
    } else {
      window.history.pushState(
        "",
        "Daily usage",
        `${frontendServerUrl}${RAWMATERIALUSAGE}?d=${currentDate}`
      );
    }
  }, []);

  const getRawMaterialInfo = async (id) => {
    setBackDrop(true);
    await providerForGet(backend_raw_materials + "/" + id, {}, Auth.getToken())
      .then((res) => {
        setSelectedRawMaterial(res.data);
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
      });
  };

  const getMonthlyUsageData = async (
    id = selectedRawMaterial.id,
    month,
    year
  ) => {
    setBackDrop(true);
    window.history.pushState(
      "",
      "Daily usage",
      `${frontendServerUrl}${ADDRAWMATERIALUSAGE}?d=${new Date(
        year,
        month - 1,
        1
      )}&r_id=${id}`
    );
    await providerForGet(
      backend_monthly_sheet_get_monthly_data,
      { raw_material: id, month: month, year: year },
      Auth.getToken()
    )
      .then((res) => {
        setMonthlyData((monthlyData) => ({
          ...monthlyData,
          data: res.data.data,
          currentMonth: new Date(res.data.currentMonth),
          finalBalance: res.data.finalBalance,
          total: res.data.total,
          month: res.data.month,
          year: res.data.year,
          isEditable: res.data.isEditable,
        }));
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error",
        }));
      });
  };

  const getCurrentMonthDetailsOfRawMaterial = async (
    id = selectedRawMaterial.id
  ) => {
    setBackDrop(true);
    let date = new Date();
    let month = date.getMonth();
    let year = date.getFullYear();
    getMonthlyUsageData(id, month + 1, year);
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
    getCurrentMonthDetailsOfRawMaterial(value.id);
  };

  /** For Adding value */
  const addNewEventAlert = (slotInfo) => {
    if (
      new Date(slotInfo.start).getMonth() + 1 === monthlyData.month &&
      slotInfo.start < moment().toDate()
    ) {
      setModal((modal) => ({
        ...modal,
        open: true,
        date: slotInfo.start,
        isEdit: false,
        text: "",
        disableOk: true,
        inputValue: 0,
        isDeduct: true,
        oldValue: 0,
      }));
    }
  };

  /** Selected event for edit or view */
  const selectedEvent = (event) => {
    if (new Date(event.start).getMonth() + 1 === monthlyData.month) {
      let oldValue = validateNumber(event.title);
      setModal((modal) => ({
        ...modal,
        open: true,
        date: event.start,
        isEdit: true,
        text: "",
        disableOk: true,
        inputValue: oldValue,
        isDeduct: true,
        oldValue: oldValue,
      }));
    }
  };

  const closeDialog = () => {
    setModal((modal) => ({
      ...modal,
      open: false,
      date: null,
      inputValue: 0,
      oldValue: 0,
      isEdit: false,
      disableOk: true,
      isDeduct: true,
      text: "",
      diff: 0,
    }));
  };

  const handleChangeNoOFUsage = (newValue) => {
    if (isEmptyString(newValue)) {
      setModal((modal) => ({
        ...modal,
        disableOk: true,
        inputValue: newValue,
      }));
    } else {
      let parsedNewValue = parseFloat(newValue);
      if (parsedNewValue >= 0) {
        if (modal.isEdit) {
          let diff = parsedNewValue - modal.oldValue;
          if (diff < 0) {
            setModal((modal) => ({
              ...modal,
              disableOk: false,
              inputValue: parsedNewValue,
              diff: Math.abs(diff),
              text: `This will add ${Math.abs(
                diff
              )} quantity back to the stocks`,
              isDeduct: false,
            }));
          } else if (diff > 0) {
            if (diff <= parseFloat(monthlyData.finalBalance)) {
              setModal((modal) => ({
                ...modal,
                disableOk: false,
                inputValue: parsedNewValue,
                diff: diff,
                text: `This will deduct ${diff} quantity from the stocks`,
                isDeduct: true,
              }));
            } else {
              setModal((modal) => ({
                ...modal,
                disableOk: true,
                diff: diff,
                inputValue: parsedNewValue,
                text: `Quantity to deduct cannot be more than the current balance`,
                isDeduct: true,
              }));
            }
          } else {
            setModal((modal) => ({
              ...modal,
              disableOk: true,
              inputValue: parsedNewValue,
              diff: diff,
              text: `No difference between new quantity and old quantity`,
              isDeduct: false,
            }));
          }
        } else {
          if (parsedNewValue <= parseFloat(monthlyData.finalBalance)) {
            setModal((modal) => ({
              ...modal,
              disableOk: false,
              inputValue: parsedNewValue,
              text: "",
              isDeduct: true,
            }));
          } else {
            setModal((modal) => ({
              ...modal,
              disableOk: true,
              inputValue: parsedNewValue,
              text: `Quantity to deduct cannot be more than the current balance`,
              isDeduct: true,
            }));
          }
        }
      } else {
        setModal((modal) => ({
          ...modal,
          disableOk: true,
          inputValue: "",
          text: "Quantity cannot be negative",
        }));
      }
    }
  };

  const addUpdateNewEvent = async () => {
    setBackDrop(true);
    closeDialog();
    await providerForPost(
      backend_monthly_sheet_add_update_entries,
      {
        isEdit: modal.isEdit,
        diff: modal.diff,
        newValue: modal.inputValue,
        isDeduct: modal.isDeduct,
        date: modal.date,
        raw_material: selectedRawMaterial.id,
      },
      auth.getToken()
    )
      .then((res) => {
        setMonthlyData((monthlyData) => ({
          ...monthlyData,
          data: res.data.data,
          total: res.data.total,
          finalBalance: res.data.finalBalance,
        }));
        setBackDrop(false);
      })
      .catch((err) => {
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error",
        }));
        setBackDrop(false);
      });
  };

  const handleCloseDialogForPreviousMonthModal = () => {
    setOpenDialogForSelectingPreviousMonth(false);
  };

  const getPreviosMonthData = async (year, month) => {
    setBackDrop(true);
    handleCloseDialogForPreviousMonthModal();
    getMonthlyUsageData(selectedRawMaterial.id, month, year);
  };

  /** Custom Tool Bar */
  const CustomToolbar = (toolbar) => {
    const label = () => {
      const date = moment(toolbar.date);
      return (
        <GridContainer>
          <GridItem
            xs={12}
            sm={12}
            md={6}
            style={{
              textAlign: "left",
            }}
          >
            {date.format("MMMM")} {date.format("YYYY")}{" "}
          </GridItem>
          <GridItem
            xs={12}
            sm={12}
            md={6}
            style={{
              textAlign: "right",
            }}
          >
            <MonthYearPicker
              views={["year", "month"]}
              onChange={(event) => {
                console.log("event ", event);
                let date = new Date(event);
                let year = date.getFullYear();
                let month = date.getMonth();
                getMonthlyUsageData(selectedRawMaterial.id, month + 1, year);
              }}
              label="Month/Year"
              name="date"
              value={new Date(monthlyData.currentMonth) || null}
              id="date"
              openTo="month"
              style={{
                marginTop: "-1rem",
              }}
            />
          </GridItem>
        </GridContainer>
      );
    };

    return (
      <>
        <GridContainer>
          <GridItem
            xs={12}
            sm={12}
            md={12}
            className={calenderStyles.rbc_toolbar_label}
          >
            <label>{label()}</label>
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={6}></GridItem>
        </GridContainer>
      </>
    );
  };

  const ColoredDateCellWrapper = ({ children, value }) => {
    let moment1 = moment(value).isSame(moment().toDate(), "day");
    if (new Date(value).getMonth() + 1 !== monthlyData.month) {
      return React.cloneElement(Children.only(children), {
        style: {
          ...children.style,
          backgroundColor: "#DDD",
        },
      });
    } else {
      return React.cloneElement(Children.only(children), {
        style: {
          ...children.style,
          backgroundColor: moment1
            ? "#eaf6ff"
            : value < moment().toDate()
            ? "#ffffff"
            : "#DDD",
        },
      });
    }
  };

  const onBackClick = () => {
    history.push(RAWMATERIALUSAGE);
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
      <DialogForGettingPreviousMonthlyData
        handleCancel={handleCloseDialogForPreviousMonthModal}
        handleClose={handleCloseDialogForPreviousMonthModal}
        handleAccept={handleCloseDialogForPreviousMonthModal}
        getPreviosMonthData={getPreviosMonthData}
        open={openDialogForSelectingPreviousMonth}
        selectedRawMaterialId={selectedRawMaterial?.id}
        rawMaterialName={selectedRawMaterial ? selectedRawMaterial.name : ""}
      />
      <DialogBox
        open={modal.open}
        dialogHeader={
          monthlyData.isEditable
            ? modal.isEdit
              ? "Edit Usage"
              : "Add Usage"
            : "View Usage"
        }
        removeAccept={!monthlyData.isEditable}
        handleCancel={closeDialog}
        handleClose={closeDialog}
        handleAccept={addUpdateNewEvent}
        cancelButton={"Cancel"}
        acceptButton={"OK"}
        isDatePresent={true}
        date={`For ${formatDate(modal.date)}`}
        disableOK={modal.disableOk}
        text={[]}
      >
        <GridContainer>
          {monthlyData.isEditable && modal.isEdit ? (
            <GridItem xs={12} sm={12} md={12}>
              <b>Old quantity :-</b> {modal.oldValue}
            </GridItem>
          ) : null}

          <GridItem xs={12} sm={12} md={12}>
            {!monthlyData.isEditable ? (
              <span>
                <b>Quantity used </b> :- {modal.inputValue}
              </span>
            ) : (
              <CustomInput
                onChange={(event) => {
                  handleChangeNoOFUsage(event.target.value);
                }}
                labelText={modal.isEdit ? "New Quantity" : "Add Quantity"}
                value={modal.inputValue}
                type="number"
                name="usage"
                id="usage"
                formControlProps={{
                  fullWidth: true,
                }}
              />
            )}
          </GridItem>
          {monthlyData.isEditable ? (
            <GridItem xs={12} sm={12} md={12}>
              <Typography variant="caption" display="block" gutterBottom>
                {modal.isEdit
                  ? `Please note editing might either add/subtract
         the difference quantity to/from the stocks`
                  : `Please note value added will be subtracted 
         from the stocks`}
              </Typography>
            </GridItem>
          ) : null}

          {!isEmptyString(modal.text) ? (
            <>
              <GridItem xs={12} sm={12} md={12}>
                <Typography variant="subtitle2" gutterBottom color="error">
                  {modal.text}
                </Typography>
              </GridItem>
            </>
          ) : null}
        </GridContainer>
      </DialogBox>
      <GridContainer>
        <GridItem xs={12} sm={12} md={10}>
          <Card>
            <CardHeader color="primary" className={classes.cardHeaderStyles}>
              <DateRangeIcon fontSize="large" />
              <p className={classes.cardCategoryWhite}></p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem
                  xs={12}
                  sm={12}
                  md={12}
                  style={{
                    marginBottom: "10px",
                    marginLeft: "-10px",
                  }}
                >
                  <FAB align={"start"} size={"small"} onClick={onBackClick}>
                    <KeyboardArrowLeftIcon />
                  </FAB>
                </GridItem>
                {selectedRawMaterial ? (
                  <>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>Id : </b> {selectedRawMaterial.id}
                    </GridItem>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>Name : </b> {selectedRawMaterial.name}
                    </GridItem>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>Department : </b>
                      {selectedRawMaterial?.department?.name}
                    </GridItem>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>Category : </b>
                      {selectedRawMaterial?.category?.name}
                    </GridItem>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>Color :</b> {selectedRawMaterial?.color?.name}
                    </GridItem>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>Size : </b>
                      {selectedRawMaterial.size}
                    </GridItem>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>Current Balance : </b>
                      {monthlyData.finalBalance}
                    </GridItem>
                    <GridItem xs={12} sm={12} md={8}>
                      <b>Total Used in this month : </b>
                      {monthlyData.total}
                    </GridItem>
                  </>
                ) : null}
                <GridItem
                  xs={12}
                  sm={12}
                  md={12}
                  style={{
                    margin: "27px 0px 0px",
                  }}
                >
                  {selectedRawMaterial ? (
                    <>
                      <Button
                        color="primary"
                        onClick={() => {
                          changeRawMaterial();
                        }}
                      >
                        {selectedRawMaterial
                          ? "Change Raw Material"
                          : "Select Raw Material"}
                      </Button>
                      <Button
                        color="primary"
                        onClick={() => {
                          setOpenDialogForSelectingPreviousMonth(true);
                        }}
                      >
                        Check Previous Data
                      </Button>
                      <Button
                        color="primary"
                        onClick={() => {
                          getCurrentMonthDetailsOfRawMaterial();
                        }}
                      >
                        Go to current month
                      </Button>
                    </>
                  ) : null}
                </GridItem>
              </GridContainer>
              {selectedRawMaterial ? (
                <>
                  <GridContainer>
                    <GridItem
                      xs={12}
                      sm={12}
                      md={12}
                      style={{
                        margin: "27px 0px 0px",
                      }}
                    >
                      <div style={{ height: "500pt" }}>
                        <Calendar
                          selectable={monthlyData.isEditable}
                          events={monthlyData.data}
                          startAccessor="start"
                          endAccessor="end"
                          date={new Date(monthlyData.currentMonth)}
                          defaultDate={new Date(monthlyData.currentMonth)}
                          localizer={localizer}
                          views={{ month: true }}
                          components={{
                            toolbar: CustomToolbar,
                            dateCellWrapper: ColoredDateCellWrapper,
                          }}
                          eventPropGetter={(e) => {
                            const backgroundColor = "#32CD32";
                            return { style: { backgroundColor } };
                          }}
                          onSelectEvent={(event) => selectedEvent(event)}
                          onSelectSlot={(slotInfo) =>
                            addNewEventAlert(slotInfo)
                          }
                        />
                      </div>
                    </GridItem>
                  </GridContainer>
                </>
              ) : null}
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
      <Backdrop className={classes.backdrop} open={openBackDrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default AddDailyUsage;
