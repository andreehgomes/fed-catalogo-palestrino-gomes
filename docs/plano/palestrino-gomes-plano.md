# Plano de Desenvolvimento: Palestrino Gomes — Site Completo

**Data:** 26/05/2026
**Projeto:** fed-catalogo-palestrino-gomes
**Análise base:** [docs/analise/proximos-passos.md](../analise/proximos-passos.md)
**Branch alvo:** main

---

## Visão Geral

Portal de conteúdo editorial para o canal Palestrino Gomes (análises de futebol / Palmeiras), com monetização via Google AdSense e links de afiliado do Mercado Livre. O projeto é um **Angular 20 com SSR obrigatório** — sem SSR não há aprovação no AdSense nem indexação correta pelo Google.

A stack de backend é inteiramente Firebase: App Hosting (deploy + CI/CD), Authentication (único admin), Firestore (conteúdo), Storage (imagens) e Cloud Secret Manager (chaves). O fluxo editorial é: admin publica post no painel → Firestore → SSR renderiza HTML completo → Google indexa.

O resultado esperado é um site lançado com 15–20 análises, aprovação no AdSense ativa e rotina de backup do Firestore configurada.

---

## Convenções Obrigatórias

Extraídas do `CLAUDE.md` do projeto — aplicam-se a **todos** os componentes e serviços criados:

- **Standalone components** — nenhum `NgModule`
- **`inject()`** no corpo da classe em vez de parâmetros no construtor
- **`OnPush`** em todo componente apresentacional
- **Signals** — preferir `signal()`, `computed()`, `toSignal()` em vez de `BehaviorSubject` sempre que possível
- **`takeUntilDestroyed()`** para subscrições de Observables
- **`trackBy`** em todo `@for` com lista dinâmica
- **`loading="lazy"`** em toda `<img>` que não seja LCP
- **`loadComponent`** para lazy loading de todas as rotas
- **SCSS** via `inlineStyleLanguage: scss` (sem arquivos `.css` externos nos componentes)
- **Prettier:** aspas simples, 100 colunas, parser Angular para `.html`
- Links de afiliado sempre com `rel="sponsored nofollow"` + disclosure
- Secrets nunca no código — apenas via Cloud Secret Manager / `environment.ts` injetado no build

---

## Pré-condições e Dependências Bloqueantes

> Resolver antes de qualquer código que dependa de Firebase.

| # | Item | Bloqueia |
|---|---|---|
| P1 | Instalar `firebase` + `@angular/fire` | Toda integração Firebase |
| P2 | Criar projeto no Firebase Console | Auth, Firestore, Storage, Hosting |
| P3 | Registrar domínio `palestrinogomes.com.br` | `ads.txt`, domínio canônico, Search Console |
| P4 | Escolher componente WYSIWYG (TipTap ou Quill) | Fase 5 — Editor de posts |

---

## Fases de Implementação

---

### Fase 1 — Fundação: Rotas, Modelos e Firebase

**Objetivo:** Estruturar o projeto (rotas, interfaces TypeScript, environments) e configurar a integração Firebase. Sem essa fase nenhuma outra pode avançar.

---

#### Tarefa 1.1 — Instalar dependências Firebase

**Arquivo(s) a modificar:** `package.json`

**O que fazer:**

```bash
npm install firebase @angular/fire
```

Em seguida adicionar `provideFirebaseApp`, `provideAuth`, `provideFirestore` e `provideStorage` em `src/app/app.config.ts`.

**Critério:** `npm start` compila sem erro e `firebase` aparece em `node_modules`.

---

#### Tarefa 1.2 — Criar `environment.ts` e `environment.prod.ts`

**Arquivo(s) a criar:**
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

**O que fazer:**

```typescript
// environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
};
```

Os valores reais vêm do Firebase Console e são preenchidos localmente. No CI/CD do App Hosting, serão injetados via Cloud Secret Manager.

**Critério:** `app.config.ts` importa `environment` sem erro de TypeScript.

---

#### Tarefa 1.3 — Definir interfaces (modelos de domínio)

**Arquivo(s) a criar:**
- `src/app/core/models/post.model.ts`
- `src/app/core/models/categoria.model.ts`
- `src/app/core/models/tag.model.ts`
- `src/app/core/models/produto-afiliado.model.ts`
- `src/app/core/models/config-site.model.ts`

**O que fazer:**

