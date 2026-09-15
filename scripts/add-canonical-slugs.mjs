// Script to add canonicalSlug to translated posts
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BLOG_DIR = 'src/content/blog';
const TARGETS = ['es', 'fr', 'pt-BR'];

for (const locale of TARGETS) {
	const localeDir = join(BLOG_DIR, locale);
	const files = readdirSync(localeDir).filter(f => f.endsWith('.mdx'));
	
	for (const file of files) {
		const fullPath = join(localeDir, file);
		let content = readFileSync(fullPath, 'utf8');
		
		if (content.includes('canonicalSlug:')) {
			console.log(`[skip] ${locale}/${file}: already has canonicalSlug`);
			continue;
		}
		
		const canonicalSlug = file.replace('.mdx', '');
		const lines = content.split('\n');
		const localeLineIndex = lines.findIndex(l => l.trim().startsWith('locale:'));
		
		if (localeLineIndex !== -1) {
			lines.splice(localeLineIndex + 1, 0, `canonicalSlug: '${canonicalSlug}'`);
			const newContent = lines.join('\n');
			writeFileSync(fullPath, newContent);
			console.log(`[ok] ${locale}/${file}: added canonicalSlug: '${canonicalSlug}'`);
		} else {
			console.log(`[warn] ${locale}/${file}: could not find locale line`);
		}
	}
}

console.log('Done!');