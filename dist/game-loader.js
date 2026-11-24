/* Reassemble immutable export parts as streaming Godot responses. */
(() => {
  const files = {"index.pck":{"size":168676636,"storedSize":168676636,"encoding":"identity","sha256":"7cffb7159a766bf88b671d33472255a53282b233778545827285ff9c359a1fb5","type":"application/octet-stream","parts":[{"file":"game-assets/7cffb7159a766bf88b671d33472255a53282b233778545827285ff9c359a1fb5/index.pck.000.bin","size":20971520},{"file":"game-assets/7cffb7159a766bf88b671d33472255a53282b233778545827285ff9c359a1fb5/index.pck.001.bin","size":20971520},{"file":"game-assets/7cffb7159a766bf88b671d33472255a53282b233778545827285ff9c359a1fb5/index.pck.002.bin","size":20971520},{"file":"game-assets/7cffb7159a766bf88b671d33472255a53282b233778545827285ff9c359a1fb5/index.pck.003.bin","size":20971520},{"file":"game-assets/7cffb7159a766bf88b671d33472255a53282b233778545827285ff9c359a1fb5/index.pck.004.bin","size":20971520},{"file":"game-assets/7cffb7159a766bf88b671d33472255a53282b233778545827285ff9c359a1fb5/index.pck.005.bin","size":20971520},{"file":"game-assets/7cffb7159a766bf88b671d33472255a53282b233778545827285ff9c359a1fb5/index.pck.006.bin","size":20971520},{"file":"game-assets/7cffb7159a766bf88b671d33472255a53282b233778545827285ff9c359a1fb5/index.pck.007.bin","size":20971520},{"file":"game-assets/7cffb7159a766bf88b671d33472255a53282b233778545827285ff9c359a1fb5/index.pck.008.bin","size":904476}]},"index.wasm":{"size":39509339,"storedSize":10150665,"encoding":"gzip","sha256":"7eda98958eb09135a1acb54a4323a00b1a55af1997f15fa1cdc2b93e3df46656","type":"application/wasm","parts":[{"file":"game-assets/7eda98958eb09135a1acb54a4323a00b1a55af1997f15fa1cdc2b93e3df46656/index.wasm.000.bin","size":10150665}]}};
  const originalFetch = globalThis.fetch.bind(globalThis);
  const root = new URL('.', document.currentScript.src);
  globalThis.fetch = async function(input, options) {
    const request = new Request(input, options);
    const url = new URL(request.url);
    const name = url.pathname.slice(root.pathname.length);
    const item = url.origin === root.origin && url.pathname.startsWith(root.pathname) ? files[name] : null;
    if (!item || request.method !== 'GET') return originalFetch(input, options);
    const controller = new AbortController();
    if (request.signal.aborted) throw request.signal.reason;
    const abort = () => controller.abort(request.signal.reason);
    request.signal.addEventListener('abort', abort, { once: true });
    let index = 0;
    const cleanup = () => request.signal.removeEventListener('abort', abort);
    const stream = new ReadableStream({
      async pull(sink) {
        try {
          if (index === item.parts.length) { cleanup(); sink.close(); return; }
          const part = item.parts[index];
          let bytes;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const response = await originalFetch(new URL(part.file, root), { credentials: 'same-origin', signal: controller.signal, cache: attempt ? 'reload' : 'default' });
              if (!response.ok) throw new Error('HTTP ' + response.status);
              bytes = new Uint8Array(await response.arrayBuffer());
              if (bytes.length !== part.size) throw new Error('Incomplete game download');
              break;
            } catch (error) {
              if (controller.signal.aborted || attempt === 2) throw error;
            }
          }
          index++;
          sink.enqueue(bytes);
        } catch (error) { cleanup(); controller.abort(); sink.error(error); }
      },
      cancel(reason) { cleanup(); controller.abort(reason); }
    });
    const body = item.encoding === 'gzip' ? stream.pipeThrough(new DecompressionStream('gzip')) : stream;
    return new Response(body, { headers: { 'Content-Type': item.type, 'Content-Length': String(item.size) } });
  };
})();
