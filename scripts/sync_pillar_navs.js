const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const pillarFiles = [
    { file: 'compare.html', active: '/compare.html' },
    { file: 'reviews.html', active: '/reviews.html' },
    { file: 'protocols.html', active: '/protocols.html' },
    { file: 'blackholes.html', active: '/blackholes.html' },
    { file: 'about.html', active: '/about.html' }
];

function buildNav(activePath) {
    const items = [
        { href: '/', icon: 'fa-home', label: '首页' },
        { href: '/#recommend', icon: 'fa-fire', label: '推荐榜' },
        { href: '/compare.html', icon: 'fa-scale-balanced', label: '7折精算表' },
        { href: '/reviews.html', icon: 'fa-vial-virus', label: '晚高峰测速' },
        { href: '/protocols.html', icon: 'fa-network-wired', label: '协议科普' },
        { href: '/blackholes.html', icon: 'fa-triangle-exclamation', label: '跑路预警' },
        { href: '/about.html', icon: 'fa-circle-info', label: '评测标准' }
    ];

    const links = items.map(it => {
        const isActive = it.href === activePath;
        const style = isActive ? ' style="color: var(--primary-cyan); font-weight:700;"' : '';
        return `                <a href="${it.href}"${style}><i class="fa-solid ${it.icon}"></i> ${it.label}</a>`;
    }).join('\n');

    return `<nav class="nav-links">\n${links}\n            </nav>`;
}

pillarFiles.forEach(({ file, active }) => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    const navRegex = /<nav class="nav-links">[\s\S]*?<\/nav>/;
    if (navRegex.test(content)) {
        content = content.replace(navRegex, buildNav(active));
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated nav in ${file}`);
    }
});
