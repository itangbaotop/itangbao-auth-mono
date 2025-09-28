// apps/web/public/sw.js

const IMAGE_CACHE_NAME = 'itangbao-image-cache-v1';
const CACHE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 缓存7天

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 如果缓存名称不是当前版本，则删除
          if (cacheName !== IMAGE_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 立即控制页面，而无需等待下一次导航
  return self.clients.claim();
});

// Fetch 事件：拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 我们只关心第三方图片的 GET 请求
  // 根据你的实际情况调整此处的 URL 匹配规则
  const isThirdPartyImage = 
    request.method === 'GET' &&
    (request.url.startsWith('https://lh3.googleusercontent.com') ||
     request.url.startsWith('https://avatars.githubusercontent.com'));

  if (isThirdPartyImage) {
    // 应用 "Stale-While-Revalidate" 策略
    event.respondWith(staleWhileRevalidate(request));
  }
  
  // 对于其他请求，正常执行网络请求
});

/**
 * Stale-While-Revalidate 缓存策略
 * 1. 立即从缓存返回响应（如果可用），提供快速的用户体验。
 * 2. 同时，在后台发起网络请求以获取最新版本。
 * 3. 获取到新版本后，更新缓存，以便下次请求使用。
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponsePromise = await cache.match(request);

  const networkResponsePromise = fetch(request).then(response => {
    // 确保响应有效
    if (response && response.status === 200) {
      // 克隆响应，因为响应体只能被读取一次
      const responseToCache = response.clone();
      // 存入缓存
      cache.put(request, responseToCache);
    }
    return response;
  });

  // 优先返回缓存的响应，如果存在的话。否则，等待网络响应。
  return cachedResponsePromise || networkResponsePromise;
}

/**
 * Cache First (先缓存后网络) 策略 - 备选方案
 * 如果图片基本不更新，可以使用此策略，性能更好。
 */
async function cacheFirst(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // 如果缓存命中，直接返回
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // 否则，从网络获取
  try {
    const networkResponse = await fetch(request);
    // 确保响应有效
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Fetch failed; returning offline fallback.', error);
    // 可选：返回一个默认的占位图
    // return caches.match('/images/placeholder.png');
    throw error;
  }
}