const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const postsDir = path.join(rootDir, 'posts');

const headSpeedSnippet = `    <!-- Instant Speculation Rules & Alert Bar State -->
    <script>if(sessionStorage.getItem('topAlertClosed')==='true'){document.documentElement.classList.add('top-alert-closed');}</script>
    <script type="speculationrules">
    {
      "prerender": [
        {
          "source": "list",
          "urls": ["/", "/reviews", "/compare", "/protocols", "/blackholes", "/about"]
        }
      ]
    }
    </script>`;

// Helper to generate the exact standard header matching index.html 100%
function buildStandardHeader(activeKey) {
    const navItems = [
        { key: 'home', href: '/', label: '首页' },
        { key: 'recommend', href: '/#recommend', label: '机场推荐' },
        { key: 'directory', href: '/#directory', label: '机场导航' },
        { key: 'reviews', href: '/reviews', label: '机场评测' },
        { key: 'blog', href: '/#blog', label: '博客' },
        { key: 'compare', href: '/compare', label: '性价比机场' },
        { key: 'protocols', href: '/protocols', label: '协议知识' },
        { key: 'blackholes', href: '/blackholes', label: '跑路预警', danger: true },
        { key: 'about', href: '/about', label: '关于实验室' }
    ];

    const navListHtml = navItems.map(item => {
        const isActive = item.key === activeKey;
        const classes = ['nav-item'];
        if (item.danger) classes.push('text-danger');
        if (isActive) classes.push('active');
        const linkClass = item.danger ? ' class="text-danger"' : '';
        return `                    <li class="${classes.join(' ')}"><a href="${item.href}"${linkClass}>${item.label}</a></li>`;
    }).join('\n');

    return `    <!-- Top Warning Marquee for Exit Scams -->
    <div class="top-alert-bar" id="topAlertBar">
        <div class="alert-content">
            <span class="alert-badge"><i class="fa-solid fa-triangle-exclamation"></i> 避坑提醒</span>
            <span class="alert-text">近期部分低价机场频现拔线跑路，建议博友们按月/季续费，备一份不限时按量包更稳妥。</span>
            <button class="alert-close" onclick="closeTopAlert()">&times;</button>
        </div>
    </div>

    <!-- Header & Navigation -->
    <header class="site-header">
        <div class="header-container">
            <a href="/" class="brand-logo" style="display: flex; align-items: center; text-decoration: none;">
                <img src="/images/logo-horizontal.png" alt="机场 TOP1" style="height: 38px; width: auto; max-width: 220px; object-fit: contain; vertical-align: middle;">
            </a>

            <nav class="main-nav">
                <ul class="nav-list">
${navListHtml}
                </ul>
            </nav>

            <div class="header-actions">
                <div class="search-box">
                    <i class="fa-solid fa-magnifying-glass search-icon" style="cursor: pointer;" onclick="const val=document.getElementById('globalSearch').value; if(val) location.href='/?s='+encodeURIComponent(val);"></i>
                    <input type="text" id="globalSearch" placeholder="搜索..." onkeydown="if(event.key==='Enter')location.href='/?s='+encodeURIComponent(this.value)">
                </div>
                <a href="https://t.me/huanqiuti8899" target="_blank" rel="noopener noreferrer" class="nav-link-subtle" title="TG 频道">
                    TG 频道
                </a>
                <button class="mobile-menu-btn" onclick="toggleMobileNav()">
                    <i class="fa-solid fa-bars"></i>
                </button>
            </div>
        </div>
    </header>

    <!-- Mobile Nav Drawer -->
    <div class="mobile-nav-drawer" id="mobileNav">
        <ul class="mobile-nav-list">
            <li><a href="/">首页</a></li>
            <li><a href="/#recommend">机场推荐</a></li>
            <li><a href="/#directory">机场导航</a></li>
            <li><a href="/reviews">机场评测</a></li>
            <li><a href="/#blog">博客</a></li>
            <li><a href="/compare">性价比机场</a></li>
            <li><a href="/protocols">协议知识</a></li>
            <li><a href="/blackholes" style="color: var(--accent-red);">跑路预警</a></li>
            <li><a href="/about">关于实验室</a></li>
        </ul>
    </div>`;
}

function ensureHeadSpeedSnippet(content) {
    if (content.includes('topAlertClosed')) {
        return content;
    }
    return content.replace('</head>', `${headSpeedSnippet}\n</head>`);
}

const headerBlockRegex = /(?:<!--[^\n]*(?:Top Warning|Header)[^\n]*-->\s*)?(?:<div class="top-alert-bar"[^>]*>[\s\S]*?<\/div>\s*)?(?:<!--[^\n]*Header[^\n]*-->\s*)?<header class="(?:header|site-header)">[\s\S]*?<\/header>(?:\s*<!-- Mobile Nav Drawer -->\s*<div class="mobile-nav-drawer"[^>]*>[\s\S]*?<\/div>)?/;

// 0. Update index.html head
const indexFile = path.join(rootDir, 'index.html');
if (fs.existsSync(indexFile)) {
    let indexContent = fs.readFileSync(indexFile, 'utf8');
    indexContent = ensureHeadSpeedSnippet(indexContent);
    fs.writeFileSync(indexFile, indexContent, 'utf8');
    console.log('[成功更新 index.html head 极速预渲染]');
}

// 1. Process Root Pillar Pages
const pillarPages = [
    { file: 'compare.html', activeKey: 'compare' },
    { file: 'reviews.html', activeKey: 'reviews' },
    { file: 'protocols.html', activeKey: 'protocols' },
    { file: 'blackholes.html', activeKey: 'blackholes' },
    { file: 'about.html', activeKey: 'about' },
    { file: '404.html', activeKey: '' }
];

pillarPages.forEach(({ file, activeKey }) => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    content = ensureHeadSpeedSnippet(content);

    // Standardize container width to align with 1180px header
    content = content.replace(/<main class="container" style="max-width: 1200px; margin: 36px auto; padding: 0 20px;">/g, '<main class="container" style="max-width: 1180px; margin: 32px auto; padding: 0 24px;">');

    if (headerBlockRegex.test(content)) {
        content = content.replace(headerBlockRegex, buildStandardHeader(activeKey));
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[成功统一 Header & AlertBar] ${file} (Active: ${activeKey})`);
    } else {
        console.warn(`[未找到 Header] ${file}`);
    }
});

// 2. Process All Posts in posts/
const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.html'));
postFiles.forEach(file => {
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Clean duplicate comments if present
    content = content.replace(/(?:<!-- Standard Site Navigation Header -->\s*)+/g, '');
    content = ensureHeadSpeedSnippet(content);

    if (headerBlockRegex.test(content)) {
        content = content.replace(headerBlockRegex, buildStandardHeader(''));
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[成功统一 Post Header & AlertBar] posts/${file}`);
    } else {
        console.warn(`[未找到 Post Header] posts/${file}`);
    }
});

console.log('全部页面导航栏与顶部避坑提醒条已成功 100% 统一对齐！');
