import {} from "@material-ui/core";
import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";

const localStyles = makeStyles(theme => ({
  titleText: {
    fontFamily: "Montserrat",
    marginBottom: "0.9375rem"
  }
}));

export default function CustomTypography(props) {
  const classes = localStyles();

  return (
    <Typography
      className={
        props.className
          ? clsx(classes.titleText, props.className)
          : classes.titleText
      }
      {...props}
    >
      {props.children}
    </Typography>
  );
}
