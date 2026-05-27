# Execução: Palestrino Gomes — Site Completo (parcial)

**Data:** 2026-05-26
**Plano:** [docs/plano/palestrino-gomes-plano.md](../plano/palestrino-gomes-plano.md)
**Branch:** main
**Executor:** Claude Code
**Status:** Interrompido — continuar na próxima sessão

---

## Resumo

Foram implementadas a Fase 1 completa (fundação: Firebase, environments, modelos, rotas, serviços e guard), a Fase 2 completa (12 componentes compartilhados do design system) e parte da Fase 4 (SeoService, AnalyticsService e CookieBannerComponent). O `app.ts` e `app.html` foram substituídos pela estrutura de layout real do site (Navbar + RouterOutlet + Footer + CookieBanner).

---

## Tarefas Executadas

| Fase | Tarefa | Status | Observações |
|------|--------|--------|-------------|
| 1.1 | Configurar Firebase no `app.config.ts` | ✅ | `firebase@11.10.0` + `@angular/fire@20.0.1` já instalados |
| 1.2 | Criar `environment.ts` e `environment.prod.ts` | ✅ | `fileReplacements` adicionado ao `angular.json` |
| 1.3 | Criar 5 modelos de domínio | ✅ | `post`, `categoria`, `tag`, `produto-afiliado`, `config-site` |
| 1.4 | Configurar `app.routes.ts` | ✅ | Todas as rotas lazy com `loadComponent` |
| 1.5 | Configurar `app.routes.server.ts` | ✅ | Prerender / SSR / Client por rota |
| 1.6 | Criar serviços core | ✅ | 6 serviços: Post, Categoria, Tag, ProdutoAfiliado, Auth, ConfigSite |
| 1.7 | Criar `authGuard` | ✅ | Redireciona `/admin/*` → `/admin/login` se não autenticado |
| 2.1 | `NavbarComponent` | ✅ | Logo, menu de categorias (Firestore), busca, hamburguer mobile |
| 2.2 | `ButtonComponent` | ✅ | 4 variantes: primary, secondary, ghost, youtube-cta |
| 2.3 | `CategoryChipComponent` | ✅ | Cor por pilar via `computed()` |
| 2.4 | `ArticleCardComponent` | ✅ | Cover 16:9, chip, título Oswald, excerpt truncado |
| 2.5 | `HeroCardComponent` | ✅ | Full-width, overlay, CTA |
| 2.6 | `CompactCardComponent` | ✅ | Thumbnail à esquerda, título + data |
| 2.7 | `AdSlotComponent` | ✅ | Placeholder SSR / `adsbygoogle.push` no browser, altura fixa anti-CLS |
| 2.8 | `AffiliateCardComponent` | ✅ | `rel="sponsored nofollow"` obrigatório, disclosure |
| 2.9 | `YouTubeEmbedComponent` | ✅ | Thumbnail SSR → iframe ao clicar; `SafeResourceUrl` |
| 2.10 | `FooterComponent` | ✅ | Logo, links institucionais, aviso de IA, copyright com `computed()` |
| 2.11 | `BreadcrumbComponent` | ✅ | `<nav>/<ol>` semântico, último item sem link |
| 2.12 | `PaginationComponent` | ✅ | Links SEO com `routerLink + queryParams` |
| 4.1 | `SeoService` | ✅ | `setHome`, `setCategoria`, `setArtigo`, `addArtigoJsonLd` + canonical |
| 4.3 | `AnalyticsService` | ✅ | Carrega GA4 apenas após consentimento, `trackPageView` por `NavigationEnd` |
| 4.4 | `CookieBannerComponent` | ✅ | Aceitar/recusar; estado em `localStorage`; emite `consentimentoEmitido` |
| —   | `app.ts` e `app.html` | ✅ | Layout: Navbar + RouterOutlet + Footer + CookieBanner substituem o placeholder Angular |

---

## Pendente (próxima sessão)

| Fase | Tarefa | Prioridade |
|------|--------|-----------|
| — | Preencher `src/app/app.scss` (arquivo em branco, 1 linha) | Alta |
| — | Verificar / completar `src/styles/_tokens.scss` (tokens de cores, tipografia, espaçamento) | Alta |
| 3.1 | `HomeComponent` (`/`) — hero + grid + seções por pilar + AdSlot | Alta |
| 3.2 | `CategoriaComponent` (`/:categoria`) — header + lista paginada | Alta |
| 3.3 | `ArtigoComponent` (`/:categoria/:slug`) — corpo + JSON-LD + compartilhamento + relacionados | Alta |
| 3.4 | `BuscaComponent` (`/busca`) | Média |
| 3.5 | Páginas estáticas: `Sobre`, `Contato`, `Privacidade`, `AvisoIa` | Média |
| 3.6 | `public/ads.txt` (placeholder com publisher ID) | Alta |
| 3.7 | Rota `/sitemap.xml` no `server.ts` | Média |
| 5.1 | `AdminLoginComponent` | Alta |
| 5.2 | `AdminPostsComponent` — listagem com filtro de status | Alta |
| 5.3 | `AdminEditorComponent` — TipTap + painel lateral de metadados | Alta |
| 5.4 | `AdminCategoriasComponent` | Média |
| 5.5 | `AdminTagsComponent` | Média |
| 5.6 | `AdminAfiliadosComponent` | Média |
| 5.7 | `AdminConfiguracoesComponent` | Média |
| 7.1 | `firestore.rules` com regras de segurança | Alta |
| — | `npm run build` — verificar zero erros TypeScript | Alta |

