const _ = require("lodash");

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

function convertNumber(num) {
  return Math.round((parseFloat(num) + Number.EPSILON) * 100) / 100;
}

module.exports = {
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
};
