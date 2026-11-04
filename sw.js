/* VideiraBook — service worker: deixa o app abrir rápido e mostra um aviso quando estiver sem internet */
const CACHE = 'videirabook-v26';
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
  // (as ilustrações 3D têm página própria e são guardadas com o próprio endereço, sem substituir a tela do app)
  // (só a raiz vira a tela do app; páginas próprias, como a de cada igreja, ficam guardadas com o próprio endereço)
  const chave = req.mode === 'navigate' && url.pathname === '/' ? '/' : req;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(chave, copia)); }
      return res;
    }).catch(() => caches.match(chave).then(r => r || caches.match('/')))
  );
});

// Notificações no celular (enviadas pelo servidor)
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch { d = { texto: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.titulo || 'VideiraBook', {
    body: d.texto || '', icon: '/icon-192.png', badge: '/icon-192.png', tag: d.tag, renotify: !!d.tag,
    data: { link: d.link || '#/inicio' },
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const alvo = new URL('/' + (e.notification.data && e.notification.data.link || '#/inicio'), self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(janelas => {
    for (const j of janelas) if (new URL(j.url).origin === self.location.origin) { j.navigate(alvo).catch(() => {}); return j.focus(); }
    return self.clients.openWindow(alvo);
  }));
});
