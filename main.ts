import { Puppet } from './js/puppeteer/puppeteer-utils'

require("dotenv").config();

// const puppet = require("./js/puppeteer/puppeteer-utils");


(async () => {

    const urls: string[] = [
        "https://temp-mail.org/",
        "https://temp-mail.org/",
    ]

    for (const [i, url] of urls.entries()) {
        console.log(url)
        const puppet = new Puppet()
        await puppet.startBrowser()
        await puppet.browseTo(url)
        console.log(`Browser ${i + 1} done navigating to ${url}`)

    }

})()