```typescript
// post.model.ts
export interface Post {
  id: string;
  slug: string;
  titulo: string;
  excerpt: string;
  corpo: string; // HTML rico gerado pelo WYSIWYG
  categoriaId: string;
  tags: string[];
  coverUrl: string;
  youtubeId?: string;
  afiliados: string[]; // IDs de ProdutoAfiliado
  status: 'rascunho' | 'publicado' | 'agendado';
  publicadoEm: Date;
  atualizadoEm: Date;
  tempoDeLeituraMin: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Categoria {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  pilar: 'analises' | 'taticas' | 'opiniao' | 'historia';
}

export interface Tag {
  id: string;
  slug: string;
  nome: string;
}

export interface ProdutoAfiliado {
  id: string;
  titulo: string;
  imagemUrl: string;
  preco: number;
  linkAfiliado: string; // deve ter rel="sponsored nofollow"
  disclosure: string;
}

export interface ConfigSite {
  adsensePublisherId: string;
  textoSobre: string;
  textoContato: string;
}
```

**Critério:** Todos os modelos compilam com `strict: true` sem erros.

---

#### Tarefa 1.4 — Configurar rotas públicas e admin

**Arquivo(s) a modificar:** `src/app/app.routes.ts`

**O que fazer:**

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'busca',
    loadComponent: () => import('./features/busca/busca.component').then(m => m.BuscaComponent),
  },
  {
    path: 'sobre',
    loadComponent: () => import('./features/sobre/sobre.component').then(m => m.SobreComponent),
  },
  {
    path: 'contato',
    loadComponent: () => import('./features/contato/contato.component').then(m => m.ContatoComponent),
  },
  {
    path: 'privacidade',
    loadComponent: () => import('./features/privacidade/privacidade.component').then(m => m.PrivacidadeComponent),
  },
  {
    path: 'aviso-ia',
    loadComponent: () => import('./features/aviso-ia/aviso-ia.component').then(m => m.AvisoIaComponent),
  },
  {
    path: 'admin',
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/admin/login/admin-login.component').then(m => m.AdminLoginComponent),
      },
      {
        path: 'posts',
        loadComponent: () => import('./features/admin/posts/admin-posts.component').then(m => m.AdminPostsComponent),
      },
      {
        path: 'posts/novo',
        loadComponent: () => import('./features/admin/editor/admin-editor.component').then(m => m.AdminEditorComponent),
      },
      {
        path: 'posts/:id/editar',
        loadComponent: () => import('./features/admin/editor/admin-editor.component').then(m => m.AdminEditorComponent),
      },
      {
        path: 'categorias',
        loadComponent: () => import('./features/admin/categorias/admin-categorias.component').then(m => m.AdminCategoriasComponent),
      },
      {
        path: 'tags',
        loadComponent: () => import('./features/admin/tags/admin-tags.component').then(m => m.AdminTagsComponent),
      },
      {
        path: 'afiliados',
        loadComponent: () => import('./features/admin/afiliados/admin-afiliados.component').then(m => m.AdminAfiliadosComponent),
      },
      {
        path: 'configuracoes',
        loadComponent: () => import('./features/admin/configuracoes/admin-configuracoes.component').then(m => m.AdminConfiguracoesComponent),
      },
    ],
  },
  // Rotas de categoria e artigo — devem vir por último (slugs dinâmicos)
  {
    path: ':categoria',
    loadComponent: () => import('./features/categoria/categoria.component').then(m => m.CategoriaComponent),
  },
  {
    path: ':categoria/:slug',
    loadComponent: () => import('./features/artigo/artigo.component').then(m => m.ArtigoComponent),
  },
];
```

**Critério:** `npm start` funciona e rotas resolvem para componentes placeholder sem erro 404.

---

#### Tarefa 1.5 — Configurar `app.routes.server.ts` com SSR/Prerender

**Arquivo(s) a modificar:** `src/app/app.routes.server.ts`

**O que fazer:**

```typescript
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'sobre', renderMode: RenderMode.Prerender },
  { path: 'contato', renderMode: RenderMode.Prerender },
  { path: 'privacidade', renderMode: RenderMode.Prerender },
  { path: 'aviso-ia', renderMode: RenderMode.Prerender },
  { path: 'busca', renderMode: RenderMode.Server }, // query string — não pré-renderizar
  { path: 'admin/**', renderMode: RenderMode.Client }, // painel: SPA puro, sem SSR
  { path: ':categoria', renderMode: RenderMode.Server },
  { path: ':categoria/:slug', renderMode: RenderMode.Server },
];
```

**Critério:** `npm run build` gera HTML estático para `/`, `/sobre`, `/contato`, `/privacidade` e `/aviso-ia`.

---

#### Tarefa 1.6 — Criar serviços core (Firebase)

**Arquivo(s) a criar:**
- `src/app/core/services/post.service.ts`
- `src/app/core/services/categoria.service.ts`
- `src/app/core/services/auth.service.ts`

**O que fazer** (padrão para todos os serviços):

```typescript
// post.service.ts (exemplo de padrão)
import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, where, orderBy, limit } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private firestore = inject(Firestore);

  getPublicados(limitN = 10): Observable<Post[]> {
    const ref = collection(this.firestore, 'posts');
    const q = query(ref, where('status', '==', 'publicado'), orderBy('publicadoEm', 'desc'), limit(limitN));
    return collectionData(q, { idField: 'id' }) as Observable<Post[]>;
  }

  getBySlug(slug: string): Observable<Post | undefined> {
    const ref = collection(this.firestore, 'posts');
    const q = query(ref, where('slug', '==', slug), where('status', '==', 'publicado'), limit(1));
    return (collectionData(q, { idField: 'id' }) as Observable<Post[]>).pipe(map(posts => posts[0]));
  }
}
```

**Critério:** Serviços injetáveis sem erro de TypeScript; métodos cobrem os casos de uso de leitura das Fases 2 e 3.

---

#### Tarefa 1.7 — Criar `authGuard`

**Arquivo(s) a criar:** `src/app/core/guards/auth.guard.ts`

**O que fazer:**

```typescript
import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { map, take } from 'rxjs';

