import "date-fns";
import React from "react";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import styles from "../../assets/jss/material-dashboard-react/components/customInputStyle.js";
import { makeStyles } from "@material-ui/core";
import classNames from "classnames";
import {
  primaryColor,
  grayColor,
} from "../../assets/jss/material-dashboard-react.js";
import styled from "styled-components";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";

const useStyles = makeStyles(styles);
const theme = createMuiTheme({
  overrides: {
    MuiPickersClock: {
      clock: {
        backgroundColor: "#9c27b0",
      },
    },
    MuiPickersToolbar: {
      toolbar: {
        backgroundColor: "#9c27b0",
      },
    },
    MuiPickersDay: {
      daySelected: {
        backgroundColor: "#9c27b0",
      },
    },
    MuiTypography: {
      colorPrimary: {
        color: "#9c27b0",
      },
    },
    MuiButton: {
      textPrimary: {
        color: "#9c27b0",
      },
    },
    MuiPickersMonth: {
      monthSelected: {
        color: "#9c27b0",
      },
      root: {
        "&:focus": {
          color: "#9c27b0",
        },
      },
    },
  },
});
const DatePicker = (props) => {
  const classes = useStyles();
  const {
    formControlProps,
    error,
    helperTextId,
    isHelperText,
    helperText,
    ...rest
  } = props;
  const marginTop = classNames({
    [classes.marginTop]: props.noMargin ? false : true,
    [classes.noMargin]: props.noMargin ? true : false,
  });

  const underlineClasses = classNames({
    [classes.underlineError]: props.error,
    [classes.underlineSuccess]: props.success && !props.error,
    [classes.underline]: true,
  });

  const StyledTextField = styled(KeyboardDatePicker)`
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
    <ThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <StyledTextField
          margin="normal"
          id="date-picker-dialog"
          label={props.label}
          format="d MMM yyyy"
          value={props.date}
          name={props.name}
          onChange={props.handleDateChange}
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
          maxDate={
            new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
          }
          classes={{
            root: marginTop,
            disabled: classes.disabled,
            underline: underlineClasses,
            input: classes.input,
          }}
          {...props}
        />
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export default DatePicker;
