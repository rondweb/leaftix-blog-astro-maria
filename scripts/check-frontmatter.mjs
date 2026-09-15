#!/usr/bin/env node
// Frontmatter validator for the Leaftix Blog content collection.
//
// Astro loads every post through the `blog` collection defined in
// src/content.config.ts, so one malformed frontmatter block fails the build.
// js-yaml only reports it as "duplicated mapping key" with a line number, which
// is easy to miss across four locale folders — this script reports every problem
// at once and exits non-zero. Run it before a build: `npm run check:frontmatter`.
//
// Intentionally dependency-free (no js-yaml import) so it keeps working
// regardless of what Astro pulls in transitively.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BLOG_DIR = 'src/content/blog';
/* Kept in sync with `localeCodes` in src/content.config.ts. */
const LOCALES = ['en', 'pt-BR', 'es', 'fr'];
/* Required by the `blog` collection schema. */
const REQUIRED = ['locale', 'title', 'description', 'pubDate', 'canonicalSlug'];

const problems = [];
let checked = 0;

/* js-yaml rejects duplicate mapping keys ("duplicated mapping key"). Detect them
 * here so a corrupt source file fails loudly instead of being copied into every
 * locale. `lineOffset` converts a frontmatter-relative index into a file line. */
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
	return dupes.map((d) => `'${d.key}' at line ${d.line} (first at line ${d.first})`).join(', ');
}

/* Minimal frontmatter reader: top-level keys plus one level of nested mapping,
 * which covers `image: { url, alt }`. List items and comments are skipped. */
