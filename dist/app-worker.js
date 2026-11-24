const appRoot = new URL(self.registration.scope);

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.mode !== 'navigate' || request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== appRoot.origin) return;
  if (url.pathname !== appRoot.pathname && url.pathname !== `${appRoot.pathname}index.html`) return;

  // Fetch the current shell when launching the app, even if GitHub Pages cached the old URL.
  url.searchParams.set('_app', Date.now().toString());
  event.respondWith(fetch(url, { cache: 'no-store' }));
});
