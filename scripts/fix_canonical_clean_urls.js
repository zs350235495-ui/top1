const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const pillars = ['compare.html', 'reviews.html', 'protocols.html', 'blackholes.html', 'about.html'];

pillars.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    const cleanName = file.replace('.html', '');
    // Replace canonical URL
    content = content.replace(new RegExp(`https://jichangtop1\\.com/${file}`, 'g'), `https://jichangtop1.com/${cleanName}`);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[成功更新 Canonical] ${file} -> https://jichangtop1.com/${cleanName}`);
});