export const authGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return authState(auth).pipe(
    take(1),
    map(user => user ? true : router.createUrlTree(['/admin/login'])),
  );
};
```

**Critério:** Navegar para `/admin/posts` sem login redireciona para `/admin/login`.

---

### Fase 2 — Componentes Compartilhados

**Objetivo:** Construir todos os componentes do design system antes de montar as páginas. Consultar o Stitch (project ID `15267574697450678868`) antes de implementar cada componente.

> **Atenção:** Consultar Stitch antes de cada componente para pixel-perfect com as telas geradas.

---

#### Tarefa 2.1 — `NavbarComponent`

**Arquivo(s) a criar:** `src/app/shared/components/navbar/navbar.component.ts`

**O que fazer:**
- Logo "P" à esquerda (link para `/`)
- Menu de categorias (carregado do `CategoriaService`)
- Ícone de busca (link para `/busca`)
- Standalone, `OnPush`
- Responsivo: menu hamburguer em mobile via signal `menuAberto = signal(false)`

**Critério:** Navbar renderiza com categorias reais do Firestore e link de busca funciona.

---

#### Tarefa 2.2 — `ButtonComponent`

**Arquivo(s) a criar:** `src/app/shared/components/button/button.component.ts`

**O que fazer:**
- Input `variante: 'primary' | 'secondary' | 'ghost' | 'youtube-cta'`
- Input `type: 'button' | 'submit' = 'button'`
- Input `disabled = false`
- Usar `HostBinding` para classes baseadas na variante

**Critério:** Todas as 4 variantes renderizam com estilos corretos do design system.

---

#### Tarefa 2.3 — `CategoryChipComponent`

**Arquivo(s) a criar:** `src/app/shared/components/category-chip/category-chip.component.ts`

**O que fazer:**
- Input `pilar: 'analises' | 'taticas' | 'opiniao' | 'historia'`
- Cor de fundo mapeada ao pilar via `computed()`
- Link opcional (input `href?: string`)

**Critério:** Cada pilar renderiza com cor correta dos tokens.

---

#### Tarefa 2.4 — `ArticleCardComponent`

**Arquivo(s) a criar:** `src/app/shared/components/article-card/article-card.component.ts`

**O que fazer:**
- Input `post: Post`
- Imagem cover 16:9 com `loading="lazy"`
- `CategoryChipComponent` integrado
- Título em Oswald
- Excerpt truncado (CSS `line-clamp: 2`)
- Data formatada + tempo de leitura

**Critério:** Card renderiza com todos os campos e imagem não causa CLS.

---

#### Tarefa 2.5 — `HeroCardComponent`

**Arquivo(s) a criar:** `src/app/shared/components/hero-card/hero-card.component.ts`

**O que fazer:**
- Input `post: Post`
- Full-width com imagem de fundo (sem `loading="lazy"` — é LCP)
- Overlay escuro + título + excerpt + botão "Ler análise"
- Link para `/:categoria/:slug`

**Critério:** Card ocupa largura total com texto legível sobre a imagem.

---

#### Tarefa 2.6 — `CompactCardComponent`

**Arquivo(s) a criar:** `src/app/shared/components/compact-card/compact-card.component.ts`

**O que fazer:**
- Input `post: Post`
- Thumbnail à esquerda (largura fixa, `loading="lazy"`)
- Título + data à direita

**Critério:** Layout horizontal mantido em todos os breakpoints.

---

#### Tarefa 2.7 — `AdSlotComponent`

**Arquivo(s) a criar:** `src/app/shared/components/ad-slot/ad-slot.component.ts`

**O que fazer:**
- Input `slotId: string`
- Input `formato: 'leaderboard' | 'rectangle' | 'mobile-banner'`
- Altura fixa via `@HostBinding('style.minHeight')` (anti-CLS obrigatório)
- Renderizar `<ins class="adsbygoogle">` no browser; no servidor renderizar placeholder com borda tracejada + label "ANÚNCIO"
- Usar `isPlatformBrowser()` para distinguir SSR de browser

**Critério:** No SSR o slot é um placeholder de altura fixa; no browser o script do AdSense é chamado.

---

#### Tarefa 2.8 — `AffiliateCardComponent`

**Arquivo(s) a criar:** `src/app/shared/components/affiliate-card/affiliate-card.component.ts`

**O que fazer:**
- Input `produto: ProdutoAfiliado`
- Imagem, título, preço formatado (BRL), botão "Ver no Mercado Livre"
- Link com `rel="sponsored nofollow"` **obrigatório**
- Texto de disclosure abaixo do botão

**Critério:** Link gerado tem `rel="sponsored nofollow"` verificável no HTML renderizado.

---

#### Tarefa 2.9 — `YouTubeEmbedComponent`

**Arquivo(s) a criar:** `src/app/shared/components/youtube-embed/youtube-embed.component.ts`

**O que fazer:**
- Input `videoId: string`
- No SSR: exibir thumbnail estática (`https://img.youtube.com/vi/{id}/hqdefault.jpg`) com botão play
- No browser: ao clicar, substituir pelo `<iframe>` do YouTube (lazy load real)
- Aspect ratio 16:9 via CSS

