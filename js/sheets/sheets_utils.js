const math = require("../calc/math_utils.js");

const { google } = require("googleapis");

const ID = "1IxjxyZ5469unCouxduEdqNvNC0YMsaqGvnJc4BJ61PI";

const auth = new google.auth.GoogleAuth({
  keyFile: "./service-account.json",
  /* -------------------------------------------------------------------------- */
  /*                               VERY IMPORTANT                               */
  /* -------------------------------------------------------------------------- */
  /* ------ scopes here is fundamental in getting some endpoints to work ------ */
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  /* -------------------------------------------------------------------------- */
});

// set auth as a global default
google.options({
  auth
});

const sheets = google.sheets("v4");

async function fetchTable() {
  return sheets.spreadsheets
    .get({
      spreadsheetId: ID
    })
    .then(({ data }) => {
      return data.sheets.map((sheet) => sheet.properties.title);
    })
    .catch((e) => {
      console.error("The API returned an error.");
      throw e;
    });
}

async function logData(product, lastPrice = "", savings = "") {
  console.group(`🏓 Logging price for ${product.item}`);

  const numericPrice = math.stringToN(product.price);

  const price_structure = [lastPrice, numericPrice, savings];

  console.log(price_structure);
  console.groupEnd();

  const config = {
    spreadsheetId: ID,
    range: `${product.item}!A1:A`,
    valueInputOption: "RAW",
    requestBody: {
      majorDimension: "ROWS",
      values: [[...price_structure, product.url, product.date]]
    }
  };

  return sheets.spreadsheets.values.append(config);
}
// async function logData(product, lastPrice = "", savings = "") {
//   let price_structure = [lastPrice, "", savings];

//   console.group(`Finding keys for ${product.item}`);
//   product.prices.forEach(([prefix, price]) => {
//     let keys = Object.keys(ORDER);
//     let which_key = keys.find((key) => prefix.toLowerCase().includes(key));
//     let where = ORDER[which_key];

//     console.log(prefix, price);

//     price_structure[where] = Number(
//       price
//         .replace(".", "")
//         .replace(",", ".")
//         .replace(/[^0-9\.-]+/g, "")
//     );
//     console.log(price_structure);
//   });
//   console.groupEnd();

//   const config = {
//     spreadsheetId: ID,
//     range: `${product.item}!A1:A`,
//     valueInputOption: "RAW",
//     requestBody: {
//       majorDimension: "ROWS",
//       values: [[...price_structure, product.url, product.date]]
//     }
//   };

//   return sheets.spreadsheets.values.append(config);
// }

async function createHeaders(product) {
  const config = {
    spreadsheetId: ID,
    range: `${product.item}!A1:1`,
    valueInputOption: "RAW",
    requestBody: {
      majorDimension: "COLUMNS",
      values: [["De"], ["Por"], ["Você economiza"], ["url"], ["time"]]
    }
  };

  return sheets.spreadsheets.values.append(config);
}

async function createSheet(product) {
  console.log("CREATING SHEET...");

  const requests = [
    {
      addSheet: {
        properties: {
          title: product.item
        }
      }
    }
  ];

  return sheets.spreadsheets
    .batchUpdate({
      spreadsheetId: ID,
      resource: {
        requests
      }
    })
    .then(({ data }) => {
      console.log("✅ SHEET CREATED", data.replies[0].addSheet);

      console.log("CREATING HEADERS...");
      return createHeaders(product);
    })
    .then(({ data }) => {
      console.log("👏 HEADERS CREATED", data);
    });
}

module.exports = {
  fetchTable,
  createSheet,
  logData,
  getLatestPrice,
  getSheetData
};

async function getLatestPrice(sheet_name) {
  console.group(`🙇 FETCHING LAST PRICE ( ${sheet_name} )`);
  return getSheetData(sheet_name, "A:E")
    .then((data) => {
      const prices = data[1];
      const times = data[4];
      const last_index = times.length - 1;
      const priceObj = { price: prices[last_index], time: times[last_index] };
      console.log(
        priceObj.price,
        `at ${new Date(priceObj.time).toLocaleString()}`
      );
      console.groupEnd();
      return priceObj;
    })
    .catch((e) => {
      console.error(e);
      return undefined;
    });
}

async function getSheetData(sheet_name, range) {
  return sheets.spreadsheets.values
    .get({
      spreadsheetId: ID,
      range: `${sheet_name}!${range}`,
      majorDimension: "COLUMNS",
      valueRenderOption: "UNFORMATTED_VALUE"
    })
    .then(({ data }) => data.values);
}

// (async () => {
//   await getLatestPrice("Nintendo Switch Lite Amarelo - Versão Na");
// })();