---

## Configuração pendente (não-código)

### Cloud Secret Manager (não sabe como fazer)
Passos para configurar:

1. No [Google Cloud Console](https://console.cloud.google.com), acesse **APIs & Services → Enable APIs** e habilite **Secret Manager API**.
2. Acesse **Security → Secret Manager** e crie os secrets (um por chave do Firebase config):
   - `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, etc.
3. No Firebase App Hosting, vá em **Settings → Environment variables** e mapeie cada secret.
4. Referencie no `environment.prod.ts` os valores como `process.env['FIREBASE_API_KEY']` — o App Hosting injeta automaticamente em build time via Cloud Build.

### Preencher credentials do Firebase
Os dois arquivos de environment têm as strings em branco. Preenchê-las com os valores do Firebase Console antes de qualquer deploy:

```
src/environments/environment.ts      ← valores do projeto de dev/local
src/environments/environment.prod.ts ← valores do projeto de produção
```

### Domínio `palestrinogomes.com.br`
- Configurar DNS para apontar para o Firebase App Hosting (A + AAAA records fornecidos pelo console).
- Após conectar, habilitar HTTPS automático.

---

## Discrepâncias do Plano

| Item | Plano previa | O que foi feito | Motivo |
|------|--------------|-----------------|--------|
| `authGuard` | `export const authGuard = () => {...}` (arrow) | `export function authGuard()` (function declaration) | Compatibilidade mais clara com a assinatura de `canActivate` |
| Fase 3 antes de Fase 4 | SEO depois do portal | SEO implementado antes (SeoService, Analytics, CookieBanner) | Serviços de SEO são dependências do `ArtigoComponent` — melhor ter prontos |
| `app.scss` | Não mencionado | Arquivo existia com 1 linha vazia; ficou pendente de conteúdo | Interrompido pelo usuário |

---

## Arquivos Criados/Modificados

```
src/
├── environments/
│   ├── environment.ts                              [criado]
│   └── environment.prod.ts                         [criado]
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   ├── post.model.ts                       [criado]
│   │   │   ├── categoria.model.ts                  [criado]
│   │   │   ├── tag.model.ts                        [criado]
│   │   │   ├── produto-afiliado.model.ts           [criado]
│   │   │   └── config-site.model.ts                [criado]
│   │   ├── services/
│   │   │   ├── post.service.ts                     [criado]
│   │   │   ├── categoria.service.ts                [criado]
│   │   │   ├── tag.service.ts                      [criado]
│   │   │   ├── produto-afiliado.service.ts         [criado]
│   │   │   ├── auth.service.ts                     [criado]
│   │   │   ├── config-site.service.ts              [criado]
│   │   │   ├── seo.service.ts                      [criado]
│   │   │   └── analytics.service.ts                [criado]
│   │   └── guards/
│   │       └── auth.guard.ts                       [criado]
│   ├── shared/
│   │   └── components/
│   │       ├── button/button.component.ts          [criado]
│   │       ├── category-chip/...component.ts       [criado]
│   │       ├── article-card/...component.ts        [criado]
│   │       ├── hero-card/...component.ts           [criado]
│   │       ├── compact-card/...component.ts        [criado]
│   │       ├── ad-slot/...component.ts             [criado]
│   │       ├── affiliate-card/...component.ts      [criado]
│   │       ├── youtube-embed/...component.ts       [criado]
│   │       ├── navbar/...component.ts              [criado]
│   │       ├── footer/...component.ts              [criado]
│   │       ├── breadcrumb/...component.ts          [criado]
│   │       ├── pagination/...component.ts          [criado]
│   │       └── cookie-banner/...component.ts       [criado]
│   ├── app.ts                                      [modificado — layout real]
│   ├── app.html                                    [modificado — layout real]
│   ├── app.config.ts                               [modificado — Firebase providers]
│   ├── app.routes.ts                               [modificado — todas as rotas]
│   └── app.routes.server.ts                        [modificado — SSR/Prerender/Client]
└── angular.json                                    [modificado — fileReplacements]
```

---

## Como retomar

Na próxima sessão, ler este arquivo e o plano original em `docs/plano/palestrino-gomes-plano.md`.

**Primeira tarefa ao retomar:**
1. Preencher `src/app/app.scss` com o CSS de layout global (`.main-content` container).
2. Verificar `src/styles/_tokens.scss` — se os tokens (`--color-verde`, `--font-heading`, etc.) ainda não estão declarados, declará-los antes de rodar o build.
3. Executar `npm run build` para confirmar zero erros antes de avançar para o portal público (Fase 3).