**Critério:** No SSR apenas a thumbnail é renderizada (sem iframe); no browser o vídeo carrega ao clicar.

---

#### Tarefa 2.10 — `FooterComponent`

**Arquivo(s) a criar:** `src/app/shared/components/footer/footer.component.ts`

**O que fazer:**
- Logo, links de navegação institucional (`/sobre`, `/contato`, `/privacidade`, `/aviso-ia`)
- Ícones de redes sociais (YouTube, Instagram, X)
- Aviso de uso de IA obrigatório (conforme requisitos)
- Copyright com ano via `computed()`

**Critério:** Footer renderizado via SSR com todos os links corretos.

---

#### Tarefa 2.11 — `BreadcrumbComponent`

**Arquivo(s) a criar:** `src/app/shared/components/breadcrumb/breadcrumb.component.ts`

**O que fazer:**
- Input `itens: { label: string; url?: string }[]`
- Renderizar `<nav aria-label="breadcrumb">` com `<ol>`
- Último item sem link (item ativo)

**Critério:** Breadcrumb renderizado no SSR com marcação semântica correta.

---

#### Tarefa 2.12 — `PaginationComponent`

**Arquivo(s) a criar:** `src/app/shared/components/pagination/pagination.component.ts`

**O que fazer:**
- Inputs: `paginaAtual: number`, `totalPaginas: number`
- Output `paginaMudou: EventEmitter<number>`
- Links com `routerLink` + `queryParams: { p: pagina }` (SEO-friendly, indexável)
- Não usar scroll infinito — paginação por links

**Critério:** Trocar de página muda o `?p=` na URL e o componente pai recarrega os posts.

---

### Fase 3 — Portal Público

**Objetivo:** Implementar as rotas públicas usando os componentes da Fase 2 e os serviços da Fase 1.

---

#### Tarefa 3.1 — Home (`/`)

**Arquivo(s) a criar:** `src/app/features/home/home.component.ts`

**O que fazer:**
- `HeroCardComponent` com post de destaque (primeiro publicado)
- Grid de últimas publicações com `ArticleCardComponent`
- Seções separadas por pilar editorial (`@for` com `trackBy`)
- `AdSlotComponent` entre as seções
- Dados via `PostService.getPublicados()` → `toSignal()`

**Critério:** Página inicial renderiza HTML completo no SSR com dados reais do Firestore.

