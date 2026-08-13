// Fallback seguro. O build de produção gera o service worker principal.
// Este arquivo nunca deve cancelar seu registro ou recarregar páginas.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
