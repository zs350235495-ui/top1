const fs = require('fs');
const path = require('path');

// Execute data.js in VM/eval context to get AIRPORTS_DATA and REVIEWS_DATA
const dataJsContent = fs.readFileSync('./js/data.js', 'utf8')
    .replace('const AIRPORTS_DATA =', 'global.AIRPORTS_DATA =')
    .replace('const BLOG_ARTICLES_DATA =', 'global.BLOG_ARTICLES_DATA =')
    .replace('const REVIEWS_DATA =', 'global.REVIEWS_DATA =');
eval(dataJsContent);

const baseUrl = 'https://jichangtop1.com'; // Standard base URL for sitemap
const now = new Date().toISOString().split('T')[0];

let urls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' }
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

// Write sitemap.xml
fs.writeFileSync('./sitemap.xml', sitemapXml, 'utf8');
console.log(`Successfully generated sitemap.xml with ${urls.length} URLs!`);

// Generate robots.txt content
let robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

fs.writeFileSync('./robots.txt', robotsTxt, 'utf8');
console.log('Successfully generated robots.txt!');
