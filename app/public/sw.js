/* DailyRoutine service worker — offline-first cache. */
const VERSION = 'dr-v2';
const SHELL_CACHE = `${VERSION}-shell`;
const ICON_CACHE = `${VERSION}-icons`;

// Resolved relative to the SW scope (works under /DailyRoutine/ on Pages).
const SHELL = ['.', 'index.html', 'manifest.webmanifest', 'app-icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  // Icons: cache-first, populate lazily (the icon sets are large).
  if (url.pathname.includes('/icons/')) {
    e.respondWith(
      caches.open(ICON_CACHE).then((cache) =>
        cache.match(e.request).then(
          (hit) =>
            hit ||
            fetch(e.request).then((res) => {
              if (res.ok) cache.put(e.request, res.clone());
              return res;
            })
        )
      )
    );
    return;
  }

  // App shell & assets: network-first with cache fallback (offline support).
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((hit) => hit || caches.match('index.html'))
      )
  );
});
