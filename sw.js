// Voxa SW v3 — force kills all old caches
const CACHE = 'voxa-v6';

self.addEventListener('install', e => {
  // Skip waiting immediately — don't let old SW stay
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['./index.html']))
  );
});

self.addEventListener('activate', e => {
  // Delete ALL old caches — including hanzhi-v1, shuohua-v22, voxa-v6, voxa-v6
  e.waitUntil(
    caches.keys().then(keys => {
      console.log('[Voxa SW] Clearing caches:', keys);
      return Promise.all(
        keys.map(k => {
          console.log('[Voxa SW] Deleting cache:', k);
          return caches.delete(k);
        })
      );
    }).then(() => {
      console.log('[Voxa SW] All old caches cleared');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', e => {
  // ALWAYS network-first for HTML — never serve stale
  if (e.request.mode === 'navigate' || 
      e.request.url.endsWith('.html') || 
      e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first for other assets
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
