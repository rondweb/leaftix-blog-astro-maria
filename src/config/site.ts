export type SiteLink = {
	href: string;
	label: string;
};

export type SiteConfig = {
	name: string;
	title: string;
	description: string;
	siteUrl: string;
	email: string;
	locale: string;
	authorName: string;
	authorRole: string;
	keywords: string[];
	ogImage: string;
	navLinks: SiteLink[];
	extraPages: SiteLink[];
	legalLinks: SiteLink[];
	socialLinks: SiteLink[];
};

const defaultSiteUrl = 'https://leaftix.com';
const envSiteUrl = process.env.SITE_URL ?? process.env.PUBLIC_SITE_URL;
const normalizedSiteUrl = (envSiteUrl || defaultSiteUrl).replace(/\/+$/, '');

export const siteConfig: SiteConfig = {
	name: 'Leaftix Blog',
	title: 'Leaftix Blog | AI, Autonomous Governance & Sustainable Food Production',
	description:
		'Leaftix GaiaOS is Leaftix\'s autonomous governance operating system for sustainable food production. Multi-agent AI, Digital Twin, edge-native architecture — from monitoring to proactive governance.',
	// Set SITE_URL or PUBLIC_SITE_URL to keep canonicals, robots.txt, and the sitemap aligned in each environment.
	siteUrl: normalizedSiteUrl,
	email: 'info@leaftix.com',
	locale: 'en-US',
	authorName: 'Ronaldo Andrade',
	authorRole: 'CEO',
	keywords: [
		'Leaftix GaiaOS',
		'Leaftix',
		'artificial intelligence agriculture',
		'autonomous governance',
		'sustainable production',
		'digital twin',
		'agtech',
		'precision farming',
		'food security',
		'AI agriculture',
		'sustainable food production',
		'autonomous governance',
		'edge computing agriculture',
	],
	ogImage: 'https://leaftix.com/og-image.png',
	navLinks: [
		{ href: '/blog', label: 'Blog' },
		{ href: '/about', label: 'About' },
	],
	extraPages: [
		{ href: '/cookies', label: 'Cookies' },
		{ href: '/privacy', label: 'Privacy' },
		{ href: '/terms', label: 'Terms' },
		{ href: '/404', label: '404' },
	],
	legalLinks: [
		{ href: '/cookies', label: 'Cookies' },
		{ href: '/privacy', label: 'Privacy' },
		{ href: '/terms', label: 'Terms' },
	],
	socialLinks: [
		{ href: 'https://www.linkedin.com/company/leaftix/', label: 'LinkedIn' },
		{ href: 'https://www.facebook.com/profile.php?id=61560266627242', label: 'Facebook' },
		{ href: 'https://www.instagram.com/leaftixagrotech/', label: 'Instagram' },
	],
};