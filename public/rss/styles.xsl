<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
	version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
>
	<xsl:output method="html" encoding="UTF-8" version="1.0" doctype-system="about:legacy-compat" />

	<xsl:template match="/">
		<html lang="en-US">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width" />
				<title><xsl:value-of select="/rss/channel/title" /></title>
				<style>
					:root {
						color-scheme: light dark;
						--background: #ffffff;
						--foreground: #171717;
						--muted: #f7f7f7;
						--muted-foreground: #676767;
						--border: #d9d9d9;
						--accent-link: #5869d8;
						--font-sans: 'Manrope Variable', 'Inter', 'Segoe UI', sans-serif;
						--font-mono: 'SF Mono', 'Roboto Mono', 'Consolas', monospace;
					}
					@media (prefers-color-scheme: dark) {
						:root {
							--background: #0d1014;
							--foreground: #f5f7fb;
							--muted: #171b22;
							--muted-foreground: #a3acb9;
							--border: #2a313c;
							--accent-link: #9dacff;
						}
					}
					* { box-sizing: border-box; }
					body {
						margin: 0;
						padding: 3rem 1.5rem;
						font-family: var(--font-sans);
						color: var(--foreground);
						background: var(--background);
						line-height: 1.6;
					}
					.container { max-width: 42rem; margin: 0 auto; }
					h1 { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.04em; margin: 0 0 0.25rem; }
					.feed-description { color: var(--muted-foreground); margin: 0 0 2rem; font-size: 1.05rem; }
					.feed-meta { font-size: 0.88rem; color: var(--muted-foreground); margin-bottom: 2.5rem; font-family: var(--font-mono); }
					.post { padding: 1.5rem 0; border-bottom: 1px solid var(--border); }
					.post:last-child { border-bottom: none; }
					.post-title { margin: 0 0 0.4rem; }
					.post-title a {
						font-size: 1.35rem;
						font-weight: 700;
						letter-spacing: -0.03em;
						color: var(--accent-link);
						text-decoration: none;
					}
					.post-title a:hover { text-decoration: underline; }
					.post-meta { font-size: 0.85rem; color: var(--muted-foreground); margin-bottom: 0.5rem; font-family: var(--font-mono); }
					.post-desc { margin: 0; font-size: 0.98rem; color: var(--muted-foreground); line-height: 1.65; }
					.post-tags { margin-top: 0.6rem; display: flex; flex-wrap: wrap; gap: 0.35rem; }
					.tag {
						padding: 0.15rem 0.5rem;
						border-radius: 999px;
						background: var(--muted);
						font-size: 0.75rem;
						font-weight: 600;
						color: var(--muted-foreground);
						font-family: var(--font-mono);
						text-transform: uppercase;
						letter-spacing: 0.04em;
					}
					.subscribe {
						margin-top: 2rem;
						padding: 1rem 1.25rem;
						background: var(--muted);
						border-radius: 0.75rem;
						font-size: 0.92rem;
						color: var(--muted-foreground);
						text-align: center;
					}
					.subscribe a { color: var(--accent-link); text-decoration: none; font-weight: 600; }
					.subscribe a:hover { text-decoration: underline; }
				</style>
			</head>
			<body>
				<div class="container">
					<h1><xsl:value-of select="/rss/channel/title" /></h1>
					<p class="feed-description"><xsl:value-of select="/rss/channel/description" /></p>
					<p class="feed-meta">
						<xsl:value-of select="count(/rss/channel/item)" /> posts —
						<xsl:value-of select="/rss/channel/language" />
					</p>

					<xsl:apply-templates select="/rss/channel/item" />

					<div class="subscribe">
						Subscribe:
						<a href="{/rss/channel/link}rss.xml">RSS Feed</a>
					</div>
				</div>
			</body>
		</html>
	</xsl:template>

	<xsl:template match="item">
		<article class="post">
			<h2 class="post-title">
				<a href="{link}"><xsl:value-of select="title" /></a>
			</h2>
			<p class="post-meta">
				<xsl:value-of select="substring(pubDate, 1, 16)" />
				<xsl:if test="author"> — <xsl:value-of select="author" /></xsl:if>
			</p>
			<p class="post-desc"><xsl:value-of select="description" /></p>
			<xsl:if test="category">
				<div class="post-tags">
					<xsl:for-each select="category">
						<span class="tag"><xsl:value-of select="." /></span>
					</xsl:for-each>
				</div>
			</xsl:if>
		</article>
	</xsl:template>
</xsl:stylesheet>