const fs = require('fs');
const path = require('path');

// 1. 扫描与替换函数
function patchAffiliateLinks(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 匹配包含 aff 链接的 <a> 标签并补齐 nofollow sponsored
    content = content.replace(/<a\s+([^>]*href=["'][^"']*(?:aff|huanqiutiaff|dalaoyunaff|yunjiexianaff)[^"']*["'][^>]*)>/gi, (match, attrs) => {
        if (attrs.includes('rel=')) {
            // 替换现有 rel
            attrs = attrs.replace(/rel=["'][^"']*["']/gi, 'rel="nofollow sponsored noopener noreferrer"');
        } else {
            attrs += ' rel="nofollow sponsored noopener noreferrer"';
        }
        return `<a ${attrs}>`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[外链属性已合规] ${filePath}`);
    }
}

// 处理根目录 HTML
['index.html', 'compare.html', 'about.html', 'reviews.html', 'blackholes.html', 'protocols.html', '404.html'].forEach(f => {
    patchAffiliateLinks(path.join(__dirname, '..', f));
});

// 处理 posts/ 目录所有 HTML
const postsDir = path.join(__dirname, '../posts');
if (fs.existsSync(postsDir)) {
    fs.readdirSync(postsDir).filter(f => f.endsWith('.html')).forEach(f => {
        patchAffiliateLinks(path.join(postsDir, f));
    });
}

// 处理 js/data.js
patchAffiliateLinks(path.join(__dirname, '../js/data.js'));

console.log('所有推广外链 nofollow sponsored 属性统一重构完毕！');
