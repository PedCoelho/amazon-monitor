import { Browser, Page } from "puppeteer";
import puppeteer, { PuppeteerExtra } from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";


export class Puppet {

  private puppeteer: PuppeteerExtra = puppeteer.use(StealthPlugin());
  private browser: Browser | undefined
  private page: Page | undefined //todo will need to handle more pages

  constructor() { }

  public async startBrowser() {
    this.browser = await this.puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
  }


  public async browseTo(url: string) {
    if (!this.browser) {
      console.error('Browser not initialized, returning')
      return
    }

    const navigationTime: number = Date.now();

    this.page = await this.browser.newPage();
    await this.page.goto(url, { timeout: 30000, waitUntil: "domcontentloaded" });
  }
}

// module.exports = {
//   startBrowser,
//   browseTo
// };

// async function startBrowser(): Promise<Browser> {
//   return puppeteer.launch({
//     headless: false,
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });
// }

// async function browseTo(browser: Browser, url: string): Promise<any> {
//   const page: Page = await browser.newPage();
//   const time: number = Date.now();

//   await page.goto(url, { timeout: 30000, waitUntil: "domcontentloaded" });
//   return page
// }

// async function any(page: any) {
//   await page.waitForSelector("#productTitle");

//   let item = await page.evaluate(() => {
//     const product_name = "#productTitle";
//     return document
//       .querySelector(product_name)
//       ?.innerText.substr(0, 40)
//       .replaceAll(":", "");
//   });

//   let price = await page.evaluate(() => {

//     const MAINPRICE = document
//       .querySelector("[data-feature-name=corePrice]")
//       ?.innerText.split("\n")[0];

//     const FALLBACK = document.querySelector("#price")?.innerText;

//     return MAINPRICE || FALLBACK;
//   });

//   let product = { item, price, url, date: time };

//   const waitFor = Math.floor(Math.random() * 5000) + 5000;
//   console.log(`🕰️ Waiting for...${(waitFor / 1000).toFixed(0)}s`);
//   await page.waitForTimeout(waitFor);

//   if (!product.price) throw Error(`- Couldn't find price for ${product.item}`);

//   // await page.screenshot({ path: `./screenshots/${product.item}.png` });

//   await browser.close();

//   return product;
// }
