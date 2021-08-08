import {
  grayColor,
  defaultFont,
  primaryColor,
  whiteColor,
  blackColor,
  hexToRgb
} from "../../material-dashboard-react";

const styles = {
  switchBox: {
    paddingTop: "0.8rem !important"
  },
  extendedIcon: {
    marginRight: "1rem"
  },
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
  componentBorder: {
    margin: "0.5rem",
    border: "0.5px solid " + grayColor[4],
    borderRadius: "0.5rem"
  },
  backdrop: {
    zIndex: 1000,
    color: "#fff"
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
  },
  cardHeaderStyles: {
    width: "max-content"
  },
  addDeleteFabButon: {
    marginTop: "auto",
    display: "flex"
  },
  typo: {
    paddingLeft: "25%",
    marginBottom: "40px",
    position: "relative"
  },
  typo1: {
    paddingLeft: "1rem",
    position: "relative"
  },
  h5: {
    fontWeight: 600,
    fontSize: "1.25em",
    fontFamily: "Montserrat !important",
    color: "#8A8A97 !important"
  },
  note: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    bottom: "10px",
    color: "#c0c1c2",
    display: "block",
    fontWeight: "400",
    fontSize: "13px",
    lineHeight: "13px",
    left: "0",
    marginLeft: "20px",
    position: "absolute",
    width: "260px"
  },
  title: {
    ...defaultFont,
    letterSpacing: "unset",
    lineHeight: "30px",
    fontSize: "18px",
    borderRadius: "3px",
    textTransform: "none",
    color: "inherit",
    margin: "0",
    "&:hover,&:focus": {
      background: "transparent"
    }
  },
  switchBase: {
    color: primaryColor[0] + "!important"
  },
  switchIcon: {
    boxShadow: "0 1px 3px 1px rgba(" + hexToRgb(blackColor) + ", 0.4)",
    color: whiteColor + " !important",
    border: "1px solid rgba(" + hexToRgb(blackColor) + ", .54)"
  },
  switchIconChecked: {
    borderColor: primaryColor[0],
    transform: "translateX(0px)!important"
  },
  switchBar: {
    width: "30px",
    height: "15px",
    backgroundColor: "rgb(" + hexToRgb(grayColor[18]) + ")",
    borderRadius: "15px",
    opacity: "0.7!important"
  },
  switchChecked: {
    "& + $switchBar": {
      backgroundColor: "rgba(" + hexToRgb(primaryColor[0]) + ", 1) !important"
    },
    "& $switchIcon": {
      borderColor: primaryColor[0]
    }
  },
  label: {
    cursor: "pointer",
    paddingLeft: "0",
    color: "rgba(" + hexToRgb(blackColor) + ", 0.26)",
    fontSize: "14px",
    lineHeight: "1.428571429",
    fontWeight: "400",
    display: "inline-flex"
  }
};

export default styles;
