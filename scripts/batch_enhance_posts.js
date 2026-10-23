const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const postsDir = path.join(rootDir, 'posts');

const postMapping = {
    '2026-airport-node-recommendation-selection-guide.html': {
        related: [
            { file: '2026-top1-high-speed-stable-nodes-evaluation.html', title: '2026 年度高速稳定网络节点 TOP1 实测推荐' },
            { file: '2026-airport-selection-pitfall-guide.html', title: '2026 年机场怎么选？线路质量与避坑指南' },
            { file: 'huanqiuti.html', title: '环球梯 (HuanQiuTi) IEPL 专线深度实测研报' }
        ],
        pillar: { url: '/compare.html', title: '2026 高性价比机场 7 折精算表' }
    },
    '2026-airport-recommendation-guide.html': {
        related: [
            { file: '2026-top1-high-speed-stable-nodes-evaluation.html', title: '2026 年度高速稳定网络节点 TOP1 实测推荐' },
            { file: '2026-airport-node-recommendation-selection-guide.html', title: '2026 稳定机场与高速节点选购全景指南' },
            { file: 'huanqiuti.html', title: '环球梯 (HuanQiuTi) IEPL 专线深度实测研报' }
        ],
        pillar: { url: '/compare.html', title: '2026 高性价比机场 7 折精算表' }
    },
    '2026-airport-selection-pitfall-guide.html': {
        related: [
            { file: '2026-yiyuan-airport-selection-guide.html', title: '2026 一元机场选购与避坑指南' },
            { file: '2026-airport-node-recommendation-selection-guide.html', title: '2026 稳定机场与高速节点选购指南' },
            { file: '2026-top1-high-speed-stable-nodes-evaluation.html', title: '2026 年度高速稳定网络节点 TOP1 实测推荐' }
        ],
        pillar: { url: '/blackholes.html', title: '跑路机场黑名单与避坑预警' }
    },
    '2026-cross-border-network-sla-reliability-specification.html': {
        related: [
            { file: '2026-routing-rules-fake-ip-dns-streaming-guide.html', title: '跨平台网络分流规则与策略组调优实战' },
            { file: '2026-ikuai-sidecar-gateway-transparent-proxy-dns-guide.html', title: 'iKuai 结合分流网关实现透明代理' },
            { file: 'huanqiuti.html', title: '环球梯 (HuanQiuTi) IEPL 专线深度实测研报' }
        ],
        pillar: { url: '/about.html', title: '实验室评测标准与探针拓扑规范' }
    },
    '2026-ikuai-sidecar-gateway-transparent-proxy-dns-guide.html': {
        related: [
            { file: '2026-routing-rules-fake-ip-dns-streaming-guide.html', title: '跨平台网络分流规则与策略组调优实战' },
            { file: '2026-cross-border-network-sla-reliability-specification.html', title: '2026 跨境网络节点 SLA 可靠性评估规范' },
            { file: '2026-network-stability-optimization-guide.html', title: '构建高质量网络连接体验：排错指南' }
        ],
        pillar: { url: '/protocols.html', title: '次世代传输协议科普与调优' }
    },
    '2026-network-connection-service-selection-guide.html': {
        related: [
            { file: '2026-airport-node-recommendation-selection-guide.html', title: '2026 稳定机场与高速节点选购指南' },
            { file: '2026-network-stability-optimization-guide.html', title: '构建高质量网络连接体验：线路架构解析' },
            { file: 'huanqiuti.html', title: '环球梯 (HuanQiuTi) IEPL 专线深度实测研报' }
        ],
        pillar: { url: '/reviews.html', title: '晚高峰测速横评与网络诊断' }
    },
    '2026-network-stability-optimization-guide.html': {
        related: [
            { file: '2026-ikuai-sidecar-gateway-transparent-proxy-dns-guide.html', title: 'iKuai 结合分流网关实现透明代理' },
            { file: '2026-routing-rules-fake-ip-dns-streaming-guide.html', title: '跨平台网络分流规则与策略组调优实战' },
            { file: '2026-cross-border-network-sla-reliability-specification.html', title: '2026 跨境网络节点 SLA 可靠性评估规范' }
        ],
        pillar: { url: '/protocols.html', title: '次世代传输协议科普与调优' }
    },
    '2026-routing-rules-fake-ip-dns-streaming-guide.html': {
        related: [
            { file: '2026-ikuai-sidecar-gateway-transparent-proxy-dns-guide.html', title: 'iKuai 结合分流网关实现透明代理' },
            { file: '2026-cross-border-network-sla-reliability-specification.html', title: '2026 跨境网络节点 SLA 可靠性评估规范' },
            { file: '2026-top1-high-speed-stable-nodes-evaluation.html', title: '2026 年度高速稳定网络节点 TOP1 实测推荐' }
        ],
        pillar: { url: '/protocols.html', title: '次世代传输协议科普与调优' }
    },
    '2026-top1-high-speed-stable-nodes-evaluation.html': {
        related: [
            { file: 'huanqiuti.html', title: '环球梯 (HuanQiuTi) IEPL 专线深度实测研报' },
            { file: '2026-airport-node-recommendation-selection-guide.html', title: '2026 稳定机场与高速节点选购指南' },
            { file: '2026-routing-rules-fake-ip-dns-streaming-guide.html', title: '跨平台网络分流规则与策略组调优实战' }
        ],
        pillar: { url: '/reviews.html', title: '晚高峰测速横评与真实跑分' }
    },
    '2026-yiyuan-airport-selection-guide.html': {
        related: [
            { file: '2026-airport-selection-pitfall-guide.html', title: '2026 年机场怎么选？避坑指南' },
            { file: '2026-airport-node-recommendation-selection-guide.html', title: '2026 稳定机场与高速节点选购指南' },
            { file: 'huanqiuti.html', title: '环球梯 (HuanQiuTi) IEPL 专线深度实测研报' }
        ],
        pillar: { url: '/blackholes.html', title: '跑路机场黑名单与避坑预警' }
    },
    'huanqiuti.html': {
        related: [
            { file: '2026-top1-high-speed-stable-nodes-evaluation.html', title: '2026 年度高速稳定网络节点 TOP1 实测推荐' },
            { file: '2026-airport-node-recommendation-selection-guide.html', title: '2026 稳定机场与高速节点选购指南' },
            { file: '2026-routing-rules-fake-ip-dns-streaming-guide.html', title: '跨平台网络分流规则与策略组调优实战' }
        ],
        pillar: { url: '/compare.html', title: '2026 高性价比机场 7 折精算表' }
    }
};

const authorJson = {
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
};

const publisherJson = {
    "@type": "Organization",
    "name": "机场 TOP1",
    "logo": {
        "@type": "ImageObject",
        "url": "https://jichangtop1.com/images/favicon.png"
    }
};

Object.keys(postMapping).forEach(filename => {
    const filePath = path.join(postsDir, filename);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Upgrade / Inject TechArticle JSON-LD
    const hasTechArticle = content.includes('"TechArticle"');
    if (!hasTechArticle) {
        const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
        const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
        const headline = titleMatch ? titleMatch[1].replace(' - 机场 TOP1', '').trim() : filename;
        const description = descMatch ? descMatch[1].trim() : headline;

        const techArticleSchema = `
    <!-- Schema.org TechArticle & E-E-A-T Author Entity -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": ${JSON.stringify(headline)},
      "description": ${JSON.stringify(description)},
      "url": "https://jichangtop1.com/posts/${filename}",
      "datePublished": "2026-10-15",
      "dateModified": "2026-10-23",
      "inLanguage": "zh-CN",
      "author": ${JSON.stringify(authorJson, null, 8)},
      "publisher": ${JSON.stringify(publisherJson, null, 8)}
    }
    </script>
`;
        content = content.replace('</head>', `${techArticleSchema}\n</head>`);
    }

    // 2. Inject FAQPage JSON-LD if article has FAQs
    if (filename === '2026-airport-node-recommendation-selection-guide.html' && !content.includes('"FAQPage"')) {
        const faqSchema = `
    <!-- Schema.org FAQPage for Google Rich Snippets -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "为什么免费节点或极低价机场经常出现断流与卡顿？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "免费或极低价节点通常采用公网直连架构，数十人共享带宽。晚高峰骨干网拥堵时公网出口优先丢弃普通数据包。此外，低价服务商缺乏资金维持线路冗余与售后，易出现掉线和封锁。"
          }
        },
        {
          "@type": "Question",
          "name": "观看 4K / 8K 视频卡顿，主要是受带宽还是延迟影响？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "主要取决于实际可调度的持续带宽吞吐量以及丢包率，而不仅是 ping 延迟。物理专线或优质中转节点能在保持极低丢包的同时提供稳定大带宽。"
          }
        },
        {
          "@type": "Question",
          "name": "一个订阅链接可以在手机、电脑和平板上同时使用吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以。绝大多数主流服务商都支持同一订阅在多台设备导入，但需注意套餐说明中的允许最大同时在线设备数限制。"
          }
        },
        {
          "@type": "Question",
          "name": "初次订阅建议选月付还是年付？如何降低试错风险？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "强烈建议首次购买优先选择月付。不同地区运营商网络在不同节点路由有差异，先月付体验完整晚高峰周期，适配良好再按季或按年续订。"
          }
        },
        {
          "@type": "Question",
          "name": "不限时按量流量包与普通月付套餐有什么区别？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "普通月付套餐按月清零；而不限时按量包购买固定总流量用多少扣多少，直到用完为止，没有时间限制，非常适合作为防断网备用。"
          }
        }
      ]
    }
    </script>
`;
        content = content.replace('</head>', `${faqSchema}\n</head>`);
    }

    if (filename === '2026-yiyuan-airport-selection-guide.html' && !content.includes('"FAQPage"')) {
        const faqSchema = `
    <!-- Schema.org FAQPage for Google Rich Snippets -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "一元机场可以用来注册和使用 ChatGPT 吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "不建议。一元机场节点通常被数万人同时共享使用，IP 被 OpenAI 标记为高风险代理 IP 的概率极高，容易导致注册被拒、登录报错或账号无故被封。"
          }
        },
        {
          "@type": "Question",
          "name": "如果预算有限，如何降低专线机场的使用成本？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以优先使用专属 7 折优惠码（如 HQ66、dly88）订阅轻量基础套餐，或者选择不限时按量流量包。按量包买一次可用很久，实际折算下来月成本也极低。"
          }
        },
        {
          "@type": "Question",
          "name": "为什么一元机场的域名经常打不开？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "因为廉价公网域名缺乏高防护 DNS 机制，极易被国内 GFW 污染封锁。运营者如果缺乏运维资金，往往更换域名不及时，导致用户无法更新订阅。"
          }
        }
      ]
    }
    </script>
`;
        content = content.replace('</head>', `${faqSchema}\n</head>`);
    }

    // 3. Fix obsolete internal links
    content = content.replace(/href=["']\/index\.html#compare["']/g, 'href="/compare.html"');
    content = content.replace(/href=["']\/index\.html#reviews["']/g, 'href="/reviews.html"');
    content = content.replace(/href=["']\/index\.html#protocols["']/g, 'href="/protocols.html"');
    content = content.replace(/href=["']\/index\.html#blackholes["']/g, 'href="/blackholes.html"');
    content = content.replace(/href=["']\/index\.html["']/g, 'href="/"');

    // 4. Inject Related Articles Mesh
    const info = postMapping[filename];
    if (info && !content.includes('related-posts-card')) {
        const relatedItemsHtml = info.related.map(r => `
                    <a href="/posts/${r.file}" style="display:block; padding:12px; background:#FFFFFF; border:1px solid var(--border-color, #E2E8F0); border-radius:6px; text-decoration:none; color:inherit; transition:transform 0.2s ease;">
                        <span style="font-size:0.75rem; color:var(--primary-cyan, #C85A32); font-weight:700; display:block; margin-bottom:4px;">技术实测研报</span>
                        <strong style="font-size:0.9rem; line-height:1.4; display:block; color:var(--text-heading, #1A1A1A);">${r.title}</strong>
                    </a>`).join('\n');

        const pillarItemHtml = `
                    <a href="${info.pillar.url}" style="display:block; padding:12px; background:#FAF0EB; border:1px solid #E5C3B3; border-radius:6px; text-decoration:none; color:inherit;">
                        <span style="font-size:0.75rem; color:var(--primary-cyan, #C85A32); font-weight:700; display:block; margin-bottom:4px;">★ 核心支柱专题</span>
                        <strong style="font-size:0.9rem; line-height:1.4; display:block; color:var(--text-heading, #1A1A1A);">${info.pillar.title}</strong>
                    </a>`;

        const relatedCardHtml = `
            <!-- Topic Mesh & Related Articles Cluster -->
            <div class="related-posts-card" style="margin: 36px 0 20px; padding: 24px; background: #FAF8F5; border-radius: 8px; border: 1px solid var(--border-color, #E2E8F0);">
                <h3 style="font-size: 1.15rem; color: var(--text-heading, #1A1A1A); margin-bottom: 14px; font-weight: 700;">
                    <i class="fa-solid fa-book-bookmark" style="color: var(--primary-cyan, #C85A32);"></i> 相关技术研报与核心支柱专题
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
${relatedItemsHtml}
${pillarItemHtml}
                </div>
            </div>
`;
        if (content.includes('</article>')) {
            content = content.replace('</article>', `${relatedCardHtml}\n        </article>`);
        } else if (content.includes('</section>')) {
            content = content.replace('</section>', `${relatedCardHtml}\n        </section>`);
        } else if (content.includes('</main>')) {
            content = content.replace('</main>', `${relatedCardHtml}\n    </main>`);
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[成功增强] ${filename}`);
});

console.log('全部 11 篇文章已完成网状交叉互联、TechArticle 与 FAQPage 结构化数据升级！');
