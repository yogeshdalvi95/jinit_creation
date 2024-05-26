import moment from "moment";
import { frontendServerUrl } from "../constants";
import {
  DashboardAdminRoutes,
  DashboardStaffRoutes,
  SuperAdminDashboardRoutes,
} from "../routes/AdminRoutes";

export const getInitials = (name) => {
  let rgx = new RegExp(/(\p{L}{1})\p{L}+/, "gu");

  let initials = [...name.matchAll(rgx)] || [];

  initials = (
    (initials.shift()?.[1] || "") + (initials.pop()?.[1] || "")
  ).toUpperCase();

  return initials;
};

export const whiteColorID = "white (plain colour)";

export function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth()
  );
}

export const isEmptyString = (val) => {
  let result = !val || /^\s*$/.test(val);
  return result;
};

export const removeAllQueryParams = (filter, prefix) => {
  let obj = Object.keys(filter).map((d) => `${prefix}${d}`);
  removeParamFromUrl(obj);
};

export const setAllQueryParamsFromUrl = (filterObject, filterKeys, prefix) => {
  const queryParams = new URLSearchParams(window.location.search);
  let params = Object.fromEntries(queryParams);
  filterKeys.forEach((fk) => {
    let filterName = `${prefix}${fk.name}`;
    let value = params[filterName];
    if (queryParams.has(filterName)) {
      if (fk.type === "string") {
        filterObject = {
          ...filterObject,
          [fk.name]: value,
        };
      } else if (fk.type === "number") {
        if (validateNumber(value)) {
          filterObject = {
            ...filterObject,
            [fk.name]: value,
          };
        }
      } else if (fk.type === "start_date") {
        let sd = new Date(value);
        if (value && !isEmptyString(value) && checkIFValidDateObject(sd)) {
          filterObject = {
            ...filterObject,
            [fk.name]: sd.toISOString(),
          };
        }
      } else if (fk.type === "end_date") {
        let ed = new Date(value);
        if (value && !isEmptyString(value) && checkIFValidDateObject(ed)) {
          filterObject = {
            ...filterObject,
            [fk.name]: moment(ed.toISOString())
              .endOf("day")
              .format("YYYY-MM-DDT23:59:59.999Z"),
          };
        }
      }
      if (fk.isCallBack) {
        fk.callBack(value);
      }
    }
  });

  return filterObject;
};

export const financialYearValues = () => {
  let arr = [];
  for (let i = 2022; i < new Date().getFullYear() + 1; i++) {
    arr = [
      ...arr,
      {
        name: `April ${i} - March ${i + 1}`,
        value: {
          startYear: i,
          startMonth: 3,
          endYear: i + 1,
          endMonth: 3,
          value: `April ${i} - March ${i + 1}`,
        },
      },
    ];
  }
  return arr;
};

export const getFinancialYear = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  let year = null;
  let year1 = null;
  if (currentMonth > 2) {
    /** if current month > March */
    year = currentDate.getFullYear() - 2;
    year1 = currentDate.getFullYear() + 1;
  } else if (currentMonth < 3) {
    /** if current month < April */
    year = currentDate.getFullYear() - 3;
    year1 = currentDate.getFullYear();
  }
  return {
    minDate: new Date(year, 3, 1),
    maxDate: new Date(year1, 3, 0),
  };
};

export const setAllQueryParamsForSearch = (filter, prefix, filterKeys) => {
  const queryParams = new URLSearchParams(window.location.search);
  /** First remove existing */
  let existingParams = Object.fromEntries(queryParams);
  if (existingParams) {
    filterKeys.forEach((p) => {
      if (queryParams.has(`${prefix}${p.name}`)) {
        queryParams.delete(`${prefix}${p.name}`);
      }
    });
  }

  let params = Object.fromEntries(queryParams);
  Object.keys(filter).forEach((d) => {
    params = {
      ...params,
      [`${prefix}${d}`]: filter[d],
    };
  });
  let allParams = new URLSearchParams(params).toString();
  console.log("params => ", params);
  window.history.pushState(
    "",
    "",
    `${frontendServerUrl}${window.location.pathname}${
      isEmptyString(allParams) ? "" : `?${allParams}`
    }`
  );
};

export const removeParamFromUrl = (param) => {
  const queryParams = new URLSearchParams(window.location.search);
  if (
    typeof param === "object" &&
    Object.prototype.toString.call(param) === "[object Array]"
  ) {
    param.forEach((p) => {
      if (queryParams.has(p)) {
        queryParams.delete(p);
      }
    });
  } else if (typeof param === "string") {
    if (queryParams.has(param)) {
      queryParams.delete(param);
    }
  }
  let allParams = new URLSearchParams(queryParams).toString();
  window.history.pushState(
    "",
    "",
    `${frontendServerUrl}${window.location.pathname}${
      isEmptyString(allParams) ? "" : `?${allParams}`
    }`
  );
};

