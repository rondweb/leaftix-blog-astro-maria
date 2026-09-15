// Central internationalization configuration for the Leaftix Blog.
//
// English (en) is the official/default locale and is served at the root (/).
// The remaining locales are served under a URL prefix (/pt-BR/, /es/, /fr/).

export type LocaleCode = 'en' | 'pt-BR' | 'es' | 'fr';

export const defaultLocale: LocaleCode = 'en';

export const locales: LocaleCode[] = ['en', 'pt-BR', 'es', 'fr'];

export type LocaleMeta = {
	code: LocaleCode;
	htmlLang: string; // value for the <html lang="..."> attribute
	ogLocale: string; // value for og:locale (facebook format)
	dateLocale: string; // value for Intl.DateTimeFormat / toLocaleDateString
	nativeName: string; // the language name written in its own language
	shortName: string; // short label used in the language switcher
};

export const localeMeta: Record<LocaleCode, LocaleMeta> = {
	en: {
		code: 'en',
		htmlLang: 'en',
		ogLocale: 'en_US',
		dateLocale: 'en-US',
		nativeName: 'English',
		shortName: 'EN',
	},
	'pt-BR': {
		code: 'pt-BR',
		htmlLang: 'pt-BR',
		ogLocale: 'pt_BR',
		dateLocale: 'pt-BR',
		nativeName: 'Português (Brasil)',
		shortName: 'PT',
	},
	es: {
		code: 'es',
		htmlLang: 'es',
		ogLocale: 'es_ES',
		dateLocale: 'es-ES',
		nativeName: 'Español',
		shortName: 'ES',
	},
	fr: {
		code: 'fr',
		htmlLang: 'fr',
		ogLocale: 'fr_FR',
		dateLocale: 'fr-FR',
		nativeName: 'Français',
		shortName: 'FR',
	},
};

/**
 * Builds the URL path for a given locale from a base path, stripping any
 * existing locale prefix first, then reapplying the target one.
 * The default locale (en) has no prefix.
 */
export function getLocalePath(path: string, locale: LocaleCode = defaultLocale): string {
	let clean = path.replace(/\/+$/, '') || '/';

	for (const code of locales) {
		const prefix = `/${code}`;
		if (clean === prefix || clean.startsWith(`${prefix}/`)) {
			clean = clean.slice(prefix.length) || '/';
			break;
		}
	}

	if (locale === defaultLocale) {
		return clean === '/' ? '/' : clean;
	}
	return `/${locale}${clean === '/' ? '' : clean}`;
}

/**
 * getStaticPaths() params for every locale except the default one.
 * Used by the localized routes under src/pages/[locale]/ so each of them
 * generates its /pt-BR, /es and /fr URLs without repeating the same list.
 */
export function localeParams() {
	return locales
		.filter((code) => code !== defaultLocale)
		.map((locale) => ({ params: { locale } }));
}

/* -------------------------------------------------------------------------- */
/*  UI strings dictionary                                                     */
/* -------------------------------------------------------------------------- */

type UiDict = {
	common: {
		skipToContent: string;
		readArticle: string;
		backToBlog: string;
		goToHomepage: string;
		updated: string;
		readTheBlog: string;
		aboutLeaftix: string;
		contactUs: string;
		viewCaseStudy: string;
		noPosts: string;
		blog: string;
	};
	nav: {
		home: string;
		blog: string;
		about: string;
		work: string;
		resume: string;
		other: string;
		cookies: string;
		privacy: string;
		terms: string;
		homepageAria: string;
		primaryAria: string;
		moreAria: string;
		mobileAria: string;
		toggleMenu: string;
		changeLanguage: string;
		themeDark: string;
		themeLight: string;
	};
	footer: {
		ctaTitle: string;
		ctaText: string;
		cookiePreferences: string;
		copyrightSuffix: string;
	};
	index: {
		heroTitle: string;
		heroText: string;
		latestPosts: string;
		recentHeading: string;
		ctaTitle: string;
		ctaText: string;
	};
	blog: {
		eyebrow: string;
		title: string;
		description: string;
		heading: string;
		intro: string;
		postsAria: string;
	};
	notFound: {
		title: string;
		description: string;
		heading: string;
		intro: string;
	};
};

