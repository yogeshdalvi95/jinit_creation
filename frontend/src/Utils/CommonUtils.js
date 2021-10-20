import moment from "moment";

export const getInitials = name => {
  let rgx = new RegExp(/(\p{L}{1})\p{L}+/, "gu");

  let initials = [...name.matchAll(rgx)] || [];

  initials = (
    (initials.shift()?.[1] || "") + (initials.pop()?.[1] || "")
  ).toUpperCase();

  return initials;
};

export function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth()
  );
}

export const isEmptyString = val => {
  let result = !val || /^\s*$/.test(val);
  return result;
};

export const getMonthName = val => {
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
    "December"
  ];

  return monthNames[parseInt(val) - 1];
};

export const isNumeric = str => {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
};

export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};

export const plainDate = data => {
  var newDate2 = moment(data).format("MMMM Do YYYY");
  return newDate2;
};

export const dateToDDMMYYYY = data => {
  var newDate2 = moment(data).format("DD-MMM-YYYY");
  return newDate2;
};

export const getValidDate = date => {
  if (date) {
    if (new Date(date) == new Date(1970, 1, 1)) {
      return null;
    } else {
      return date;
    }
  } else {
    return null;
  }
};

export const convertNumberToAmount = num => {
  let x = num;
  x = x.toString();
  var lastThree = x.substring(x.length - 3);
  var otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers !== "") lastThree = "," + lastThree;
  var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return res;
};

export const convertNumber = (val, isAmount) => {
  let num = 0;
  if (isAmount) {
    num = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val);
  } else {
    num = new Intl.NumberFormat("en-IN", {}).format(val);
  }
  return num;
};

export function formatDate(value) {
  let date = new Date(value);
  const day = date.toLocaleString("default", { day: "2-digit" });
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.toLocaleString("default", { year: "numeric" });
  return day + "-" + month + "-" + year;
}
