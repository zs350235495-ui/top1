const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const postsDir = path.join(rootDir, 'posts');

const standardHeaderHtml = `    <!-- Standard Site Navigation Header -->
    <header class="site-header">
        <div class="header-container">
            <a href="/" class="brand-logo" style="display: flex; align-items: center; text-decoration: none;">
                <img src="/images/logo-horizontal.png" alt="机场 TOP1" style="height: 38px; width: auto; max-width: 220px; object-fit: contain; vertical-align: middle;">
            </a>
            <nav class="main-nav">
                <ul class="nav-list">
                    <li class="nav-item"><a href="/">首页</a></li>
                    <li class="nav-item"><a href="/#recommend">实测推荐</a></li>
                    <li class="nav-item"><a href="/compare">7折性价比精算</a></li>
                    <li class="nav-item"><a href="/reviews">晚高峰测速横评</a></li>
                    <li class="nav-item"><a href="/protocols">协议科普</a></li>
                    <li class="nav-item text-danger"><a href="/blackholes" class="text-danger">跑路预警</a></li>
                    <li class="nav-item"><a href="/about">关于实验室</a></li>
                </ul>
            </nav>
        </div>
    </header>`;

const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.html'));

postFiles.forEach(file => {
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Ensure CSS link uses absolute path /css/styles.css
    if (content.includes('href="../css/styles.css"')) {
        content = content.replace(/href=["']\.\.\/css\/styles\.css["']/g, 'href="/css/styles.css"');
        modified = true;
    }
    if (content.includes('href="css/styles.css"')) {
        content = content.replace(/href=["']css\/styles\.css["']/g, 'href="/css/styles.css"');
        modified = true;
    }

    // 2. Ensure favicon and images use absolute path
    if (content.includes('href="../images/favicon.png"')) {
        content = content.replace(/href=["']\.\.\/images\/favicon\.png["']/g, 'href="/images/favicon.png"');
        modified = true;
    }
    if (content.includes('src="../images/')) {
        content = content.replace(/src=["']\.\.\/images\//g, 'src="/images/');
        modified = true;
    }
    if (content.includes('href="../index.html"')) {
        content = content.replace(/href=["']\.\.\/index\.html["']/g, 'href="/"');
        modified = true;
    }

    // 3. Ensure a unified site-header exists
    // If the file uses <header class="header">, replace with standardHeaderHtml
    const legacyHeaderRegex = /<header class="header">[\s\S]*?<\/header>/;
    if (legacyHeaderRegex.test(content)) {
        content = content.replace(legacyHeaderRegex, standardHeaderHtml);
        modified = true;
        console.log(`Replaced legacy header with standardHeaderHtml in ${file}`);
    }

    // If the file doesn't have any site-header at all (like SLA or pitfall post)
    if (!content.includes('<header class="site-header">') && !content.includes('<header class="header">')) {
        // Insert right after <body>
        const bodyTagRegex = /<body[^>]*>/i;
        const match = content.match(bodyTagRegex);
        if (match) {
            content = content.replace(match[0], `${match[0]}\n${standardHeaderHtml}\n`);
            modified = true;
            console.log(`Injected standardHeaderHtml into ${file}`);
        }
    }

    // If the file already has <header class="site-header">, ensure its navigation is rich and uses absolute paths
    const siteHeaderRegex = /<header class="site-header">[\s\S]*?<\/header>/;
    if (siteHeaderRegex.test(content)) {
        content = content.replace(siteHeaderRegex, standardHeaderHtml);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[成功统一样式与导航] ${file}`);
    }
});

// Also check pillar pages in root: compare.html, reviews.html, protocols.html, blackholes.html, about.html, 404.html
const rootPillars = ['compare.html', 'reviews.html', 'protocols.html', 'blackholes.html', 'about.html', '404.html'];
rootPillars.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Ensure absolute CSS path
    if (content.includes('href="css/styles.css"')) {
        content = content.replace(/href=["']css\/styles\.css["']/g, 'href="/css/styles.css"');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[成功统一根目录页面] ${file}`);
    }
});

console.log('All posts and pages verified for absolute CSS paths and standard navigation!');
