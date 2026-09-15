// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import tailwindcss from '@tailwindcss/vite';
import { siteConfig } from './src/config/site.ts';

const usingFallbackSiteUrl =
	!process.env.SITE_URL &&
	!process.env.PUBLIC_SITE_URL &&
	siteConfig.siteUrl === 'https://leaftix.com';

if (usingFallbackSiteUrl) {
	console.warn(
		'[leaftix-blog] Using the default site URL for SEO metadata. Set SITE_URL or PUBLIC_SITE_URL before publishing so canonical URLs and the sitemap are correct.'
	);
}

// https://astro.build/config
export default defineConfig({
	site: siteConfig.siteUrl,
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'pt-BR', 'es', 'fr'],
		routing: {
			// English (the official/default locale) lives at the root (/).
			// The other locales are served under a URL prefix (/pt-BR/, /es/, /fr/).
			prefixDefaultLocale: false,
		},
	},
	integrations: [
		mdx(),
		sitemap({
			i18n: {
				defaultLocale: 'en',
				locales: {
					en: 'en',
					'pt-BR': 'pt-BR',
					es: 'es',
					fr: 'fr',
				},
			},
			filter(page) {
				// Legal pages are excluded in every locale (e.g. /es/cookies/).
				const segments = new URL(page).pathname.split('/').filter(Boolean);
				return !['cookies', 'privacy', 'terms'].includes(segments.at(-1) ?? '');
			},
		}),
		robotsTxt({
			host: true,
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
