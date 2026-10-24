const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const postsDir = path.join(rootDir, 'posts');

// Helper to list all HTML files
function getAllHtmlFiles() {
    const rootFiles = fs.readdirSync(rootDir)
        .filter(f => f.endsWith('.html'))
        .map(f => path.join(rootDir, f));
    const postFiles = fs.readdirSync(postsDir)
        .filter(f => f.endsWith('.html'))
        .map(f => path.join(postsDir, f));
    return [...rootFiles, ...postFiles];
}

const allHtmlFiles = getAllHtmlFiles();
const report = {
    totalFiles: allHtmlFiles.length,
    dim1_assets: [],
    dim2_schema: [],
    dim3_meta: [],
    dim4_crawlers: {},
    dim5_headings_and_links: []
};

// 1. Audit Dimension 1: Assets & Absolute Paths
console.log('--- 正在审计 维度 1: 资源引用与绝对路径 ---');
allHtmlFiles.forEach(file => {
    const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const isSub = relPath.startsWith('posts/');

    // Check relative resource links
    const srcMatches = [...content.matchAll(/(?:src|href)=["']([^"']+)["']/g)];
    const suspicious = [];

    srcMatches.forEach(m => {
        const val = m[1];
        if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:') || val.startsWith('#') || val.startsWith('javascript:')) return;
        
        // If in posts/ and asset path does not start with / or ../
        if (isSub && !val.startsWith('/') && (val.endsWith('.css') || val.endsWith('.js') || val.endsWith('.png') || val.endsWith('.jpg') || val.endsWith('.svg') || val.endsWith('.json'))) {
            suspicious.push({ tag: m[0], reason: '子路由使用非绝对路径静态资源' });
        }

        // Check if local file exists
        if (val.startsWith('/') && !val.startsWith('//')) {
            const cleanVal = val.split('?')[0].split('#')[0];
            let targetPath = path.join(rootDir, cleanVal);
            // Handle clean URL or directory
            if (!fs.existsSync(targetPath)) {
                if (fs.existsSync(targetPath + '.html')) {
                    // valid clean url
                } else if (cleanVal === '/' || cleanVal === '') {
                    // home
                } else if (!cleanVal.includes('.')) {
                    // could be clean url
                    if (!fs.existsSync(path.join(rootDir, cleanVal + '.html'))) {
                        suspicious.push({ tag: val, reason: '本地目标文件未找到' });
                    }
                } else {
                    suspicious.push({ tag: val, reason: '本地静态文件不存在: ' + cleanVal });
                }
            }
        }
    });

    if (suspicious.length > 0) {
        report.dim1_assets.push({ file: relPath, issues: suspicious });
    }
});

