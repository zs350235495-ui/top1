const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(postsDir, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // 提取文章标题
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    let title = titleMatch ? titleMatch[1].replace(' - 机场 TOP1', '').trim() : '技术评测研报';

    // 1. 注入 BreadcrumbList JSON-LD
    if (!html.includes('"@type": "BreadcrumbList"')) {
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
          "name": "评测知识库",
          "item": "https://jichangtop1.com/reviews.html"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "${title.replace(/"/g, '\\"')}",
          "item": "https://jichangtop1.com/posts/${file}"
        }
      ]
    }
    </script>`;

        if (html.includes('</head>')) {
            html = html.replace('</head>', `${breadcrumbSchema}\n</head>`);
        }
    }

    // 2. 注入 RSS Feed Link
    if (!html.includes('type="application/rss+xml"')) {
        const rssTag = `\n    <link rel="alternate" type="application/rss+xml" title="机场 TOP1 官方评测订阅源" href="https://jichangtop1.com/feed.xml">`;
        if (html.includes('</head>')) {
            html = html.replace('</head>', `${rssTag}\n</head>`);
        }
    }

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`[Breadcrumbs & RSS 注入完成] ${file}`);
});

console.log('全量文章 BreadcrumbList 与 RSS 注入完成！');
