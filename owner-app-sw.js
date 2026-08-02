const OWNER_APP_CACHE = 'ruth-owner-app-v2';
const APP_SHELL = [
  'admin.html',
  'app.js',
  'admin.js',
  'firebase-client.js',
  'owner-app.js',
  'styles.css',
  'assets/ruth-jewels-favicon-v2.png',
  'assets/ruth-jewels-logo-v2.jpg'
].map(path => new URL(path, self.registration.scope).toString());

self.addEventListener('install', event => {
  event.waitUntil(caches.open(OWNER_APP_CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names
    .filter(name => name.startsWith('ruth-owner-app-') && name !== OWNER_APP_CACHE)
    .map(name => caches.delete(name))
  )).then(() => self.clients.claim()));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(OWNER_APP_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request, { ignoreSearch:true })) || Response.error();
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith(new URL(self.registration.scope).pathname)) event.respondWith(networkFirst(event.request));
});

