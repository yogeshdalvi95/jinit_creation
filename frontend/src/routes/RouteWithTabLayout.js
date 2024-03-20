import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Route } from "react-router-dom";
import { Redirect } from "react-router-dom";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import { useLocation } from "react-router-dom";

import styles from "../assets/jss/material-dashboard-react/controllers/commonLayout";
import { Layout } from "../hoc";
import {
  Auth as auth,
  GridContainer,
  GridItem,
  NotFoundPage,
} from "../components";
import {
  EDITDESIGN,
  LOGIN,
  SELECTRAWMATERIALS,
  SELECTRAWMATERIALSWOHASH,
  SELECTREADYMATERIALS,
  SELECTREADYMATERIALSWOHASH,
} from "../paths";
import { convertNumber, getRoutesOnLogin, validateNumber } from "../Utils";
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
  const [value, setValue] = React.useState(0);
  const [header, setHeader] = React.useState("");
  const [loader, setLoader] = React.useState(true);
  const [loaderForUpdateDesign, setLoaderForUpdateDesign] =
    React.useState(false);
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
  const [selectedColor, setSelectedColor] = React.useState({
    isColorSelected: false,
    selectedColor: null,
    selectedColorPrice: null,
  });

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

  const setColor = (
    isColorSelected,
    colorSelected,
    colorPrice = formState.designData?.color_price
  ) => {
    let color_price = colorPrice ? colorPrice : [];
    let selectedColorPrice = null;
    if (colorSelected) {
      for (let i = 0; i < color_price.length; i++) {
        if (color_price[i].color === colorSelected.id) {
          selectedColorPrice = color_price[i];
          break;
        }
      }
    }
    setSelectedColor((selectedColor) => ({
      ...selectedColor,
      isColorSelected: isColorSelected,
      selectedColor: isColorSelected ? colorSelected : null,
      selectedColorPrice: selectedColorPrice,
    }));
  };

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

  const handleChange = (event, newValue) => {
    let value = null;
    if (newValue === 0) {
      value = SELECTRAWMATERIALS;
    } else {
      value = SELECTREADYMATERIALS;
    }
    if (!value) {
      setPageNotFound(true);
    } else {
      history.push({
        pathname: `${EDITDESIGN}${value}/${formState.designId}`,
      });
    }
  };

  const updateDesign = async () => {
    setLoaderForUpdateDesign(true);
    await providerForGet(
      backend_designs + "/" + formState.designId,
      {},
      auth.getToken()
    )
      .then((res) => {
        setLoaderForUpdateDesign(false);
        if (res.data) {
          setColor(
            selectedColor.isColorSelected,
            selectedColor.selectedColor,
            res.data?.color_price
          );
          setFormState((formState) => ({
            ...formState,
            designData: res.data,
          }));
        } else {
          throw new Error("");
        }
      })
      .catch((err) => {
        setLoaderForUpdateDesign(false);
        setPageNotFound(true);
      });
  };

  const getLoader = () => {
    return (
      <CircularProgress
        color="primary"
        className={classes.colorPrimary}
        size={20}
        style={{
          marginLeft: "10px",
        }}
      />
    );
  };

  const calculateTotalPrice = () => {
    if (formState?.designData?.colors?.length) {
      let color = selectedColor.selectedColor;
      let colorPrice = selectedColor.selectedColorPrice;
      return (
        <>
          {/* <GridItem xs={12}>
            <>
              {" "}
              <b>Total Price of all the common materials: </b> ( i.e price of
              all the common materials present across all the colors including
              add. price ):{" "}
            </>
            <b></b>
            {loaderForUpdateDesign
              ? getLoader()
              : convertNumber(
                  parseFloat(
                    formState?.designData?.material_price +
                      formState?.designData?.add_price
                  ).toFixed(2),
                  true
                )}
          </GridItem> */}
          {selectedColor.isColorSelected ? (
            <>
              <GridItem xs={12}>
                <>
                  {" "}
                  <b>
                    Price of all the raw materials required for '{color?.name}'
                  </b>{" "}
                  {loaderForUpdateDesign
                    ? getLoader()
                    : convertNumber(
                        parseFloat(colorPrice?.color_price).toFixed(2),
                        true
                      )}
                </>
              </GridItem>
              <GridItem xs={12}>
                <>
                  {" "}
                  <b>Total Price for '{color?.name}': </b> (price of all the
                  common raw materials ={" "}
                  {convertNumber(
                    [
                      parseFloat(formState?.designData?.material_price).toFixed(
                        2
                      ),
                    ],
                    true
                  )}
                  ) + (price of raw materials required for '{color?.name}'={" "}
                  {convertNumber(
                    parseFloat(colorPrice?.color_price).toFixed(2),
                    true
                  )}
                  ) + (add. price ={" "}
                  {convertNumber(
                    parseFloat(formState?.designData?.add_price).toFixed(2),
                    true
                  )}
                  ) :{" "}
                </>
                <b></b>
                {loaderForUpdateDesign
                  ? getLoader()
                  : convertNumber(
                      parseFloat(
                        formState?.designData?.material_price +
                          formState?.designData?.add_price +
                          colorPrice?.color_price
                      ).toFixed(2),
                      true
                    )}
              </GridItem>
              <GridItem
                xs={12}
                style={{
                  marginTop: "10px",
                }}
              >
                <b>Stock Available:</b> {colorPrice.stock}
              </GridItem>
            </>
          ) : (
            <GridItem
              xs={12}
              style={{
                marginTop: "15px",
              }}
            >
              <b>Total Price:</b>{" "}
              {convertNumber(
                validateNumber(formState?.designData?.totalPriceForAnyOneColor)
              )}
            </GridItem>
          )}
        </>
      );
    } else {
      return (
        <>
          <GridItem xs={12}>
            <b>Total Price </b>( price of all the materials required for this
            order i.e (
            {convertNumber(
              parseFloat(formState?.designData?.material_price).toFixed(2),
              true
            )}
            ) + add. price i.e (
            {convertNumber(
              parseFloat(formState?.designData?.add_price).toFixed(2),
              true
            )}
            )) :{" "}
            {loaderForUpdateDesign
              ? getLoader()
              : convertNumber(
                  parseFloat(
                    formState?.designData?.material_price +
                      formState?.designData?.add_price
                  ).toFixed(2),
                  true
                )}
          </GridItem>
        </>
      );
    }
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
                  <Box sx={{ width: "100%" }}>
                    <GridContainer style={{ dispay: "flex" }}>
                      <GridItem xs={12}>
                        <b>Design No : </b> {formState?.designData?.material_no}
                      </GridItem>
                      {selectedColor.isColorSelected ? (
                        <>
                          <GridItem xs={12}>
                            <b>Selected Color : </b>{" "}
                            {selectedColor.selectedColor?.name}
                          </GridItem>{" "}
                          <GridItem xs={12}>{`< ----------------- >`}</GridItem>
                        </>
                      ) : null}
                      <GridItem xs={12}>
                        <b>Add. Price : </b>{" "}
                        {loaderForUpdateDesign
                          ? getLoader()
                          : convertNumber(
                              parseFloat(
                                formState?.designData?.add_price
                              ).toFixed(2),
                              true
                            )}
                      </GridItem>
                      <GridItem xs={12}>
                        {formState?.designData?.colors?.length ? (
                          <>
                            {" "}
                            <b>Price of all the common raw materials </b> ( i.e
                            price of all the common materials present across all
                            the colors excluding add. price ):{" "}
                          </>
                        ) : (
                          <>
                            {" "}
                            <b>Price of raw materials</b> ( i.e price of all the
                            materials present excluding add. price ):{" "}
                          </>
                        )}
                        {loaderForUpdateDesign
                          ? getLoader()
                          : convertNumber(
                              parseFloat(
                                formState?.designData?.material_price
                              ).toFixed(2),
                              true
                            )}
                      </GridItem>
                      {calculateTotalPrice()}
                    </GridContainer>
                    <br />
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <StyledTabs
                        value={value}
                        onChange={handleChange}
                        variant="scrollable"
                        scrollButtons
                        allowScrollButtonsMobile
                        TabIndicatorProps={{
                          children: <span className="MuiTabs-indicatorSpan" />,
                        }}
                      >
                        {tabs.map((t) => (
                          <StyledTab label={t} />
                        ))}
                      </StyledTabs>
                    </Box>
                    <Box>
                      <Component
                        {...props}
                        setColor={setColor}
                        urlParams={ComputedMatch}
                        id={formState.designId}
                        designData={formState.designData}
                        isRawMaterial={formState.isRawMaterial}
                        isReadyMaterial={formState.isReadyMaterial}
                        updateDesign={updateDesign}
                        {...otherProps}
                      />
                    </Box>
                  </Box>
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
