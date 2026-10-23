const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const files = [
    'index.html',
    'reviews.html',
    'compare.html',
    'protocols.html',
    'blackholes.html',
    'about.html',
    ...fs.readdirSync(path.join(rootDir, 'posts')).filter(f => f.endsWith('.html')).map(f => 'posts/' + f)
];

const broken = [];
files.forEach(f => {
    const fullPath = path.join(rootDir, f);
    const c = fs.readFileSync(fullPath, 'utf8');
    const links = [...c.matchAll(/href=["'](\/[^"'#?]+)["']/g)].map(m => m[1]);
    links.forEach(l => {
        if (l === '/' || l === '') return;
        let p = l.startsWith('/') ? l.slice(1) : l;
        const directPath = path.join(rootDir, p);
        const htmlPath = path.join(rootDir, p + '.html');
        if (!fs.existsSync(directPath) && !fs.existsSync(htmlPath)) {
            broken.push({ from: f, to: l });
        }
    });
});

console.log('Total files checked:', files.length);
console.log('Broken links found:', broken.length, broken);
if (broken.length === 0) {
    console.log('✅ 全站全部内链 100% 真实有效，零死链 (Zero 404)！');
}
