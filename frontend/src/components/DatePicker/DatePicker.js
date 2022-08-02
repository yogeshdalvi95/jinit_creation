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
  defaultFont,
} from "../../assets/jss/material-dashboard-react.js";
import styled from "styled-components";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";

const useStyles = makeStyles(styles);
const theme = createMuiTheme({
  overrides: {
    MuiInputBase: {
      input: {
        ...defaultFont,
        color: grayColor[3] + " !important",
        fontWeight: "400",
        fontSize: "14px",
        lineHeight: "1.42857",
        letterSpacing: "unset",
      },
    },
    MuiPickersClock: {
      clock: {
        backgroundColor: "#a56863",
      },
    },
    MuiPickersToolbar: {
      toolbar: {
        backgroundColor: "#a56863",
      },
    },
    MuiPickersDay: {
      daySelected: {
        backgroundColor: "#a56863",
      },
    },
    MuiTypography: {
      colorPrimary: {
        color: "#a56863",
      },
    },
    MuiButton: {
      textPrimary: {
        color: "#a56863",
      },
    },
    MuiPickersMonth: {
      monthSelected: {
        color: "#a56863",
      },
      root: {
        "&:focus": {
          color: "#a56863",
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
      font-size: 12px !important;
      font-family: "Roboto", "Helvetica", "Arial", sans-serif;
      font-weight: 400;
      line-height: 1.42857;
      letter-spacing: unset;
    }
    .MuiInputBase-input {
      font-size: 0.900rem,
      color: #555555 !important
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
