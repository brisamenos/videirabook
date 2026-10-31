/* VideiraBook — service worker: deixa o app abrir rápido e mostra um aviso quando estiver sem internet */
const CACHE = 'videirabook-v11';
const BASE = ['/', '/css/style.css?v=4', '/js/core.js?v=4', '/js/aluno.js?v=4', '/js/professor.js?v=4', '/img/logo.svg',
  '/icon-192.png', '/fonts/newsreader-latin-opsz-normal.woff2', '/fonts/newsreader-latin-opsz-italic.woff2', '/fonts/figtree-latin-wght-normal.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // Dados (aulas, progresso, arquivos) sempre vêm do servidor
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/arquivos/')) return;
  // Telas e arquivos do app: tenta a internet primeiro; sem conexão, usa a cópia guardada
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? '/' : req, copia)); }
      return res;
    }).catch(() => caches.match(req.mode === 'navigate' ? '/' : req).then(r => r || caches.match('/')))
  );
});
