import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import styled from "styled-components";
import Autocomplete from "@material-ui/lab/Autocomplete";
// @material-ui/icons
import {
  primaryColor,
  grayColor
} from "../../assets/jss/material-dashboard-react.js";
// core components
import styles from "../../assets/jss/material-dashboard-react/components/customInputStyle.js";
import { TextField } from "@material-ui/core";

const useStyles = makeStyles(styles);

export default function CustomAutoComplete(props) {
  const classes = useStyles();

  const StyledTextField = styled(TextField)`
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

  const {
    formControlProps,
    labelText,
    id,
    options,
    optionKey,
    autocompleteId,
    labelProps,
    inputProps,
    error,
    success,
    rtlActive,
    autoComplete,
    onChange,
    value,
    getOptionLabel,
    onHighlightChange,
    ...rest
  } = props;

  const labelClasses = classNames({
    [" " + classes.labelRootError]: error,
    [" " + classes.labelRootSuccess]: success && !error,
    [" " + classes.labelRTL]: rtlActive
  });
  const underlineClasses = classNames({
    [classes.underlineError]: error,
    [classes.underlineSuccess]: success && !error,
    [classes.underline]: true
  });
  const marginTop = classNames({
    [classes.marginTop]: labelText === undefined
  });
  let newInputProps = {
    maxLength:
      inputProps && inputProps.maxLength ? inputProps.maxLength : undefined,
    minLength:
      inputProps && inputProps.minLength ? inputProps.minLength : undefined,
    step: inputProps && inputProps.step ? inputProps.step : undefined
  };

  return (
    <Autocomplete
      id={autocompleteId}
      options={options}
      getOptionLabel={
        getOptionLabel ? getOptionLabel : option => option[optionKey]
      }
      onHighlightChange={onHighlightChange ? onHighlightChange : null}
      onChange={onChange}
      value={value}
      {...rest}
      classes={{
        root: marginTop,
        disabled: classes.disabled,
        underline: underlineClasses,
        input: classes.input,
        popper: classes.input,
        listbox: classes.input
      }}
      renderInput={params => (
        <StyledTextField
          id={id}
          {...params}
          style={{
            margin: "25px 0 0 0"
          }}
          label={labelText}
          margin="normal"
        />
      )}
    />
  );
}

CustomAutoComplete.propTypes = {
  labelText: PropTypes.node,
  labelProps: PropTypes.object,
  id: PropTypes.string,
  inputProps: PropTypes.object,
  formControlProps: PropTypes.object,
  error: PropTypes.bool,
  success: PropTypes.bool,
  rtlActive: PropTypes.bool
};
