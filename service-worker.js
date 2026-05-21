/**
 * Service Worker - 离线缓存
 */

const CACHE_NAME = 'pwa-demo-v2-2';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/games/game-base.js',
    './js/games/game-2048.js',
    './js/games/game-guess.js',
    './js/core/auth.js',
    './js/core/storage.js',
    './js/core/app.js',
    './manifest.json'
];

// 安装事件 - 缓存资源
self.addEventListener('install', event => {
    console.log('[SW] 安装中...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] 缓存资源');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
    console.log('[SW] 激活中...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] 删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 请求拦截 - 返回缓存或网络
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(event.request)
                    .then(response => {
                        // 不缓存非成功响应
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // 缓存新资源
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // 网络失败时返回缓存
                        return caches.match('./index.html');
                    });
            })
    );
});