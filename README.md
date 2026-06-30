# Leaftix Blog

[![Astro 6](https://img.shields.io/badge/Astro-6-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Configured-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Live site:** [blog.leaftix.com](https://blog.leaftix.com)

Leaftix Blog is the official blog of [Leaftix](https://leaftix.com) — exploring the intersection of artificial intelligence, autonomous governance, and sustainable food production. Built with Astro.

It includes:

- a modern, responsive homepage with Leaftix branding
- About page with Leaftix GaiaOS content
- light and dark mode with a persistent header icon toggle
- cookie consent banner with saved preferences and a footer re-open action
- Privacy, Terms, Cookie Policy, and 404 pages
- shared header/footer/navigation
- MDX support for blog posts
- sitemap generation
- Open Graph and Twitter meta tags
- structured data defaults
- Netlify and Vercel config

## Tech Stack

- Astro 6
- Tailwind CSS 4 via Vite plugin
- MDX
- `@fontsource-variable/manrope`

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Configuration

Main site settings live in:

- [src/config/site.ts](./src/config/site.ts)

Update this file to customize:

- `name`
- `title`
- `description`
- `email`
- `authorName`
- `authorRole`
- social links
- navigation links

Set your production domain with an environment variable before deploying:

- `SITE_URL=https://blog.leaftix.com`
- or `PUBLIC_SITE_URL=https://blog.leaftix.com`

This keeps canonical URLs, `robots.txt`, and the sitemap aligned without editing source for each environment.

## SEO

The site includes:

- canonical URLs
- meta descriptions
- keyword meta
- Open Graph tags
- Twitter card tags
- sitemap generation
- dynamic `robots.txt`
- JSON-LD structured data defaults
- `noindex` handling for the 404 page

## Cookies and Consent

The site includes a client-side cookie consent system with:

- a bottom banner for first visit consent
- a preferences modal with essential, analytics, and marketing categories
- saved consent in `localStorage` under `leaftix-cookie-consent`
- a footer `Cookie Preferences` button for reopening the modal
- a `Cookies` policy page at `/cookies`

The site also saves the visitor's color theme in `localStorage` under `leaftix-theme`.

## Pages

- `/` — Homepage
- `/about` — About Leaftix
- `/blog` — Blog posts (coming soon)
- `/privacy` — Privacy Policy
- `/cookies` — Cookie Policy
- `/terms` — Terms of Use
- `/404` — Not Found

## Deployment

Included config:

- [netlify.toml](./netlify.toml)
- [vercel.json](./vercel.json)

If you only deploy to one platform, delete the other config file before wiring up CI so platform auto-detection stays predictable.

## License

MIT