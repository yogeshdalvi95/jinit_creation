import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Route } from "react-router-dom";
import { Redirect } from "react-router-dom";
import {
  Backdrop,
  CircularProgress,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { useLocation } from "react-router-dom";
import DateRangeIcon from "@material-ui/icons/DateRange";
import AddIcon from "@material-ui/icons/Add";
import styles from "../assets/jss/material-dashboard-react/controllers/commonLayout";
import { Layout } from "../hoc";
import {
  Auth as auth,
  GridContainer,
  GridItem,
  NotFoundPage,
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
  SnackBarComponent,
} from "../components";
import {
  EDITDESIGN,
  LOGIN,
  SELECTRAWMATERIALS,
  SELECTRAWMATERIALSWOHASH,
  SELECTREADYMATERIALS,
  SELECTREADYMATERIALSWOHASH,
} from "../paths";
import { convertNumber, getRoutesOnLogin } from "../Utils";
import { primaryColor } from "../assets/jss/material-dashboard-react";
import { providerForGet } from "../api";
import { backend_designs } from "../constants";

const getDesignId = (pathName) => {
  let value = null;
  if (pathName) {
    let arr = [];
    arr = pathName.match(/\d+/g);
    if (arr && arr.length) {
      value = arr[0];
    }
  }
  return value;
};

const RouteWithTabLayout = ({
  component: Component,
  computedMatch: ComputedMatch,
  openSubMenu,
  ...otherProps
}) => {
  const location = useLocation();
  const useStyles = makeStyles(styles);
  const history = useHistory();
  const classes = useStyles();
  const [filter, setFilter] = useState({
    _sort: "date:desc",
  });
  const [value, setValue] = React.useState(0);
  const [selectedRawMaterial, setSelectedRawMaterial] = useState(null);
  const [header, setHeader] = React.useState("");
  const [loader, setLoader] = React.useState(true);
  const [pageNotFound, setPageNotFound] = React.useState(false);
  const [formState, setFormState] = React.useState({
    designId: getDesignId(
      otherProps?.location?.pathname ? otherProps?.location?.pathname : null
    ),
    routes: [],
    isRawMaterial: null,
    isReadyMaterial: null,
    designData: {},
  });

  const [snackBar, setSnackBar] = useState({
    show: false,
    severity: "",
    message: "",
  });

  const [
    openDialogForSelectingRawMaterial,
    setOpenDialogForSelectingRawMaterial,
  ] = useState(false);

  const tabs = ["Select Raw Materials"];

  useEffect(() => {
    if (auth?.getToken() !== null) {
      setValues();
    } else {
      auth.clearAppStorage();
      return (
        <React.Fragment>
          <Redirect
            to={{
              pathname: LOGIN,
            }}
          />
        </React.Fragment>
      );
    }
  }, [location]);

  useEffect(() => {
    if (auth?.getToken() == null) {
      auth.clearAppStorage();
      return (
        <React.Fragment>
          <Redirect
            to={{
              pathname: LOGIN,
            }}
          />
        </React.Fragment>
      );
    }
  });

  const setValues = async () => {
    let data = {};
    let routes = getRoutesOnLogin(auth);
    setLoader(true);
    let dependencyObject = {
      isRawMaterial: false,
      isReadyMaterial: false,
      routes: routes,
    };

    let pathName = window.location.pathname;
    let pathNameArray = pathName.split("/");

    if (
      !formState?.designId ||
      (formState?.designId && isNaN(formState.designId))
    ) {
      setLoader(false);
      setPageNotFound(true);
    } else {
      await providerForGet(
        backend_designs + "/" + formState.designId,
        {},
        auth.getToken()
      )
        .then((res) => {
          data = res.data;
        })
        .catch((err) => {
          setLoader(false);
          setPageNotFound(true);
        });

      if (pathNameArray.indexOf(SELECTRAWMATERIALSWOHASH) > -1) {
        dependencyObject = {
          ...dependencyObject,
          isRawMaterial: true,
        };
      } else if (pathNameArray.indexOf(SELECTREADYMATERIALSWOHASH) > -1) {
        dependencyObject = {
          ...dependencyObject,
          isReadyMaterial: true,
        };
      } else {
        setLoader(false);
        setPageNotFound(true);
      }
      setFormState((formState) => ({
        ...formState,
        isRawMaterial: dependencyObject.isRawMaterial,
        isReadyMaterial: dependencyObject.isReadyMaterial,
        designData: data,
        routes: dependencyObject.routes,
      }));
      setHeader(
        `Select ${dependencyObject.isRawMaterial ? "Raw" : "Ready"} Material`
      );
    }
    setValue(dependencyObject.isRawMaterial ? 0 : 1);
    setLoader(false);
  };

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

  if (auth.getToken() !== null) {
    return (
      <>
        <Route
          render={(props) => (
            <>
              <Layout
                dashboardRoutes={formState.routes}
                header={header}
                openSubMenu={openSubMenu}
              >
                {loader ? (
                  <Backdrop className={classes.backdrop} open={loader}>
                    <CircularProgress color="inherit" />
                  </Backdrop>
                ) : pageNotFound ? (
                  <NotFoundPage />
                ) : (
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
                          <CardHeader
                            color="primary"
                            className={classes.cardHeaderStyles}
                          >
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
                                </FAB>
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
                                  <CustomTableCell>
                                    Raw Material
                                  </CustomTableCell>
                                  <CustomTableCell>Total Used</CustomTableCell>
                                </CustomTableRow>
                              </CustomTableHead>
                              <CustomTableBody></CustomTableBody>
                            </CustomMaterialUITable>
                          </CardBody>
                        </Card>
                      </GridItem>
                    </GridContainer>
                  </>
                  // <Box sx={{ width: "100%" }}>
                  //   <GridContainer style={{ dispay: "flex" }}>
                  //     <GridItem xs={12}>
                  //       <b>Design No : </b> {formState?.designData?.material_no}
                  //     </GridItem>
                  //     {selectedColor.isColorSelected ? (
                  //       <>
                  //         <GridItem xs={12}>
                  //           <b>Selected Color : </b>{" "}
                  //           {selectedColor.selectedColor?.name}
                  //         </GridItem>{" "}
                  //         <GridItem xs={12}>{`< ----------------- >`}</GridItem>
                  //       </>
                  //     ) : null}
                  //     <GridItem xs={12}>
                  //       <b>Add. Price : </b>{" "}
                  //       {loaderForUpdateDesign
                  //         ? getLoader()
                  //         : convertNumber(
                  //             parseFloat(
                  //               formState?.designData?.add_price
                  //             ).toFixed(2),
                  //             true
                  //           )}
                  //     </GridItem>
                  //     <GridItem xs={12}>
                  //       {formState?.designData?.colors?.length ? (
                  //         <>
                  //           {" "}
                  //           <b>Price of all the common raw materials </b> ( i.e
                  //           price of all the common materials present across all
                  //           the colors excluding add. price ):{" "}
                  //         </>
                  //       ) : (
                  //         <>
                  //           {" "}
                  //           <b>Price of raw materials</b> ( i.e price of all the
                  //           materials present excluding add. price ):{" "}
                  //         </>
                  //       )}
                  //       {loaderForUpdateDesign
                  //         ? getLoader()
                  //         : convertNumber(
                  //             parseFloat(
                  //               formState?.designData?.material_price
                  //             ).toFixed(2),
                  //             true
                  //           )}
                  //     </GridItem>
                  //     {calculateTotalPrice()}
                  //   </GridContainer>
                  //   <br />
                  //   <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  //     <StyledTabs
                  //       value={value}
                  //       onChange={handleChange}
                  //       variant="scrollable"
                  //       scrollButtons
                  //       allowScrollButtonsMobile
                  //       TabIndicatorProps={{
                  //         children: <span className="MuiTabs-indicatorSpan" />,
                  //       }}
                  //     >
                  //       {tabs.map((t) => (
                  //         <StyledTab label={t} />
                  //       ))}
                  //     </StyledTabs>
                  //   </Box>
                  //   <Box>
                  //     <Component
                  //       {...props}
                  //       setColor={setColor}
                  //       urlParams={ComputedMatch}
                  //       id={formState.designId}
                  //       designData={formState.designData}
                  //       isRawMaterial={formState.isRawMaterial}
                  //       isReadyMaterial={formState.isReadyMaterial}
                  //       updateDesign={updateDesign}
                  //       {...otherProps}
                  //     />
                  //   </Box>
                  // </Box>
                )}
              </Layout>
            </>
          )}
        />
      </>
    );
  } else {
    auth.clearAppStorage();
    return (
      <React.Fragment>
        <Redirect
          to={{
            pathname: LOGIN,
          }}
        />
      </React.Fragment>
    );
  }
};

const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    display: "flex",
    justifyContent: "center",
    backgroundColor: primaryColor[0],
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  marginRight: theme.spacing(1),
  "&.Mui-focusVisible": {
    backgroundColor: primaryColor[0],
  },
  "&.Mui-selected": {
    color: primaryColor[0],
  },
}));

export default RouteWithTabLayout;
