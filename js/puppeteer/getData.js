const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

module.exports = {
  getData
};

async function getData(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  // await page.setRequestInterception(true);

  // page.on("request", (r) => {
  //   if (
  //     // ["image", "stylesheet", "font", "script"].indexOf(r.resourceType()) !== -1
  //     ["script"].indexOf(r.resourceType()) !== -1
  //   ) {
  //     r.abort();
  //   } else {
  //     r.continue();
  //   }
  // });

  // await page.evaluateOnNewDocument(() => {
  //   Object.defineProperty(navigator, "platform", { get: () => "Win32" });
  //   Object.defineProperty(navigator, "platform", { get: () => "20100101" });
  //   Object.defineProperty(navigator, "vendor", { get: () => "" });
  //   Object.defineProperty(navigator, "oscpu", {
  //     get: () => "Windows NT 10.0; Win64; x64"
  //   });
  // });

  // await page.setUserAgent(
  //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0"
  // );

  const time = Date.now();

  await page.goto(url, { timeout: 30000, waitUntil: "domcontentloaded" });

  await page.waitForSelector("#productTitle");

  let item = await page.evaluate(() => {
    const product_name = "#productTitle";
    return document
      .querySelector(product_name)
      ?.innerText.substr(0, 40)
      .replaceAll(":", "");
  });

  let price = await page.evaluate(() => {
    //review Considering utilizing only numeric values
    // const product_prices = [
    //   ...document.querySelectorAll("[class*=priceBlock]")
    // ].map((x) =>
    //   x
    //     .closest("tr")
    //     .innerText.split(":")
    //     .map((y) => y.trim())
    // );
    // const fallback = [
    //   [
    //     "por:",
    //     document
    //       .querySelector("[data-feature-name=corePrice]")
    //       .innerText.split("\n")[0]
    //   ]
    // ];

    // return product_prices.length ? product_prices : fallback;
    const MAINPRICE = document
      .querySelector("[data-feature-name=corePrice]")
      ?.innerText.split("\n")[0];

    const FALLBACK = document.querySelector("#price")?.innerText;

    return MAINPRICE || FALLBACK;
  });

  let product = { item, price, url, date: time };

  const waitFor = Math.floor(Math.random() * 5000) + 5000;
  console.log(`🕰️ Waiting for...${(waitFor / 1000).toFixed(0)}s`);
  await page.waitForTimeout(waitFor);

  if (!product.price) throw Error(`- Couldn't find price for ${product.item}`);

  // await page.screenshot({ path: `./screenshots/${product.item}.png` });

  await browser.close();

  return product;
}
