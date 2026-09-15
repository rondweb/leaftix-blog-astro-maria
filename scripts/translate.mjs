// Translation pipeline for the Leaftix Blog (CANONICAL).
//
// Strategy (LibreTranslate preserves markdown verbatim, so translate LARGE
// chunks instead of per-segment calls — no ZZLT placeholder scheme):
//   - frontmatter: title/description/alt translated, locale rewritten, URLs kept
//   - body: prose chunks (~1200 chars) translated whole — headings, links,
//     bold, lists pass through the API untouched and come back intact
//   - code fences, MDX components/import/export/JSX, tables, image lines:
//     passed through verbatim (image alts + headings + list/quote text are
//     translated line-by-line)
//
// Usage:
//   node scripts/translate.mjs                    (translate every missing file)
//   node scripts/translate.mjs <file>              (one file, all locales)
//   node scripts/translate.mjs <file> <target>     (one file, one locale)
//   node scripts/translate.mjs --regen             (retranslate all, incl. existing)
//   node scripts/translate.mjs --only <substring>  (filter source filenames)
//   node scripts/translate.mjs --only <sub> --regen
//
// Optionally set TRANSLATE_API to override the API base URL.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BLOG_DIR = fileURLToPath(new URL('../src/content/blog/', import.meta.url));
const API = process.env.TRANSLATE_API || 'https://translate.lnds.space/translate';
const SOURCE = 'en';
const TARGETS = ['pt-BR', 'es', 'fr'];
const CHUNK = 1200;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function translateText(text, target) {
	if (!text || !text.trim()) return text;
	const res = await fetch(API, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ q: text, source: SOURCE, target, format: 'text' }),
	});
	if (res.status === 429) {
		await sleep(1500);
		return translateText(text, target);
	}
	if (!res.ok) {
		throw new Error(`API ${res.status}: ${await res.text()} (${text.slice(0, 80)})`);
	}
	const data = await res.json();
	return data.translatedText;
}

/* Protect inline markdown tokens so the translator does not eat them.
 *
 * NOTE: placeholders used to be sent to the API (ZZLT0ZZ), but LibreTranslate
 * mangles them (e.g. "ZZLT0Z"), leaking artifacts into translated posts.
 * Instead, translateTextSegments() below never sends tokens to the API: it
 * splits prose into plain-text segments, translates each one, and rejoins
 * everything with the original tokens verbatim. */
const TOKEN_RE =
	/!\[[^\]]*\]\([^)]*\)|`[^`]*`|\[[^\]]*\]\([^)]*\)|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_/g;

/* Translate only the plain-text segments of a string.
 *
 * Markdown tokens are NEVER sent to the API verbatim (LibreTranslate mangles
 * placeholders like ZZLT0ZZ). Instead each token is handled intelligently:
 * code spans stay verbatim, while the human-readable part of emphasis, links
 * and images is translated and re-wrapped with the original markers/URLs. */
async function translateSegments(text, target) {
	if (!text || !text.trim()) return text;
	const parts = [];
	let lastIndex = 0;
	// Fresh regex instance per call so lastIndex never leaks between calls.
	const re = new RegExp(TOKEN_RE.source, 'g');
	let match;
	while ((match = re.exec(text)) !== null) {
		if (match.index > lastIndex) {
			parts.push({ token: false, text: text.slice(lastIndex, match.index) });
		}
		parts.push({ token: true, text: match[0] });
		lastIndex = match.index + match[0].length;
	}
	if (lastIndex < text.length) {
		parts.push({ token: false, text: text.slice(lastIndex) });
	}
	const out = [];
	for (const part of parts) {
		if (!part.token) {
			out.push(part.text.trim() ? await translateText(part.text, target) : part.text);
			continue;
		}
		out.push(await translateToken(part.text, target));
	}
	return out.join('');
}

/* Translate a single markdown token, preserving its syntax. */
async function translateToken(token, target) {
	if (token.startsWith('`')) return token; // code stays verbatim
	let m;
	if ((m = token.match(/^!\[([\s\S]*)\]\(([^)]*)\)$/))) {
		return `![${await translateSegments(m[1], target)}](${m[2]})`;
	}
	if ((m = token.match(/^\[([\s\S]*)\]\(([^)]*)\)$/))) {
		return `[${await translateSegments(m[1], target)}](${m[2]})`;
	}
	m = token.match(/^(\*\*|__|\*|_)([\s\S]+)\1$/);
	if (m) {
		return `${m[1]}${await translateSegments(m[2], target)}${m[1]}`;
	}
	return token;
}

/* Translate a markdown table row cell by cell, keeping pipes aligned.
 * Separator rows (`| --- | --- |`) pass through untouched. */
async function translateTableRow(line, target) {
	if (/^[\s|:=-]+$/.test(line.trim())) return line;
	const leading = /^\s*\|/.test(line);
	const trailing = /\|\s*$/.test(line);
	const cells = line.split('|');
	const out = [];
	for (let i = 0; i < cells.length; i++) {
		const isEdge = (i === 0 && leading) || (i === cells.length - 1 && trailing);
		if (isEdge || !cells[i].trim()) {
			out.push(cells[i]);
			continue;
		}
		out.push(await translateSegments(cells[i], target));
	}
	return out.join('|');
}


