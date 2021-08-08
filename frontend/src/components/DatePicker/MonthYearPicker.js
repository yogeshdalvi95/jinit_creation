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
import {
  primaryColor,
  grayColor
} from "../../assets/jss/material-dashboard-react.js";
import styled from "styled-components";
import { DatePicker } from "@material-ui/pickers";

const useStyles = makeStyles(styles);

export default function MonthYearPicker(props) {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const classes = useStyles();
  const marginTop = classNames({
    [classes.marginTop]: true
  });

  const underlineClasses = classNames({
    [classes.underlineError]: props.error,
    [classes.underlineSuccess]: props.success && !props.error,
    [classes.underline]: true
  });

  const StyledTextField = styled(DatePicker)`
    label.Mui-focused {
      color: green;
    }
    .MuiInput-underline:after {
      border-color: ${primaryColor[0]};
    }
    .MuiInput-underline:before {
      border-color: ${grayColor[4]} !important;
    }
    .MuiFormLabel-root {
      color: #aaaaaa !important;
      font-size: 14px;
      font-family: "Roboto", "Helvetica", "Arial", sans-serif;
      font-weight: 400;
      line-height: 1.42857;
      letter-spacing: unset;
    }
  `;

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <StyledTextField
        margin="normal"
        id="date-picker-dialog"
        label={"Select Year and Month"}
        format="MMM yyyy"
        views={["year", "month"]}
        maxDate={new Date(year, month, 0)}
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
          input: classes.input
        }}
        {...props}
      />
    </MuiPickersUtilsProvider>
  );
}