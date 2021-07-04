import moment from "moment";

export const getInitials = name => {
  let rgx = new RegExp(/(\p{L}{1})\p{L}+/, "gu");

  let initials = [...name.matchAll(rgx)] || [];

  initials = (
    (initials.shift()?.[1] || "") + (initials.pop()?.[1] || "")
  ).toUpperCase();

  return initials;
};

export const isEmptyString = val => {
  let result = !val || /^\s*$/.test(val);
  return result;
};

export const isNumeric = str => {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
};

export const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};

export const plainDate = data => {
  var newDate2 = moment(data).format("MMMM Do YYYY");
  return newDate2;
};