// 2. Audit Dimension 2: Schema.org JSON-LD
console.log('--- 正在审计 维度 2: 结构化数据 (Schema.org JSON-LD) ---');
allHtmlFiles.forEach(file => {
    const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');

    const schemaMatches = [...content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    const schemas = [];
    schemaMatches.forEach(m => {
        try {
            const parsed = JSON.parse(m[1]);
            schemas.push(parsed);
        } catch (e) {
            schemas.push({ error: 'JSON解析错误: ' + e.message });
        }
    });

    const isPost = relPath.startsWith('posts/');
    const isHome = relPath === 'index.html';

    const issues = [];
    if (schemas.length === 0 && relPath !== '404.html') {
        issues.push('缺失 Schema.org 结构化数据');
    }

    if (isHome) {
        const hasWebSite = schemas.some(s => s['@graph'] ? s['@graph'].some(g => g['@type'] === 'WebSite') : s['@type'] === 'WebSite');
        const hasOrg = schemas.some(s => s['@graph'] ? s['@graph'].some(g => g['@type'] === 'Organization') : s['@type'] === 'Organization');
        if (!hasWebSite) issues.push('首页缺失 WebSite 标记');
        if (!hasOrg) issues.push('首页缺失 Organization 权威实体标记');
    }

    if (isPost) {
        const hasArticle = schemas.some(s => s['@type'] === 'TechArticle' || s['@type'] === 'BlogPosting' || s['@type'] === 'Article');
        const hasBreadcrumb = schemas.some(s => s['@type'] === 'BreadcrumbList');
        if (!hasArticle) issues.push('文章页缺失 TechArticle/BlogPosting 标记');
        if (!hasBreadcrumb) issues.push('文章页缺失 BreadcrumbList 标记');
    }

    if (issues.length > 0) {
        report.dim2_schema.push({ file: relPath, issues });
    }
});

// 3. Audit Dimension 3: Canonical & OpenGraph & Twitter Cards
console.log('--- 正在审计 维度 3: Canonical 与元数据完整性 ---');
allHtmlFiles.forEach(file => {
    const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
    if (relPath === '404.html') return;
    const content = fs.readFileSync(file, 'utf8');

    const issues = [];
    if (!content.includes('<link rel="canonical"')) {
        issues.push('缺失 <link rel="canonical">');
    }
    if (!content.includes('property="og:title"')) {
        issues.push('缺失 og:title');
    }
    if (!content.includes('property="og:image"')) {
        issues.push('缺失 og:image');
    }
    if (!content.includes('name="twitter:card"')) {
        issues.push('缺失 twitter:card');
    }
    if (!content.includes('name="description"')) {
        issues.push('缺失 meta description');
    }

    if (issues.length > 0) {
        report.dim3_meta.push({ file: relPath, issues });
    }
});

// 4. Audit Dimension 4: Crawlers & Sitemap & llms.txt
console.log('--- 正在审计 维度 4: 爬虫抓取协议与地图网络 ---');
const robotsPath = path.join(rootDir, 'robots.txt');
const sitemapPath = path.join(rootDir, 'sitemap.xml');
const llmsPath = path.join(rootDir, 'llms.txt');

report.dim4_crawlers.hasRobots = fs.existsSync(robotsPath);
report.dim4_crawlers.hasSitemap = fs.existsSync(sitemapPath);
report.dim4_crawlers.hasLlms = fs.existsSync(llmsPath);

if (report.dim4_crawlers.hasRobots) {
    const robots = fs.readFileSync(robotsPath, 'utf8');
    report.dim4_crawlers.robotsDisallowed = (robots.match(/Disallow:[^\n]+/g) || []);
    report.dim4_crawlers.robotsSitemap = robots.includes('Sitemap:');
}

if (report.dim4_crawlers.hasSitemap) {
    const sitemap = fs.readFileSync(sitemapPath, 'utf8');
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    report.dim4_crawlers.sitemapTotalUrls = locs.length;

    // Check if every URL in sitemap actually maps to a file
    const sitemapDeadlinks = [];
    locs.forEach(loc => {
        try {
            const u = new URL(loc);
            let pName = u.pathname;
            if (pName.endsWith('/')) pName = pName.slice(0, -1);
            if (pName === '') pName = '/index.html';
            let localPath = path.join(rootDir, pName);
            if (!fs.existsSync(localPath)) {
                if (fs.existsSync(localPath + '.html')) {
                    // ok clean url
                } else {
                    sitemapDeadlinks.push(loc);
                }
            }
        } catch (e) {
            sitemapDeadlinks.push(loc + ' (URL解析失败)');
        }
    });
    report.dim4_crawlers.sitemapDeadlinks = sitemapDeadlinks;

    // Check if any HTML files are NOT in sitemap
    const missingFromSitemap = [];
    allHtmlFiles.forEach(file => {
        const rel = path.relative(rootDir, file).replace(/\\/g, '/');
        if (rel === '404.html') return;
        const expectedLoc = rel === 'index.html' ? 'https://jichangtop1.com/' : `https://jichangtop1.com/${rel.replace(/\.html$/, '')}`;
        const altLoc = `https://jichangtop1.com/${rel}`;
        if (!locs.includes(expectedLoc) && !locs.includes(altLoc)) {
            missingFromSitemap.push(rel);
        }
    });
    report.dim4_crawlers.missingFromSitemap = missingFromSitemap;
}

// 5. Audit Dimension 5: Headings & Internal Link Integrity
console.log('--- 正在审计 维度 5: 语义标签与内链完整性 ---');
allHtmlFiles.forEach(file => {
    const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');

    const h1Matches = [...content.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
    const issues = [];
    if (h1Matches.length === 0 && relPath !== '404.html') {
        issues.push('页面缺失 <h1> 标签');
    } else if (h1Matches.length > 1) {
        issues.push(`页面存在多个 <h1> 标签 (数量: ${h1Matches.length})`);
    }

    if (issues.length > 0) {
        report.dim5_headings_and_links.push({ file: relPath, issues });
    }
});

console.log('\n================ 审计结果汇总 ================');
console.log(JSON.stringify(report, null, 2));
