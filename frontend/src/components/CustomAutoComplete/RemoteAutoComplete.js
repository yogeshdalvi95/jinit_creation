import { FormHelperText } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { providerForGet } from "../../api";
import { frontendServerUrl } from "../../constants";
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
      borderBottom: `1px solid ${props.isError ? "red" : "#D2D2D2"}`,
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none",
      borderRadius: "0px",
      boxShadow: "none",
      // overwrittes hover style
      "&:hover": {
        borderBottom: `2px solid ${props.isError ? "red" : "#a56863"}`,
      },
      "&:click": {
        borderBottom: `2px solid ${props.isError ? "red" : "#a56863"}`,
      },
    }),
    input: (provided, state) => ({
      ...provided,
      fontSize: "0.9rem",
    }),
    menu: (provided, state) => ({
      ...provided,
      zIndex: 100000000,
      fontSize: "0.8rem",
    }),
    placeholder: (base, state) => ({
      ...base,
      top: "64%",
      fontSize: "0.9rem",
      color: "#AAAAAA !important",
    }),
    singleValue: (provided, state) => ({
      ...provided,
      fontSize: "0.9rem",
      top: "64%",
    }),
  };

  const generateRawMaterialLabel = useCallback(
    (d) => {
      return `${d[props.searchString]}/ Category:- ${
        d.category.name
      }/ Department:- ${d.department.name}`;
    },
    [props.searchString]
  );

  useEffect(() => {
    const getData = async (id) => {
      console.log("getData => ", id);
      await providerForGet(props.apiName + "/" + id, {}, Auth.getToken())
        .then((res) => {
          setSelectedValue({
            label: props.isRawMaterial
              ? generateRawMaterialLabel(res.data)
              : res.data[props.searchString],
            value: res.data.id,
            allData: res.data,
          });
        })
        .catch((err) => {});
    };

    let selectedData = props.selectedValue;
    console.log("selectedData => ", selectedData);
    if (typeof selectedData === "number" || typeof selectedData === "string") {
      getData(selectedData);
    } else if (typeof selectedData === "object") {
      if (
        selectedData &&
        selectedData.value &&
        (!selectedData.label || isEmptyString(selectedData.label))
      ) {
        getData(selectedData.value);
      } else {
        setSelectedValue(selectedData);
      }
    } else {
      setSelectedValue(selectedData);
    }
  }, [props, generateRawMaterialLabel]);

  const filterData = (data) => {
    return data.map((d) => {
      let label = "";
      if (props.isRawMaterial) {
        label = generateRawMaterialLabel(d);
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
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              if (response.status === 401) {
                Auth.clearAppStorage();
                window.location.href = `${frontendServerUrl}/login`;
              }
            }
          })
          .then((result) => {
            resolve(filterData(result.data));
          })
          .catch((error) => {
            throw error;
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
        isDisabled={props.disabled}
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
