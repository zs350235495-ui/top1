const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const postsDir = path.join(rootDir, 'posts');

const filesToProcess = [];

// Root html files
fs.readdirSync(rootDir).forEach(f => {
    if (f.endsWith('.html') || f === 'README.md' || f === 'llms.txt' || f === 'llms-full.txt') {
        filesToProcess.push(path.join(rootDir, f));
    }
});

// Posts html files
if (fs.existsSync(postsDir)) {
    fs.readdirSync(postsDir).forEach(f => {
        if (f.endsWith('.html')) {
            filesToProcess.push(path.join(postsDir, f));
        }
    });
}

// Scripts files (like standardize_all_headers.js, generate_sitemap.js, etc.)
filesToProcess.push(path.join(rootDir, 'generate_sitemap.js'));
filesToProcess.push(path.join(rootDir, 'scripts', 'standardize_all_headers.js'));
filesToProcess.push(path.join(rootDir, 'scripts', 'fix_all_post_headers_and_css.js'));
filesToProcess.push(path.join(rootDir, 'scripts', 'batch_enhance_posts.js'));

filesToProcess.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace internal links with clean URLs
    content = content.replace(/href=["']\/compare\.html["']/g, 'href="/compare"');
    content = content.replace(/href=["']\/reviews\.html["']/g, 'href="/reviews"');
    content = content.replace(/href=["']\/protocols\.html["']/g, 'href="/protocols"');
    content = content.replace(/href=["']\/blackholes\.html["']/g, 'href="/blackholes"');
    content = content.replace(/href=["']\/about\.html["']/g, 'href="/about"');

    // Also replace absolute domain links with clean URLs (in README, llms.txt, etc.)
    content = content.replace(/https:\/\/jichangtop1\.com\/compare\.html/g, 'https://jichangtop1.com/compare');
    content = content.replace(/https:\/\/jichangtop1\.com\/reviews\.html/g, 'https://jichangtop1.com/reviews');
    content = content.replace(/https:\/\/jichangtop1\.com\/protocols\.html/g, 'https://jichangtop1.com/protocols');
    content = content.replace(/https:\/\/jichangtop1\.com\/blackholes\.html/g, 'https://jichangtop1.com/blackholes');
    content = content.replace(/https:\/\/jichangtop1\.com\/about\.html/g, 'https://jichangtop1.com/about');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[已更新为 Clean URL] ${path.basename(filePath)}`);
    }
});

console.log('所有链接与文档已成功升级为 Clean URLs（无 .html 后缀），彻底规避 308 重定向！');
