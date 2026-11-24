(() => {
  const { release } = document.currentScript.dataset;
  const root = new URL('.', document.currentScript.src);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(new URL('app-worker.js', root), { updateViaCache: 'none' }).catch(console.warn);
  }

  let lastCheck = 0;
  let updateButton;
  async function checkForUpdate() {
    if (document.visibilityState !== 'visible' || updateButton || Date.now() - lastCheck < 15000) return;
    lastCheck = Date.now();
    const url = new URL('release.json', root);
    url.searchParams.set('check', lastCheck.toString());
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return;
      const latest = await response.json();
      if (!/^[a-f0-9]{64}$/.test(latest.release ?? '') || latest.release === release) return;
      updateButton = document.createElement('button');
      updateButton.type = 'button';
      updateButton.textContent = '새 버전 적용';
      updateButton.style.cssText = 'position:fixed;z-index:10;top:calc(env(safe-area-inset-top, 0px) + 12px);left:50%;transform:translateX(-50%);background:#141c23;color:#fff;border:1px solid #d5b279;border-radius:8px;padding:10px 14px;font:600 14px system-ui;cursor:pointer';
      updateButton.addEventListener('click', () => {
        const next = new URL(location.href);
        next.searchParams.set('v', latest.release);
        location.replace(next);
      });
      document.body.append(updateButton);
    } catch {
      // Connection errors leave the running game alone. Check again on the next return.
    }
  }

  document.addEventListener('visibilitychange', checkForUpdate);
  window.addEventListener('focus', checkForUpdate);
  window.addEventListener('pageshow', (event) => { if (event.persisted) checkForUpdate(); });
})();
