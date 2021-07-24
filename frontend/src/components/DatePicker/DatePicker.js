import "date-fns";
import React from "react";
import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import styles from "../../assets/jss/material-dashboard-react/components/customInputStyle.js";
import { makeStyles } from "@material-ui/core";
import classNames from "classnames";
const useStyles = makeStyles(styles);

export default function DatePicker(props) {
  const classes = useStyles();
  const marginTop = classNames({
    [classes.marginTop]: true
  });

  const underlineClasses = classNames({
    [classes.underlineError]: props.error,
    [classes.underlineSuccess]: props.success && !props.error,
    [classes.underline]: true
  });

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        margin="normal"
        id="date-picker-dialog"
        label={props.label}
        format="d MMM yyyy"
        value={props.date}
        name={props.name}
        onChange={props.handleDateChange}
        KeyboardButtonProps={{
          "aria-label": "change date"
        }}
        classes={{
          root: marginTop,
          disabled: classes.disabled,
          underline: underlineClasses,
          input: classes.input,
          popper: classes.input,
          listbox: classes.input
        }}
        {...props}
      />
    </MuiPickersUtilsProvider>
  );
}
