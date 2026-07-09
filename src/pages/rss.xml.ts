import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteConfig } from '../config/site';

export async function GET(context) {
	const allPosts = await getCollection('blog', ({ data }) => !data.draft);
	const sortedPosts = allPosts.sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	);

	return rss({
		title: siteConfig.name,
		description: siteConfig.description,
		site: context.site,
		items: sortedPosts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			link: `/blog/${post.id}/`,
			pubDate: post.data.pubDate,
			author: post.data.author || siteConfig.authorName,
			categories: post.data.tags,
			customData: post.data.updatedDate
				? `<lastBuildDate>${post.data.updatedDate.toUTCString()}</lastBuildDate>`
				: undefined,
		})),
		stylesheet: '/rss/styles.xsl',
		customData: `<language>${siteConfig.locale}</language>`,
	});
}