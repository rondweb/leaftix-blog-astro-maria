// Chunked single-file translation for the Leaftix Blog.
// LibreTranslate preserves markdown sent verbatim, so translate LARGE
// chunks (~1200 chars) instead of per-segment calls. Frontmatter fields
// (title/description/alt) and locale handled separately. Tables and JSX
// pass through verbatim.
// Usage: node scripts/translate-chunk.mjs <source-file> <target> [out-file]
import { readFileSync, writeFileSync } from 'node:fs';
const API = process.env.TRANSLATE_API || 'https://translate.lnds.space/translate';
const SOURCE = 'en';
const CHUNK = 1200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function translateText(text, target) {
  if (!text || !text.trim()) return text;
  const res = await fetch(API, { method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ q: text, source: SOURCE, target, format: 'text' }) });
  if (res.status === 429) { await sleep(1500); return translateText(text, target); }
  if (!res.ok) throw new Error('API ' + res.status);
  return (await res.json()).translatedText;
}
/* js-yaml rejects duplicate mapping keys ("duplicated mapping key"), which makes
 * the Astro content collection fail to load. Detect them here so a corrupt
 * source file fails loudly instead of being silently copied into every locale.
 * `lineOffset` converts a frontmatter-relative index into a file line number. */
function findDuplicateKeys(frontmatter, lineOffset = 0) {
  const stack = [{ indent: -1, keys: new Map() }];
  const dupes = [];
  frontmatter.split('\n').forEach((raw, i) => {
    const line = raw.replace(/\r$/, '');
    if (!line.trim() || line.trimStart().startsWith('#')) return;
    const m = line.match(/^(\s*)([^\s:#][^:#]*?):(.*)$/);
    if (!m) return;
    const indent = m[1].length;
    const key = m[2].trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const scope = stack[stack.length - 1];
    if (scope.keys.has(key)) dupes.push({ key, line: i + 1 + lineOffset, first: scope.keys.get(key) });
    else scope.keys.set(key, i + 1 + lineOffset);
    /* A key with no value opens a nested mapping (e.g. "image:"). */
    if (!m[3].trim()) stack.push({ indent, keys: new Map() });
  });
  return dupes;
}

function formatDuplicates(dupes) {
  return dupes.map((d) => "'" + d.key + "' at line " + d.line + " (first at line " + d.first + ")").join(', ');
}

function splitBody(body) {
  const lines = body.split('\n');
  const chunks = [];
  let cur = [];
  let len = 0;
  let fence = false;
  const push = () => { if (cur.length) { chunks.push({ verbatim: false, text: cur.join('\n') }); cur = []; len = 0; } };
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('```')) { push(); chunks.push({ verbatim: true, text: line }); fence = !fence; continue; }
    if (fence || t.includes('|') || /^<[A-Za-z]/.test(t) || t.startsWith('export ') ||
      t.startsWith('import ') || t.startsWith('{') || t === '' || /^(-{3,}|\*{3,})$/.test(t) ||
      /^(#{1,6}\s+|>)/.test(t) || t.startsWith('![')) {
      push(); chunks.push({ verbatim: true, text: line }); continue;
    }
    if (len + line.length + 1 > CHUNK && cur.length) push();
    cur.push(line); len += line.length + 1;
  }
  push();
  return chunks;
}
async function main() {
  const [src, target, dest] = process.argv.slice(2);
  if (!src || !target) { console.error('Usage...'); process.exit(1); }
  // Normalize CRLF first: the frontmatter/body matching below relies on `$`, so a
  // leftover \r used to make title/description/alt silently stay untranslated.
  const content = readFileSync(src, 'utf8').replace(/\r\n?/g, '\n');
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) throw new Error('no frontmatter');
  const dupes = findDuplicateKeys(m[1], 1); // frontmatter starts on file line 2
  if (dupes.length) {
    throw new Error('duplicate frontmatter key -> ' + formatDuplicates(dupes) + ' in ' + src);
  }
  const out = [];
  for (const line of m[1].split('\n')) {
    const f = line.match(/^( *)(title|description|alt): (['"])(.*?)\3$/);
    if (f) {
      const tr = await translateText(f[4], target);
      out.push(f[1] + f[2] + ': "' + tr.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"');
    } else if (/^locale: /.test(line)) out.push('locale: "' + target + '"');
    else if (/^canonicalSlug: /.test(line)) out.push(line); // Keep canonicalSlug unchanged
    else out.push(line);
  }
  const chunks = splitBody(content.slice(m[0].length));
  // Structural lines pass through verbatim; but headings, image lines and
  // list items/blockquotes still need translation, handled line-by-line.
  const needsLine = (text) => /^(#{1,6}\s+|>)/.test(text.trim()) || text.trimStart().startsWith('![') || /^([-*+]\s+|\d+\.\s+)/.test(text.trim());
  const tb = chunks.filter((c) => !c.verbatim || needsLine(c.text)).length;
  console.log('chunks to translate: ' + tb);
  const body = [];
  let n = 0;
  for (const c of chunks) {
    if (c.verbatim && !needsLine(c.text)) { body.push(c.text); continue; }
    const t = c.text.trim();
    if (t.startsWith('![')) {
      const im = c.text.match(/^(!\[)(.*?)(\]\(.*\))$/);
      body.push(im ? im[1] + (await translateText(im[2], target)) + im[3] : c.text);
    } else {
      const h = t.match(/^(#{1,6})\s+(.*)$/);
      if (h) body.push(h[1] + ' ' + (await translateText(h[2], target)).trim());
      else if (t.startsWith('>')) body.push('> ' + (await translateText(t.replace(/^>\s?/, ''), target)));
      else {
        const li = t.match(/^([-*+]\s+|\d+\.\s+)(.*)$/);
        body.push(li ? li[1] + (await translateText(li[2], target)) : await translateText(c.text, target));
      }
    }
    n++;
    console.log('  ' + n + '/' + tb);
  }
  writeFileSync(dest || src.replace('/en/', '/' + target + '/'), '---\n' + out.join('\n') + '\n---\n\n' + body.join('\n').trim() + '\n');
  console.log('[ok] done');
}
main().catch((e) => { console.error(e.message); process.exit(1); });
