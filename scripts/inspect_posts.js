const fs = require('fs');
const path = require('path');

const postsDir = path.resolve(__dirname, '..', 'posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.html'));

const postList = files.map(file => {
    const fullPath = path.join(postsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
    const title = titleMatch ? titleMatch[1].replace(' - 机场 TOP1', '').trim() : file;
    const desc = descMatch ? descMatch[1].trim() : '';
    const hasTechArticle = content.includes('"TechArticle"');
    const hasFAQ = content.includes('"FAQPage"');
    const hasBreadcrumbs = content.includes('"BreadcrumbList"');
    return { file, title, desc, hasTechArticle, hasFAQ, hasBreadcrumbs };
});

console.log(JSON.stringify(postList, null, 2));
