/**
 * 机场 TOP1 - Service Worker 核心静态资源缓存引擎 (v3)
 * 纯静态资源缓存策略，严格放行 HTML 文档导航，杜绝 ERR_FAILED 错误
 */
const CACHE_NAME = 'jichangtop1-assets-v3';

// 仅缓存真正的静态资源文件（CSS、JS、图片、图标、清单）
const STATIC_ASSETS = [
  '/css/styles.css',
  '/js/data.js',
  '/js/app.js',
  '/images/favicon.png',
  '/images/logo-horizontal.png',
  '/images/huanqiuti-logo.jpg',
  '/manifest.json'
];

// 安装阶段：预缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活阶段：强力清理所有历史旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] 清理历史过期缓存:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截请求：仅处理静态静态资源，HTML 导航一律放行给原生浏览器网络，防止重定向导致 ERR_FAILED
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // 关键：页面导航跳转（mode === 'navigate'）完全不拦截，交给浏览器原生网络与 Cloudflare 重定向机制
  if (event.request.mode === 'navigate') {
    return;
  }

  const url = new URL(event.request.url);

  // 仅缓存同源资源与 cdnjs 静态库
  if (url.origin !== self.location.origin && !url.hostname.includes('cdnjs.cloudflare.com')) {
    return;
  }

  // 静态资源采用 Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // 网络失败时降级返回缓存，如果都没有则让浏览器处理
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
