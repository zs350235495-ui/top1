const fs = require('fs');
const path = require('path');

// Execute data.js in VM/eval context to get AIRPORTS_DATA and BLOG_ARTICLES_DATA
const dataJsContent = fs.readFileSync('./js/data.js', 'utf8')
    .replace('const AIRPORTS_DATA =', 'global.AIRPORTS_DATA =')
    .replace('const BLOG_ARTICLES_DATA =', 'global.BLOG_ARTICLES_DATA =')
    .replace('const REVIEWS_DATA =', 'global.REVIEWS_DATA =');
eval(dataJsContent);

const baseUrl = 'https://jichangtop1.com';
const now = new Date().toISOString().split('T')[0];
const rfc822Date = new Date().toUTCString();

// 1. 生成 Sitemap URLs
let urls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/flagship-network-sla-benchmark-2026`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/network-protocol-topology-handbook-2026`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/compare`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/reviews`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/blackholes`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/protocols`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/about`, priority: '0.7', changefreq: 'monthly' }
];

// Add standalone HTML posts from posts/ directory
if (fs.existsSync('./posts')) {
    const postFiles = fs.readdirSync('./posts').filter(f => f.endsWith('.html'));
    postFiles.forEach(file => {
        urls.push({
            loc: `${baseUrl}/posts/${file}`,
            priority: '0.8',
            changefreq: 'weekly'
        });
    });
}

// Generate sitemap.xml content
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

urls.forEach(item => {
    sitemapXml += `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>
`;
});

sitemapXml += `</urlset>
`;

fs.writeFileSync('./sitemap.xml', sitemapXml, 'utf8');
console.log(`[成功] 生成 sitemap.xml，共收录 ${urls.length} 个独立 URL！`);

// 2. 生成专业级 robots.txt
let robotsTxt = `User-agent: *
Allow: /
Disallow: /scripts/
Disallow: /scratch/
Disallow: /content/
Disallow: /.github/
Disallow: /cdn-cgi/
# SEO Compliance Notice:
# /go/ and /go.html are deliberately NOT blocked by robots.txt to ensure crawlers
# can detect the <meta name="robots" content="noindex, nofollow"> tag and avoid
# Bing Webmaster "Blocked by robots.txt" indexing errors.

# AI Search Engine Crawlers (GEO - Generative Engine Optimization)
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
# LLM Knowledge Standard: ${baseUrl}/llms.txt
`;

fs.writeFileSync('./robots.txt', robotsTxt, 'utf8');
console.log('[成功] 生成专业级 robots.txt，含 AI 爬虫友好放行与 llms.txt 规范！');

// 3. 生成符合 RSS 2.0 规范的 feed.xml
let articles = [];
if (typeof BLOG_ARTICLES_DATA !== 'undefined' && Array.isArray(BLOG_ARTICLES_DATA)) {
    articles = BLOG_ARTICLES_DATA;
} else if (typeof generateBlogArticles === 'function') {
    articles = generateBlogArticles();
}

let feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>机场 TOP1 - 2026 稳定节点评测推荐与跑路避坑预警</title>
    <link>${baseUrl}/</link>
    <description>专业的跨境网络节点性能压测、独家7折优惠码与客户端规则分流知识库</description>
    <language>zh-CN</language>
    <lastBuildDate>${rfc822Date}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
`;

articles.slice(0, 15).forEach(art => {
    const rawUrl = art.url || (art.id ? `posts/${art.id}.html` : '');
    if (!rawUrl) return;
    const pubDate = art.date ? new Date(art.date).toUTCString() : rfc822Date;
    const postUrl = rawUrl.startsWith('http') ? rawUrl : `${baseUrl}/${rawUrl.replace(/^\/+/, '')}`;
    feedXml += `    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${art.desc || art.summary || art.title}]]></description>
      <author>${art.author || '机场 TOP1'}</author>
    </item>
`;
});

feedXml += `  </channel>
</rss>
`;

fs.writeFileSync('./feed.xml', feedXml, 'utf8');
console.log(`[成功] 生成标准 RSS 2.0 feed.xml，共输出 ${articles.length} 篇最新技术文章！`);
