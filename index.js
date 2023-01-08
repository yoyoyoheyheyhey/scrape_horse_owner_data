const { Keyboard } = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer')
const fs = require('fs');

puppeteer.use(StealthPlugin());

(async () => {
   const browser = await puppeteer.launch({
      // headless: false,
      headless: true,
      args:[
         '--no-sandbox',
         '--disable-gpu',
         '--enable-webgl',
         '--window-size=1200,1500'
      ],
      executablePath: executablePath(),
   }); 

   const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36'; 
   const page = await browser.newPage();
   await page.setUserAgent(ua);

  const year = 2022 // check
  const baseUrl = `https://umanity.jp/racedata/db/ranking.php?type=7&year=${year}&page=`
  let pageNum = 1
  const pageNumMax = 16 // check
  const tsv = []

  while (pageNum <= pageNumMax) {
    await page.goto(`${baseUrl}${pageNum}`, { waitUntil: 'networkidle2' });

    await page.waitForSelector(".race");

    const tsvRows = await page.evaluate(() => {
      const tbodies = [...document.querySelectorAll('.race table tbody table tbody tbody tbody')].map(el => el.querySelectorAll('tr'))
      const right = [...(tbodies[0] || [])]
      const left = [...(tbodies[1] || [])]
      right.shift()
      left.shift()

      const rows = [...right, ...left]
      return rows.map(row => [...row.querySelectorAll('td')].map(el => el.textContent).join('\t'))
    })
    console.log(tsvRows)

    tsv.push(tsvRows)

    pageNum  += 1
  }

  const text = tsv.flat().join('\n')
  fs.writeFileSync(`${year}.tsv`, text);
})();
