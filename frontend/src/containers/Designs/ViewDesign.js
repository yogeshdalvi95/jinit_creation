import React from "react";
import { useEffect } from "react";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import { Auth, FAB, GridContainer, GridItem, Table } from "../../components";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import Typography from "@mui/material/Typography";
// core components

import { DESIGNS, NOTFOUNDPAGE } from "../../paths";
import { providerForGet } from "../../api";
import { backend_view_designs } from "../../constants";
import { useState } from "react";
import { Backdrop, CircularProgress } from "@material-ui/core";
import no_image_icon from "../../assets/img/no_image_icon.png";
import { common } from "@mui/material/colors";

const useStyles = makeStyles(styles);

const ViewDesign = (props) => {
  const [colors, setColors] = useState([]);
  const classes = useStyles();
  const history = useHistory();
  const [isView] = useState(props.isView ? props.isView : null);
  const [id, setId] = useState(props.id ? props.id : null);
  const [openBackDrop, setBackDrop] = useState(false);
  const [formState, setFormState] = useState({});
  const [commonRawMaterialsData, setCommonRawMaterialsData] = useState({});

  /** Use effect check if the data is for viewing or editing */
  useEffect(() => {
    if (isView && id) {
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
          setFormState(res.data);
          let data = res.data?.designData.colors.map((el) => el.id);
          setCommonRawMaterialsData(res.data?.commonRawMaterials);
          setColors(data);
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

  return (
    <GridContainer>
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
      <GridItem xs={12} sm={12} md={12}>
        <Typography
          variant="h2"
          gutterBottom
          component="div"
          sx={{ fontSize: 40 }}
        >
          {formState?.designData?.material_no}
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
        <GridItem xs={12} sm={12} md={7}></GridItem>
        <GridItem xs={12} sm={12} md={5}></GridItem>
      </GridItem>
      {Object.keys(commonRawMaterialsData).length ? (
        <>
          <GridItem xs={12} sm={12} md={8}>
            {commonRawMaterialsData?.commonMaterialsWithoutDie && (
              <>
                <Table
                  columns={columns}
                  data={commonRawMaterialsData.commonMaterialsWithoutDie}
                  options={{
                    paging: false,
                  }}
                />
              </>
            )}
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            {commonRawMaterialsData?.commonMaterialsWithDie && (
              <>
                <Table
                  columns={dieColumns}
                  data={commonRawMaterialsData.commonMaterialsWithDie}
                  options={{
                    paging: false,
                  }}
                />
              </>
            )}
          </GridItem>
          <GridItem
            xs={12}
            sm={12}
            md={4}
            style={{
              marginTop: "30px",
            }}
          >
            {commonRawMaterialsData?.commonMotiBandhaiMaterial &&
            commonRawMaterialsData.commonMotiBandhaiMaterial.length ? (
              <>
                <Table
                  columns={bandhaiColumns}
                  data={commonRawMaterialsData.commonMotiBandhaiMaterial}
                  options={{
                    paging: false,
                  }}
                />
              </>
            ) : null}
          </GridItem>
          {colors.map((c, k) => (
            <React.Fragment key={k}>
              <GridItem
                xs={12}
                sm={12}
                md={12}
                style={{
                  textAlign: "center",
                  marginTop: "30px",
                }}
              >
                <Typography
                  variant="h2"
                  gutterBottom
                  component="div"
                  sx={{
                    fontSize: 15,
                    pb: 2,
                    pt: 2,
                  }}
                >
                  <b>Ratio: </b>
                  {formState[c].colorName}
                </Typography>
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                {formState[c]?.colorMaterial && (
                  <>
                    <Table
                      columns={columns}
                      data={formState[c]?.colorMaterial}
                      options={{
                        paging: false,
                      }}
                    />
                  </>
                )}
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                {formState[c]?.colorBandhaiMaterials && (
                  <>
                    <Table
                      columns={bandhaiColumns}
                      data={formState[c]?.colorBandhaiMaterials}
                      options={{
                        paging: false,
                      }}
                    />
                  </>
                )}
              </GridItem>
            </React.Fragment>
          ))}
        </>
      ) : (
        "No data to show"
      )}
      <Backdrop className={classes.backdrop} open={openBackDrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </GridContainer>
  );
};

export default ViewDesign;
