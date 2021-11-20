require("dotenv").config();

const utils = require("./js/puppeteer/getData.js");
const sheets = require("./js/sheets/sheets_utils.js");
const math = require("./js/calc/math_utils.js");


let urls = [
  "https://www.amazon.com.br/Console-New-Nintendo-Switch-Vermelho/dp/B08M9S4XTR/",
  "https://www.amazon.com.br/Nintendo-Switch-Lite-Amarelo-Nacional/dp/B08M9JC5GB/",
  "https://www.amazon.com.br/Placa-V%C3%ADdeo-ASUS-Gaming-Tracing/dp/B0966689N3/",
  "https://www.amazon.com.br/DAC-192-Catalogo-Envelopes-Multicor/dp/B07843QQB5/",
  "https://www.amazon.com.br/dp/B084J4WP6J/",
  "https://www.amazon.com.br/Rel%C3%B3gio-acionamento-despertador-termometro-CBRN01422/dp/B07N7ZZWJL/",
  "https://www.amazon.com.br/gp/product/B07ZJN56KK/",
  "https://www.amazon.com.br/dp/B078C6JQ9L/"
];

(async () => {
  let data = [];

  try {
    urls = await sheets.getSheetData("urls", "A:A").then((res) => res.flat());
  } catch (e) {
    console.error("📛ERROR:", e.message);
  }

  console.log("GETTING URLS", urls);

  for (let url of urls) {
    try {
      let product_data = await utils.getData(url);
      console.log(product_data);
      data.push(product_data);
    } catch (e) {
      console.error("📛ERROR: Could not retrieve product data.");
      console.error(e.message);
    }
  }

  console.log("Done gathering data");

  const sheet_names = await sheets.fetchTable();
  console.log(sheet_names);

  for (let product of data) {
    if (sheet_names.includes(product.item)) {
      await compareAndLogData(product);
    } else {
      await sheets.createSheet(product).then((res) => sheets.logData(product));
    }
  }
})();

async function compareAndLogData(product) {
  const latestVal = await sheets.getLatestPrice(product.item);
  //TODO SHOW HOW MUCH TIME SINCE LAST PRICE

  const price = math.stringToN(product.price);
  if (!latestVal || latestVal.price == price) return;
  const difference = price - latestVal.price;

  // await notifyChange(latestVal, product);

  return sheets.logData(product, latestVal.price, difference);
}

async function notifyChange(product, last, difference) {
  //TODO IMPLEMENT NODEMAILER
  const hasIncreased = Boolean(difference > 0);
  const message = hasIncreased ? "aumentou" : "diminuiu";

  const toCurrency = (n) =>
    n.toLocaleString("PT-BR", { style: "currency", currency: "BRL" });

  const paragraph = `
    O preço do produto ${product.item}<b>${message}</b>!
    
    De: ${toCurrency(last.price)} - ${Date(last.time).toLocaleString()}
    Para: <b>${toCurrency(product.price)}</b> - ${Date(
    product.date
  ).toLocaleString()}

    Link: ${product.url}
  `;
}
