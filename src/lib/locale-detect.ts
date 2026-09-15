/**
 * Locale detection utilities for the Leaftix Blog.
 *
 * English (en) is the default and canonical locale, served at the root (/).
 * Other locales are served under URL prefixes (/pt-BR/, /es/, /fr/).
 */

import type { LocaleCode } from '../config/i18n';
import { defaultLocale, locales } from '../config/i18n';

/** Map base browser language codes to supported locales. */
const languageMap: Record<string, LocaleCode> = {
	en: 'en',
	pt: 'pt-BR',
	es: 'es',
	fr: 'fr',
};

/**
 * Determines the best matching locale from an Accept-Language header.
 *
 * @param acceptLanguage - The value of the Accept-Language header.
 * @returns The best matching LocaleCode, or the default locale.
 *
 * @example
 * // Returns 'pt-BR' for Brazilian Portuguese
 * determineLocale('pt-BR,pt;q=0.9,en;q=0.8')
 *
 * @example
 * // Returns 'es' for Spanish preference
 * determineLocale('es-ES,es;q=0.9,en;q=0.8')
 */
export function determineLocale(acceptLanguage: string | null): LocaleCode {
	if (!acceptLanguage) return defaultLocale;

	// Parse all languages with their quality values
	const parsedLanguages = acceptLanguage
		.split(',')
		.map((part) => {
			const trimmed = part.trim();
			const [lang, ...params] = trimmed.split(';');
			const qParam = params.find((p) => p.trim().startsWith('q='));
			const q = qParam ? parseFloat(qParam.split('=')[1]) : 1;
			return { lang: lang.trim(), q };
		})
		.sort((a, b) => b.q - a.q);

	// Find the first supported locale in preference order
	for (const { lang } of parsedLanguages) {
		const baseLang = lang.split('-')[0];
		if (languageMap[baseLang]) {
			return languageMap[baseLang];
		}
	}

	return defaultLocale;
}

/**
 * Gets the next available locale for a language switcher.
 * Returns locales in a defined order for cycling.
 */
export function getNextLocale(current: LocaleCode): LocaleCode {
	const currentIndex = locales.indexOf(current);
	const nextIndex = (currentIndex + 1) % locales.length;
	return locales[nextIndex];
}