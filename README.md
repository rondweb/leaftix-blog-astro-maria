# Alba

Alba is a clean Astro portfolio template for UX designers, product designers, and visual product thinkers.

It includes:

- a polished portfolio homepage
- a sample case study page
- About and Resume pages
- Privacy, Terms, and 404 pages
- shared header/footer/navigation
- MDX support
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

## Template Setup

The main template settings live in:

- [site.config.mjs](./site.config.mjs)

Update this file before publishing:

- `siteUrl`
- `name`
- `title`
- `description`
- `email`
- `authorName`
- `authorRole`
- social links

## SEO

The template includes:

- canonical URLs
- meta descriptions
- keyword meta
- Open Graph tags
- Twitter card tags
- sitemap generation
- dynamic `robots.txt`
- JSON-LD structured data defaults
- `noindex` handling for the 404 page

Main SEO files:

- [src/layouts/Layout.astro](./src/layouts/Layout.astro)
- [astro.config.mjs](./astro.config.mjs)
- [src/pages/robots.txt.ts](./src/pages/robots.txt.ts)
- [public/og-image.svg](./public/og-image.svg)

## Content and Pages

Main pages:

- `/`
- `/about`
- `/resume`
- `/work/nextpoint`
- `/privacy`
- `/terms`
- `/404`

There is also a starter MDX content example in:

- [src/content/pages/getting-started.mdx](./src/content/pages/getting-started.mdx)

## Deployment

Included config:

- [netlify.toml](./netlify.toml)
- [vercel.json](./vercel.json)

## Notes

- Replace the example project copy and images with your own work.
- Replace `https://your-domain.com` in [site.config.mjs](./site.config.mjs) before deploying.
- The social share image is a template default and can be replaced with your own branded preview.
