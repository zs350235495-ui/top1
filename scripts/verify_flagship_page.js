const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../flagship-network-sla-benchmark-2026.html');
const content = fs.readFileSync(filePath, 'utf8');

console.log('=== 检查开始 ===');

// 1. JSON-LD validation
const jsonLdMatch = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!jsonLdMatch) {
    console.error('❌ 未找到 JSON-LD');
} else {
    try {
        const json = JSON.parse(jsonLdMatch[1]);
        console.log('✅ JSON-LD 语法完全正确！');
        console.log('   @graph 包含类型:', json['@graph'].map(item => item['@type']));
        const article = json['@graph'].find(x => x['@type'] === 'TechArticle');
        console.log('   headline:', article.headline);
        console.log('   datePublished:', article.datePublished);
        console.log('   dateModified:', article.dateModified);
        console.log('   author:', article.author.name);
        console.log('   inLanguage:', article.inLanguage);
    } catch (e) {
        console.error('❌ JSON-LD 解析失败:', e.message);
    }
}

// 2. Canonical check
const canonicalMatch = content.match(/<link rel="canonical" href="([^"]+)">/);
console.log('✅ Canonical URL:', canonicalMatch ? canonicalMatch[1] : '❌ 未找到');

// 3. Headings hierarchy check
const h1Matches = [...content.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
console.log('✅ H1 标签数量:', h1Matches.length);
if (h1Matches.length === 1) {
    console.log('   H1 内容:', h1Matches[0][1].trim().replace(/\s+/g, ' '));
} else {
    console.error('❌ H1 标签数量不等于 1！');
}

// 4. Check for external links or affiliate parameters
const suspiciousAff = [...content.matchAll(/(\?aff=|\?ref=|\?code=)/g)];
if (suspiciousAff.length > 0) {
    console.error('❌ 发现返利推广参数:', suspiciousAff);
} else {
    console.log('✅ 零外部返利参数 (Zero affiliate/ref/code)');
}

// 5. Check for external telegram links in this document
const tgMatch = content.match(/t\.me\//);
if (tgMatch) {
    console.error('❌ 发现 Telegram 外部社群链接！');
} else {
    console.log('✅ 零外部社交群组链接 (Zero external social links)');
}

// 6. Check ranking service providers
const providers = ['环球梯', '大佬云', '云界线', '闪电鼠', '神行加速', '榴莲云'];
providers.forEach(p => {
    const boldP = `<strong>${p}</strong>`;
    const count = (content.match(new RegExp(p, 'g')) || []).length;
    console.log(`✅ 服务商 ${p}: 出现 ${count} 次`);
});

// 7. Check that '闪电云' is NOT erroneously used
const wrongLightning = content.match(/闪电云/);
if (wrongLightning) {
    console.error('❌ 警告：发现误写为 "闪电云"！');
} else {
    console.log('✅ 严谨核对：未发现 "闪电云"，统一正确使用 "闪电鼠"！');
}

console.log('=== 检查完成 ===');