/* Translate an MDX body, preserving code fences, tables, links, images and JSX. */
async function translateMarkdown(md, target) {
	const lines = md.split('\n');
	const out = [];
	let inFence = false;
	let buffer = [];

	const flush = async () => {
		if (buffer.length === 0) return;
		const paragraph = buffer.join('\n');
		const translated = await translateParagraph(paragraph, target);
		out.push(translated);
		buffer = [];
	};

	for (const line of lines) {
		const trimmed = line.trim();

		if (trimmed.startsWith('```')) {
			await flush();
			inFence = !inFence;
			out.push(line);
			continue;
		}
		if (inFence) {
			out.push(line);
			continue;
		}

		if (trimmed === '') {
			await flush();
			out.push('');
			continue;
		}

		if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
			await flush();
			out.push(line);
			continue;
		}

		if (trimmed.includes('|')) {
			await flush();
			out.push(await translateTableRow(line, target));
			continue;
		}

		if (trimmed.startsWith('![')) {
			await flush();
			const m = line.match(/^(!\[)(.*?)(\]\(.*\))$/);
			if (m) {
				const alt = await translateSegments(m[2], target);
				out.push(`${m[1]}${alt}${m[3]}`);
			} else {
				out.push(line);
			}
			continue;
		}

		if (
			/^<[A-Za-z]/.test(trimmed) ||
			trimmed.startsWith('export ') ||
			trimmed.startsWith('{') ||
			trimmed.startsWith('import ')
		) {
			await flush();
			out.push(line);
			continue;
		}

		const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
		if (heading) {
			await flush();
			const text = (await translateParagraph(heading[2], target)).trim();
			out.push(`${heading[1]} ${text}`);
			continue;
		}

		if (trimmed.startsWith('>')) {
			await flush();
			const inner = trimmed.replace(/^>\s?/, '');
			const text = await translateParagraph(inner, target);
			out.push(`> ${text}`);
			continue;
		}

		const listItem = trimmed.match(/^([-*+]\s+|\d+\.\s+)(.*)$/);
		if (listItem) {
			await flush();
			const text = await translateParagraph(listItem[2], target);
			out.push(`${listItem[1]}${text}`);
			continue;
		}

		buffer.push(line);
	}
	await flush();
	return out.join('\n');
}

/* Translate select frontmatter fields (title, description, image alt). */
async function translateFrontmatter(frontmatter, target, locale, sourceFile) {
	const lines = frontmatter.split('\n');
	const out = [];
	
	// Extract canonicalSlug from source if available
	const sourceSlugMatch = frontmatter.match(/^canonicalSlug: (['"])(.+?)\1$/m);
	const canonicalSlug = sourceSlugMatch ? sourceSlugMatch[2] : sourceFile.replace('.mdx', '');
	
	let hasCanonicalSlug = false;
	
	for (const line of lines) {
		const match = line.match(/^( *)(title|description|alt): (['"])(.*?)\3$/);
		if (match) {
			const [, indent, key, , value] = match;
			const translated = await translateSegments(value, target);
			const safe = translated.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
			out.push(`${indent}${key}: "${safe}"`);
		} else if (/^locale: /.test(line)) {
			out.push(`locale: "${locale}"`);
		} else if (/^canonicalSlug: /.test(line)) {
			hasCanonicalSlug = true;
			out.push(line); // Keep canonicalSlug unchanged
		} else {
			out.push(line);
		}
	}
	
	// Add canonicalSlug if it doesn't exist
	if (!hasCanonicalSlug) {
		// Insert after locale line
		const localeIdx = out.findIndex(l => /^locale:/.test(l));
		if (localeIdx !== -1) {
			out.splice(localeIdx + 1, 0, `canonicalSlug: '${canonicalSlug}'`);
		} else {
			out.push(`canonicalSlug: '${canonicalSlug}'`);
		}
	}
	
	return out.join('\n');
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
	return dupes.map((d) => `'${d.key}' at line ${d.line} (first at line ${d.first})`).join(', ');
}

function extractFrontmatter(content) {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return null;
	return { frontmatter: match[1], body: content.slice(match[0].length) };
}

async function main() {
	const args = process.argv.slice(2);
	const regen = args.includes('--regen');
	const onlyIdx = args.indexOf('--only');
	const onlyFilter = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
	const sourceDir = join(BLOG_DIR, SOURCE);
	const files = readdirSync(sourceDir).filter((f) => f.endsWith('.mdx'));

	for (const file of files) {
		if (onlyFilter && !file.includes(onlyFilter)) continue;
		const fullPath = join(sourceDir, file);
		// Normalize CRLF so the `$`-anchored frontmatter regexes match: a stray \r
		// previously made title/description/alt silently stay untranslated.
		const content = readFileSync(fullPath, 'utf8').replace(/\r\n?/g, '\n');
		const parts = extractFrontmatter(content);
		if (!parts) {
			console.warn(`[skip] ${file}: could not parse frontmatter`);
			continue;
		}

		const duplicates = findDuplicateKeys(parts.frontmatter, 1); // frontmatter starts on file line 2
		if (duplicates.length) {
			throw new Error(`duplicate frontmatter key -> ${formatDuplicates(duplicates)} in ${file}`);
		}

		for (const target of TARGETS) {
			const outDir = join(BLOG_DIR, target);
			mkdirSync(outDir, { recursive: true });
			const outPath = join(outDir, file);
			if (existsSync(outPath) && !regen) {
				console.log(`[skip] exists ${target}/${file}`);
				continue;
			}
			const frontmatter = await translateFrontmatter(parts.frontmatter, target, target, file);
			const body = await translateMarkdown(parts.body, target);
			const output = `---\n${frontmatter}\n---\n\n${body.trim()}\n`;
			writeFileSync(outPath, output);
			console.log(`[ok] ${target}/${file}`);
			await sleep(120);
		}
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

async function translateParagraph(text, target) {
	return translateSegments(text, target);
}