const fs = require('fs');
const path = require('path');

// Target Affiliate Mapping
const AFF_MAPPING = {
    'huanqiuti': {
        name: '环球梯 (HuanQiuTi)',
        url: 'https://123pps01.huanqiutiaff.com/#/?code=j5VBUvw0',
        aliases: ['ap-huanqiuti', 'huanqiu']
    },
    'dalaoyun': {
        name: '大佬云 (DaLaoYun)',
        url: 'https://ppsvip01.dalaoyunaff.com/#/?code=Iz1GlCVa',
        aliases: ['ap-dalaoyun']
    },
    'yunjiexian': {
        name: '云界线 (YunJieXian)',
        url: 'https://pp01.yunjiexianaff.com/#/?code=bp0ZSKBV',
        aliases: ['ap-yunjiexian', 'https://yjxsub01.yunjiexianaff.com/#/?code=9M572s6Y']
    },
    'shandianshu': {
        name: '闪电鼠 (ShanDianShu)',
        url: 'https://ppsvip01.shandianshuaff.com/#/?code=QbLF8tjB',
        aliases: ['ap-shandianshu']
    },
    'shenxing': {
        name: '神行加速 (ShenXing VPN)',
        url: 'https://pps123.shenxingaff.com/#/?code=6tQ7zHUc',
        aliases: ['ap-shenxing']
    },
    'liulianyun': {
        name: '榴莲云 (LiuLianYun)',
        url: 'https://123pp01.liulianyunaff.com/#/?code=MsZP3u7G',
        aliases: ['ap-liulianyun']
    },
    'yuntu': {
        name: '云图机场 (YunTu)',
        url: 'https://super.ytjcok.org/#/register?code=poKwFVtv',
        aliases: ['ap-yuntu']
    },
    'shunyun': {
        name: '瞬云 (ShunYun)',
        url: 'https://ddd.jichang.best/#/register?code=nldUZaYc',
        aliases: ['ap-shunyun']
    },
    'kexinyun': {
        name: '可信云 (KeXinYun)',
        url: 'https://everett7623.kosingaff.com/#/?code=sFKKfEYs',
        aliases: ['ap-kexinyun']
    },
    'sujie': {
        name: '速界 (SuJie)',
        url: 'https://pygllc.speedworldaff.cc/#/?code=kcoensXG',
        aliases: ['ap-sujie']
    },
    'jilianyun': {
        name: '极连云 (JiLianYun)',
        url: 'https://haozevpn.jlyvipaff.com/#/?code=jwCMOvQO',
        aliases: ['ap-jilianyun']
    },
    'kunpeng': {
        name: '鲲鹏加速 (KunPeng)',
        url: 'https://kunpengjiasu.com/#/register?code=WPugVZUe',
        aliases: ['ap-kunpeng']
    },
    'kuaili': {
        name: '快狸快狸 (KuaiLi)',
        url: 'https://fanxiaobin.kuailiaff.com/#/?code=e0cAmK7F',
        aliases: ['ap-kuaili']
    },
    'bianyuanjiedian': {
        name: '边缘节点 (EdgeNode)',
        url: 'https://wep.edgenovaaff.com/#/?code=mLLL6h6F',
        aliases: ['ap-bianyuanjiedian']
    }
};

function getAllFiles(dir, exts = ['.html', '.md', '.js', '.json']) {
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

const allFiles = getAllFiles(path.join(__dirname, '..'), ['.html', '.md']);
console.log(`Auditing ${allFiles.length} HTML and MD files for exact affiliate links...`);

const findings = [];

allFiles.forEach(f => {
    const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, lineIdx) => {
        // match any <a> tag
        const aRegex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi;
        let match;
        while ((match = aRegex.exec(line)) !== null) {
            const rawTag = match[0];
            const href = match[2];
            // check if href is external affiliate
            for (const [id, info] of Object.entries(AFF_MAPPING)) {
                if (href === info.url || href.includes(info.url) || info.aliases.some(a => href.includes(a))) {
                    findings.push({
                        file: rel,
                        line: lineIdx + 1,
                        id,
                        href,
                        tag: rawTag
                    });
                }
            }
            // Also check for any unknown aff links
            if (href.includes('aff') || href.includes('code=') || href.includes('register?code=')) {
                if (!findings.some(f => f.file === rel && f.line === lineIdx + 1 && f.href === href)) {
                    findings.push({
                        file: rel,
                        line: lineIdx + 1,
                        id: 'UNKNOWN_OR_ALT',
                        href,
                        tag: rawTag
                    });
                }
            }
        }
    });
});

console.log(`Total AFF <a> tags found: ${findings.length}`);
const fileSummary = {};
findings.forEach(f => {
    fileSummary[f.file] = (fileSummary[f.file] || 0) + 1;
});
console.table(fileSummary);

const uniqueHrefs = [...new Set(findings.map(f => f.href))];
console.log('\nUnique Hrefs:', uniqueHrefs);

const allExternalLinks = new Set();
allFiles.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const matches = [...content.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)];
    matches.forEach(m => {
        allExternalLinks.add(m[1]);
    });
});
console.log('\nALL EXTERNAL HTTP LINKS IN PROJECT:');
for (const link of allExternalLinks) {
    console.log(' - ', link);
}