function parseFrontmatter(frontmatter, lineOffset) {
	const root = new Map();
	const nested = new Map();
	const stack = [{ indent: -1, key: null, map: root }];
	frontmatter.split('\n').forEach((raw, i) => {
		const line = raw.replace(/\r$/, '');
		if (!line.trim() || line.trimStart().startsWith('#') || line.trimStart().startsWith('- ')) return;
		const m = line.match(/^(\s*)([^\s:#][^:#]*?):(.*)$/);
		if (!m) return;
		const indent = m[1].length;
		const key = m[2].trim();
		const value = m[3].trim();
		while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
		const parent = stack[stack.length - 1];
		parent.map.set(key, { value, line: i + 1 + lineOffset });
		if (!value) {
			const child = new Map();
			nested.set(key, child);
			stack.push({ indent, key, map: child });
		}
	});
	return { root, nested };
}

const unquote = (value) => value.replace(/^['"]|['"]$/g, '').trim();

function checkFile(locale, file, enSource) {
	const rel = `${locale}/${file}`;
	checked++;

	const source = readFileSync(join(BLOG_DIR, locale, file), 'utf8');
	const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!m) {
		problems.push(`${rel}: no frontmatter block`);
		return;
	}

	const lineOffset = 1; // frontmatter content starts on file line 2
	const duplicates = findDuplicateKeys(m[1], lineOffset);
	if (duplicates.length) {
		problems.push(
			`${rel}: duplicate frontmatter key -> ${formatDuplicates(duplicates)} ` +
			`(js-yaml fails with "duplicated mapping key")`
		);
	}

	const { root, nested } = parseFrontmatter(m[1], lineOffset);

	for (const key of REQUIRED) {
		const entry = root.get(key);
		if (!entry) problems.push(`${rel}: missing required key '${key}'`);
		else if (!entry.value) problems.push(`${rel}: key '${key}' has no value (line ${entry.line})`);
	}

	const localeEntry = root.get('locale');
	if (localeEntry && localeEntry.value) {
		const declared = unquote(localeEntry.value);
		if (!LOCALES.includes(declared)) {
			problems.push(`${rel}: locale '${declared}' is not one of ${LOCALES.join(', ')}`);
		} else if (declared !== locale) {
			problems.push(`${rel}: locale '${declared}' does not match its folder`);
		}
	}

	const slugEntry = root.get('canonicalSlug');
	if (slugEntry && slugEntry.value) {
		const expected = file.replace(/\.mdx$/, '');
		const declared = unquote(slugEntry.value);
		if (declared !== expected) problems.push(`${rel}: canonicalSlug '${declared}' should be '${expected}'`);
	}

	/* `image` is optional, but url and alt are both required once it is set. */
	if (root.has('image')) {
		const image = nested.get('image') || new Map();
		for (const key of ['url', 'alt']) {
			const entry = image.get(key);
			if (!entry || !entry.value) problems.push(`${rel}: image.${key} is required when 'image' is set`);
		}
	}

	/* Code and JSX must stay locale-invariant. */
	if (enSource) compareCodeParts(locale, file, source, enSource);

	/* Non-English posts must not ship untranslated metadata. */
	if (enSource) checkTranslatedMetadata(locale, file, source, enSource);

	checkRelativeImports(locale, file, source);
}

/* The translation pipeline is documented to pass imports/exports, JSX and fenced
 * code through verbatim, because they are locale-invariant. When it does not, the
 * post stops being valid MDX — e.g. `</Note>` translated to `" Note "`, style
 * object keys translated, or `];` turned into `#;`. Collect those parts so a
 * translation can be compared against its EN source. */
function extractCodeParts(source) {
	const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
	const statements = [];
	const tags = [];
	const fences = [];
	let fence = null;
	body.split('\n').forEach((raw) => {
		const line = raw.replace(/\r$/, '');
		if (/^\s*```/.test(line)) {
			if (fence === null) {
				fence = [];
				fences.push(fence);
			} else {
				fence = null;
			}
			return;
		}
		if (fence !== null) {
			fence.push(line);
			return;
		}
		const t = line.trim();
		if (/^(import|export)(\s|$)/.test(t)) statements.push(t);
		else if (/^<\/?[A-Za-z][A-Za-z0-9.-]*(\s|\/?>|$)/.test(t)) tags.push(t);
	});
	return { statements, tags, fences };
}

function compareCodeParts(locale, file, source, enSource) {
	const rel = `${locale}/${file}`;
	const expected = extractCodeParts(enSource);
	const actual = extractCodeParts(source);
	const buckets = [
		['import/export statement', expected.statements, actual.statements],
		['JSX tag line', expected.tags, actual.tags],
		['code fence', expected.fences, actual.fences],
	];
	for (const [label, want, got] of buckets) {
		const len = Math.max(want.length, got.length);
		for (let i = 0; i < len; i++) {
			if (JSON.stringify(want[i]) !== JSON.stringify(got[i])) {
				problems.push(
					`${rel}: ${label} #${i + 1} differs from en/${file} -> expected ` +
					`${JSON.stringify(want[i])} but found ${JSON.stringify(got[i])} (code/JSX must stay locale-invariant)`
				);
				break; // one report per bucket is enough
			}
		}
	}
}

/* A relative import inside a post resolves from that post's own folder. The
 * locale-folder layout added a directory level, so a stale `../../components/...`
 * silently stops resolving and fails the build with "Module not found". */
function checkRelativeImports(locale, file, source) {
	const rel = `${locale}/${file}`;
	const dir = join(BLOG_DIR, locale);
	for (const statement of extractCodeParts(source).statements) {
		const m = statement.match(/^import\s+[^'"]*from\s+['"](\.[^'"]+)['"]/);
		if (!m) continue;
		const resolved = join(dir, m[1]);
		const candidates = [`${resolved}.astro`, `${resolved}.ts`, `${resolved}.js`, `${resolved}.mjs`, join(resolved, 'index.astro'), resolved];
		if (!candidates.some((candidate) => existsSync(candidate))) {
			problems.push(`${rel}: import '${m[1]}' does not resolve (looked for ${resolved})`);
		}
	}
}

/* Metadata has to be translated as well. A CRLF source used to make the pipeline
 * skip title/description/alt (its regexes were `$`-anchored), which left English
 * metadata inside a translated post — easy to miss in review, visible on the site. */
function metadataValues(source) {
	const fmMatch = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	const frontmatter = fmMatch ? fmMatch[1] : '';
	const pick = (re) => {
		const m = frontmatter.match(re);
		return m ? m[1].replace(/^['"]|['"]$/g, '').trim() : '';
	};
	const bodyAlts = source
		.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
		.split('\n')
		.map((line) => (line.match(/^!\[(.*?)\]\(/) || [])[1] || '')
		.filter(Boolean);
	return {
		title: pick(/^title:[ \t]*(.*)$/m),
		description: pick(/^description:[ \t]*(.*)$/m),
		imageAlt: pick(/^[ \t]+alt:[ \t]*(.*)$/m),
		bodyAlts,
	};
}

function checkTranslatedMetadata(locale, file, source, enSource) {
	const rel = `${locale}/${file}`;
	const en = metadataValues(enSource);
	const translated = metadataValues(source);
	for (const field of ['title', 'description', 'imageAlt']) {
		if (en[field] && en[field] === translated[field]) {
			problems.push(
				`${rel}: ${field} is identical to en/${file} -> looks untranslated ` +
				`(${JSON.stringify(en[field].slice(0, 60))})`
			);
		}
	}
	const untranslatedAlts = translated.bodyAlts.filter((alt) => en.bodyAlts.includes(alt));
	if (untranslatedAlts.length) {
		problems.push(
			`${rel}: ${untranslatedAlts.length} body image alt(s) identical to en/${file} -> ` +
			`looks untranslated (${JSON.stringify(untranslatedAlts[0].slice(0, 60))})`
		);
	}
}

for (const locale of readdirSync(BLOG_DIR).sort()) {
	const localeDir = join(BLOG_DIR, locale);
	if (!statSync(localeDir).isDirectory()) continue;
	for (const file of readdirSync(localeDir).sort()) {
		if (!file.endsWith('.mdx')) continue;
		const enPath = join(BLOG_DIR, 'en', file);
		const enSource = locale === 'en' || !existsSync(enPath) ? null : readFileSync(enPath, 'utf8');
		checkFile(locale, file, enSource);
	}
}

if (problems.length) {
	console.error(`\n${problems.length} problem(s) found in ${checked} content file(s):`);
	for (const problem of problems) console.error(`  - ${problem}`);
	process.exit(1);
}

console.log(`OK: ${checked} content file(s) validated across ${LOCALES.join(', ')}.`);