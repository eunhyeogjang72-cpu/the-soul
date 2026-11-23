import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { gunzipSync } from 'node:zlib';

const root = path.resolve(process.argv[2]);
const files = JSON.parse(readFileSync(path.join(root, 'game-files.json'), 'utf8'));
const loader = readFileSync(path.join(root, 'game-loader.js'), 'utf8');
const origin = process.argv[3] || 'https://game.example/';
let failures = 0;
let requests = 0;
let corrupt = false;
const context = vm.createContext({
  document: { currentScript: { src: origin + 'game-loader.js' } },
  URL, Response, ReadableStream, DecompressionStream, AbortController, Uint8Array,
  Request: class extends Request { constructor(input, options) { super(typeof input === 'string' ? new URL(input, origin) : input, options); } },
  fetch: async (input) => {
    requests++;
    if (failures > 0) { failures--; return new Response('retry', { status: 503 }); }
    const relative = new URL(typeof input === 'string' ? input : input.url || input.href, origin).pathname.slice(new URL(origin).pathname.length);
    if (relative === 'unrelated') return new Response('passthrough');
    return new Response(corrupt ? new Uint8Array(1) : readFileSync(path.join(root, relative)));
  },
});
vm.runInContext(loader, context);
for (const [name, file] of Object.entries(files)) {
  for (const part of file.parts) assert.ok(statSync(path.join(root, part.file)).size <= 20 * 1024 * 1024);
  failures = 1;
  const response = await context.fetch(name);
  assert.equal(Number(response.headers.get('Content-Length')), file.size);
  assert.equal(response.headers.get('Content-Type'), file.type);
  const hash = createHash('sha256');
  let size = 0;
  for await (const chunk of response.body) { hash.update(chunk); size += chunk.length; }
  assert.equal(size, file.size);
  assert.equal(hash.digest('hex'), file.sha256, 'Reassembly must match the original export.');
}
assert.equal(await (await context.fetch('unrelated')).text(), 'passthrough');
corrupt = true;
const before = requests;
await assert.rejects(async () => (await context.fetch('index.pck')).arrayBuffer(), /Incomplete game download/);
assert.equal(requests - before, 3, 'Corrupt files must stop after three attempts.');
const controller = new AbortController();
controller.abort(new Error('cancelled'));
await assert.rejects(context.fetch('index.pck', { signal: controller.signal }), /cancelled/);
const storedWasm = Buffer.concat(files['index.wasm'].parts.map(part => readFileSync(path.join(root, part.file))));
const wasm = files['index.wasm'].encoding === 'gzip' ? gunzipSync(storedWasm) : storedWasm;
assert.ok(WebAssembly.validate(wasm), 'Exported engine must be valid WASM.');
const html = readFileSync(path.join(root, 'index.html'), 'utf8');
assert.ok(html.indexOf('game-loader.js') < html.indexOf('src="index.js"'));
for (const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
console.log('SITES_EXPORT_CHECK_OK: matching game data, valid WASM, retries, cancellation and HTML scripts');
