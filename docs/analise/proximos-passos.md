# Palestrino Gomes — Próximos Passos

> Documento vivo. Atualizar conforme etapas forem concluídas.
> Última atualização: 26/05/2026

---

## Status atual

- [x] Análise de requisitos concluída (`docs/Analise_Requisitos_Site_Palestrino_Gomes.md`)
- [x] Design system gerado no Stitch (asset `5422a64bd15845198531c4ceaeaeeff5`)
- [x] Tokens de design salvos em `src/styles/_tokens.scss`
- [x] Telas geradas no Stitch: Home, Artigo, Categoria, Admin Login, Admin Editor
- [x] Projeto Angular 20 + SSR scaffoldado

---

## Fase 1 — Infraestrutura

> Pré-requisito para qualquer deploy. Fazer antes de codar as features.

- [ ] **Registrar o domínio** `palestrinogomes.com.br`
- [ ] **Criar projeto no Firebase** (console.firebase.google.com)
  - Ativar Firebase Authentication (e-mail/senha, único admin)
  - Ativar Cloud Firestore
  - Ativar Firebase Storage
  - Ativar Firebase App Hosting e conectar ao repositório Git
- [ ] **Configurar Cloud Secret Manager** para guardar chaves sensíveis
- [ ] **Primeiro deploy** do esqueleto Angular no App Hosting (validar pipeline de CI/CD)
- [ ] **Modelar regras de segurança** do Firestore e Storage
  - Leitura pública: apenas posts com `status == "publicado"`
  - Escrita: apenas usuário admin autenticado

---

## Fase 2 — Componentes compartilhados (Opção B)

> Consultar telas no Stitch antes de implementar cada componente.
> Stitch project ID: `15267574697450678868`

- [ ] `NavbarComponent` — logo "P", menu de categorias, ícone de busca
- [ ] `ButtonComponent` — variantes: primary, secondary, ghost, youtube-cta
- [ ] `CategoryChipComponent` — variantes por pilar: Análises, Táticas, Opinião, História
- [ ] `ArticleCardComponent` — cover 16:9, chip, título Oswald, excerpt, data + tempo de leitura
- [ ] `HeroCardComponent` — card de destaque full-width com CTA "Ler análise"
- [ ] `CompactCardComponent` — thumbnail à esquerda, título + data à direita
- [ ] `AdSlotComponent` — placeholder com borda tracejada, label "ANÚNCIO", altura fixa (anti-CLS)
- [ ] `AffiliateCardComponent` — imagem, título, preço, botão "Ver no Mercado Livre", disclosure
- [ ] `YouTubeEmbedComponent` — embed de vídeo com placeholder
- [ ] `FooterComponent` — logo, links, redes sociais, aviso de IA
- [ ] `BreadcrumbComponent` — navegação hierárquica
- [ ] `PaginationComponent` — paginação SEO-friendly

---

## Fase 3 — Portal público

> Cada rota deve usar `RenderMode.Prerender` ou SSR para garantir HTML completo ao Google e ao AdSense.

- [ ] **Rota `/` — Home**
  - Hero com artigo em destaque
  - Grid de últimas publicações
  - Seções por pilar editorial
  - Slots de AdSense integrados

- [ ] **Rota `/[categoria]` — Listagem por categoria**
  - Header da categoria com descrição
  - Lista de artigos paginada
  - Slot de anúncio

- [ ] **Rota `/[categoria]/[slug]` — Leitura de artigo**
  - Header completo (título, autor, data, tempo de leitura)
  - Corpo do post (rich text renderizado)
  - Embed de YouTube
  - Card de afiliado inline
  - Slots de anúncio (meio e fim)
  - Botões de compartilhamento (WhatsApp, X, Facebook, copiar link)
  - Posts relacionados

- [ ] **Rota `/busca` — Busca textual**

- [ ] **Páginas institucionais estáticas**
  - `/sobre`
  - `/contato`
  - `/privacidade`
  - `/aviso-ia`

- [ ] **`ads.txt`** na raiz do domínio com o publisher ID do AdSense

- [ ] **`sitemap.xml`** gerado dinamicamente a partir dos posts publicados

---

## Fase 4 — SEO & Meta tags

- [ ] Implementar `@angular/ssr` meta tags por rota (title, description, canonical, OG, Twitter Card)
- [ ] Implementar JSON-LD (`Article`/`NewsArticle` + `BreadcrumbList`) em cada post
- [ ] Registrar no Google Search Console
- [ ] Configurar Google Analytics 4 (com controle de consentimento LGPD)
- [ ] Banner de consentimento de cookies (controla disparo de anúncios e analytics)

---

## Fase 5 — Painel administrativo

- [ ] **Rota `/admin/login`** — tela de autenticação Firebase (guard para rotas admin)
- [ ] **Rota `/admin/posts`** — listagem de posts com status (rascunho/publicado/agendado)
- [ ] **Rota `/admin/posts/novo` e `/admin/posts/[id]/editar`** — editor WYSIWYG
  - Escolher componente: TipTap, Quill ou equivalente (decisão técnica pendente)
  - Botões dedicados: inserir vídeo YouTube, inserir card de afiliado
  - Painel lateral: status, categoria, tags, capa, SEO
- [ ] **Rota `/admin/categorias`** — CRUD de categorias
- [ ] **Rota `/admin/tags`** — CRUD de tags
- [ ] **Rota `/admin/afiliados`** — vitrine de produtos reutilizáveis (Mercado Livre)
- [ ] **Rota `/admin/configuracoes`** — códigos AdSense, textos institucionais

---

## Fase 6 — Monetização

- [ ] Integrar Google AdSense (blocos nos slots já mapeados no layout)
- [ ] Validar que `ads.txt` está acessível em `palestrinogomes.com.br/ads.txt`
- [ ] Testar que anúncios não causam CLS (Core Web Vitals)
- [ ] Configurar links de afiliado Mercado Livre com `rel="sponsored nofollow"` e aviso

---

## Fase 7 — Conteúdo e lançamento

- [ ] Produzir **15–20 análises densas** antes de solicitar aprovação no AdSense
- [ ] Revisar checklist de SEO em cada post
- [ ] Solicitar aprovação no Google AdSense
- [ ] Configurar rotina de backup do Firestore (exportação periódica)
- [ ] Lançar e monitorar Core Web Vitals no Search Console

---

## Decisões técnicas ainda em aberto

| Item | Situação |
|---|---|
| Componente WYSIWYG do editor | A decidir na Fase 5 (TipTap, Quill, etc.) |
| Registro do domínio `palestrinogomes.com.br` | Em processo de compra |

---

## Referências rápidas

| Recurso | Localização |
|---|---|
| Requisitos completos | `docs/Analise_Requisitos_Site_Palestrino_Gomes.md` |
| Prompts Stitch | `docs/Prompts_Stitch_Design_System_Palestrino_Gomes.md` |
| Tokens de design | `src/styles/_tokens.scss` |
| Stitch project ID | `15267574697450678868` |
| Stitch design system asset | `5422a64bd15845198531c4ceaeaeeff5` |
