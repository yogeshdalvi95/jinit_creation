const uploadPermissions = ["upload"];

const FRANCHISE = [
  {
    franchise_name: "PFC",
    schooling: [
      "Ph.D or Advanced Professional Degree",
      "Master's Degree",
      "Bachelor's Degree",
      "Associate Degree",
      "High School Graduate",
      "College Senior/Graduate",
      "College Junior",
      "College Sophomore",
      "College Freshman",
      "1 Grade",
      "2 Grade",
      "3 Grade",
      "4 Grade",
      "5 Grade",
      "6 Grade",
      "7 Grade",
      "8 Grade",
    ],

    marital_status: ["Married", "Single", "Divorced", "Unknown"],

    countries: [
      "United Arab Emirates (‫الإمارات العربية المتحدة‬‎)",

      "United States",

      "Canada",

      "Afghanistan (‫افغانستان‬‎)",

      "Albania (Shqipëri)",

      "Algeria (‫الجزائر‬‎)",

      "American Samoa",

      "Andorra",

      "Angola",

      "Anguilla",

      "Antigua and Barbuda",

      "Argentina",

      "Armenia (Հայաստան)",

      "Aruba",

      "Australia",

      "Austria (Österreich)",

      "Azerbaijan (Azərbaycan)",

      "Bahamas",

      "Bahrain (‫البحرين‬‎)",

      "Bangladesh (বাংলাদেশ)",

      "Barbados",

      "Belarus (Беларусь)",

      "Belgium (België)",

      "Belize",

      "Benin (Bénin)",

      "Bermuda",

      "Bhutan (འབྲུག)",

      "Bolivia",

      "Bosnia and Herzegovina (Босна и Херцеговина)",

      "Botswana",

      "Brazil (Brasil)",

      "British Indian Ocean Territory",

      "British Virgin Islands",

      "Brunei",

      "Bulgaria (България)",

      "Burkina Faso",

      "Burundi (Uburundi)",

      "Cambodia (កម្ពុជា)",

      "Cameroon (Cameroun)",

      "Canada",

      "Cape Verde (Kabu Verdi)",

      "Caribbean Netherlands",

      "Cayman Islands",

      "Central African Republic (République centrafricaine)",

      "Chad (Tchad)",

      "Chile",

      "China (中国)",

      "Christmas Island",

      "Cocos (Keeling) Islands",

      "Colombia",

      "Comoros (‫جزر القمر‬‎)",

      "Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)",

      "Congo (Republic) (Congo-Brazzaville)",

      "Cook Islands",

      "Costa Rica",

      "Côte d’Ivoire",

      "Croatia (Hrvatska)",

      "Cuba",

      "Curaçao",

      "Cyprus (Κύπρος)",

      "Czech Republic (Česká republika)",

      "Denmark (Danmark)",

      "Djibouti",

      "Dominica",

      "Dominican Republic (República Dominicana)",

      "Ecuador",

      "Egypt (‫مصر‬‎)",

      "El Salvador",

      "Equatorial Guinea (Guinea Ecuatorial)",

      "Eritrea",

      "Estonia (Eesti)",

      "Ethiopia",

      "Falkland Islands (Islas Malvinas)",

      "Faroe Islands (Føroyar)",

      "Fiji",

      "Finland (Suomi)",

      "France",

      "French Guiana (Guyane française)",

      "French Polynesia (Polynésie française)",

      "Gabon",

      "Gambia",

      "Georgia (საქართველო)",

      "Germany (Deutschland)",

      "Ghana (Gaana)",

      "Gibraltar",

      "Greece (Ελλάδα)",

      "Greenland (Kalaallit Nunaat)",

      "Grenada",

      "Guadeloupe",

      "Guam",

      "Guatemala",

      "Guernsey",

      "Guinea (Guinée)",

      "Guinea-Bissau (Guiné Bissau)",

      "Guyana",

      "Haiti",

      "Honduras",

      "Hong Kong (香港)",

      "Hungary (Magyarország)",

      "Iceland (Ísland)",

      "India (भारत)",

      "Indonesia",

      "Iran (‫ایران‬‎)",

      "Iraq (‫العراق‬‎)",

      "Ireland",

      "Isle of Man",

      "Israel (‫ישראל‬‎)",

      "Italy (Italia)",

      "Jamaica",

      "Japan (日本)",

      "Jersey",

      "Jordan (‫الأردن‬‎)",

      "Kazakhstan (Казахстан)",

      "Kenya",

      "Kiribati",

      "Kosovo",

      "Kuwait (‫الكويت‬‎)",

      "Kyrgyzstan (Кыргызстан)",

      "Laos (ລາວ)",

      "Latvia (Latvija)",

      "Lebanon (‫لبنان‬‎)",

      "Lesotho",

      "Liberia",

      "Libya (‫ليبيا‬‎)",

      "Liechtenstein",

      "Lithuania (Lietuva)",

      "Luxembourg",

      "Macau (澳門)",

      "Macedonia (FYROM) (Македонија)",

      "Madagascar (Madagasikara)",

      "Malawi",

      "Malaysia",

      "Maldives",

      "Mali",

      "Malta",

      "Marshall Islands",

      "Martinique",

      "Mauritania (‫موريتانيا‬‎)",

      "Mauritius (Moris)",

      "Mayotte",

      "Mexico (México)",

      "Micronesia",

      "Moldova (Republica Moldova)",

      "Monaco",

      "Mongolia (Монгол)",

      "Montenegro (Crna Gora)",

      "Montserrat",

      "Morocco (‫المغرب‬‎)",

      "Mozambique (Moçambique)",

      "Myanmar (Burma) (မြန်မာ)",

      "Namibia (Namibië)",

      "Nauru",

      "Nepal (नेपाल)",

      "Netherlands (Nederland)",

      "New Caledonia (Nouvelle-Calédonie)",

      "New Zealand",

      "Nicaragua",

      "Niger (Nijar)",

      "Nigeria",

      "Niue",

      "Norfolk Island",

      "North Korea (조선 민주주의 인민 공화국)",

      "Northern Mariana Islands",

      "Norway (Norge)",

      "Oman (‫عُمان‬‎)",

      "Pakistan (‫پاکستان‬‎)",

      "Palau",

      "Palestine (‫فلسطين‬‎)",

      "Panama (Panamá)",

      "Papua New Guinea",

      "Paraguay",

      "Peru (Perú)",

      "Philippines",

      "Poland (Polska)",

      "Portugal",

      "Puerto Rico",

      "Qatar (‫قطر‬‎)",

      "Réunion (La Réunion)",

      "Romania (România)",

      "Russia (Россия)",

      "Rwanda",

      "Saint Barthélemy",

      "Saint Helena",

      "Saint Kitts and Nevis",

      "Saint Lucia",

      "Saint Martin (Saint-Martin (partie française))",

      "Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)",

      "Saint Vincent and the Grenadines",

      "Samoa",

      "San Marino",

      "São Tomé and Príncipe (São Tomé e Príncipe)",

      "Saudi Arabia (‫المملكة العربية السعودية‬‎)",

      "Senegal (Sénégal)",

      "Serbia (Србија)",

      "Seychelles",

      "Sierra Leone",

      "Singapore",

      "Sint Maarten",

      "Slovakia (Slovensko)",

      "Slovenia (Slovenija)",

      "Solomon Islands",

      "Somalia (Soomaaliya)",

      "South Africa",

      "South Korea (대한민국)",

      "South Sudan (‫جنوب السودان‬‎)",

      "Spain (España)",

      "Sri Lanka (ශ්‍රී ලංකාව)",

      "Sudan (‫السودان‬‎)",

      "Suriname",

      "Svalbard and Jan Mayen",

      "Swaziland",

      "Sweden (Sverige)",

      "Switzerland (Schweiz)",

      "Syria (‫سوريا‬‎)",

      "Taiwan (台灣)",

      "Tajikistan",

      "Tanzania",

      "Thailand (ไทย)",

      "Timor-Leste",

      "Togo",

      "Tokelau",

      "Tonga",

      "Trinidad and Tobago",

      "Tunisia (‫تونس‬‎)",

      "Turkey (Türkiye)",

      "Turkmenistan",

      "Turks and Caicos Islands",

      "Tuvalu",

      "U.S. Virgin Islands",

      "Uganda",

      "Ukraine (Україна)",

      "United Arab Emirates (‫الإمارات العربية المتحدة‬‎)",

      "United Kingdom",

      "United States",

      "Uruguay",

      "Uzbekistan (Oʻzbekiston)",

      "Vanuatu",

      "Vatican City (Città del Vaticano)",

      "Venezuela",

      "Vietnam (Việt Nam)",

      "Wallis and Futuna (Wallis-et-Futuna)",

      "Western Sahara (‫الصحراء الغربية‬‎)",

      "Yemen (‫اليمن‬‎)",

      "Zambia",

      "Zimbabwe",

      "Åland Islands",
    ],

    documentPermission: [
      {
        allDocuments: {
          "Give All": { view: false, download: false },
          "Give All With Insert": { view: true, download: true },
          "All Reports": { view: true, download: true },
          "Exchange Break Down For All Meals Week": {
            view: true,
            download: true,
          },
          "Shopping List": { view: true, download: true },
          "Menu For Week List": { view: true, download: true },
          "Actual Food For All Meal": { view: true, download: true },
          "Supplement Reports": { view: true, download: true },
          "Exercise Reports": { view: true, download: true },
          "Body Mass Reports": { view: true, download: true },
          "Measurements Reports": { view: true, download: true },
        },
      },
    ],

    gender: ["Male", "Female", "Other"],
    relation: [
      "Wife",
      "Husband",
      "Mother",
      "Father",
      "Sister",
      "Brother",
      "Friend",
      "Relative",
    ],
    userTags: ["Athlete", "Pro-Athlete", "VIP", "VVIP"],
    sizeWeight: [
      "Items",
      "Ounces",
      "Grams",
      "Cups",
      "Slices",
      "Halves",
      "Squares",
      "Tablespoons",
      "Medium",
      "Small",
      "Large",
      "2' Square",
      "4' Diameter",
      "6' Diameter",
      "Lg. Biscuit",
      "Clove",
      "25g Bar",
      "Teaspoons",
    ],
    category: [
      {
        name: "Milk",
        sub_categories: [
          {
            name: "Yoghurt",
          },
          {
            name: "Cheese",
          },
        ],
      },
      {
        name: "Vegetable",
        sub_categories: [{ name: "Vegetable" }],
      },
      {
        name: "Fruit",
        sub_categories: [{ name: "Fruit" }],
      },
      {
        name: "Bread",
        sub_categories: [{ name: "Beans" }, { name: "Cereals" }],
      },
      {
        name: "Meat",
        sub_categories: [{ name: "Beefs" }, { name: "Eggs" }],
      },
      {
        name: "Fat",
        sub_categories: [{ name: "Nuts&Seeds" }, { name: "Oils" }],
      },
    ],
    muscleNames: ["Off"],
  },
];

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
        name: "individual-kachha-purchase",
        action: ["find", "create", "update", "findOne", "update", "delete"],
      },
      {
        name: "individual-pakka-purchase",
        action: ["find", "create", "update", "findOne", "update", "delete"],
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
        action: [],
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
        action: ["find", "create", "update", "findOne", "update", "delete"],
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
        action: ["find", "create", "update", "findOne", "update", "delete"],
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
        action: ["find", "create", "update", "findOne", "update", "delete"],
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
        action: ["find", "create", "update", "findOne", "update", "delete"],
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
  FRANCHISE,
};
