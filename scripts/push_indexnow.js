/**
 * IndexNow 自动批量提交脚本 (带容错与自动重试)
 * 在 GitHub Actions 构建与部署时自动将 sitemap.xml 中的所有有效 URL 提交给 Bing / IndexNow
 */
const https = require('https');
const fs = require('fs');

const host = 'jichangtop1.com';
const key = 'f8724651013c4d30b2386d6a6f5d9e6b';
const keyLocation = `https://${host}/${key}.txt`;

if (!fs.existsSync('./sitemap.xml')) {
    console.error('未找到 sitemap.xml 文件，跳过 IndexNow 提交。');
    process.exit(0);
}

const sitemapContent = fs.readFileSync('./sitemap.xml', 'utf8');
const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);

if (!locMatches || locMatches.length === 0) {
    console.warn('sitemap.xml 中未匹配到任何 URL。');
    process.exit(0);
}

const urlList = locMatches.map(tag => tag.replace(/<\/?loc>/g, '').trim());

console.log(`准备向 IndexNow (api.indexnow.org) 提交 ${urlList.length} 个 URL...`);

const payload = JSON.stringify({
    host: host,
    key: key,
    keyLocation: keyLocation,
    urlList: urlList
});

function sendRequest(retryCount = 0) {
    const options = {
        hostname: 'api.indexnow.org',
        port: 443,
        path: '/indexnow',
        method: 'POST',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
            if (res.statusCode === 200 || res.statusCode === 202) {
                console.log(`[成功] IndexNow 接收成功！状态码: ${res.statusCode}`);
            } else {
                console.log(`[通知] IndexNow 返回状态码: ${res.statusCode}, 响应: ${responseBody || 'None'}`);
            }
        });
    });

    req.on('timeout', () => {
        req.destroy();
        handleRetry(retryCount, '请求超时');
    });

    req.on('error', (err) => {
        handleRetry(retryCount, err.message);
    });

    req.write(payload);
    req.end();
}

function handleRetry(retryCount, reason) {
    if (retryCount < 3) {
        console.warn(`[重试 ${retryCount + 1}/3] 原因: ${reason}，将在 3 秒后重试...`);
        setTimeout(() => sendRequest(retryCount + 1), 3000);
    } else {
        console.warn(`[跳过] IndexNow 在多次重试后未能连接 (${reason})，不阻断部署流程。`);
    }
}

sendRequest();
