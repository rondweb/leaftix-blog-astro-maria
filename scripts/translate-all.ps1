# Batch translation of all canonical EN posts to pt-BR/es/fr using translate-chunk.mjs
# Run detached: Start-Process powershell -ArgumentList "-File scripts/translate-all.ps1"
$ErrorActionPreference = 'Continue'
Set-Location 'e:\OTHER_PROJECTS\leaftix-blog-astro-maria'
$files = @(
  'beyond-silence-decoding-language-of-crops.mdx',
  'community-supported-agriculture-food-waste-canada.mdx',
  'expectations-for-the-urban-farming-market-in-2026-qualitative-overview.mdx',
  'urban-farming-market-2026-trends-challenges-outlook.mdx',
  'vertical-farming-2026-grid-stress-ai-adaptive-leds.mdx'
)
$targets = @('pt-BR', 'es', 'fr')
foreach ($f in $files) {
  foreach ($t in $targets) {
    $log = "tr-$f-$t.log"
    "=== $f -> $t $(Get-Date) ===" | Out-File $log -Encoding utf8
    node scripts/translate-chunk.mjs "src/content/blog/en/$f" "$t" >> $log 2>&1
  }
}
'ALL DONE' | Out-File tr-ALL-DONE.log -Encoding utf8
