import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const [htmlPath, outputPath] = process.argv.slice(2)
if (!htmlPath || !outputPath) throw new Error('Usage: node render-html-pdf.mjs <input.html> <output.pdf>')

const installedBrowser = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync)
const browser = await chromium.launch({ headless: true, ...(installedBrowser ? { executablePath: installedBrowser } : {}) })
try {
  const page = await browser.newPage()
  await page.setContent(await readFile(resolve(htmlPath), 'utf8'), { waitUntil: 'load' })
  await page.pdf({
    path: resolve(outputPath),
    format: 'A4',
    landscape: true,
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="width:100%;padding:0 12mm;color:#7b8290;font:7px Arial;display:flex;justify-content:space-between"><span>MSMC · Grievance Redress Committees</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
    margin: { top: '13mm', right: '12mm', bottom: '14mm', left: '12mm' },
  })
} finally {
  await browser.close()
}
