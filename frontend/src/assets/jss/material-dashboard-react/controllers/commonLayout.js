import { grayColor } from "../../material-dashboard-react";

const styles = {
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
  }
};

export default styles;
