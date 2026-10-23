const fs = require('fs');
const path = require('path');

const baseUrl = 'https://jichangtop1.com';

function injectHreflangAndReferrer(filePath, relUrl) {
    if (!fs.existsSync(filePath)) return;
    let html = fs.readFileSync(filePath, 'utf8');

    if (!html.includes('hreflang="zh-CN"')) {
        const fullUrl = `${baseUrl}/${relUrl}`.replace(/\/+$/, '/');
        const hreflangBlock = `
    <!-- Hreflang & Multi-region targeting -->
    <link rel="alternate" hreflang="zh-CN" href="${fullUrl}">
    <link rel="alternate" hreflang="zh-TW" href="${fullUrl}">
    <link rel="alternate" hreflang="zh-HK" href="${fullUrl}">
    <link rel="alternate" hreflang="x-default" href="${fullUrl}">
    <meta name="referrer" content="strict-origin-when-cross-origin">`;

        if (html.includes('</head>')) {
            html = html.replace('</head>', `${hreflangBlock}\n</head>`);
            fs.writeFileSync(filePath, html, 'utf8');
            console.log(`[Hreflang & Referrer 注入完成] ${filePath}`);
        }
    }
}

// 根目录核心页面
injectHreflangAndReferrer(path.join(__dirname, '../index.html'), '');
injectHreflangAndReferrer(path.join(__dirname, '../compare.html'), 'compare.html');
injectHreflangAndReferrer(path.join(__dirname, '../reviews.html'), 'reviews.html');
injectHreflangAndReferrer(path.join(__dirname, '../blackholes.html'), 'blackholes.html');
injectHreflangAndReferrer(path.join(__dirname, '../protocols.html'), 'protocols.html');
injectHreflangAndReferrer(path.join(__dirname, '../about.html'), 'about.html');

// posts 目录核心页面
const postsDir = path.join(__dirname, '../posts');
if (fs.existsSync(postsDir)) {
    fs.readdirSync(postsDir).filter(f => f.endsWith('.html')).forEach(f => {
        injectHreflangAndReferrer(path.join(postsDir, f), `posts/${f}`);
    });
}

console.log('所有页面 Hreflang 与 Referrer-Policy 注入完毕！');
