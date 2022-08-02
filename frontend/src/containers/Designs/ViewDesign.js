import React from "react";
import { useEffect } from "react";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import {
  Auth,
  FAB,
  GridContainer,
  GridItem,
  Table,
  Card,
  CardBody,
  CardHeader,
  CustomDropDown,
  RawMaterialDetail,
  Button,
  SnackBarComponent,
} from "../../components";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { useTheme } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
// core components
import { DESIGNS, NOTFOUNDPAGE, VIEWDESIGN } from "../../paths";
import { providerForDownload, providerForGet } from "../../api";
import { backend_view_designs, frontendServerUrl } from "../../constants";
import { useState } from "react";
import { Backdrop, CircularProgress } from "@material-ui/core";
import { backend_download_designs } from "../../constants/UrlConstants";
const useStyles = makeStyles(styles);

const ViewDesign = (props) => {
  const theme = useTheme();
  const [colors, setColors] = useState([]);
  const classes = useStyles();
  const history = useHistory();
  const [isView] = useState(props.isView ? props.isView : null);
  const [id] = useState(props.id ? props.id : null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState(null);
  const [commonRawMaterialsData, setCommonRawMaterialsData] = useState(null);

  const isGreaterThanSmallScreen = useMediaQuery(theme.breakpoints.up("sm"), {
    defaultMatches: true,
  });

  const [snackBar, setSnackBar] = React.useState({
    show: false,
    severity: "",
    message: "",
  });

  /** Use effect check if the data is for viewing or editing */
  useEffect(() => {
    if (isView && id) {
      const urlParams = new URLSearchParams(window.location.search);
      let color = urlParams.get("c");
      setSelectedColor(color);
      getEditViewData(id);
    }
  }, []);

  const columns = [
    {
      title: "Name",
      field: "raw_material.name",
      sorting: true,
      align: "left",
    },
    {
      title: "Size",
      field: "raw_material.size",
      sorting: true,
      align: "left",
    },
    {
      title: "Quantity",
      field: "quantity",
      sorting: true,
      align: "left",
      render: (rowData) => {
        let unit = rowData?.raw_material?.unit?.name;
        return rowData.quantity + " (" + unit + ")";
      },
    },
  ];
  const bandhaiColumns = [
    {
      title: "Bandhai",
      field: "raw_material.name",
      sorting: true,
      align: "left",
    },
    {
      title: "Size",
      field: "raw_material.size",
      sorting: true,
      align: "left",
    },
    {
      title: "Quantity",
      field: "quantity",
      sorting: true,
      align: "left",
      render: (rowData) => {
        let unit = rowData?.raw_material?.unit?.name;
        return rowData.quantity + " (" + unit + ")";
      },
    },
  ];
  const dieColumns = [
    {
      title: "Die",
      field: "raw_material.name",
      sorting: true,
      align: "left",
    },
    {
      title: "Quantity",
      field: "quantity",
      sorting: true,
      align: "left",
      render: (rowData) => {
        let unit = rowData?.raw_material?.unit?.name;
        return rowData.quantity + " (" + unit + ")";
      },
    },
  ];

  const getEditViewData = async (id) => {
    setBackDrop(true);
    let isError = false;
    await providerForGet(backend_view_designs + "/" + id, {}, Auth.getToken())
      .then((res) => {
        if (res.status === 200) {
          let data = res.data?.designData.colors;
          setCommonRawMaterialsData(res.data?.commonRawMaterials);
          setColors(() =>
            data.map((d) => ({
              name: d.name,
              value: d.id,
              id: d.id,
            }))
          );
          setFormState(res.data);
        } else {
          isError = true;
        }
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
        isError = true;
      });
    if (isError) {
      setBackDrop(false);
      history.push(NOTFOUNDPAGE);
    }
  };

  const onBackClick = () => {
    history.push(DESIGNS);
  };

  const downloadOrder = async (downloadAll, color) => {
    setBackDrop(true);
    await providerForDownload(
      backend_download_designs,
      {
        downloadAll: downloadAll,
        color: color,
        id: id,
      },
      Auth.getToken()
    )
      .then((res) => {
        const url = URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );
        const pdfNewWindow = window.open();
        pdfNewWindow.location.href = url;
        setBackDrop(false);
      })
      .catch((err) => {
        setBackDrop(false);
        setSnackBar((snackBar) => ({
          ...snackBar,
          show: true,
          severity: "error",
          message: "Error while downloading order data",
        }));
      });
  };

  const snackBarHandleClose = () => {
    setSnackBar((snackBar) => ({
      ...snackBar,
      show: false,
      severity: "",
      message: "",
    }));
  };

  return (
    <GridContainer>
      <SnackBarComponent
        open={snackBar.show}
        severity={snackBar.severity}
        message={snackBar.message}
        handleClose={snackBarHandleClose}
      />
      <GridItem xs={12} sm={12} md={12}>
        <FAB
          color="primary"
          align={"start"}
          size={"small"}
          onClick={onBackClick}
        >
          <KeyboardArrowLeftIcon />
        </FAB>
      </GridItem>
      {formState ? (
        <>
          <GridItem xs={12} sm={12} md={12}>
            <Typography
              variant="h2"
              gutterBottom
              component="div"
              sx={{ fontSize: 40 }}
            >
              {formState?.designData?.material_no
                ? formState.designData.material_no
                : "------"}
            </Typography>
            <Typography
              variant="h2"
              gutterBottom
              component="div"
              sx={{ fontSize: 18, mt: -1, mb: 3 }}
            >
              Design Sheet
            </Typography>
          </GridItem>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="primary" className={classes.cardHeaderStyles}>
                <h4 className={classes.cardTitleWhite}>{props.header}</h4>
                <p className={classes.cardCategoryWhite}></p>
              </CardHeader>
              <CardBody>
                <GridContainer>
                  <GridItem
                    style={{
                      width: "20rem",
                    }}
                  >
                    <CustomDropDown
                      id="color_list"
                      onChange={(event) => {
                        setSelectedColor(event.target.value);
                        window.history.pushState(
                          "",
                          "Daily usage",
                          `${frontendServerUrl}${VIEWDESIGN}/${id}?c=${event.target.value}`
                        );
                      }}
                      labelText="Select Color/Ratio"
                      name="color_list"
                      value={selectedColor}
                      nameValue={colors}
                      formControlProps={{
                        fullWidth: true,
                      }}
                    />
                  </GridItem>
                  {selectedColor && (
                    <GridItem
                      style={{
                        marginTop: isGreaterThanSmallScreen ? "1.8rem" : "",
                      }}
                    >
                      <Button
                        color="primary"
                        onClick={() => {
                          downloadOrder(false, selectedColor);
                        }}
                      >
                        Download
                      </Button>
                    </GridItem>
                  )}
                  <GridItem
                    style={{
                      marginTop: isGreaterThanSmallScreen ? "1.8rem" : "",
                    }}
                  >
                    <Button
                      color="primary"
                      onClick={() => {
                        downloadOrder(true, null);
                      }}
                    >
                      Download All
                    </Button>
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  {selectedColor && (
                    <>
                      <GridItem xs={12} sm={12} md={12}>
                        <GridContainer>
                          <GridItem
                            xs={12}
                            sm={12}
                            md={12}
                            style={{
                              textAlign: "left",
                              marginTop: "30px",
                            }}
                          >
                            <Typography
                              variant="h1"
                              gutterBottom
                              component="div"
                              sx={{
                                fontSize: 18,
                                pb: 2,
                                pt: 2,
                              }}
                            >
                              <b>Ratio: </b>
                              {formState[selectedColor]?.colorName}
                            </Typography>
                          </GridItem>
                        </GridContainer>
                        <GridContainer>
                          <GridItem xs={12} sm={12} md={7}>
                            <Table
                              columns={columns}
                              data={[
                                ...formState[selectedColor]?.colorMaterial,
                                ...commonRawMaterialsData.commonMaterialsWithoutDie,
                              ]}
                              options={{
                                paging: false,
                              }}
                              detailPanel={(rowData) => {
                                return (
                                  <GridContainer>
                                    <GridItem xs={12} sm={12} md={6}>
                                      <RawMaterialDetail
                                        raw_material={rowData.raw_material}
                                      />
                                    </GridItem>
                                  </GridContainer>
                                );
                              }}
                            />
                          </GridItem>
                          <GridItem xs={12} sm={12} md={5}>
                            <Table
                              columns={dieColumns}
                              data={[
                                ...commonRawMaterialsData.commonMaterialsWithDie,
                              ]}
                              options={{
                                paging: false,
                              }}
                              detailPanel={(rowData) => {
                                return (
                                  <GridContainer>
                                    <GridItem xs={12} sm={12} md={6}>
                                      <RawMaterialDetail
                                        raw_material={rowData.raw_material}
                                      />
                                    </GridItem>
                                  </GridContainer>
                                );
                              }}
                            />
                          </GridItem>
                        </GridContainer>
                      </GridItem>
                      <GridItem
                        xs={12}
                        sm={12}
                        md={12}
                        style={{
                          marginTop: "30px",
                        }}
                      >
                        <Table
                          columns={bandhaiColumns}
                          data={[
                            ...commonRawMaterialsData.commonMotiBandhaiMaterial,
                            ...formState[selectedColor]?.colorBandhaiMaterials,
                          ]}
                          options={{
                            paging: false,
                          }}
                          detailPanel={(rowData) => {
                            return (
                              <GridContainer>
                                <GridItem xs={12} sm={12} md={6}>
                                  <RawMaterialDetail
                                    raw_material={rowData.raw_material}
                                  />
                                </GridItem>
                              </GridContainer>
                            );
                          }}
                        />
                      </GridItem>
                    </>
                  )}
                </GridContainer>
              </CardBody>
            </Card>
          </GridItem>
        </>
      ) : null}

      <Backdrop className={classes.backdrop} open={openBackDrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </GridContainer>
  );
};

export default ViewDesign;
