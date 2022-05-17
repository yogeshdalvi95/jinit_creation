import React from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { FormHelperText, makeStyles } from "@material-ui/core";
import styles from "../../assets/jss/material-dashboard-react/components/customCheckBoxStyle.js";
import classNames from "classnames";
import { Radio } from "@mui/material";

const useStyles = makeStyles(styles);
export default function CustomRadioButton(props) {
  const classes = useStyles();
  const color = classNames({
    [classes.primaryColor]: !props.error,
    [classes.errorColor]: props.error,
    [classes.disabledColor]: props.disabled,
  });
  return (
    <>
      <FormControlLabel
        control={
          <Radio
            classes={{
              disabled: classes.disabled,
              input: classes.input,
              colorPrimary: color,
            }}
            checked={props.checked}
            onChange={props.onChange}
            name={props.name}
            color="primary"
            {...props}
          />
        }
        style={{
          margin: "40px 0 0 0",
        }}
        label={props.labelText}
      />
      {props.isHelperText ? (
        <FormHelperText id={props.helperTextId} error={props.error}>
          {props.helperText}
        </FormHelperText>
      ) : null}
    </>
  );
}
