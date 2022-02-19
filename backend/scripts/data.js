const uploadPermissions = ["upload"];

const PUBLIC_ROUTES = {
  controllers: [
    {
      name: "auth",
      type: "users-permissions",
      action: [
        "callback",
        "connect",
        "emailconfirmation",
        "forgotpassword",
        "register",
        "resetpassword",
        "sendemailconfirmation",
      ],
    },
  ],
};

const ROLES = {
  "Super Admin": {
    controllers: [
      {
        name: "department",
        action: [],
      },
      {
        name: "designs",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "designs-and-materials",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "individual-kachha-purchase",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "individual-pakka-purchase",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },

      {
        name: "category",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "color",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "party",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "check_duplicate_party",
        ],
      },
      {
        name: "sale-return",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "sales",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "getexcelsheetforexport",
        ],
      },

      {
        name: "raw-material-and-quantity-for-ready-material",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "updatequantity",
          "addrawmaterialtoreadymaterial",
          "deleterawmaterialfromreadymaterial",
        ],
      },
      {
        name: "monthly-sheet",
        action: [],
      },
      {
        name: "goods-return",
        action: [],
      },
      {
        name: "orders",
        action: [],
      },
      {
        name: "purchases",
        action: [],
      },
      {
        name: "raw-material",
        action: [],
      },
      {
        name: "ready-material",
        action: ["changeiscolordependent"],
      },
      {
        name: "seller",
        action: ["find"],
      },
      {
        name: "units",
        action: [],
      },
      {
        name: "auth",
        type: "users-permissions",
        action: ["getalladmins", "getallstaff"],
      },
    ],
    grantAllPermissions: true,
  },
  Admin: {
    controllers: [
      {
        name: "designs",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "designs-and-materials",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "category",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "color",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "party",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "check_duplicate_party",
        ],
      },
      {
        name: "sale-return",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "sales",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "getexcelsheetforexport",
        ],
      },
      {
        name: "department",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "individual-kachha-purchase",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "individual-pakka-purchase",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "raw-material-and-quantity-for-ready-material",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "updatequantity",
          "addrawmaterialtoreadymaterial",
          "deleterawmaterialfromreadymaterial",
        ],
      },
      {
        name: "goods-return",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "monthly-sheet",
        action: [
          "find",
          "getlatestentries",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "addupdateentries",
          "getselecteddata",
        ],
      },
      {
        name: "orders",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "check_availibility",
          "getdepartmentsheet",
          "createupdatedepartmentsheet",
        ],
      },
      {
        name: "purchases",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "raw-material",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "getrawmaterialnameforautocomplete",
        ],
      },
      {
        name: "ready-material",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "changeiscolordependent",
        ],
      },
      {
        name: "seller",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "check_duplicate_seller",
          "update",
          "delete",
          "getsellernameforautocomplete",
        ],
      },
      {
        name: "units",
        action: ["find", "create", "update", "findOne"],
      },
      {
        name: "user",
        type: "users-permissions",
        action: ["me"],
      },
      {
        name: "auth",
        type: "users-permissions",
        action: ["getalladmins", "getallstaff"],
      },
    ],
    grantAllPermissions: false,
  },
  Staff: {
    controllers: [
      {
        name: "designs",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "designs-and-materials",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "category",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "color",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "party",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "check_duplicate_party",
        ],
      },
      {
        name: "sale-return",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "sales",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "getexcelsheetforexport",
        ],
      },
      {
        name: "department",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "individual-kachha-purchase",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "individual-pakka-purchase",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "raw-material-and-quantity-for-ready-material",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "updatequantity",
          "addrawmaterialtoreadymaterial",
          "deleterawmaterialfromreadymaterial",
        ],
      },
      {
        name: "goods-return",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "monthly-sheet",
        action: [
          "find",
          "getlatestentries",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "addupdateentries",
          "getselecteddata",
        ],
      },
      {
        name: "orders",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "check_availibility",
          "getdepartmentsheet",
          "createupdatedepartmentsheet",
        ],
      },
      {
        name: "purchases",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "raw-material",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "getrawmaterialnameforautocomplete",
        ],
      },
      {
        name: "ready-material",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "update",
          "delete",
          "changeiscolordependent",
        ],
      },
      {
        name: "seller",
        action: [
          "find",
          "create",
          "update",
          "findOne",
          "check_duplicate_seller",
          "update",
          "delete",
          "getsellernameforautocomplete",
        ],
      },
      {
        name: "units",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "user",
        type: "users-permissions",
        action: ["me"],
      },
      {
        name: "auth",
        type: "users-permissions",
        action: ["getalladmins", "getallstaff"],
      },
    ],
    grantAllPermissions: false,
  },
};

module.exports = {
  uploadPermissions,
  ROLES,
  PUBLIC_ROUTES,
};
