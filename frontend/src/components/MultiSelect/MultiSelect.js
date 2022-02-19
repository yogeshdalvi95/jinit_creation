import React from "react";
import { Box, Chip } from "@material-ui/core";

import { CustomAutoComplete } from "../index.js";

const MultiSelect = (props) => {
  const { name, selected, handleChange, options, optionKey } = props;

  return (
    <CustomAutoComplete
      {...props}
      multiple
      defaultValue={selected}
      value={selected}
      labelText={name}
      onChange={handleChange}
      options={options}
      optionKey={optionKey}
      getOptionSelected={(option, value) => value.id === option.id}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip label={option[optionKey]} {...getTagProps({ index })} />
        ))
      }
      formControlProps={{
        fullWidth: true,
      }}
    />
  );
};

export default MultiSelect;
