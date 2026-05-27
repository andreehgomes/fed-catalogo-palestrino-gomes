# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200 (ng serve)
npm run build      # Production build (outputs to dist/)
npm test           # Unit tests via Karma/Jasmine
npm run watch      # Dev build with watch mode
```

Run the SSR server after building:
```bash
node dist/fed-catalogo-palestrino-gomes/server/server.mjs
# or: npm run serve:ssr:fed-catalogo-palestrino-gomes
```

Run a single test file:
```bash
ng test --include="**/component-name.spec.ts"
```

## Project context

Content portal / blog for the **Palestrino Gomes** YouTube channel (Palmeiras football). Revenue comes from Google AdSense and Mercado Livre affiliate links. SSR is a hard requirement — without it, AdSense approval fails and Google indexing is broken.

Production domain: **palestrinogomes.com.br**

Full requirements are documented in `docs/Analise_Requisitos_Site_Palestrino_Gomes.md`. Design system prompts are in `docs/Prompts_Stitch_Design_System_Palestrino_Gomes.md`.

## Planned stack (not yet wired in)

| Layer | Technology |
|---|---|
| Hosting / SSR runtime | Firebase App Hosting (Cloud Run + Cloud CDN + Cloud Build) |
| Auth | Firebase Authentication — single admin user (André) |
| Database | Cloud Firestore |
| File storage | Firebase Storage |
| Secrets | Cloud Secret Manager |
| Analytics | Google Analytics 4 |

**Firestore collections:** `posts`, `categorias`, `tags`, `produtos_afiliado`, `config`.

## Architecture

**Angular 20 SSR app** using the `@angular/build:application` builder with `@angular/ssr`.

**Rendering pipeline:**
- `src/main.ts` — browser bootstrap
- `src/main.server.ts` — server bootstrap
- `src/server.ts` — Express server using `AngularNodeAppEngine`; serves static files from `dist/browser/`, all other routes via SSR
- `src/app/app.config.ts` — browser `ApplicationConfig` (router, hydration with event replay)
- `src/app/app.config.server.ts` — server config merged with browser config, adds `provideServerRendering`
- `src/app/app.routes.server.ts` — server routes; `RenderMode.Prerender` for all paths

**Key settings:**
- TypeScript strict mode fully enabled, including `strictTemplates` and `strictInjectionParameters`
- Components use SCSS (`inlineStyleLanguage: scss`)
- Prettier: single quotes, 100-char print width, Angular HTML parser for `.html` files

## Key architectural decisions

- **No comments section** — out of scope by client decision; do not add.
- **No newsletter / email capture** — out of scope by client decision.
- **Affiliate links** are inserted manually (no Mercado Livre API integration yet); every affiliate link must carry `rel="sponsored nofollow"` and an affiliate disclosure notice.
- **Admin panel** targets a single user; no multi-role access needed.
- **WYSIWYG editor** (component TBD at implementation time) — no raw HTML or Markdown editing in the admin.
- **`ads.txt`** must be served at the domain root for AdSense publisher verification.
- Secrets (API keys, Firebase config) go in Cloud Secret Manager, never committed to source.
- Components should be standalone with lazy loading per route to keep the bundle small and support future API integrations without rewrites.