export const addQueryParam = (param, value) => {
  const queryParams = new URLSearchParams(window.location.search);
  let params = Object.fromEntries(queryParams);
  params = {
    ...params,
    [param]: value,
  };

  window.history.pushState(
    "",
    "",
    `${frontendServerUrl}${window.location.pathname}?${new URLSearchParams(
      params
    ).toString()}`
  );
};

export const getMonthName = (val) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return monthNames[parseInt(val) - 1];
};

export const isNumeric = (str) => {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
};

export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};

export const plainDate = (data) => {
  var newDate2 = moment(data).format("DD-MM-YYYY");
  return newDate2;
};

export const dateToDDMMYYYY = (data) => {
  var newDate2 = moment(data).format("DD-MMM-YYYY");
  return newDate2;
};

export const getValidDate = (date) => {
  if (date) {
    if (new Date(date) === new Date(1970, 1, 1)) {
      return null;
    } else {
      return date;
    }
  } else {
    return null;
  }
};

export const convertNumberToAmount = (num) => {
  let x = num;
  x = x.toString();
  var lastThree = x.substring(x.length - 3);
  var otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers !== "") lastThree = "," + lastThree;
  var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return res;
};

export const convertNumber = (
  val,
  isAmount,
  addCustomPrefix = false,
  prefix
) => {
  let num = 0;
  val = parseFloat(validateNumber(val).toFixed(2));
  if (isAmount) {
    num = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);
    if (addCustomPrefix) {
      num = num + prefix;
    } else {
      num = num + " /-";
    }
  } else {
    num = new Intl.NumberFormat("en-IN", {}).format(val);
  }
  return num;
};

//s2ab method
export function s2ab(s) {
  var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
  var view = new Uint8Array(buf); //create uint8array as viewer
  for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
  return buf;
}

export function formatDate(value) {
  let date = new Date(value);
  const day = date.toLocaleString("default", { day: "2-digit" });
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.toLocaleString("default", { year: "numeric" });
  return day + "-" + month + "-" + year;
}

export function getRoutesOnLogin(auth) {
  let routes = [];
  if (auth.getUserInfo().role.name === process.env.REACT_APP_SUPER_ADMIN) {
    routes = SuperAdminDashboardRoutes;
  } else if (auth.getUserInfo().role.name === process.env.REACT_APP_ADMIN) {
    routes = DashboardAdminRoutes;
  } else {
    routes = DashboardStaffRoutes;
  }
  return routes;
}

export function validateNumber(num) {
  if (isNaN(parseFloat(num))) {
    return 0;
  } else {
    return parseFloat(num);
  }
}

export function checkIfDateFallsInAcceptableRange(check) {
  let previousDate = new Date(new Date().setMonth(new Date().getMonth() - 3));
  let fromDate = new Date(
    previousDate.getFullYear(),
    previousDate.getMonth(),
    1
  );
  let toDate = new Date();
  var cDate;
  cDate = Date.parse(check);

  if (cDate <= toDate && cDate >= fromDate) {
    return true;
  } else {
    return false;
  }
}

export function getMinDate() {
  let previousDate = new Date(new Date().setMonth(new Date().getMonth() - 3));
  let fromDate = new Date(
    previousDate.getFullYear(),
    previousDate.getMonth(),
    1
  );
  return fromDate;
}

export function checkIFValidDateObject(d) {
  let isValid = false;
  if (Object.prototype.toString.call(d) === "[object Date]") {
    isValid = true;
    if (isNaN(d)) {
      isValid = false;
    } else {
      isValid = true;
    }
  } else {
    isValid = false;
  }
  return isValid;
}

export function getMonthDifference(startDate, endDate) {
  return (
    endDate.getMonth() -
    startDate.getMonth() +
    12 * (endDate.getFullYear() - startDate.getFullYear())
  );
}

export function getMonth(m_no) {
  let month = ""; //Create a local variable to hold the string
  switch (m_no) {
    case 0:
      month = "January";
      break;
    case 1:
      month = "February";
      break;
    case 2:
      month = "March";
      break;
    case 3:
      month = "April";
      break;
    case 4:
      month = "May";
      break;
    case 5:
      month = "June";
      break;
    case 6:
      month = "July";
      break;
    case 7:
      month = "August";
      break;
    case 8:
      month = "September";
      break;
    case 9:
      month = "October";
      break;
    case 10:
      month = "November";
      break;
    case 11:
      month = "December";
      break;
    default:
      month = "Invalid month";
  }
  return month;
}
