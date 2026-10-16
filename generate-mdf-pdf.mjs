import { readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { departments } from './src/data/siteData.js'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const forum = departments.find(({ slug }) => slug === 'community-services')?.publicBodies?.find(({ id }) => id === 'metropolitan-development-forum')
if (!forum) throw new Error('The Metropolitan Development Forum data could not be found.')

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]))
const logo = await readFile(resolve(projectRoot, 'public/images/municipal-logo.png'))
const logoUrl = `data:image/png;base64,${logo.toString('base64')}`
const members = forum.members.map((member, index) => `
  <tr><td>${String(index + 1).padStart(2, '0')}</td><td>${escapeHtml(member.name)}</td><td>${escapeHtml(member.category)}</td></tr>`).join('')

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 18mm 15mm 17mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #17233a; font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt; line-height: 1.45; }
  .masthead { display: grid; grid-template-columns: 23mm 1fr; gap: 6mm; align-items: center; border-bottom: 2.5px solid #8f3f48; padding-bottom: 5mm; }
  .masthead img { width: 21mm; height: 21mm; object-fit: contain; }
  .masthead p { margin: 0; color: #8f3f48; font-size: 7pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
  .masthead h1 { margin: 1.3mm 0 0; font-family: Georgia, serif; font-size: 19pt; line-height: 1.1; }
  .document-meta { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 5mm; background: #f1f2f3; }
  .document-meta div { min-height: 16mm; border-right: 1px solid #d7dbe0; padding: 3mm; }
  .document-meta div:last-child { border: 0; }
  .document-meta span { display: block; color: #6b7280; font-size: 6.5pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  .document-meta strong { display: block; margin-top: 1mm; font-size: 8.5pt; }
  .intro { display: grid; grid-template-columns: .8fr 1.2fr; gap: 8mm; margin: 7mm 0 6mm; }
  .intro h2 { margin: 0; font-family: Georgia, serif; font-size: 15pt; line-height: 1.2; }
  .intro p { margin: 0; color: #485365; }
  .directory-title { display: flex; align-items: end; justify-content: space-between; border-top: 1px solid #cfd4da; padding: 4mm 0 2.5mm; }
  .directory-title h2 { margin: 0; font-size: 11pt; }
  .directory-title span { color: #8f3f48; font-size: 7pt; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  thead { display: table-header-group; }
  th { background: #17233a; padding: 2.4mm 2.6mm; color: white; font-size: 6.6pt; letter-spacing: .07em; text-align: left; text-transform: uppercase; }
  th:first-child { width: 10mm; } th:nth-child(2) { width: 57mm; }
  td { border-bottom: 1px solid #d9dde1; padding: 2.35mm 2.6mm; vertical-align: top; }
  td:first-child { color: #8f3f48; font-family: Consolas, monospace; font-size: 7.2pt; font-weight: 700; }
  td:nth-child(2) { font-weight: 700; }
  tr { break-inside: avoid; }
  .certification { break-inside: avoid; margin-top: 7mm; border: 1px solid #cfd4da; border-left: 3px solid #8f3f48; padding: 4mm; }
  .certification h2 { margin: 0; font-size: 9pt; }.certification p { margin: 1.5mm 0 0; color: #596273; font-size: 8pt; }
  .footer-note { margin-top: 5mm; color: #687180; font-size: 7pt; }
</style></head><body>
  <header class="masthead"><img src="${logoUrl}" alt=""><div><p>Government of Uganda · Official municipal record</p><h1>Makindye Ssabagabo Municipal Council</h1></div></header>
  <section class="document-meta"><div><span>Document</span><strong>Metropolitan Development Forum member directory</strong></div><div><span>Reference</span><strong>MSMC/CBS/MDF/2026</strong></div><div><span>Confirmed</span><strong>14 October 2026</strong></div></section>
  <section class="intro"><h2>${escapeHtml(forum.name)}<br>confirmed membership</h2><p>${escapeHtml(forum.summary)} ${escapeHtml(forum.purpose)}</p></section>
  <div class="directory-title"><h2>Official member directory</h2><span>${forum.members.length} confirmed representatives</span></div>
  <table><thead><tr><th>No.</th><th>Member</th><th>Represented stakeholder category</th></tr></thead><tbody>${members}</tbody></table>
  <section class="certification"><h2>Record ownership and updates</h2><p>This directory is issued by the Community-Based Services Department. Any correction or replacement must be approved by the responsible municipal office and published as a new controlled version on the Municipal Notice Board.</p></section>
  <p class="footer-note">Official website: www.msabagabo.go.ug · General enquiries: info@msabagabo.go.ug · Toll-free: 0800 256 260</p>
</body></html>`

const output = resolve(projectRoot, 'public/documents/msmc-metropolitan-development-forum-members.pdf')
await mkdir(dirname(output), { recursive: true })
const installedBrowser = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync)
const browser = await chromium.launch({ headless: true, ...(installedBrowser ? { executablePath: installedBrowser } : {}) })
try {
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  await page.pdf({ path: output, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="width:100%;padding:0 15mm;color:#7b8290;font:7px Arial;display:flex;justify-content:space-between"><span>MSMC · Metropolitan Development Forum</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>', margin: { top: '18mm', right: '15mm', bottom: '17mm', left: '15mm' } })
} finally {
  await browser.close()
}
console.log(`Generated ${output}`)
