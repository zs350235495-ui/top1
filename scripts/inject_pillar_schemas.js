const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. protocols.html
const protocolsPath = path.join(rootDir, 'protocols.html');
if (fs.existsSync(protocolsPath)) {
    let content = fs.readFileSync(protocolsPath, 'utf8');
    if (!content.includes('"TechArticle"')) {
        const protocolsSchema = `
    <!-- Schema.org TechArticle -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": "主流网络加速协议深度横评：Shadowsocks、Trojan、VLESS-REALITY 与 Hysteria 2",
      "description": "系统对比主流翻墙传输与代理协议在抗 GFW 探测封锁、首包 RTT 延迟、弱网丢包对抗与系统资源消耗上的架构差异，提供理性选型建议。",
      "url": "https://jichangtop1.com/protocols.html",
      "datePublished": "2026-10-18",
      "dateModified": "2026-10-23",
      "inLanguage": "zh-CN",
      "author": {
        "@type": "Person",
        "name": "机场 TOP1 网络实验室",
        "jobTitle": "高级网络基础设施与 SLA 评估架构师",
        "worksFor": {
          "@type": "Organization",
          "name": "机场 TOP1",
          "url": "https://jichangtop1.com/"
        },
        "sameAs": [
          "https://t.me/huanqiuti8899",
          "https://github.com/zs350235495-ui/top1"
        ]
      },
      "publisher": {
        "@type": "Organization",
        "name": "机场 TOP1",
        "logo": {
          "@type": "ImageObject",
          "url": "https://jichangtop1.com/images/favicon.png"
        }
      }
    }
    </script>
`;
        content = content.replace('</head>', `${protocolsSchema}\n</head>`);
        fs.writeFileSync(protocolsPath, content, 'utf8');
        console.log('[成功注入 Schema] protocols.html');
    }
}

// 2. reviews.html
const reviewsPath = path.join(rootDir, 'reviews.html');
if (fs.existsSync(reviewsPath)) {
    let content = fs.readFileSync(reviewsPath, 'utf8');
    if (!content.includes('"CollectionPage"')) {
        const reviewsSchema = `
    <!-- Schema.org CollectionPage & ItemList -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "2026 稳定机场晚高峰测速横评与博主自用选购笔记 - 机场 TOP1",
      "description": "深入测评主流专线机场的 4K/8K 起播速度、延迟抖动与丢包率，提供真实客观的一线选购笔记。",
      "url": "https://jichangtop1.com/reviews.html",
      "publisher": {
        "@type": "Organization",
        "name": "机场 TOP1·网络基准评测实验室",
        "url": "https://jichangtop1.com/"
      },
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "url": "https://jichangtop1.com/posts/huanqiuti.html",
            "name": "环球梯 (HuanQiuTi) 全 IEPL 专线晚高峰实测研报"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "url": "https://jichangtop1.com/posts/2026-top1-high-speed-stable-nodes-evaluation.html",
            "name": "2026 年度高速稳定网络节点 TOP1 实测推荐"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "url": "https://jichangtop1.com/posts/2026-airport-node-recommendation-selection-guide.html",
            "name": "2026 稳定机场与高速节点选购全景指南"
          }
        ]
      }
    }
    </script>
`;
        content = content.replace('</head>', `${reviewsSchema}\n</head>`);
        fs.writeFileSync(reviewsPath, content, 'utf8');
        console.log('[成功注入 Schema] reviews.html');
    }
}

// 3. blackholes.html
const blackholesPath = path.join(rootDir, 'blackholes.html');
if (fs.existsSync(blackholesPath)) {
    let content = fs.readFileSync(blackholesPath, 'utf8');
    if (!content.includes('"FAQPage"')) {
        const blackholesSchema = `
    <!-- Schema.org Article & FAQPage -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "headline": "2026 机场跑路预警黑名单与低价套路避坑手册",
          "description": "持续更新 2026 最新机场跑路预警黑名单，曝光虚假专线与跑路套路，提供突发拔线自救方案与退款指导。",
          "url": "https://jichangtop1.com/blackholes.html",
          "datePublished": "2026-10-10",
          "dateModified": "2026-10-23",
          "inLanguage": "zh-CN",
          "author": {
            "@type": "Person",
            "name": "机场 TOP1 网络实验室",
            "worksFor": {
              "@type": "Organization",
              "name": "机场 TOP1"
            }
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "如何识别即将跑路或跑路风险极高的劣质机场？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "常见特征包括：突然推出超低折扣的三年付或永久付套餐、官方 Telegram 交流群开启全员禁言或频道断更、频繁更换公网中继域名、晚高峰出现大面积红字断流且客服无回应。"
              }
            },
            {
              "@type": "Question",
              "name": "如果不幸遭遇机场跑路拔线，该如何紧急自救？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "平时常备一份不限时按量流量包（如云界线随心包）作为二道防线，一旦主力机场断连可一键切换分流；对于近期通过支付宝或信用卡购买的年付订单，可尝试联系支付渠道客服提交违约证据申请争议退款。"
              }
            }
          ]
        }
      ]
    }
    </script>
`;
        content = content.replace('</head>', `${blackholesSchema}\n</head>`);
        fs.writeFileSync(blackholesPath, content, 'utf8');
        console.log('[成功注入 Schema] blackholes.html');
    }
}
