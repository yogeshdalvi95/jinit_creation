import {} from "@material-ui/core";
import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";

const localStyles = makeStyles(theme => ({
  titleText: {
    color: "#110F48",
    fontFamily: "Montserrat",
    fontWeight: 500,
    fontSize: "0.99rem",
    marginBottom: "0.9375rem"
  }
}));

export default function CaptionText(props) {
  const classes = localStyles();

  return (
    <Typography
      className={
        props.className
          ? clsx(classes.titleText, props.className)
          : classes.titleText
      }
      variant="caption"
      display="block"
      gutterBottom
      {...props}
    >
      {props.children}
    </Typography>
  );
}
