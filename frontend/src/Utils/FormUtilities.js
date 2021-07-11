import { validation as validateInput } from "./Validation";

/** Function to check if required fields are present in the set values of form*/
export const checkAllKeysPresent = (objectWithKeys, schema) => {
  let areFieldsValid = true;
  let checkIfFieldsValid = 0;
  Object.keys(schema).map(field => {
    if (schema[field]["required"] && !objectWithKeys.hasOwnProperty(field)) {
      checkIfFieldsValid += 1;
    }
    return null;
  });

  /** Required fields are present in schema bt not in the object to check */
  if (checkIfFieldsValid) {
    areFieldsValid = false;
  }
  return areFieldsValid;
};

/** Function to check if required fields are not present then this returns all the requiured fields*/
export const getListOfKeysNotPresent = (objectWithKeys, schema) => {
  Object.keys(schema).map(field => {
    if (schema[field]["required"] && !objectWithKeys.hasOwnProperty(field)) {
      objectWithKeys = {
        ...objectWithKeys,
        [field]: ""
      };
    }
    return null;
  });
  return objectWithKeys;
};

/** returns true if json is empty */
export const checkEmpty = obj => {
  return Object.keys(obj).length ? false : true;
};

/** Gives yor error message */
export const showError = (identifier, errorArray) => {
  let finalErrorArray = [];
  finalErrorArray = errorArray[identifier].map(error => {
    return error + " ";
  });
  return finalErrorArray;
};

/** returns errors in form 
 * Accepts 5 parameters.
 * 1: the object to check i.e formState.values
 * 2: The schema which contains all objects to check.
 * 3: Is date present for date validation.
 * 4: dateFrom: schema name for date from/ start date
 * 5: dateTo: schema name for date to/ end date
 * 
 * Sample structure to call
 * formState.errors = formUtilities.setErrors(
        formState.values,
        EventSchema,
        true,
        dateFrom,
        dateTo
      );
*/
export const setErrors = (objectToCheck, schema) => {
  let formErrors = {};
  const noEmptySpaces = /^\s*$/;
  Object.keys(schema).map(field => {
    if (schema[field]["required"]) {
      let validations = {};
      if (schema[field]["validations"]) {
        validations = schema[field]["validations"];
      } else {
        let label = schema[field]["label"]
          ? schema[field]["label"] + " is required"
          : "required*";
        validations = {
          required: {
            value: "true",
            message: label
          }
        };
      }
      const errors = validateInput(
        objectToCheck.hasOwnProperty(field) ? objectToCheck[field] : "",
        validations
      );
      if (errors.length) {
        formErrors = {
          ...formErrors,
          [field]: errors
        };
      }
    } else if (
      schema[field]["validations"] &&
      Object.keys(schema[field]["validations"]).length &&
      !noEmptySpaces.test(objectToCheck[field]) &&
      objectToCheck.hasOwnProperty(field)
    ) {
      const errors = validateInput(
        objectToCheck.hasOwnProperty(field),
        schema[field]["validations"]
      );
      if (errors.length) {
        formErrors = {
          ...formErrors,
          [field]: errors
        };
      }
    }
    return null;
  });
  return formErrors;
};

export const hasError = (field, object) => {
  if (object.hasOwnProperty(field)) {
    return true;
  } else {
    return false;
  }
};
