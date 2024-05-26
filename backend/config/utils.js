const _ = require("lodash");
const XLSX = require("xlsx");
const fs = require("fs");
var path = require("path");
const puppeteer = require("puppeteer");
const {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
  grayscale,
} = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

const whiteColorID = "white (plain colour)";

function getMonth(m_no) {
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

function getRequestParams(params) {
  const page = params.page ? parseInt(params.page) : 1;
  let pageSize = 10;
  if (params.pageSize) {
    if (params.pageSize == "-1") {
      pageSize = "-1";
    } else {
      pageSize = parseInt(params.pageSize);
    }
  } else {
    pageSize = 10;
  }
  const query = _.omit(params, ["page", "pageSize"]);
  return { page, query, pageSize };
}

function getPaginatedResponse(response) {
  return {
    result: response ? response.toJSON() : null,
    ...response.pagination,
  };
}

function getResponse(response) {
  return {
    result: response ? response.toJSON() : null,
  };
}

function getFindOneResponse(response) {
  return {
    result: response,
  };
}

function getTotalPLuginRecord(model, plugin) {
  return strapi.query(model, plugin).count();
}

function getTotalRecords(model) {
  return strapi.query(model).count();
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const getNumberOfPages = (list, numberPerPage) => {
  return Math.ceil(list.length / numberPerPage);
};

/**
 *
 * @param {*} list // Resultset of query
 * @param {*} currentPage // Which page data to fetch
 * @param {*} numberPerPage // How many number of rows to return
 *
 * @returns {Object}
 */
function paginate(list, currentPage, numberPerPage) {
  const totalRecords = list ? list.length : 0;
  numberPerPage = numberPerPage === -1 ? totalRecords : numberPerPage;

  const start = (currentPage - 1) * numberPerPage;
  const end = start + numberPerPage;

  const totalPages = getNumberOfPages(list, numberPerPage);

  const result = list.slice(start, end);

  return {
    result,
    pagination: {
      page: currentPage,
      pageSize: numberPerPage,
      rowCount: totalRecords,
      pageCount: totalPages,
    },
  };
}

function getErrorResponse(response) {
  return {
    result: {
      message: response,
    },
  };
}

function sort(data, sort) {
  let sortByFields = [],
    orderByFields = [];

  sort.forEach((s) => {
    sortByFields.push(s.field);
    orderByFields.push(s.order);
  });

  let result;
  if (sortByFields.length && orderByFields.length) {
    result = _.orderBy(data, sortByFields, orderByFields);
  } else {
    result = data;
  }
  return result;
}

function getDateInYYYYMMDD(date) {
  var today = date;
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + "-" + mm + "-" + dd;
  return today;
}

function getDateInMMDDYYYY(date) {
  var today = new Date(date);
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = `${dd}-${mm}-${yyyy}`;
  return today;
}

const convertNumber = (val, isAmount, addCustomPrefix = false, prefix) => {
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

function checkEmpty(obj) {
  return Object.keys(obj).length ? false : true;
}

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function isEmptyString(val) {
  let result = !val || /^\s*$/.test(val);
  return result;
}

function utilityFunctionForGettingBytesExcelData(data, sheet_name) {
  var wb = XLSX.utils.book_new();
  wb.SheetNames.push(sheet_name);
  var ws = XLSX.utils.json_to_sheet(data);
  wb.Sheets[sheet_name] = ws;
  var wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  return wbout;
}

function utilityFunctionForGettingBytesExcelDataForMultipleSheets(data) {
  var wb = XLSX.utils.book_new();
  let sheetNames = Object.keys(data);
  sheetNames.forEach((sn) => {
    wb.SheetNames.push(sn);
    var ws = XLSX.utils.json_to_sheet(data[sn]);
    wb.Sheets[sn] = ws;
  });
  var wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  return wbout;
}

function roundNumberTo2digit(num) {
  if (!isNaN(parseFloat(num))) {
    return parseFloat(parseFloat(num).toFixed(2));
  } else {
    return 0.0;
  }
}

function validateNumber(num) {
  if (isNaN(parseFloat(num))) {
    return 0;
  } else {
    return parseFloat(num);
  }
}

function checkIfDateFallsInCurrentMonth(date) {
  let dateToCheck = new Date(date);
  if (dateToCheck == "Invalid Date") {
    return false;
  } else {
    let monthToCheck = dateToCheck.getMonth() + 1;
    let yearToCheck = dateToCheck.getFullYear();
    let currentMonth = new Date().getMonth() + 1;
    let currentYear = new Date().getFullYear();
    if (monthToCheck == currentMonth && yearToCheck == currentYear) {
      return true;
    } else {
      return false;
    }
  }
}

function base64_encode(file) {
  let bitmap = null;
  try {
    bitmap = fs.readFileSync(file);
  } catch (error) {
    bitmap = fs.readFileSync(
      path.resolve(__dirname, `../assets/images/nodata.jpg`)
    );
  }
  return new Buffer.from(bitmap).toString("base64");
}

const noDataImg =
  "data:image/png;base64," +
  base64_encode(path.resolve(__dirname, `../assets/images/nodata.jpg`));

const logo =
  "data:image/png;base64," +
  base64_encode(path.resolve(__dirname, `../assets/images/logo.png`));

const pdfMargin = 45;

const generatePDF = async (
  report_name,
  html,
  landscape = false,
  format = "A4",
  showPageNumber = true
) => {
  var content = fs.readFileSync(
    path.resolve(__dirname, "../assets/files/pdf_template.html"),
    "utf-8"
  );

  var contentVal = content.replace(/{pdfMargin}/g, pdfMargin);

  /** pdf margin */
  contentVal = contentVal.replace(/{report_name}/g, report_name);
  contentVal = contentVal.replace(/{htmlTag}/g, html);
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disabled-setupid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(contentVal);
  const footer = `<span style="font-size: 10px; margin-right : auto ;margin-left:35px;"> Dombivli West </span>
                    ${
                      showPageNumber
                        ? `<span style="font-size: 10px; margin-left : auto ;margin-right:35px;"> <span class="pageNumber"></span> </span> `
                        : ``
                    }
                  `;

  // const buffer = await page.pdf({
  //   printBackground: false,
  //   displayHeaderFooter: true,
  //   margin: {
  //     left: "0px",
  //     top: `90px`,
  //     right: "0px",
  //     bottom: "90px",
  //   },
  //   headerTemplate: `<span><img src = '${logo}' width = '60' style='margin-left:35px;'/></span>`,
  //   footerTemplate:
  //     '3432524fsdfs <span style="font-size: 10px; margin-left:auto; margin-right:35px;"> <span class="pageNumber"></span></span></span>',
  // });

  const buffer = await page.pdf({
    landscape: landscape,
    format: format,
    printBackground: true,
    displayHeaderFooter: true,
    margin: {
      left: "0px",
      top: `90px`,
      right: "0px",
      bottom: "90px",
    },
    headerTemplate: `<span>
                      <img src = '${logo}' width = '60' style='margin-left:35px;'/>
                    </span>`,
    footerTemplate: footer,
  });
  await browser.close();
  return buffer;
};

function getMonthDifference(startDate, endDate) {
  return (
    endDate.getMonth() -
    startDate.getMonth() +
    12 * (endDate.getFullYear() - startDate.getFullYear())
  );
}

const getFinancialYear = () => {
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

module.exports = {
  roundNumberTo2digit,
  getRequestParams,
  getPaginatedResponse,
  getResponse,
  getFindOneResponse,
  getTotalRecords,
  getTotalPLuginRecord,
  asyncForEach,
  paginate,
  getErrorResponse,
  sort,
  merge: _.merge,
  lowerCase: _.lowerCase,
  head: _.head,
  last: _.last,
  getDateInYYYYMMDD,
  convertNumber,
  checkEmpty,
  daysInMonth,
  isEmptyString,
  utilityFunctionForGettingBytesExcelData,
  getDateInMMDDYYYY,
  validateNumber,
  checkIfDateFallsInCurrentMonth,
  utilityFunctionForGettingBytesExcelDataForMultipleSheets,
  noDataImg,
  pdfMargin,
  generatePDF,
  logo,
  base64_encode,
  getMonthDifference,
  getMonth,
  whiteColorID,
  getFinancialYear,
};
