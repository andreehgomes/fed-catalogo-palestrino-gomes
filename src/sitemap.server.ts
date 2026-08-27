import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const BASE_URL = 'https://palestrinogomes.com.br';

/** Páginas estáticas do site (sem lastmod). */
const STATIC_PATHS = [
  '',
  '/sobre',
  '/contato',
  '/privacidade',
  '/aviso-ia',
  '/classificacao',
];

/** TTL do cache em memória do sitemap (1 hora). */
const SITEMAP_CACHE_TTL_MS = 60 * 60 * 1000;

interface SitemapUrl {
  loc: string;
  lastmod?: string;
}

let cachedSitemap: { xml: string; savedAt: number } | null = null;

function ensureAdminApp(): void {
  if (!getApps().length) {
    initializeApp();
  }
}

function toIsoDate(value: unknown): string | undefined {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString().slice(0, 10);
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return undefined;
}

function buildXml(urls: SitemapUrl[]): string {
  const entries = urls
    .map(({ loc, lastmod }) => {
      const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
      return `  <url><loc>${loc}</loc>${lastmodTag}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

async function fetchDynamicUrls(): Promise<SitemapUrl[]> {
  ensureAdminApp();
  const db = getFirestore();

  const [categoriasSnap, postsSnap] = await Promise.all([
    db.collection('categorias').get(),
    db.collection('posts').where('status', '==', 'publicado').get(),
  ]);

  const categorias: SitemapUrl[] = categoriasSnap.docs
    .map(doc => doc.data()['slug'] as string | undefined)
    .filter((slug): slug is string => !!slug)
    .map(slug => ({ loc: `${BASE_URL}/${slug}` }));

  const posts: SitemapUrl[] = postsSnap.docs
    .map((doc): SitemapUrl | null => {
      const data = doc.data();
      const categoriaSlug = data['categoriaSlug'] as string | undefined;
      const slug = data['slug'] as string | undefined;
      if (!categoriaSlug || !slug) return null;
      return {
        loc: `${BASE_URL}/${categoriaSlug}/${slug}`,
        lastmod: toIsoDate(data['atualizadoEm']) ?? toIsoDate(data['publicadoEm']),
      };
    })
    .filter((url): url is SitemapUrl => url !== null);

  return [...categorias, ...posts];
}

/**
 * Gera o sitemap.xml com páginas estáticas + categorias + posts publicados (Firestore).
 * Resultado é cacheado em memória por 1 hora. Em caso de falha no Firestore,
 * devolve ao menos as páginas estáticas (sem cachear, para tentar de novo depois).
 */
export async function getSitemapXml(): Promise<string> {
  if (cachedSitemap && Date.now() - cachedSitemap.savedAt < SITEMAP_CACHE_TTL_MS) {
    return cachedSitemap.xml;
  }

  const staticUrls: SitemapUrl[] = STATIC_PATHS.map(path => ({ loc: `${BASE_URL}${path}` }));

  try {
    const dynamicUrls = await fetchDynamicUrls();
    const xml = buildXml([...staticUrls, ...dynamicUrls]);
    cachedSitemap = { xml, savedAt: Date.now() };
    return xml;
  } catch (error) {
    console.error('[sitemap] Falha ao buscar URLs dinâmicas no Firestore:', error);
    return buildXml(staticUrls);
  }
}
