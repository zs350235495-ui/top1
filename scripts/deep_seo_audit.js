const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const postsDir = path.join(rootDir, 'posts');

const htmlFiles = [
    'index.html', 'compare.html', 'reviews.html', 'protocols.html', 'blackholes.html', 'about.html', '404.html'
].map(f => path.join(rootDir, f));

const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.html')).map(f => path.join(postsDir, f));
const allFiles = [...htmlFiles, ...postFiles];

console.log('=== 全面 SEO 与技术架构增权审计 ===');
console.log(`总扫描文件数: ${allFiles.length}`);

const report = {
    relativeAssets: [],
    missingCanonical: [],
    canonicalMismatches: [],
    missingOgTags: [],
    missingTwitterTags: [],
    missingSchema: [],
    schemaDetails: [],
    h1Status: [],
    brokenInternalLinks: [],
    sitemapAudit: {},
    robotsAudit: {},
    llmsAudit: {}
};

// Known valid routes & files
const existingRoutes = new Set([
    '/', '/compare', '/reviews', '/protocols', '/blackholes', '/about',
    '/index.html', '/compare.html', '/reviews.html', '/protocols.html', '/blackholes.html', '/about.html', '/404.html',
    '/sitemap.xml', '/robots.txt', '/llms.txt', '/feed.xml'
]);
postFiles.forEach(pf => {
    existingRoutes.add('/posts/' + path.basename(pf));
});

allFiles.forEach(file => {
    const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');

    // 1. 资源引用与相对路径审计
    const relAssets = content.match(/(?:href|src)=["'](?:\.\.\/|\.\/)[^"']*(?:\.css|\.js|\.png|\.jpg|\.svg|\.ico|\.json)["']/gi) || [];
    if (relAssets.length > 0) {
        report.relativeAssets.push({ file: relPath, count: relAssets.length, assets: relAssets });
    }

    // 2. Canonical 标签审计
    const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    if (!canonicalMatch) {
        if (!relPath.includes('404.html')) {
            report.missingCanonical.push(relPath);
        }
    } else {
        const canonicalUrl = canonicalMatch[1];
        // Check if canonical matches expected canonical path
        let expectedPath = '/' + relPath;
        if (relPath === 'index.html') expectedPath = '/';
        else if (relPath.endsWith('.html') && !relPath.startsWith('posts/')) {
            expectedPath = '/' + relPath.replace(/\.html$/, '');
        }
        const expectedFullUrl = 'https://jichangtop1.com' + expectedPath;
        if (canonicalUrl !== expectedFullUrl && !relPath.includes('404.html')) {
            report.canonicalMismatches.push({ file: relPath, actual: canonicalUrl, expected: expectedFullUrl });
        }
    }

    // 3. Open Graph & Twitter Cards 审计
    const ogTitle = content.match(/property=["']og:title["']\s+content=["']([^"']*)["']/i);
    const ogDesc = content.match(/property=["']og:description["']\s+content=["']([^"']*)["']/i);
    const ogImage = content.match(/property=["']og:image["']\s+content=["']([^"']*)["']/i);
    if (!ogTitle || !ogDesc || !ogImage) {
        report.missingOgTags.push({ file: relPath, missing: { ogTitle: !ogTitle, ogDesc: !ogDesc, ogImage: !ogImage } });
    }

    const twCard = content.match(/name=["']twitter:card["']/i);
    const twTitle = content.match(/name=["']twitter:title["']/i);
    if (!twCard || !twTitle) {
        report.missingTwitterTags.push({ file: relPath, missing: { twCard: !twCard, twTitle: !twTitle } });
    }

    // 4. Schema.org JSON-LD 结构化数据审计
    const schemaBlocks = content.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi) || [];
    if (schemaBlocks.length === 0) {
        if (!relPath.includes('404.html')) {
            report.missingSchema.push(relPath);
        }
    } else {
        const types = [];
        schemaBlocks.forEach(block => {
            const jsonText = block.replace(/<script\s+type=["']application\/ld\+json["']>/i, '').replace(/<\/script>/i, '');
            try {
                const parsed = JSON.parse(jsonText);
                if (parsed['@type']) types.push(parsed['@type']);
                if (parsed['@graph']) {
                    parsed['@graph'].forEach(g => { if (g['@type']) types.push(g['@type']); });
                }
            } catch (e) {
                types.push('JSON_PARSE_ERROR');
            }
        });
        report.schemaDetails.push({ file: relPath, types });
    }

    // 5. H1 语义标签审计
    const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    report.h1Status.push({
        file: relPath,
        h1Count: h1Matches.length,
        h1Text: h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim().substring(0, 40))
    });

    // 6. 内部链接健康度审计 (查找页面内的绝对站内链接)
    const links = content.match(/href=["'](\/[^"'#?]+)["']/g) || [];
    links.forEach(l => {
        const target = l.replace(/^href=["']/, '').replace(/["']$/, '');
        if (target.startsWith('/') && !target.startsWith('//')) {
            if (!existingRoutes.has(target) && !target.startsWith('/images/') && !target.startsWith('/css/') && !target.startsWith('/js/')) {
                const localFile = path.join(rootDir, target.replace(/^\//, ''));
                if (!fs.existsSync(localFile)) {
                    report.brokenInternalLinks.push({ file: relPath, brokenTarget: target });
                }
            }
        }
    });
});

// 7. Robots.txt 审计
const robotsPath = path.join(rootDir, 'robots.txt');
if (fs.existsSync(robotsPath)) {
    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    report.robotsAudit = {
        exists: true,
        disallowCss: robotsContent.includes('Disallow: /css') || robotsContent.includes('Disallow: /assets'),
        hasSitemap: robotsContent.includes('Sitemap:')
    };
} else {
    report.robotsAudit = { exists: false };
}

// 8. Sitemap.xml 审计
const sitemapPath = path.join(rootDir, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const locMatches = sitemapContent.match(/<loc>([^<]+)<\/loc>/g) || [];
    const urls = locMatches.map(l => l.replace(/<\/?loc>/g, ''));
    
    const deadUrls = [];
    urls.forEach(u => {
        let route = u.replace('https://jichangtop1.com', '');
        if (route === '') route = '/';
        if (!existingRoutes.has(route)) {
            deadUrls.push(u);
        }
    });

    report.sitemapAudit = {
        totalUrls: urls.length,
        deadUrls: deadUrls
    };
} else {
    report.sitemapAudit = { exists: false };
}

// 9. llms.txt 审计
const llmsPath = path.join(rootDir, 'llms.txt');
if (fs.existsSync(llmsPath)) {
    const llmsContent = fs.readFileSync(llmsPath, 'utf8');
    report.llmsAudit = {
        exists: true,
        length: llmsContent.length,
        hasLinks: (llmsContent.match(/https:\/\/jichangtop1\.com[^\s\)]+/g) || []).length
    };
} else {
    report.llmsAudit = { exists: false };
}

console.log(JSON.stringify(report, null, 2));
