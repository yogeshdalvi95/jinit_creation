import React from "react";
import MaterialTable, { MTableToolbar, MTableHeader } from "material-table";
import LinearProgress from "@material-ui/core/LinearProgress";
import styles from "./Table.module.css";
import { Box, makeStyles, TablePagination, Paper } from "@material-ui/core";

import { defaultFont } from "../../assets/jss/material-dashboard-react.js";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiPaper-root": {
      borderRadius: "100px",
      boxShadow: "0px 0px 0px 0px rgba(0,0,0,0);",
    },
  },
  table: {
    "& tfoot tr td div:nth-child(1)": {
      justifyContent: "center",
      flex: "initial",
      fontFamily: "Montserrat",
      fontWeight: 600,
      fontSize: "0.75rem",
      color: "#8A8A97",
    },
    "& tfoot tr td ": {
      border: "none !important",
      fontFamily: "Montserrat",
      fontWeight: 500,
      fontSize: "1rem",
      "& > div": {
        display: "flex",
        flexWrap: "wrap",
      },
    },
    "& tfoot tr td div:nth-child(2) span": {
      fontFamily: "Montserrat",
      fontWeight: 500,
      fontSize: "1rem",
    },
    "& .MuiTypography-caption": {
      fontFamily: "Montserrat",
      fontWeight: 500,
      fontSize: "0.75rem",
      color: "#000",
    },
    "& th": {
      color: "#3b3b42 !important",
      backgroundColor: "#f9f8f8 !important",
      fontSize: "0.9375rem !important",
      fontWeight: "600 !important",
      lineHeight: "1.5rem !important",
      letterSpacing: "0.15px !important",
      border: "0.6px solid #e0e0e0 !important",
      fontFamily: "Montserrat !important",
      padding: "1rem !important",
      // textAlign: "left",
      flexDirection: "row",
    },
    "& td": {
      ...defaultFont,
      // textAlign: "left",
      fontSize: "0.8125rem !important",
      fontWeight: "450 !important",
      lineHeight: "1.5rem !important",
      letterSpacing: "0.15px !important",
      border: "0.6px solid #e0e0e0 !important",
      "& .MuiIconButton-label": {
        color: "#1C4979 !important",
      },
      "& .Mui-disabled .MuiIconButton-label": {
        color: "#00000042 !important",
      },
    },
    "& tbody tr:last-child td": {
      borderBottom: "0px !important",
    },
  },
}));

const useNewStyles = makeStyles(styles);

const Table = (props) => {
  const {
    rows,
    columns,
    className,
    pageSize,
    checkboxSelection,
    title,
    ...rest
  } = props;
  const classes = useStyles();

  return (
    <Box boxShadow={0}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      ></link>
      <div className={classes.root}>
        <MaterialTable
          components={{
            OverlayLoading: (props) => (
              <div style={{ position: "absolute", top: 0, width: "100%" }}>
                <LinearProgress />
              </div>
            ),
            Container: (props) => (
              <Paper {...props} className={classes.table} />
            ),
            Pagination: (props) => (
              <TablePagination {...props} className={classes.table} />
            ),
            Toolbar: () => null,
          }}
          title={props.title ? props.title : null}
          columns={props.columns}
          isLoading={props.isLoading}
          actions={props.actions}
          editable={props.editable}
          options={props.options}
          onOrderChange={props.onOrderChange}
          style={{}}
          {...props}
        />
      </div>
    </Box>
  );
};

Table.propTypes = {};

Table.defaultProps = {};

export default Table;