---

#### Tarefa 3.2 — Listagem por categoria (`/:categoria`)

**Arquivo(s) a criar:** `src/app/features/categoria/categoria.component.ts`

**O que fazer:**
- Header com nome e descrição da categoria
- Lista paginada de `ArticleCardComponent`
- `PaginationComponent` com `queryParams`
- `AdSlotComponent` após o header
- `BreadcrumbComponent`: Home > [Categoria]
- Dados via `CategoriaService` + `PostService`

**Critério:** Acessar `/analises` retorna HTML com posts dessa categoria; paginação troca a URL.

---

#### Tarefa 3.3 — Leitura de artigo (`/:categoria/:slug`)

**Arquivo(s) a criar:** `src/app/features/artigo/artigo.component.ts`

**O que fazer:**
- Header: título, autor, data, tempo de leitura
- `BreadcrumbComponent`: Home > Categoria > Título
- Corpo do post: `[innerHTML]` com `DomSanitizer` (HTML rico do WYSIWYG)
- `YouTubeEmbedComponent` se `post.youtubeId` existe
- `AffiliateCardComponent` para cada `post.afiliados`
- `AdSlotComponent` no meio e no fim
- Botões de compartilhamento: WhatsApp, X, Facebook, copiar link
- Posts relacionados (mesma categoria): 3 `CompactCardComponent`

**Critério:** Artigo renderiza HTML completo via SSR; botões de compartilhamento geram URLs corretas.

---

#### Tarefa 3.4 — Busca (`/busca`)

**Arquivo(s) a criar:** `src/app/features/busca/busca.component.ts`

**O que fazer:**
- Input de texto com `queryParams: { q: termo }`
- Busca via Firestore (campo `titulo` — busca simples por prefixo)
- Lista de resultados com `ArticleCardComponent`
- Estado vazio e estado de loading com signals
- `renderMode: RenderMode.Server` (não pré-renderizar)

**Critério:** Buscar "palmeiras" exibe artigos com "palmeiras" no título.

---

#### Tarefa 3.5 — Páginas institucionais estáticas

**Arquivo(s) a criar:**
- `src/app/features/sobre/sobre.component.ts`
- `src/app/features/contato/contato.component.ts`
- `src/app/features/privacidade/privacidade.component.ts`
- `src/app/features/aviso-ia/aviso-ia.component.ts`

**O que fazer:**
- Conteúdo estático com `RenderMode.Prerender`
- Texto vindo de `ConfigSite` (Firestore) para `/sobre` e `/contato`
- `/privacidade` e `/aviso-ia` com conteúdo fixo em template

**Critério:** Todas as 4 rotas retornam HTML estático no build (`dist/browser/`).

---

#### Tarefa 3.6 — `ads.txt`

**Arquivo(s) a criar:** `public/ads.txt`

**O que fazer:**
- Arquivo texto simples: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
- Publisher ID vem do AdSense após aprovação
- O builder Angular copia arquivos de `public/` para a raiz do `dist/browser/`

**Critério:** `https://palestrinogomes.com.br/ads.txt` retorna o arquivo com status 200.

---

#### Tarefa 3.7 — `sitemap.xml` dinâmico

**Arquivo(s) a criar:** `src/server.ts` (adicionar rota Express)

**O que fazer:**

```typescript
// Em src/server.ts, antes do handler SSR
app.get('/sitemap.xml', async (req, res) => {
  const posts = await getPublicadosForSitemap(); // Firestore Admin SDK
  const urls = posts.map(p =>
    `<url><loc>https://palestrinogomes.com.br/${p.categoriaSlug}/${p.slug}</loc><lastmod>${p.atualizadoEm}</lastmod></url>`
  ).join('');
  res.header('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});
```

**Critério:** `GET /sitemap.xml` retorna XML válido com todas as URLs dos posts publicados.

---

### Fase 4 — SEO & Meta Tags

**Objetivo:** Garantir que cada página tenha meta tags completas, dados estruturados e rastreamento configurado.

---

#### Tarefa 4.1 — Meta tags por rota

**Arquivo(s) a criar:** `src/app/core/services/seo.service.ts`

**O que fazer:**

```typescript
@Injectable({ providedIn: 'root' })
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);

  setArticle(post: Post, categoriaSlug: string): void {
    const url = `https://palestrinogomes.com.br/${categoriaSlug}/${post.slug}`;
    this.title.setTitle(post.metaTitle ?? post.titulo);
    this.meta.updateTag({ name: 'description', content: post.metaDescription ?? post.excerpt });
    this.meta.updateTag({ property: 'og:title', content: post.titulo });
    this.meta.updateTag({ property: 'og:description', content: post.excerpt });
    this.meta.updateTag({ property: 'og:image', content: post.coverUrl });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ rel: 'canonical', href: url });
  }
}
```

Chamar `SeoService` no `ngOnInit` (ou via `effect()`) de cada componente de rota.

**Critério:** `curl https://palestrinogomes.com.br/analises/meu-artigo | grep og:title` retorna o título do post.

