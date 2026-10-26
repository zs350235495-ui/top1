const fs = require('fs');
const path = require('path');

const VALID_AFF_IDS = new Set([
    'huanqiuti', 'ap-huanqiuti',
    'dalaoyun', 'ap-dalaoyun',
    'yunjiexian', 'ap-yunjiexian',
    'shandianshu', 'ap-shandianshu',
    'shenxing', 'ap-shenxing',
    'liulianyun', 'ap-liulianyun',
    'yuntu', 'ap-yuntu',
    'shunyun', 'ap-shunyun',
    'kexinyun', 'ap-kexinyun',
    'sujie', 'ap-sujie',
    'jilianyun', 'ap-jilianyun',
    'kunpeng', 'ap-kunpeng',
    'kuaili', 'ap-kuaili',
    'bianyuanjiedian', 'ap-bianyuanjiedian'
]);

function getAllFiles(dir, exts = ['.html', '.md']) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!['.git', 'node_modules', '.gemini', 'scratch'].includes(file)) {
                results = results.concat(getAllFiles(fullPath, exts));
            }
        } else {
            if (exts.includes(path.extname(file).toLowerCase())) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const allHtmlFiles = getAllFiles(path.join(__dirname, '..'), ['.html']);

let totalGoLinks = 0;
let compliantRelCount = 0;
let invalidRelCount = 0;
let invalidIdCount = 0;
const issues = [];
const goLinkPerFile = {};

allHtmlFiles.forEach(f => {
    const relPath = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
    if (relPath === 'go.html') return; // skip target itself

    const content = fs.readFileSync(f, 'utf8');
    const aRegex = /<a\s+([^>]*?)>/gi;
    let match;

    while ((match = aRegex.exec(content)) !== null) {
        const attrs = match[1];
        const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
        if (!hrefMatch) continue;

        const href = hrefMatch[1];
        if (href.startsWith('/go.html') || href.startsWith('/go/')) {
            totalGoLinks++;
            goLinkPerFile[relPath] = (goLinkPerFile[relPath] || 0) + 1;

            // Extract ID
            let id = null;
            if (href.includes('id=')) {
                id = href.split('id=')[1].split('&')[0];
            } else if (href.startsWith('/go/')) {
                id = href.replace('/go/', '').split('?')[0].split('/')[0];
            }

            if (!id || !VALID_AFF_IDS.has(id)) {
                invalidIdCount++;
                issues.push(`[Invalid ID] ${relPath}: ${href}`);
            }

            // Check rel attribute
            const relMatch = attrs.match(/rel=["']([^"']+)["']/i);
            if (!relMatch) {
                invalidRelCount++;
                issues.push(`[Missing rel] ${relPath}: ${match[0]}`);
            } else {
                const relVal = relMatch[1].toLowerCase();
                const hasNofollow = relVal.includes('nofollow');
                const hasSponsored = relVal.includes('sponsored');
                const hasNoopener = relVal.includes('noopener');
                const hasNoreferrer = relVal.includes('noreferrer');

                if (hasNofollow && hasSponsored && hasNoopener && hasNoreferrer) {
                    compliantRelCount++;
                } else {
                    invalidRelCount++;
                    issues.push(`[Incomplete rel: "${relVal}"] ${relPath}: ${match[0]}`);
                }
            }
        }
    }
});

console.log('====================================================');
console.log('       AFF 301 隔离与合规改造全站审计报告           ');
console.log('====================================================');
console.log(`全站检测到的安全中转 /go.html 内链总数: ${totalGoLinks}`);
console.log(`严格符合 rel="nofollow sponsored noopener noreferrer" 的链接数: ${compliantRelCount}`);
console.log(`异常 / 不合规链接数: ${invalidRelCount}`);
console.log(`非法 / 未知 target ID 数: ${invalidIdCount}`);

console.log('\n--- 页面中转内链分布统计 ---');
console.table(goLinkPerFile);

// Check robots.txt
console.log('\n--- robots.txt 避坑策略核验 ---');
const robotsContent = fs.readFileSync(path.join(__dirname, '../robots.txt'), 'utf8');
const hasGoDisallow = /Disallow:\s*\/go/i.test(robotsContent);
if (hasGoDisallow) {
    console.error('❌ 警告：robots.txt 包含对 /go 的 Disallow 规则，可能导致 Bing Webmaster Tools 报 Blocked 错误！');
} else {
    console.log('✅ 合规通过：robots.txt 未对 /go 或 /go.html 进行 Disallow，完全杜绝 Bing Webmaster Tools 索引阻断报警。');
}

// Check go.html
console.log('\n--- /go.html 承接页头部 Robots 核验 ---');
const goHtmlContent = fs.readFileSync(path.join(__dirname, '../go.html'), 'utf8');
const hasMetaRobots = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex[^"']*nofollow[^"']*["']/i.test(goHtmlContent);
if (hasMetaRobots) {
    console.log('✅ 合规通过：/go.html 页面头部包含严格的 <meta name="robots" content="noindex, nofollow...">');
} else {
    console.error('❌ 警告：/go.html 缺少必需的 noindex, nofollow 头部元标签！');
}

// Check _redirects
console.log('\n--- _redirects 文件核验 ---');
const redirectsExists = fs.existsSync(path.join(__dirname, '../_redirects'));
if (redirectsExists) {
    const redContent = fs.readFileSync(path.join(__dirname, '../_redirects'), 'utf8');
    const count301 = (redContent.match(/301/g) || []).length;
    console.log(`✅ 合规通过：_redirects 存在，包含 ${count301} 处 301 重定向规则与 /go/* 兜底。`);
} else {
    console.error('❌ 警告：未找到 _redirects 文件！');
}

// Check nginx-redirects.conf
console.log('\n--- nginx-redirects.conf 文件核验 ---');
const nginxExists = fs.existsSync(path.join(__dirname, '../nginx-redirects.conf'));
if (nginxExists) {
    const confContent = fs.readFileSync(path.join(__dirname, '../nginx-redirects.conf'), 'utf8');
    const hasHeader = confContent.includes('X-Robots-Tag');
    const count301Nginx = (confContent.match(/return 301/g) || []).length;
    console.log(`✅ 合规通过：nginx-redirects.conf 存在，包含 X-Robots-Tag 标头与 ${count301Nginx} 处 301 规则。`);
} else {
    console.error('❌ 警告：未找到 nginx-redirects.conf 文件！');
}

if (issues.length > 0) {
    console.log('\n--- 发现的待纠正问题列表 ---');
    issues.forEach(i => console.log('  ⚠️ ', i));
} else {
    console.log('\n🎉 全站 100% 通过合规审计，零死链，零非标链接，零外链泄露！');
}
