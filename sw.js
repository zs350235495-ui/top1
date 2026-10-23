/**
 * 机场 TOP1 - Service Worker 渐进式离线缓存与极速渲染引擎
 * 采用 Stale-While-Revalidate 与 Cache-First 复合策略
 */
const CACHE_NAME = 'jichangtop1-core-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/compare.html',
  '/reviews.html',
  '/blackholes.html',
  '/protocols.html',
  '/about.html',
  '/css/styles.css',
  '/js/data.js',
  '/js/app.js',
  '/images/favicon.png',
  '/images/logo-horizontal.png',
  '/manifest.json'
];

// 安装阶段：预缓存核心静态骨架
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 正在预缓存全站核心资源...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活阶段：清理旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] 清除过期缓存:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截请求：Stale-While-Revalidate 机制，秒开渲染同时后台无感更新
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求且属于同源或 CDN 资源
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 避免缓存跨域 API 或第三方推广外链
  if (url.origin !== self.location.origin && !url.hostname.includes('cdnjs.cloudflare.com')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        // 如果本地缓存命中则立即返回，并在后台更新；否则等待网络返回
        return cachedResponse || fetchPromise;
      });
    })
  );
});
