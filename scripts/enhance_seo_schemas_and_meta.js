const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Add BreadcrumbList Schema to Pillar Pages
const pillarBreadcrumbs = [
    {
        file: 'compare.html',
        name: '2026 高性价比机场 7 折精算表',
        url: 'https://jichangtop1.com/compare'
    },
    {
        file: 'reviews.html',
        name: '2026 稳定机场晚高峰测速横评与实测档案',
        url: 'https://jichangtop1.com/reviews'
    },
    {
        file: 'protocols.html',
        name: '主流网络加速协议深度技术横评',
        url: 'https://jichangtop1.com/protocols'
    },
    {
        file: 'blackholes.html',
        name: '2026 机场跑路预警黑名单与低价避坑手册',
        url: 'https://jichangtop1.com/blackholes'
    },
    {
        file: 'about.html',
        name: '关于 机场 TOP1·网络可靠性与基准压测实验室',
        url: 'https://jichangtop1.com/about'
    }
];

pillarBreadcrumbs.forEach(({ file, name, url }) => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('"@type": "BreadcrumbList"')) {
        const breadcrumbSchema = `
    <!-- Schema.org BreadcrumbList -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://jichangtop1.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "${name}",
          "item": "${url}"
        }
      ]
    }
    </script>
`;
        content = content.replace('</head>', `${breadcrumbSchema}</head>`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[已注入 BreadcrumbList Schema] ${file}`);
    }
});

// 2. Enhance 404.html with noindex and complete meta tags
const notFoundPath = path.join(rootDir, '404.html');
if (fs.existsSync(notFoundPath)) {
    let content = fs.readFileSync(notFoundPath, 'utf8');
    if (!content.includes('name="robots"')) {
        content = content.replace('<head>', '<head>\n    <meta name="robots" content="noindex, follow">');
    }
    if (!content.includes('property="og:title"')) {
        const ogTags = `
    <meta property="og:type" content="website">
    <meta property="og:title" content="页面不存在 - 机场 TOP1">
    <meta property="og:description" content="抱歉，您访问的页面不存在或已被移除。">
    <meta property="og:image" content="https://jichangtop1.com/images/logo-horizontal.png">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="页面不存在 - 机场 TOP1">
`;
        content = content.replace('</head>', `${ogTags}</head>`);
    }
    fs.writeFileSync(notFoundPath, content, 'utf8');
    console.log('[已规范化 404.html 元数据与 noindex]');
}

console.log('增权补全脚本执行完毕！');
