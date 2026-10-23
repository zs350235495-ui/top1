const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const postsDir = path.join(rootDir, 'posts');

const allHtmlFiles = [];

// Root html files
fs.readdirSync(rootDir).forEach(f => {
    if (f.endsWith('.html')) allHtmlFiles.push({ file: f, path: path.join(rootDir, f), isPost: false });
});

// Posts html files
if (fs.existsSync(postsDir)) {
    fs.readdirSync(postsDir).forEach(f => {
        if (f.endsWith('.html')) allHtmlFiles.push({ file: f, path: path.join(postsDir, f), isPost: true });
    });
}

const auditResults = allHtmlFiles.map(({ file, path: filePath, isPost }) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const cssLinks = content.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
    const hasSiteHeader = content.includes('class="site-header"');
    const hasLegacyHeader = content.includes('class="header"');
    const hasNavLinks = content.includes('class="nav-links"');
    const hasMainNav = content.includes('class="main-nav"');
    const hasAnyHeader = content.includes('<header');
    return {
        file,
        isPost,
        cssLinks,
        hasSiteHeader,
        hasLegacyHeader,
        hasNavLinks,
        hasMainNav,
        hasAnyHeader
    };
});

console.log(JSON.stringify(auditResults, null, 2));