export const ui: Record<LocaleCode, UiDict> = {
	en: {
		common: {
			skipToContent: 'Skip to content',
			readArticle: 'Read article',
			backToBlog: 'Back to Blog',
			goToHomepage: 'Go to homepage',
			updated: 'Updated',
			readTheBlog: 'Read the Blog',
			aboutLeaftix: 'About Leaftix',
			contactUs: 'Contact us',
			viewCaseStudy: 'View case study',
			noPosts: 'No posts yet. Check back soon!',
			blog: 'Blog',
		},
		nav: {
			home: 'Home',
			blog: 'Blog',
			about: 'About',
			work: 'Work',
			resume: 'Resume',
			other: 'Other',
			cookies: 'Cookies',
			privacy: 'Privacy',
			terms: 'Terms',
			homepageAria: 'homepage',
			primaryAria: 'Primary navigation',
			moreAria: 'More navigation pages',
			mobileAria: 'Mobile navigation',
			toggleMenu: 'Toggle navigation menu',
			changeLanguage: 'Change language',
			themeDark: 'Switch to dark mode',
			themeLight: 'Switch to light mode',
		},
		footer: {
			ctaTitle: "Let's build the future of autonomous food production together.",
			ctaText:
				'Follow our journey or reach out to learn more about Leaftix GaiaOS and how AI is transforming sustainable agriculture.',
			cookiePreferences: 'Cookie Preferences',
			copyrightSuffix: 'AI for Sustainable Food Production.',
		},
		index: {
			heroTitle: 'The future of sustainable food production is autonomous.',
			heroText:
				'Welcome to the Leaftix Blog — where we explore the intersection of artificial intelligence, autonomous governance, and sustainable agriculture. Discover how multi-agent AI, Digital Twins, and edge-native architectures are transforming food production from reactive monitoring to proactive governance.',
			latestPosts: 'Latest Posts',
			recentHeading: 'Recent articles from the blog',
			ctaTitle: 'Stay updated with Leaftix',
			ctaText:
				'Follow our journey as we build the autonomous governance infrastructure for sustainable food production. New articles, research insights, and product updates.',
		},
		blog: {
			eyebrow: 'Blog',
			title: 'Blog | Leaftix Blog',
			description:
				'Explore articles about AI-driven autonomous governance, Digital Twin technology, edge-native architecture, and sustainable food production.',
			heading: 'Insights on AI, autonomous governance, and the future of food production.',
			intro:
				'Articles, research insights, product updates, and technical deep dives from the Leaftix team.',
			postsAria: 'Blog posts',
		},
		notFound: {
			title: 'Page Not Found | Leaftix Blog',
			description: '404 page for the Leaftix Blog.',
			heading: 'Page not found.',
			intro:
				'The link may be outdated, the page may have moved, or the URL may have been typed incorrectly.',
		},
	},
	'pt-BR': {
		common: {
			skipToContent: 'Pular para o conteúdo',
			readArticle: 'Ler o artigo',
			backToBlog: 'Voltar ao Blog',
			goToHomepage: 'Ir para a página inicial',
			updated: 'Atualizado',
			readTheBlog: 'Ler o Blog',
			aboutLeaftix: 'Sobre a Leaftix',
			contactUs: 'Fale conosco',
			viewCaseStudy: 'Ver estudo de caso',
			noPosts: 'Ainda não há posts. Volte em breve!',
			blog: 'Blog',
		},
		nav: {
			home: 'Início',
			blog: 'Blog',
			about: 'Sobre',
			work: 'Trabalhos',
			resume: 'Currículo',
			other: 'Outros',
			cookies: 'Cookies',
			privacy: 'Privacidade',
			terms: 'Termos',
			homepageAria: 'página inicial',
			primaryAria: 'Navegação principal',
			moreAria: 'Mais páginas de navegação',
			mobileAria: 'Navegação móvel',
			toggleMenu: 'Alternar menu de navegação',
			changeLanguage: 'Alterar idioma',
			themeDark: 'Alternar para o modo escuro',
			themeLight: 'Alternar para o modo claro',
		},
		footer: {
			ctaTitle: 'Vamos construir juntos o futuro da produção autônoma de alimentos.',
			ctaText:
				'Acompanhe nossa jornada ou entre em contato para saber mais sobre o Leaftix GaiaOS e como a IA está transformando a agricultura sustentável.',
			cookiePreferences: 'Preferências de cookies',
			copyrightSuffix: 'IA para a produção sustentável de alimentos.',
		},
		index: {
			heroTitle: 'O futuro da produção sustentável de alimentos é autônomo.',
			heroText:
				'Bem-vindo ao Leaftix Blog — onde exploramos a interseção entre inteligência artificial, governança autônoma e agricultura sustentável. Descubra como a IA multiagente, os Gêmeos Digitais e as arquiteturas nativas de borda estão transformando a produção de alimentos, do monitoramento reativo à governança proativa.',
			latestPosts: 'Últimos Posts',
			recentHeading: 'Artigos recentes do blog',
			ctaTitle: 'Fique atualizado com a Leaftix',
			ctaText:
				'Acompanhe nossa jornada enquanto construímos a infraestrutura de governança autônoma para a produção sustentável de alimentos. Novos artigos, insights de pesquisa e atualizações de produtos.',
		},
		blog: {
			eyebrow: 'Blog',
			title: 'Blog | Leaftix Blog',
			description:
				'Explore artigos sobre governança autônoma impulsionada por IA, tecnologia de Gêmeos Digitais, arquitetura nativa de borda e produção sustentável de alimentos.',
			heading: 'Insights sobre IA, governança autônoma e o futuro da produção de alimentos.',
			intro:
				'Artigos, insights de pesquisa, atualizações de produtos e mergulhos técnicos aprofundados da equipe Leaftix.',
			postsAria: 'Posts do blog',
		},
		notFound: {
			title: 'Página não encontrada | Leaftix Blog',
			description: 'Página 404 do Leaftix Blog.',
			heading: 'Página não encontrada.',
			intro:
				'O link pode estar desatualizado, a página pode ter sido movida ou a URL pode ter sido digitada incorretamente.',
		},
	},
	es: {
		common: {
			skipToContent: 'Saltar al contenido',
			readArticle: 'Leer el artículo',
			backToBlog: 'Volver al Blog',
			goToHomepage: 'Ir a la página de inicio',
			updated: 'Actualizado',
			readTheBlog: 'Leer el Blog',
			aboutLeaftix: 'Acerca de Leaftix',
			contactUs: 'Contáctanos',
			viewCaseStudy: 'Ver estudio de caso',
			noPosts: 'Aún no hay publicaciones. ¡Vuelve pronto!',
			blog: 'Blog',
		},
		nav: {
			home: 'Inicio',
			blog: 'Blog',
			about: 'Acerca',
			work: 'Trabajos',
			resume: 'Currículum',
			other: 'Otros',
			cookies: 'Cookies',
			privacy: 'Privacidad',
			terms: 'Términos',
			homepageAria: 'página de inicio',
			primaryAria: 'Navegación principal',
			moreAria: 'Más páginas de navegación',
			mobileAria: 'Navegación móvil',
			toggleMenu: 'Alternar menú de navegación',
			changeLanguage: 'Cambiar idioma',
			themeDark: 'Cambiar al modo oscuro',
			themeLight: 'Cambiar al modo claro',
		},
		footer: {
			ctaTitle: 'Construyamos juntos el futuro de la producción autónoma de alimentos.',
			ctaText:
				'Sigue nuestro viaje o contacta para saber más sobre Leaftix GaiaOS y cómo la IA está transformando la agricultura sostenible.',
			cookiePreferences: 'Preferencias de cookies',
			copyrightSuffix: 'IA para la producción sostenible de alimentos.',
		},
		index: {
			heroTitle: 'El futuro de la producción sostenible de alimentos es autónomo.',
			heroText:
				'Bienvenido al Leaftix Blog, donde exploramos la intersección entre la inteligencia artificial, la gobernanza autónoma y la agricultura sostenible. Descubre cómo la IA multiagente, los Gemelos Digitales y las arquitecturas nativas de borde están transformando la producción de alimentos, de la monitorización reactiva a la gobernanza proactiva.',
			latestPosts: 'Últimas Publicaciones',
			recentHeading: 'Artículos recientes del blog',
			ctaTitle: 'Mantente al día con Leaftix',
			ctaText:
				'Sigue nuestro viaje mientras construimos la infraestructura de gobernanza autónoma para la producción sostenible de alimentos. Nuevos artículos, conocimientos de investigación y actualizaciones de productos.',
		},
		blog: {
			eyebrow: 'Blog',
			title: 'Blog | Leaftix Blog',
			description:
				'Explora artículos sobre gobernanza autónoma impulsada por IA, tecnología de Gemelos Digitales, arquitectura nativa de borde y producción sostenible de alimentos.',
			heading: 'Perspectivas sobre IA, gobernanza autónoma y el futuro de la producción de alimentos.',
			intro:
				'Artículos, conocimientos de investigación, actualizaciones de productos y análisis técnicos del equipo de Leaftix.',
			postsAria: 'Publicaciones del blog',
		},
		notFound: {
			title: 'Página no encontrada | Leaftix Blog',
			description: 'Página 404 del Leaftix Blog.',
			heading: 'Página no encontrada.',
			intro:
				'El enlace puede estar desactualizado, la página puede haberse movido o la URL puede haberse escrito incorrectamente.',
		},
	},
fr: {
		common: {
			skipToContent: 'Aller au contenu',
			readArticle: "Lire l'article",
			backToBlog: 'Retour au Blog',
			goToHomepage: "Aller à la page d'accueil",
			updated: 'Mis à jour',
			readTheBlog: 'Lire le Blog',
			aboutLeaftix: 'À propos de Leaftix',
			contactUs: 'Contactez-nous',
			viewCaseStudy: "Voir l'étude de cas",
			noPosts: 'Aucune publication pour le moment. Revenez bientôt !',
			blog: 'Blog',
		},
		nav: {
			home: 'Accueil',
			blog: 'Blog',
			about: 'À propos',
			work: 'Projets',
			resume: 'CV',
			other: 'Autres',
			cookies: 'Cookies',
			privacy: 'Confidentialité',
			terms: 'Conditions',
			homepageAria: "page d'accueil",
			primaryAria: 'Navigation principale',
			moreAria: 'Autres pages de navigation',
			mobileAria: 'Navigation mobile',
			toggleMenu: 'Basculer le menu de navigation',
			changeLanguage: 'Changer de langue',
			themeDark: 'Passer au mode sombre',
			themeLight: 'Passer au mode clair',
		},
		footer: {
			ctaTitle: 'Construisons ensemble l’avenir de la production alimentaire autonome.',
			ctaText:
				"Suivez notre parcours ou contactez-nous pour en savoir plus sur Leaftix GaiaOS et comment l'IA transforme l'agriculture durable.",
			cookiePreferences: 'Préférences de cookies',
			copyrightSuffix: 'IA pour une production alimentaire durable.',
		},
		index: {
			heroTitle: "L'avenir de la production alimentaire durable est autonome.",
			heroText:
				"Bienvenue sur le Leaftix Blog, où nous explorons l'intersection entre l'intelligence artificielle, la gouvernance autonome et l'agriculture durable. Découvrez comment l'IA multi-agents, les jumeaux numériques et les architectures natives de périphérie transforment la production alimentaire, de la surveillance réactive à la gouvernance proactive.",
			latestPosts: 'Dernières Publications',
			recentHeading: 'Articles récents du blog',
			ctaTitle: 'Restez informé avec Leaftix',
			ctaText:
				"Suivez notre parcours alors que nous construisons l'infrastructure de gouvernance autonome pour une production alimentaire durable. Nouveaux articles, aperçus de recherche et mises à jour de produits.",
		},
		blog: {
			eyebrow: 'Blog',
			title: 'Blog | Leaftix Blog',
			description:
				"Explorez des articles sur la gouvernance autonome pilotée par l'IA, la technologie des jumeaux numériques, l'architecture native de périphérie et la production alimentaire durable.",
			heading: "Aperçus sur l'IA, la gouvernance autonome et l'avenir de la production alimentaire.",
			intro:
				"Articles, aperçus de recherche, mises à jour de produits et analyses techniques approfondies de l'équipe Leaftix.",
			postsAria: 'Publications du blog',
		},
		notFound: {
			title: 'Page introuvable | Leaftix Blog',
			description: 'Page 404 du Leaftix Blog.',
			heading: 'Page introuvable.',
			intro:
				"Le lien est peut-être obsolète, la page a peut-être été déplacée ou l'URL a peut-être été mal saisie.",
		},
	},
};

/** Returns the UI dictionary for a given locale code. */
export function getUi(locale: LocaleCode = defaultLocale): UiDict {
	return ui[locale] ?? ui[defaultLocale];
}
