import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    port: { type: 'string', default: '4173' },
    'base-path': { type: 'string', default: '/' },
  },
});
const port = Number(values.port);
const basePath = values['base-path'];
if (!Number.isInteger(port) || port < 1 || port > 65535 || !/^\/(?:[\w-]+\/)*$/.test(basePath)) {
  throw new Error('Use --port 4173 --base-path /optional-subdirectory/');
}
const root = resolve('dist/lsr-store/browser');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    if (!path.startsWith(basePath)) {
      response.writeHead(404).end('Not found');
      return;
    }
    const relative = path.slice(basePath.length);
    const file = resolve(root, relative || 'index.html');
    if (!file.startsWith(root + sep)) {
      response.writeHead(404).end('Not found');
      return;
    }
    let data;
    let extension = extname(file);
    try {
      data = await readFile(file);
    } catch {
      if (extension) {
        response.writeHead(404).end('Not found');
        return;
      }
      data = await readFile(resolve(root, 'index.html'));
      extension = '.html';
    }
    response.writeHead(200, {
      'Content-Type': types[extension] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(data);
  } catch {
    response.writeHead(500).end('Build the app with pnpm build before starting the preview.');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Production preview: http://127.0.0.1:${port}${basePath}`);
});
