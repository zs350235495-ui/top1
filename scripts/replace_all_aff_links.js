const fs = require('fs');
const path = require('path');

// Raw URL to Target Mapping
const URL_TO_GO_MAP = {
    'https://123pps01.huanqiutiaff.com/#/?code=j5VBUvw0': { id: 'huanqiuti', go: '/go.html?id=huanqiuti' },
    'https://ppsvip01.dalaoyunaff.com/#/?code=Iz1GlCVa': { id: 'dalaoyun', go: '/go.html?id=dalaoyun' },
    'https://pp01.yunjiexianaff.com/#/?code=bp0ZSKBV': { id: 'yunjiexian', go: '/go.html?id=yunjiexian' },
    'https://yjxsub01.yunjiexianaff.com/#/?code=9M572s6Y': { id: 'yunjiexian', go: '/go.html?id=yunjiexian' },
    'https://ppsvip01.shandianshuaff.com/#/?code=QbLF8tjB': { id: 'shandianshu', go: '/go.html?id=shandianshu' },
    'https://pps123.shenxingaff.com/#/?code=6tQ7zHUc': { id: 'shenxing', go: '/go.html?id=shenxing' },
    'https://123pp01.liulianyunaff.com/#/?code=MsZP3u7G': { id: 'liulianyun', go: '/go.html?id=liulianyun' },
    'https://super.ytjcok.org/#/register?code=poKwFVtv': { id: 'yuntu', go: '/go.html?id=yuntu' },
    'https://ddd.jichang.best/#/register?code=nldUZaYc': { id: 'shunyun', go: '/go.html?id=shunyun' },
    'https://everett7623.kosingaff.com/#/?code=sFKKfEYs': { id: 'kexinyun', go: '/go.html?id=kexinyun' },
    'https://pygllc.speedworldaff.cc/#/?code=kcoensXG': { id: 'sujie', go: '/go.html?id=sujie' },
    'https://haozevpn.jlyvipaff.com/#/?code=jwCMOvQO': { id: 'jilianyun', go: '/go.html?id=jilianyun' },
    'https://kunpengjiasu.com/#/register?code=WPugVZUe': { id: 'kunpeng', go: '/go.html?id=kunpeng' },
    'https://fanxiaobin.kuailiaff.com/#/?code=e0cAmK7F': { id: 'kuaili', go: '/go.html?id=kuaili' },
    'https://wep.edgenovaaff.com/#/?code=mLLL6h6F': { id: 'bianyuanjiedian', go: '/go.html?id=bianyuanjiedian' }
};

const stats = {
    filesModified: 0,
    tagsReplaced: 0,
    details: []
};

// 1. Process HTML / MD Files
function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    let fileReplacedCount = 0;

    // A. Replace <a> tags
    content = content.replace(/<a\s+([^>]*?)>/gi, (fullTag, attrs) => {
        let tagModified = false;
        let newAttrs = attrs;

        // Check if any raw affiliate URL exists in href
        for (const [rawUrl, info] of Object.entries(URL_TO_GO_MAP)) {
            if (newAttrs.includes(rawUrl)) {
                // Replace href
                newAttrs = newAttrs.replace(rawUrl, info.go);
                tagModified = true;
                break;
            }
        }

        // Also check if href is already /go.html or /go/ but lacks compliant rel
        const isGoLink = /href=["'][^"']*(?:\/go\.html|\/go\/)/i.test(newAttrs);

        if (tagModified || isGoLink) {
            // Strictly enforce rel="nofollow sponsored noopener noreferrer"
            if (/rel=["'][^"']*["']/i.test(newAttrs)) {
                newAttrs = newAttrs.replace(/rel=["'][^"']*["']/i, 'rel="nofollow sponsored noopener noreferrer"');
            } else {
                newAttrs += ' rel="nofollow sponsored noopener noreferrer"';
            }
            fileReplacedCount++;
            return `<a ${newAttrs}>`;
        }

        return fullTag;
    });

    // B. Replace schema.org JSON-LD url if present
    for (const [rawUrl, info] of Object.entries(URL_TO_GO_MAP)) {
        if (content.includes(`"url": "${rawUrl}"`)) {
            content = content.replace(`"url": "${rawUrl}"`, `"url": "https://jichangtop1.com${info.go}"`);
            fileReplacedCount++;
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        stats.filesModified++;
        stats.tagsReplaced += fileReplacedCount;
        stats.details.push({
            file: path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/'),
            count: fileReplacedCount
        });
    }
}

// 2. Process js/data.js
function processDataJs() {
    const dataFilePath = path.join(__dirname, '../js/data.js');
    if (!fs.existsSync(dataFilePath)) return;
    let content = fs.readFileSync(dataFilePath, 'utf8');
    let original = content;

    for (const [rawUrl, info] of Object.entries(URL_TO_GO_MAP)) {
        // Replace affUrl: "https://..." with affUrl: "/go.html?id=...", rawAffUrl: "https://..."
        const regex = new RegExp(`affUrl:\\s*"${rawUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
        content = content.replace(regex, `affUrl: "${info.go}", rawAffUrl: "${rawUrl}"`);
    }

    if (content !== original) {
        fs.writeFileSync(dataFilePath, content, 'utf8');
        console.log('[js/data.js] Updated with safe /go.html links and rawAffUrl backup.');
    }
}

// 3. Find all files
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

console.log('=== Step 1: Processing js/data.js ===');
processDataJs();

console.log('\n=== Step 2: Processing All HTML and Markdown Files ===');
const filesToProcess = getAllFiles(path.join(__dirname, '..'), ['.html', '.md']);
filesToProcess.forEach(f => {
    // skip go.html itself so its internal dictionary remains intact
    if (path.basename(f) === 'go.html') return;
    processFile(f);
});

console.log('\n=== Step 3: Summary of Replacements ===');
console.log(`Total Files Modified: ${stats.filesModified}`);
console.log(`Total Links Replaced: ${stats.tagsReplaced}`);
console.table(stats.details);
