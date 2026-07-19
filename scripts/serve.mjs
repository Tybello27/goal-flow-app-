#!/usr/bin/env node
/**
 * Minimal static server for the built GoalFlow PWA (`npm start`).
 * Serves dist/ with SPA fallback plus a real /api/health JSON endpoint.
 * Zero dependencies — used by the preview runtime; production deploys
 * (e.g. Vercel) serve dist/ directly instead.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

async function tryFile(pathname) {
  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  let file = join(ROOT, safe);
  if (!file.startsWith(ROOT)) return null;
  try {
    const s = await stat(file);
    if (s.isDirectory()) file = join(file, 'index.html');
    const data = await readFile(file);
    return { data, type: MIME[extname(file).toLowerCase()] ?? 'application/octet-stream' };
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const pathname = url.pathname;

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'content-type': 'application/json' });
      res.end('{"error":"method_not_allowed"}');
      return;
    }

    if (pathname === '/api/health' || pathname === '/api/health/') {
      res.writeHead(200, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      });
      res.end(JSON.stringify({ status: 'ok', app: 'goalflow', version: '1.0.0', uptime: Math.round(process.uptime()) }));
      return;
    }

    let found = await tryFile(pathname);
    if (!found) {
      // SPA fallback
      found = await tryFile('/index.html');
    }

    if (!found) {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end('{"error":"not_found"}');
      return;
    }

    const headers = {
      'content-type': found.type,
      'cache-control':
        pathname === '/' || pathname.endsWith('.html')
          ? 'no-cache'
          : 'public, max-age=31536000, immutable',
    };
    if (pathname === '/sw.js') headers['cache-control'] = 'no-cache';
    res.writeHead(200, headers);
    if (req.method === 'HEAD') res.end();
    else res.end(found.data);
  } catch (err) {
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'server_error' }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`GoalFlow serving dist/ at http://${HOST}:${PORT}`);
});
