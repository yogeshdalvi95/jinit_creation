import * as React from "react";
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
import { Auth as auth, NotFoundPage } from "../components";
import {
  EDITDESIGN,
  LOGIN,
  SELECTRAWMATERIALS,
  SELECTRAWMATERIALSWOHASH,
  SELECTREADYMATERIALS,
  SELECTREADYMATERIALSWOHASH,
} from "../paths";
import { getRoutesOnLogin } from "../Utils";
import { primaryColor } from "../assets/jss/material-dashboard-react";
import { useEffect } from "react/cjs/react.development";
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
  header,
  openSubMenu,
  ...otherProps
}) => {
  const location = useLocation();
  const useStyles = makeStyles(styles);
  const history = useHistory();
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
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

  const tabs = ["Raw Materials", "Ready Materials"];

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
        isRawMaterial: dependencyObject?.isRawMaterial,
        isReadyMaterial: dependencyObject?.isReadyMaterial,
        designData: data,
        routes: dependencyObject.routes,
      }));
    }
    setValue(dependencyObject.isRawMaterial ? 0 : 1);
    setLoader(false);
    console.log(dependencyObject);
  };

  console.log(formState);

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
                {
                  loader ? (
                    <Backdrop className={classes.backdrop} open={loader}>
                      <CircularProgress color="inherit" />
                    </Backdrop>
                  ) : pageNotFound ? (
                    <NotFoundPage />
                  ) : (
                    <Box sx={{ width: "100%" }}>
                      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <StyledTabs
                          value={value}
                          onChange={handleChange}
                          variant="scrollable"
                          scrollButtons
                          allowScrollButtonsMobile
                          TabIndicatorProps={{
                            children: (
                              <span className="MuiTabs-indicatorSpan" />
                            ),
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
                          urlParams={ComputedMatch}
                          header={header}
                          id={formState.designId}
                          designData={formState.designData}
                          isRawMaterial={formState.isRawMaterial}
                          isReadyMaterial={formState.isReadyMaterial}
                          {...otherProps}
                        />
                      </Box>
                    </Box>
                  )
                  /* {isDependent && id && id.length && (
                    <Component
                      {...props}
                      urlParams={ComputedMatch}
                      header={header}
                      id={id[id.length - 1]}
                      {...otherProps}
                    />
                  )}
                  {isDependent && (!id || (id && !id.length)) && <NotFoundPage />}
                  {!isDependent && (
                    <Component
                      {...props}
                      urlParams={ComputedMatch}
                      header={header}
                      {...otherProps}
                    />
                  )} */
                }
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
