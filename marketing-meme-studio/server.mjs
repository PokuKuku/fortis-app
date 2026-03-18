import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBodyAssets, loadBrandAssets, MUSCLE_KEYS, MUSCLE_TO_HEATMAP_REGIONS, TIER_COLORS, TIER_LABELS } from './lib/heatmap-data.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const port = Number.parseInt(process.env.PORT || '4311', 10);
const host = process.env.HOST || '127.0.0.1';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function send(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, headers);
  response.end(body);
}

async function buildBootstrapPayload() {
  const [bodyAssets, brandAssets] = await Promise.all([loadBodyAssets(), loadBrandAssets()]);

  return JSON.stringify({
    bodyAssets,
    brandAssets,
    muscleKeys: MUSCLE_KEYS,
    heatmapRegions: MUSCLE_TO_HEATMAP_REGIONS,
    tierColors: TIER_COLORS,
    tierLabels: TIER_LABELS,
  });
}

async function serveStatic(requestPath, response) {
  const sanitized = requestPath === '/' ? '/index.html' : requestPath;
  const filePath = path.normalize(path.join(publicDir, sanitized));

  if (!filePath.startsWith(publicDir)) {
    send(response, 403, 'Forbidden');
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    send(response, 200, file, {
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
    });
  } catch {
    send(response, 404, 'Not found');
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);

  if (request.method === 'GET' && url.pathname === '/api/bootstrap') {
    const bootstrapPayload = await buildBootstrapPayload();
    send(response, 200, bootstrapPayload, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/health') {
    send(response, 200, JSON.stringify({ ok: true }), {
      'Content-Type': 'application/json; charset=utf-8',
    });
    return;
  }

  await serveStatic(url.pathname, response);
});

server.listen(port, host, () => {
  console.log(`Fortify Meme Studio running at http://${host}:${port}`);
});
