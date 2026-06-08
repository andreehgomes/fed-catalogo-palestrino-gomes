import 'dotenv/config';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { readClassificacaoCache, saveClassificacaoCache } from './firebase-cache.server';
import { getSitemapXml } from './sitemap.server';
import { montarCopaPayload, type CopaPayload } from './copa.server';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

// trustProxyHeaders: atrás do Cloud Run / Firebase App Hosting as requisições chegam
// com headers X-Forwarded-* setados pelo load balancer do Google. Sem confiar neles,
// o Angular deopta TODAS as rotas para CSR (página vazia) — o que quebra SEO e AdSense.
// A validação de host continua ativa via NG_ALLOWED_HOSTS / security.allowedHosts.
const angularApp = new AngularNodeAppEngine({ trustProxyHeaders: true });

app.get('/sitemap.xml', async (_req, res) => {
  const xml = await getSitemapXml();
  res.header('Content-Type', 'text/xml; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

const CLASSIFICACAO_CACHE_TTL_MS = 60_000;

app.get('/api/classificacao', async (_req, res) => {
  const cache = await readClassificacaoCache();
  const cacheAge = cache ? Date.now() - cache.savedAt : Infinity;

  if (cache && cacheAge < CLASSIFICACAO_CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json(cache.payload);
    return;
  }

  try {
    const apiKey = process.env['FOOTBALL_DATA_API_KEY'] ?? '';
    const upstream = await fetch(
      'https://api.football-data.org/v4/competitions/BSA/standings',
      { headers: { 'X-Auth-Token': apiKey } },
    );

    if (!upstream.ok) {
      if (cache) {
        res.setHeader('Cache-Control', 'no-cache');
        res.json(cache.payload);
        return;
      }
      res.status(upstream.status).json({ error: 'API error' });
      return;
    }

    const data = await upstream.json();
    saveClassificacaoCache(data);
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json(data);
  } catch {
    if (cache) {
      res.setHeader('Cache-Control', 'no-cache');
      res.json(cache.payload);
      return;
    }
    res.status(503).json({ error: 'Serviço indisponível' });
  }
});

// Cache em memória da Copa 2026. Sem placar ao vivo na chave gratuita, um TTL
// curto é suficiente; durante os jogos o TheSportsDB atualiza com algum atraso.
const COPA_CACHE_TTL_MS = 120_000;
let copaCache: { payload: CopaPayload; savedAt: number } | null = null;

app.get('/api/copa', async (_req, res) => {
  const idade = copaCache ? Date.now() - copaCache.savedAt : Infinity;
  if (copaCache && idade < COPA_CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 'public, max-age=120');
    res.json(copaCache.payload);
    return;
  }

  try {
    const payload = await montarCopaPayload();
    copaCache = { payload, savedAt: Date.now() };
    res.setHeader('Cache-Control', 'public, max-age=120');
    res.json(payload);
  } catch {
    if (copaCache) {
      res.setHeader('Cache-Control', 'no-cache');
      res.json(copaCache.payload);
      return;
    }
    res.status(503).json({ error: 'Serviço indisponível' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
