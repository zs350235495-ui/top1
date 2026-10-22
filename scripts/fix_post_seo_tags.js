const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(postsDir, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // 1. 检查并补充 canonical
    if (!html.includes('rel="canonical"')) {
        const canonicalTag = `\n    <link rel="canonical" href="https://jichangtop1.com/posts/${file}">`;
        if (html.includes('</title>')) {
            html = html.replace('</title>', `</title>${canonicalTag}`);
        } else if (html.includes('<meta name="description"')) {
            html = html.replace(/(<meta name="description"[^>]*>)/, `$1${canonicalTag}`);
        }
    }

    // 2. 检查并补充 Open Graph site_name 与基础 OG 标签
    if (!html.includes('property="og:site_name"')) {
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        const descMatch = html.match(/<meta name="description" content="(.*?)">/);
        const title = titleMatch ? titleMatch[1].replace(' - 机场 TOP1', '') : '机场 TOP1 技术指南';
        const desc = descMatch ? descMatch[1] : '机场 TOP1 专业的跨境网络节点与技术评测知识库';

        const ogTags = `
    <!-- Open Graph / Telegram -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="机场 TOP1">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="https://jichangtop1.com/posts/${file}">
    <meta property="og:image" content="https://jichangtop1.com/images/logo-horizontal.png">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="https://jichangtop1.com/images/logo-horizontal.png">`;

        if (html.includes('rel="canonical"')) {
            html = html.replace(/(<link rel="canonical"[^>]*>)/, `$1${ogTags}`);
        }
    }

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`[已优化] ${file}`);
});

console.log('所有 posts/*.html 页面 SEO 标签检查与修复完成！');