---

#### Tarefa 4.2 — JSON-LD por artigo

**Arquivo(s) a modificar:** `src/app/features/artigo/artigo.component.ts`

**O que fazer:**

```typescript
// Injetar DOCUMENT e adicionar script JSON-LD no head
private addJsonLd(post: Post): void {
  const script = this.document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.titulo,
    image: [post.coverUrl],
    datePublished: post.publicadoEm.toISOString(),
    dateModified: post.atualizadoEm.toISOString(),
    author: { '@type': 'Person', name: 'Palestrino Gomes' },
  });
  this.document.head.appendChild(script);
}
```

Adicionar `BreadcrumbList` JSON-LD junto.

**Critério:** Rich Results Test do Google encontra `NewsArticle` e `BreadcrumbList` válidos.

---

#### Tarefa 4.3 — Google Analytics 4

**Arquivo(s) a modificar:** `src/index.html` (script gtag condicional) e `src/app/core/services/analytics.service.ts`

**O que fazer:**
- Script do GA4 só carrega após consentimento do usuário (LGPD)
- `AnalyticsService` expõe `trackPageView()` e `trackEvent()`
- Chamado no `Router.events` (filtrar `NavigationEnd`)

**Critério:** Eventos de pageview aparecem no painel do GA4 em tempo real.

---

#### Tarefa 4.4 — Banner de consentimento de cookies

**Arquivo(s) a criar:** `src/app/shared/components/cookie-banner/cookie-banner.component.ts`

**O que fazer:**
- Exibido na primeira visita (sem cookie de consentimento)
- Botões: "Aceitar todos" / "Recusar opcionais"
- Aceitar dispara GA4 e AdSense; recusar bloqueia ambos
- Estado persistido em `localStorage`

**Critério:** Recusar cookies impede a chamada de `gtag()` e `adsbygoogle.push()`.

---

### Fase 5 — Painel Administrativo

**Objetivo:** Interface para o único admin (André) criar e publicar posts.

---

#### Tarefa 5.1 — Login (`/admin/login`)

**Arquivo(s) a criar:** `src/app/features/admin/login/admin-login.component.ts`

**O que fazer:**
- Formulário: e-mail + senha (Firebase Auth `signInWithEmailAndPassword`)
- Após login redirecionar para `/admin/posts`
- `renderMode: RenderMode.Client` (sem SSR)

**Critério:** Login com credenciais válidas redireciona para `/admin/posts`.

---

#### Tarefa 5.2 — Listagem de posts (`/admin/posts`)

**Arquivo(s) a criar:** `src/app/features/admin/posts/admin-posts.component.ts`

**O que fazer:**
- Tabela com: título, categoria, status, data, ações (editar, excluir)
- Filtro por status (rascunho / publicado / agendado)
- Botão "Novo post" → `/admin/posts/novo`
- Dados via `PostService` (sem filtro de status)

**Critério:** Lista exibe todos os posts (independente de status) com ações funcionais.

---

#### Tarefa 5.3 — Editor de post (`/admin/posts/novo` e `/admin/posts/:id/editar`)

**Arquivo(s) a criar:** `src/app/features/admin/editor/admin-editor.component.ts`

**O que fazer:**
- **Decisão técnica:** Integrar **TipTap** (recomendado — melhor suporte a extensões customizadas para YouTube e afiliados)
  ```bash
  npm install @tiptap/core @tiptap/starter-kit @tiptap/extension-image
  ```
- Botões dedicados na toolbar: "Inserir vídeo YouTube" (abre modal com input de URL), "Inserir card de afiliado" (abre modal de seleção de produto)
- Painel lateral (signals):
  - Status (`signal<'rascunho' | 'publicado' | 'agendado'>`)
  - Categoria (select)
  - Tags (multi-select)
  - Capa (upload para Firebase Storage)
  - SEO (metaTitle, metaDescription)
- Salvar via `PostService.salvar(post)` (Firestore `setDoc` com merge)

