const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const pillarPages = [
    { file: 'compare.html', active: '/compare.html' },
    { file: 'reviews.html', active: '/reviews.html' },
    { file: 'protocols.html', active: '/protocols.html' },
    { file: 'blackholes.html', active: '/blackholes.html' },
    { file: 'about.html', active: '/about.html' },
    { file: '404.html', active: '' }
];

function buildSiteHeader(activeUrl) {
    const navItems = [
        { href: '/', label: '首页', isTab: true },
        { href: '/#recommend', label: '实测推荐', isTab: true },
        { href: '/compare.html', label: '7折性价比精算' },
        { href: '/reviews.html', label: '晚高峰测速横评' },
        { href: '/protocols.html', label: '协议科普' },
        { href: '/blackholes.html', label: '跑路预警', danger: true },
        { href: '/about.html', label: '关于实验室' }
    ];

    const listItems = navItems.map(item => {
        const isActive = item.href === activeUrl;
        const dangerClass = item.danger ? ' text-danger' : '';
        const activeClass = isActive ? ' active' : '';
        const dangerStyle = item.danger ? ' class="text-danger"' : '';
        return `                    <li class="nav-item${dangerClass}${activeClass}"><a href="${item.href}"${dangerStyle}>${item.label}</a></li>`;
    }).join('\n');

    return `    <!-- Header & Navigation -->
    <header class="site-header">
        <div class="header-container">
            <a href="/" class="brand-logo" style="display: flex; align-items: center; text-decoration: none;">
                <img src="/images/logo-horizontal.png" alt="机场 TOP1" style="height: 38px; width: auto; max-width: 220px; object-fit: contain; vertical-align: middle;">
            </a>
            <nav class="main-nav">
                <ul class="nav-list">
${listItems}
                </ul>
            </nav>
        </div>
    </header>`;
}

pillarPages.forEach(({ file, active }) => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace header (whether <header class="header"> or <header class="site-header">)
    const headerRegex = /<header class="(?:header|site-header)">[\s\S]*?<\/header>/;
    if (headerRegex.test(content)) {
        content = content.replace(headerRegex, buildSiteHeader(active));
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[成功统一站内 Header] ${file}`);
    }
});
