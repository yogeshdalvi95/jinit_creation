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
import { getFinancialYear } from "../../Utils/CommonUtils.js";

const useStyles = makeStyles(styles);
const theme = createMuiTheme({
  overrides: {
    MuiInputBase: {
      input: {
        ...defaultFont,
        fontWeight: "500",
        color: grayColor[7] + " !important",
        fontSize: "0.900rem",
        lineHeight: "1.42857",
        letterSpacing: "unset",
      },
      underline: {
        color: "#a56863 !important",
      },
    },
    MuiInputLabel: {
      root: {
        color: grayColor[3] + " !important",
      },
    },
    MuiFormLabel: {
      root: {
        fontSize: "14px",
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
    MuiInput: {
      underline: {
        "&:before": {
          borderBottom: `1px solid ${grayColor[4]}`,
        },
        "&:after": {
          borderBottom: `2px solid ${primaryColor[0]}`,
        },
        "&:hover:not(.Mui-disabled):before": {
          borderBottom: `2px solid ${primaryColor[0]}`,
        },
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
      color: #aaaaaa !important;
    }
    .MuiInput-underline {
      &:after {
        border-bottom: 1px solid ${primaryColor[0]} !important;
      }
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
  `;

  const minMaxDate = getFinancialYear();

  return (
    <ThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        {props.isSelectOnlyFinancialYear ? (
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
            minDate={getFinancialYear().minDate}
            maxDate={getFinancialYear().maxDate}
            classes={{
              root: marginTop,
              disabled: classes.disabled,
              underline: underlineClasses,
              input: classes.input,
            }}
            {...props}
          />
        ) : (
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
            classes={{
              root: marginTop,
              disabled: classes.disabled,
              underline: underlineClasses,
              input: classes.input,
            }}
            {...props}
          />
        )}
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export default DatePicker;