**Critério:** Post criado aparece na listagem com status correto; post publicado aparece no portal público.

---

#### Tarefa 5.4 — CRUD de categorias (`/admin/categorias`)

**Arquivo(s) a criar:** `src/app/features/admin/categorias/admin-categorias.component.ts`

**O que fazer:**
- Lista de categorias com botões editar/excluir
- Formulário inline de criação/edição
- `CategoriaService` com métodos `salvar()` e `excluir()`

**Critério:** Criar uma categoria a torna disponível no seletor do editor de posts.

---

#### Tarefa 5.5 — CRUD de tags (`/admin/tags`)

**Arquivo(s) a criar:** `src/app/features/admin/tags/admin-tags.component.ts`

**O que fazer:** Mesmo padrão de 5.4, mais simples (só `nome` e `slug`).

**Critério:** Tag criada aparece no multi-select do editor.

---

#### Tarefa 5.6 — Vitrine de afiliados (`/admin/afiliados`)

**Arquivo(s) a criar:** `src/app/features/admin/afiliados/admin-afiliados.component.ts`

**O que fazer:**
- Lista de produtos reutilizáveis com `AffiliateCardComponent` (preview)
- Formulário: título, URL da imagem, preço, link de afiliado, disclosure
- Link salvo com `rel="sponsored nofollow"` garantido pelo serviço

**Critério:** Produto criado pode ser inserido em qualquer post via editor.

---

#### Tarefa 5.7 — Configurações (`/admin/configuracoes`)

**Arquivo(s) a criar:** `src/app/features/admin/configuracoes/admin-configuracoes.component.ts`

**O que fazer:**
- Campos: publisher ID do AdSense, texto da página "Sobre", texto de "Contato"
- Salvar em Firestore coleção `config` (documento único `site`)

**Critério:** Alterar o publisher ID reflete em `ads.txt` e nos slots de anúncio.

---

### Fase 6 — Monetização

**Objetivo:** Integrar AdSense e verificar que tudo está em ordem para aprovação.

---

#### Tarefa 6.1 — Integrar AdSense nos slots

**Arquivo(s) a modificar:** `src/app/shared/components/ad-slot/ad-slot.component.ts`

**O que fazer:**
- Adicionar script global do AdSense em `src/index.html` (somente após consentimento)
- `AdSlotComponent` chama `adsbygoogle.push({})` no browser via `isPlatformBrowser()`
- Slot ID configurável via input

**Critério:** Slots exibem anúncios reais após aprovação no AdSense.

---

#### Tarefa 6.2 — Verificar `ads.txt`

**O que fazer:** Confirmar que `https://palestrinogomes.com.br/ads.txt` está acessível com status 200 e contém o publisher ID correto.

**Critério:** Ferramenta de verificação do AdSense não reporta erro de `ads.txt`.

---

#### Tarefa 6.3 — Testar Core Web Vitals

**O que fazer:**
- Executar Lighthouse no artigo mais longo
- Garantir que `AdSlotComponent` tem altura mínima fixa (CLS = 0)
- Garantir que `YouTubeEmbedComponent` usa thumbnail estática (sem iframe no SSR)

**Critério:** Lighthouse CLS < 0.1; LCP < 2.5s; FID < 100ms.

---

### Fase 7 — Conteúdo e Lançamento

**Objetivo:** Etapas finais antes de abrir ao público e solicitar aprovação no AdSense.

---

#### Tarefa 7.1 — Configurar regras de segurança do Firestore e Storage

**O que fazer:**

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{id} {
      allow read: if resource.data.status == 'publicado';
      allow write: if request.auth != null && request.auth.token.email == 'andrefelipefeliciogomes@gmail.com';
    }
    match /{collection}/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Critério:** Usuário não autenticado não consegue criar/editar posts; posts rascunho não são retornados.

---

#### Tarefa 7.2 — Configurar backup do Firestore

**O que fazer:**
- Habilitar exportação periódica via `gcloud firestore export` agendado no Cloud Scheduler
- Destino: bucket no Cloud Storage

**Critério:** Exportação automática ocorre diariamente; arquivo aparece no bucket.

---

#### Tarefa 7.3 — Registrar no Google Search Console

**O que fazer:**
- Adicionar propriedade `palestrinogomes.com.br`
- Submeter `sitemap.xml`

**Critério:** Search Console confirma sitemap processado sem erros.

---

## Estrutura Final de Arquivos

