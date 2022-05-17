import { FormHelperText } from "@mui/material";
import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { providerForGet } from "../../api";
import { backend_sellers } from "../../constants";
import { isEmptyString } from "../../Utils";
import Auth from "../Auth";

const RemoteAutoComplete = (props) => {
  const [selectedValue, setSelectedValue] = useState(props.selectedValue);
  const handleInputChange = (newValue) => {
    const inputValue = newValue.replace(/\W/g, "");
    return inputValue;
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      // state.isFocused can display different borderColor if you need it
      border: `2px solid ${props.isError ? "red" : "#ddd"}`,
      boxShadow: "none",
      // overwrittes hover style
      "&:hover": {
        border: `2px solid ${props.isError ? "red" : "#9c27b0"}`,
      },
      "&:click": {
        border: `2px solid ${props.isError ? "red" : "#9c27b0"}`,
      },
    }),
    menu: (provided, state) => ({
      ...provided,
      zIndex: 100000000,
    }),
  };

  useEffect(() => {
    let selectedData = props.selectedValue;
    if (
      selectedData &&
      selectedData.value &&
      (!selectedData.label || isEmptyString(selectedData.label))
    ) {
      getSellerDetails(selectedData.value);
    } else {
      setSelectedValue(props.selectedValue);
    }
  }, [props]);

  const getSellerDetails = async (id) => {
    await providerForGet(backend_sellers + "/" + id, {}, Auth.getToken())
      .then((res) => {
        setSelectedValue({
          label: res.data.seller_name,
          value: res.data.id,
        });
      })
      .catch((err) => {});
  };

  const filterData = (data) => {
    return data.map((d) => {
      console.log("data ", d);
      let label = "";
      if (props.isRawMaterial) {
        label = `${d[props.searchString]} -${d.size} -${d.category.name} -${
          d.department.name
        }`;
      } else {
        label = d[props.searchString];
      }
      return {
        label: label,
        value: d.id,
        allData: d,
      };
    });
  };

  const loadOptions = (inputValue) => {
    let params = {
      page: 1,
      pageSize: 30,
      [`${props.searchString}_contains`]: inputValue,
    };
    if (inputValue !== "" && !isEmptyString(inputValue)) {
      return new Promise((resolve, reject) => {
        fetch(props.apiName + "?" + new URLSearchParams(params), {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: "Bearer " + Auth.getToken(),
          },
        })
          .then((response) => response.json())
          .then((result) => {
            resolve(filterData(result.data));
          });
      });
    } else {
      return [];
    }
  };

  const handleChange = (newValue, actionMeta) => {
    props.setSelectedData(newValue);
  };

  return (
    <>
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        onInputChange={handleInputChange}
        onChange={handleChange}
        isClearable
        placeholder={props.placeholder ? props.placeholder : "Select..."}
        styles={customStyles}
        value={selectedValue}
      />
      {props.isError && (
        <FormHelperText error={props.isError}>{props.errorText}</FormHelperText>
      )}
    </>
  );
};

export default RemoteAutoComplete;
