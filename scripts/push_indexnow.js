/**
 * IndexNow 自动批量提交脚本 (带双端点推送与自动重试)
 * 自动将 sitemap.xml 中的所有有效 URL 同步提交给 IndexNow 全球中心与 Bing 官方端点
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

console.log(`[IndexNow] 准备向搜索引擎提交 ${urlList.length} 个最新收录 URL...`);

const payload = JSON.stringify({
    host: host,
    key: key,
    keyLocation: keyLocation,
    urlList: urlList
});

const endpoints = [
    { name: 'IndexNow Global', hostname: 'api.indexnow.org' },
    { name: 'Bing Direct', hostname: 'www.bing.com' }
];

function submitToEndpoint(endpoint, retryCount = 0) {
    const options = {
        hostname: endpoint.hostname,
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
                console.log(`[成功] ${endpoint.name} (${endpoint.hostname}) 接收成功！状态码: ${res.statusCode}`);
            } else {
                console.log(`[通知] ${endpoint.name} (${endpoint.hostname}) 返回状态码: ${res.statusCode}, 响应: ${responseBody || 'None'}`);
            }
        });
    });

    req.on('timeout', () => {
        req.destroy();
        handleRetry(endpoint, retryCount, '请求超时');
    });

    req.on('error', (err) => {
        handleRetry(endpoint, retryCount, err.message);
    });

    req.write(payload);
    req.end();
}

function handleRetry(endpoint, retryCount, reason) {
    if (retryCount < 3) {
        console.warn(`[重试 ${endpoint.name} ${retryCount + 1}/3] 原因: ${reason}，将在 3 秒后重试...`);
        setTimeout(() => submitToEndpoint(endpoint, retryCount + 1), 3000);
    } else {
        console.warn(`[跳过] ${endpoint.name} 在多次重试后未能连接 (${reason})，不阻断流程。`);
    }
}

endpoints.forEach(ep => submitToEndpoint(ep));
