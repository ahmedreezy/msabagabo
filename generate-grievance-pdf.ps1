param(
  [string]$InputPath = (Join-Path $env:USERPROFILE "Downloads\Community and Contractors' Grievance committees.docx"),
  [string]$OutputPath = (Join-Path $PSScriptRoot 'public\documents\works\community-and-contractors-grievance-redress-committees.pdf')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.Web

function Encode([string]$Value) { [System.Web.HttpUtility]::HtmlEncode($Value) }
function NodeText($Node, $NamespaceManager) {
  (($Node.SelectNodes('.//w:t', $NamespaceManager) | ForEach-Object { $_.'#text' }) -join '').Trim()
}

$inputFile = (Resolve-Path -LiteralPath $InputPath).Path
$outputDirectory = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$stream = [System.IO.File]::Open($inputFile, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
$archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Read, $false)
try {
  $entry = $archive.GetEntry('word/document.xml')
  if (-not $entry) { throw 'The Word document does not contain word/document.xml.' }
  $reader = [System.IO.StreamReader]::new($entry.Open())
  try { [xml]$documentXml = $reader.ReadToEnd() } finally { $reader.Dispose() }
} finally {
  $archive.Dispose()
  $stream.Dispose()
}

$namespaces = [System.Xml.XmlNamespaceManager]::new($documentXml.NameTable)
$namespaces.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$content = [System.Text.StringBuilder]::new()
$pendingHeading = ''
$paragraphIndex = 0

foreach ($node in $documentXml.SelectNodes('//w:body/*', $namespaces)) {
  if ($node.LocalName -eq 'p') {
    $text = NodeText $node $namespaces
    if (-not $text) { continue }
    $paragraphIndex++
    if ($paragraphIndex -le 2) { continue }
    if ($text -match '^CONTRACTORS') {
      [void]$content.Append("<div class='division'><span>Part 02</span><h2>Contractors’ grievance redress committees</h2></div>")
      $pendingHeading = ''
    } else {
      $pendingHeading = $text
    }
    continue
  }
  if ($node.LocalName -ne 'tbl') { continue }

  $rows = @($node.SelectNodes('./w:tr', $namespaces))
  if (-not $rows.Count) { continue }
  [void]$content.Append("<section class='committee'>")
  if ($pendingHeading) { [void]$content.Append("<h3>$(Encode $pendingHeading)</h3>") }
  [void]$content.Append('<table>')
  foreach ($rowIndex in 0..($rows.Count - 1)) {
    $cells = @($rows[$rowIndex].SelectNodes('./w:tc', $namespaces))
    $tag = if ($rowIndex -eq 0) { 'th' } else { 'td' }
    if ($rowIndex -eq 0) { [void]$content.Append('<thead>') } elseif ($rowIndex -eq 1) { [void]$content.Append('<tbody>') }
    [void]$content.Append('<tr>')
    foreach ($cell in $cells) { [void]$content.Append("<$tag>$(Encode (NodeText $cell $namespaces))</$tag>") }
    [void]$content.Append('</tr>')
    if ($rowIndex -eq 0) { [void]$content.Append('</thead>') }
  }
  if ($rows.Count -gt 1) { [void]$content.Append('</tbody>') }
  [void]$content.Append('</table></section>')
  $pendingHeading = ''
}

$logoPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\images\municipal-logo.png'
if (-not (Test-Path -LiteralPath $logoPath)) { $logoPath = Join-Path $PSScriptRoot 'public\images\municipal-logo.png' }
$logoData = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($logoPath))
$html = @"
<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: A4 landscape; margin: 13mm 12mm 14mm; }
* { box-sizing: border-box; }
body { margin: 0; color: #17233a; font-family: Arial, Helvetica, sans-serif; font-size: 8pt; line-height: 1.35; }
.masthead { display: grid; grid-template-columns: 19mm 1fr auto; gap: 5mm; align-items: center; border-bottom: 2.5px solid #8f3f48; padding-bottom: 4mm; }
.masthead img { width: 18mm; height: 18mm; object-fit: contain; }.masthead p { margin: 0; color: #8f3f48; font-size: 6.5pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }.masthead h1 { margin: 1mm 0 0; font-family: Georgia, serif; font-size: 17pt; }.masthead aside { color: #667085; font-size: 7pt; text-align: right; }
.title { display: grid; grid-template-columns: 1fr .45fr; gap: 10mm; margin: 7mm 0 6mm; align-items: end; }.title h2 { margin: 0; font-family: Georgia, serif; font-size: 22pt; line-height: 1.05; }.title p { margin: 0; border-left: 2px solid #8f3f48; padding-left: 4mm; color: #596273; }
.division { display: flex; align-items: end; gap: 4mm; margin: 7mm 0 3mm; border-bottom: 1px solid #bfc5cd; padding-bottom: 2mm; break-after: avoid; }.division span { color: #8f3f48; font-size: 6.5pt; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }.division h2 { margin: 0; font-size: 12pt; }
.committee { margin: 0 0 5mm; break-inside: avoid; }.committee h3 { margin: 0 0 1.5mm; color: #17233a; font-size: 9pt; }.committee:first-of-type::before { display: block; margin-bottom: 2mm; color: #8f3f48; font-size: 6.5pt; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; content: 'Part 01 · Community road-project committees'; }
table { width: 100%; border-collapse: collapse; table-layout: auto; } thead { display: table-header-group; } tr { break-inside: avoid; } th { background: #17233a; padding: 1.8mm 2mm; color: white; font-size: 6.5pt; letter-spacing: .045em; text-align: left; text-transform: uppercase; } td { border-bottom: 1px solid #d7dbe0; padding: 1.7mm 2mm; vertical-align: top; } td:first-child { width: 9mm; color: #8f3f48; font-family: Consolas, monospace; font-weight: 700; } td:last-child { white-space: nowrap; }
.record-note { margin-top: 6mm; border-left: 3px solid #8f3f48; background: #f2f3f4; padding: 3mm 4mm; color: #596273; font-size: 7pt; break-inside: avoid; }.record-note strong { color: #17233a; }
</style></head><body>
<header class="masthead"><img src="data:image/png;base64,$logoData" alt=""><div><p>Government of Uganda · Official municipal record</p><h1>Makindye Ssabagabo Municipal Council</h1></div><aside>Greater Kampala Metropolitan Area<br>Road Project</aside></header>
<section class="title"><h2>Community and contractors’<br>grievance redress committees</h2><p>Committee membership and published contact information supplied for the GKMA road project grievance-redress process.</p></section>
$($content.ToString())
<footer class="record-note"><strong>Record ownership:</strong> Corrections and replacements must be approved by the responsible municipal office and republished through the Municipal Notice Board.</footer>
</body></html>
"@

$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("msmc-grievance-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $temporaryRoot | Out-Null
$htmlPath = Join-Path $temporaryRoot 'document.html'
[System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.UTF8Encoding]::new($false))
$renderer = Join-Path $PSScriptRoot 'render-html-pdf.mjs'
try {
  & node $renderer $htmlPath $OutputPath
  if ($LASTEXITCODE -ne 0) { throw 'The PDF renderer failed.' }
  if (-not (Test-Path -LiteralPath $OutputPath)) { throw 'The PDF renderer did not create the requested file.' }
  Get-Item -LiteralPath $OutputPath | Select-Object FullName, Length, LastWriteTime
} finally {
  if (Test-Path -LiteralPath $temporaryRoot) { Remove-Item -LiteralPath $temporaryRoot -Recurse -Force -ErrorAction SilentlyContinue }
}
