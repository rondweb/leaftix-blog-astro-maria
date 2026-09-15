import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const localeCodes = ['en', 'pt-BR', 'es', 'fr'] as const;
export type BlogLocale = (typeof localeCodes)[number];

const blog = defineCollection({
	// Blog posts are grouped by locale folder: src/content/blog/{en,pt-BR,es,fr}/.
	loader: glob({ pattern: '**/*.mdx', base: 'src/content/blog' }),
	schema: z.object({
		locale: z.enum(localeCodes),
		title: z.string(),
		description: z.string(),
		pubDate: z.date(),
		updatedDate: z.date().optional(),
		author: z.string().default('Leaftix'),
		image: z
			.object({
				url: z.string(),
				alt: z.string(),
			})
			.optional(),
		tags: z.array(z.string()).default([]),
		// Unique identifier for the post content (without locale prefix).
		// Used to group translations and build hreflang links.
		canonicalSlug: z.string(),
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog };