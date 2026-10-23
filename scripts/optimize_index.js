const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const dataJsPath = path.join(rootDir, 'js', 'data.js');

// Load data.js safely by evaluating in context or regex parsing
const dataContent = fs.readFileSync(dataJsPath, 'utf8');
const context = {};
const fn = new Function('context', dataContent + '; context.AIRPORTS_DATA = AIRPORTS_DATA; context.REVIEWS_DATA = REVIEWS_DATA;');
fn(context);

const AIRPORTS_DATA = context.AIRPORTS_DATA;
const REVIEWS_DATA = context.REVIEWS_DATA;

function createAirportCardHTML(ap) {
    const logoImg = ap.logo ? `<img src="${ap.logo}" alt="${ap.name} Logo" width="44" height="44" loading="lazy" decoding="async" style="width: 44px; height: 44px; border-radius: 10px; border: 1px solid var(--border-color); margin-right: 12px; vertical-align: middle;">` : '';
    const affUrl = ap.affUrl && ap.affUrl !== '#' ? ap.affUrl : '#';

    const couponBarHtml = ap.discountCode ? `
        <div class="coupon-highlight-bar" onclick="copyDiscountCode('${ap.discountCode}')" title="点击复制 7 折优惠码">
            <span class="coupon-tag-badge"><i class="fa-solid fa-gift"></i> ${ap.discountPercent}</span>
            <span class="coupon-code-val">优惠码: <strong>${ap.discountCode}</strong> <i class="fa-regular fa-copy"></i></span>
        </div>
    ` : '';

    let cardClass = '';
    if (ap.id === 'ap-huanqiuti') cardClass = 'card-featured-accent';

    return `
        <div class="airport-card ${cardClass}">
            <div>
                <div class="ap-header">
                    <div style="display: flex; align-items: center;">
                        ${logoImg}
                        <div>
                            <span class="ap-name">${ap.name}</span>
                            <div class="ap-rating">
                                <span class="stars"><i class="fa-solid fa-star"></i> ${ap.rating}</span>
                                <span>速度: ${ap.speedScore}</span> | <span>稳定: ${ap.stabilityScore}%</span>
                            </div>
                        </div>
                    </div>
                    <span class="ap-badge">
                        ${ap.id === 'ap-huanqiuti' ? '置顶推荐' : ap.badge}
                    </span>
                </div>
                <p class="ap-desc">${ap.tagline}</p>
                
                ${couponBarHtml}

                <div class="ap-specs">
                    <div class="spec-item">
                        <span>线路架构</span>
                        <strong>${ap.bandwidth}</strong>
                    </div>
                    <div class="spec-item">
                        <span>节点数量</span>
                        <strong>${ap.nodesCount}</strong>
                    </div>
                    <div class="spec-item">
                        <span>协议支持</span>
                        <strong>${ap.protocols.join(', ')}</strong>
                    </div>
                    <div class="spec-item">
                        <span>流媒体/AI</span>
                        <strong>${ap.streamingUnlock}</strong>
                    </div>
                </div>
                <div class="ap-tags">
                    ${ap.features.map(f => `<span class="tag-chip">${f.toUpperCase()}</span>`).join('')}
                </div>
            </div>
            <div class="ap-footer">
                <div class="ap-price">
                    <span style="font-size: 0.72rem; color: var(--primary-cyan); border: 1px solid var(--border-color); padding: 1px 6px; border-radius: 4px; display: inline-block; margin-bottom: 2px;">
                        7折到手价
                    </span>
                    <div style="font-weight: 700; color: var(--text-main);">
                        ￥${ap.priceMin} <span style="font-size: 0.78rem; color: var(--text-dim); text-decoration: line-through;">￥${ap.priceOriginal}</span>
                    </div>
                </div>
                <div class="ap-actions">
                    <a href="${affUrl}" target="_blank" rel="nofollow sponsored noopener noreferrer" class="btn btn-sm btn-primary" style="text-decoration: none;">
                        官网直达
                    </a>
                    <a href="posts/huanqiuti.html" class="btn btn-sm btn-glass" style="text-decoration: none;">
                        查看实测
                    </a>
                    <button class="btn btn-sm btn-glass" onclick="toggleCompare('${ap.id}')">
                        +对比
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createReviewCardHTML(rev) {
    const targetUrl = rev.airportId === 'ap-huanqiuti' ? 'posts/huanqiuti.html' : (rev.url || 'posts/huanqiuti.html');
    return `
        <a href="${targetUrl}" class="review-card" style="display: block; text-decoration: none; color: inherit; cursor: pointer;">
            <div class="review-meta">
                <span><i class="fa-solid fa-user"></i> ${rev.author}</span>
                <span><i class="fa-solid fa-calendar"></i> ${rev.date}</span>
                <span><i class="fa-solid fa-eye"></i> ${rev.views} 阅读</span>
            </div>
            <h3 class="review-title">${rev.title}</h3>
            <p class="review-summary">${rev.summary}</p>
            <div class="ap-tags">
                ${rev.tags.map(t => `<span class="tag-chip">${t}</span>`).join('')}
            </div>
            <div style="margin-top: 14px; color: var(--primary-cyan); font-size: 0.85rem; font-weight: 700;">
                查看实测报告 <i class="fa-solid fa-arrow-right"></i>
            </div>
        </a>
    `;
}

let html = fs.readFileSync(indexPath, 'utf8');

// 1. Upgrade Desktop Nav
const oldNavRegex = /<nav class="main-nav">[\s\S]*?<\/nav>/;
const newNav = `<nav class="main-nav">
                <ul class="nav-list">
                    <li class="nav-item active" data-tab="home" onclick="switchTab('home')"><a href="/" onclick="event.preventDefault(); switchTab('home');">首页</a></li>
                    <li class="nav-item" data-tab="recommend" onclick="switchTab('recommend')"><a href="#recommend" onclick="event.preventDefault(); switchTab('recommend');">机场推荐</a></li>
                    <li class="nav-item" data-tab="directory" onclick="switchTab('directory')"><a href="#directory" onclick="event.preventDefault(); switchTab('directory');">机场导航</a></li>
                    <li class="nav-item" data-tab="reviews"><a href="/reviews.html">机场评测</a></li>
                    <li class="nav-item" data-tab="blog" onclick="switchTab('blog')"><a href="#blog" onclick="event.preventDefault(); switchTab('blog');">博客</a></li>
                    <li class="nav-item" data-tab="compare"><a href="/compare.html">性价比机场</a></li>
                    <li class="nav-item" data-tab="protocols"><a href="/protocols.html">协议知识</a></li>
                    <li class="nav-item text-danger" data-tab="blackholes"><a href="/blackholes.html" class="text-danger">跑路预警</a></li>
                    <li class="nav-item"><a href="/about.html">关于实验室</a></li>
                </ul>
            </nav>`;
html = html.replace(oldNavRegex, newNav);

// 2. Upgrade Mobile Nav
const oldMobileNavRegex = /<div class="mobile-nav-drawer" id="mobileNav">[\s\S]*?<\/div>/;
const newMobileNav = `<div class="mobile-nav-drawer" id="mobileNav">
        <ul class="mobile-nav-list">
            <li><a href="/" onclick="switchTab('home'); toggleMobileNav(); return false;">首页</a></li>
            <li><a href="#recommend" onclick="switchTab('recommend'); toggleMobileNav(); return false;">机场推荐</a></li>
            <li><a href="#directory" onclick="switchTab('directory'); toggleMobileNav(); return false;">机场导航</a></li>
            <li><a href="/reviews.html">机场评测</a></li>
            <li><a href="#blog" onclick="switchTab('blog'); toggleMobileNav(); return false;">博客指南</a></li>
            <li><a href="/compare.html">性价比机场</a></li>
            <li><a href="/protocols.html">协议知识</a></li>
            <li><a href="/blackholes.html" style="color: var(--accent-red);">跑路预警</a></li>
            <li><a href="/about.html">关于实验室</a></li>
        </ul>
    </div>`;
html = html.replace(oldMobileNavRegex, newMobileNav);

// 3. Static Pre-rendered cards for homeRecommendedGrid
const staticAirportCards = AIRPORTS_DATA.map(ap => createAirportCardHTML(ap)).join('\n');
const homeGridRegex = /<div class="airport-grid" id="homeRecommendedGrid">[\s\S]*?<\/div>/;
html = html.replace(homeGridRegex, `<div class="airport-grid" id="homeRecommendedGrid">\n${staticAirportCards}\n                </div>`);

// 4. Static Pre-rendered cards for homeReviewsGrid
const staticReviewCards = REVIEWS_DATA.slice(0, 6).map(rev => createReviewCardHTML(rev)).join('\n');
const homeReviewsRegex = /<div class="reviews-grid" id="homeReviewsGrid">[\s\S]*?<\/div>/;
html = html.replace(homeReviewsRegex, `<div class="reviews-grid" id="homeReviewsGrid">\n${staticReviewCards}\n                </div>`);

// 5. Semantic SEO Topic Cloud before </footer>
if (!html.includes('seo-matrix-section')) {
    const topicMatrixHtml = `
    <!-- Semantic SEO Topic Matrix & Anchor Cloud -->
    <section class="seo-matrix-section" style="max-width: 1180px; margin: 40px auto 20px; padding: 24px; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color);">
        <h3 style="font-size: 1.05rem; margin-bottom: 12px; color: var(--text-heading); font-weight: 700;">
            <i class="fa-solid fa-network-wired text-accent"></i> 核心专线网络索引与测速知识库
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px;">
            机场 TOP1 实验室依据 2026 年主流跨境拓扑标准，持续追踪测试 IEPL 内网专线、IPLC 物理专线及下一代传输协议。查阅各细分主题评测：
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.82rem;">
            <a href="/compare.html" style="padding: 5px 12px; background: #FAF8F5; border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-main); text-decoration: none; font-weight: 500;">2026 性价比机场推荐</a>
            <a href="/reviews.html" style="padding: 5px 12px; background: #FAF8F5; border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-main); text-decoration: none; font-weight: 500;">晚高峰 8K 测速横评</a>
            <a href="/protocols.html" style="padding: 5px 12px; background: #FAF8F5; border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-main); text-decoration: none; font-weight: 500;">VLESS-REALITY vs Hysteria 2</a>
            <a href="/blackholes.html" style="padding: 5px 12px; background: #FAF8F5; border: 1px solid var(--border-color); border-radius: 4px; color: var(--accent-red); text-decoration: none; font-weight: 500;">跑路机场黑名单与避坑</a>
            <a href="/about.html" style="padding: 5px 12px; background: #FAF8F5; border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-main); text-decoration: none; font-weight: 500;">探针拓扑与中立性声明</a>
            <a href="/posts/huanqiuti.html" style="padding: 5px 12px; background: #FAF8F5; border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-main); text-decoration: none; font-weight: 500;">环球梯 IEPL 深度长测</a>
            <a href="/posts/2026-airport-node-recommendation-selection-guide.html" style="padding: 5px 12px; background: #FAF8F5; border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-main); text-decoration: none; font-weight: 500;">2026 节点选购全景指南</a>
            <a href="/feed.xml" style="padding: 5px 12px; background: #FAF8F5; border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-main); text-decoration: none; font-weight: 500;">RSS 订阅源</a>
        </div>
    </section>
`;
    html = html.replace('<!-- Footer -->', `${topicMatrixHtml}\n    <!-- Footer -->`);
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully optimized index.html with crawlable navs, pre-rendered cards, and semantic topic matrix!');
