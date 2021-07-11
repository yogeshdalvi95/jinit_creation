/* eslint-disable no-useless-escape */
import { mapKeys } from "lodash";
/**
 * [validateInput description]
 * @param  {String || Number} value  Input's value
 * @param  {Object} inputValidations
 * @param  {String} [type='text']    Optionnal: the input's type only for email
 * @return {Array}                  Array of errors to be displayed
 */
export const validation = (value, inputValidations, type = "text") => {
  let errors = [];
  const emailRegex = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  const phonenoRegx = /^\d{10}$/;
  const noEmptySpaces = /^\s*$/;

  // handle i18n
  mapKeys(inputValidations, (validationValue, validationKey) => {
    switch (validationKey) {
      case "required":
        if (
          value === undefined ||
          value === null ||
          value.length === 0 ||
          noEmptySpaces.test(value)
        ) {
          errors.push(validationValue.message);
        }
        break;
      case "ssnvalidator":
        if (value !== null && value.length !== 0) {
          errors.push(validationValue.message);
        }
        break;
      case "validateEmailRegex":
        if (value !== null && value.length !== 0 && !emailRegex.test(value)) {
          errors.push(validationValue.message);
        }
        break;
      case "validatePasswordMinLength":
        if (value !== undefined && value.length !== 0 && value.length < 5) {
          errors.push(validationValue.message);
        }
        break;
      case "validateMobileNumber":
        if (value.length !== 0 && !phonenoRegx.test(value)) {
          errors.push(validationValue.message);
        }
        break;
      case "noEmptySpaces":
        if (!value || noEmptySpaces.test(value)) {
          errors.push(validationValue.message);
        }
        break;
      case "validateEmailPhoneRegex":
        if (
          value.length !== 0 &&
          !phonenoRegx.test(value) &&
          !emailRegex.test(value)
        ) {
          errors.push(validationValue.message);
        }
        break;
      case "validateOtp":
        //change the value and condition for length after length of otp is decided
        if (value.length !== 0 && value.length !== validationValue.value) {
          errors.push(validationValue.message);
        }
        break;
      case "validateOtpForForgotPassword":
        //change the value and condition for length after length of otp is decided
        if (value.length !== 0 && value.length < validationValue.value) {
          errors.push(validationValue.message);
        }
        break;
      default:
        errors = [];
    }
  });

  if (type === "email" && !emailRegex.test(value)) {
    errors.push("Not an email");
  }

  return errors;
};