```
src/
├── environments/
│   ├── environment.ts                          [F1.2]
│   └── environment.prod.ts                     [F1.2]
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   ├── post.model.ts                   [F1.3]
│   │   │   ├── categoria.model.ts              [F1.3]
│   │   │   ├── tag.model.ts                    [F1.3]
│   │   │   ├── produto-afiliado.model.ts       [F1.3]
│   │   │   └── config-site.model.ts            [F1.3]
│   │   ├── services/
│   │   │   ├── post.service.ts                 [F1.6]
│   │   │   ├── categoria.service.ts            [F1.6]
│   │   │   ├── auth.service.ts                 [F1.6]
│   │   │   ├── seo.service.ts                  [F4.1]
│   │   │   └── analytics.service.ts            [F4.3]
│   │   └── guards/
│   │       └── auth.guard.ts                   [F1.7]
│   ├── shared/
│   │   └── components/
│   │       ├── navbar/                         [F2.1]
│   │       ├── button/                         [F2.2]
│   │       ├── category-chip/                  [F2.3]
│   │       ├── article-card/                   [F2.4]
│   │       ├── hero-card/                      [F2.5]
│   │       ├── compact-card/                   [F2.6]
│   │       ├── ad-slot/                        [F2.7]
│   │       ├── affiliate-card/                 [F2.8]
│   │       ├── youtube-embed/                  [F2.9]
│   │       ├── footer/                         [F2.10]
│   │       ├── breadcrumb/                     [F2.11]
│   │       ├── pagination/                     [F2.12]
│   │       └── cookie-banner/                  [F4.4]
│   ├── features/
│   │   ├── home/                               [F3.1]
│   │   ├── categoria/                          [F3.2]
│   │   ├── artigo/                             [F3.3]
│   │   ├── busca/                              [F3.4]
│   │   ├── sobre/                              [F3.5]
│   │   ├── contato/                            [F3.5]
│   │   ├── privacidade/                        [F3.5]
│   │   ├── aviso-ia/                           [F3.5]
│   │   └── admin/
│   │       ├── login/                          [F5.1]
│   │       ├── posts/                          [F5.2]
│   │       ├── editor/                         [F5.3]
│   │       ├── categorias/                     [F5.4]
│   │       ├── tags/                           [F5.5]
│   │       ├── afiliados/                      [F5.6]
│   │       └── configuracoes/                  [F5.7]
│   ├── app.routes.ts                           [F1.4]
│   ├── app.routes.server.ts                    [F1.5]
│   └── app.config.ts                           [F1.1]
├── styles/
│   └── _tokens.scss                            [existente]
└── server.ts                                   [F3.7]

public/
└── ads.txt                                     [F3.6]
```

---

## Ordem de Execução Recomendada

```
P1: Instalar firebase + @angular/fire
        |
        v
F1.1 → F1.2 → F1.3 → F1.4 → F1.5 → F1.6 → F1.7
                                                |
                    +-----------+-----------+---+
                    |           |           |
                    v           v           v
              F2.1–F2.12   (paralelo)   F4.1–F4.4
                    |
                    v
              F3.1 → F3.2 → F3.3 → F3.4 → F3.5 → F3.6 → F3.7
                    |
                    v
              F5.1 → F5.2 → F5.3 → F5.4 → F5.5 → F5.6 → F5.7
                    |
                    v
              F6.1 → F6.2 → F6.3
                    |
                    v
              F7.1 → F7.2 → F7.3
```

---

## Critérios de Aceitação Globais

- [ ] `npm run build` conclui sem erros ou warnings de TypeScript
- [ ] HTML das rotas `/`, `/:categoria`, `/:categoria/:slug` é renderizado pelo servidor (sem dependência de JS para exibir conteúdo)
- [ ] Google Rich Results Test valida `NewsArticle` e `BreadcrumbList` em qualquer artigo
- [ ] `https://palestrinogomes.com.br/ads.txt` retorna o publisher ID correto com status 200
- [ ] `https://palestrinogomes.com.br/sitemap.xml` lista todos os posts publicados
- [ ] Lighthouse (mobile): Performance ≥ 90, CLS < 0.1, LCP < 2.5s
- [ ] Todo link de afiliado tem `rel="sponsored nofollow"` verificável no HTML
- [ ] Usuário não autenticado não consegue escrever no Firestore (regras de segurança ativas)
- [ ] Admin consegue criar, editar e publicar um post completo (texto + imagem + YouTube + afiliado) sem tocar no código
- [ ] Banner de consentimento bloqueia GA4 e AdSense quando o usuário recusa cookies
- [ ] Backup automático do Firestore configurado e verificado no Cloud Storage
