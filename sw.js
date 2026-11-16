/* Service worker: cangkang aplikasi tersedia offline. Permintaan ke server data tidak pernah disimpan di sini. */
var CACHE = 'doit-v1.3.0', FONTS = 'doit-fonts-1';
var SHELL = ['./', 'index.html', 'style.css', 'core.js', 'i18n.js', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE && k !== FONTS; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method === 'GET' && /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {   // font: simpan agar tetap tampil saat offline
    e.respondWith(caches.open(FONTS).then(function (c) { return c.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(function () { return hit; });
      return hit || net; }); }));
    return;
  }
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // data (Apps Script) tidak lewat sini
  e.respondWith(
    caches.match(req, {ignoreSearch: true}).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () { return hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined); });
      return hit || net;
    })
  );
});
