# Palestrino Gomes — Prompts para o Google Stitch

> **Objetivo:** gerar o design system e as telas-base do site (portal/blog) no Stitch (stitch.withgoogle.com).
> **Como usar:** cole cada prompt, um de cada vez, no Stitch. Comece pelo Prompt 0 (fundação do design system); os demais reaproveitam essa fundação. Os prompts estão em **inglês** porque o Stitch responde melhor assim.
> **Versão 1.0 — 26/05/2026**

---

## Identidade visual extraída das imagens de referência

Resumo do que define a marca, para você conferir antes de gerar:

- **Paleta:** verde-bandeira saturado + verde-neon elétrico + verde muito escuro (quase preto) como fundo; branco e cinza-prata para texto; creme/off-white em títulos. Visual escuro, dramático, "modo noturno".
- **Tipografia:** display pesado e condensado (estilo brush/stencil esportivo) para títulos; sans-serif limpo para corpo e interface.
- **Motivos:** monograma "P" em círculo, brilho neon, textura de torcida/estádio, molduras, sensação de estúdio à meia-luz.
- **Pilares editoriais (viram categorias):** Análises, Táticas, Opinião, História.
- **Tom:** intenso, sóbrio, esportivo, noturno.

### Nota importante sobre marca (ler antes de gerar)

O site terá AdSense e afiliados — é uma operação **comercial**. Por isso os prompts foram escritos para usar o **verde como inspiração de cor** (cor não é registrável) e a **identidade própria do canal** (monograma "P", nome Palestrino Gomes), **sem reproduzir o escudo oficial nem a mascote do clube**. Mantenha essa linha ao ajustar os prompts.

---

## Prompt 0 — Fundação do Design System

```
Create a complete design system for a sports content website called "Palestrino Gomes" — a Brazilian football (soccer) news and analysis blog with an intense, nocturnal, stadium-at-night mood.

BRAND PERSONALITY: passionate, bold, editorial, masculine sports-broadcast energy. Think "late-night podcast studio lit by green neon."

COLOR PALETTE (dark theme as the primary mode):
- Primary brand green (saturated, flag-like): around #1B7A3D
- Neon accent green (electric, for highlights, glows, active states): around #3DF06B
- Deep background (near-black with green undertone): around #0A1410
- Surface / card background (slightly lighter than the base): around #13241B
- Text primary: off-white #F2F4F0
- Text secondary / muted: silver-gray #A8B0A6
- Warm cream for large display titles: #ECE6D6
- Semantic: success green, warning amber, error red — all tuned to sit on dark backgrounds

TYPOGRAPHY:
- Display / headings: a heavy, condensed, sporty sans-serif with strong presence (uppercase for hero titles)
- Body / UI: a clean, highly readable sans-serif
- Define a full type scale: display, h1, h2, h3, body large, body, caption, label

COMPONENTS to define with light and (primary) dark variants:
- Buttons: primary (neon green fill), secondary (outline), ghost, and a "watch on YouTube" style button
- Cards: article/post card (cover image, category tag, title, excerpt, date, reading time), featured/hero card, compact list card
- Category tags / chips, with the four editorial pillars: Análises, Táticas, Opinião, História
- Navigation bar (dark, with the circular "P" monogram logo on the left)
- Footer
- Form inputs (text field, search field), used in an admin login and an article editor later
- Ad slot placeholders (clearly marked rectangular blocks where Google AdSense will go) in common sizes
- Affiliate product card (product image, title, price area, and a green "Ver no Mercado Livre" call-to-action button) with a small "publicidade / link de afiliado" disclosure label

VISUAL DETAILS:
- Subtle neon glow on key accents and active states
- Rounded corners (medium radius), generous spacing, strong contrast
- Mobile-first: everything must look great on a narrow phone screen first

Generate the design system foundations: color tokens, typography scale, spacing, and the core component library, in dark mode.
```

---

## Prompt 1 — Página inicial (Home)

```
Using the Palestrino Gomes design system (dark theme, brand greens, condensed sporty display headings), design the HOME PAGE of the football news/blog website. Mobile-first, then desktop.

Structure top to bottom:
1. Top navigation bar: circular "P" monogram logo on the left; menu with the categories Análises, Táticas, Opinião, História; a search icon on the right.
2. Hero / featured section: one large featured article with a full-width cover image, a category tag, a bold uppercase headline, a short excerpt, and a "Ler análise" button. Subtle green neon accents.
3. A horizontal row of 3 secondary featured articles as cards.
4. A clearly marked ad slot placeholder (leaderboard/banner) below the hero.
5. "Últimas publicações" section: a responsive grid of article cards (cover image, category tag, title, excerpt, date, reading time).
6. A section grouping content by the four editorial pillars (Análises, Táticas, Opinião, História), each with a few posts.
7. A sidebar (on desktop) with a vertical ad slot placeholder and a "mais lidas" list.
8. Footer: logo, quick links, social links (YouTube, Instagram, TikTok), and a short note that part of the channel's content uses AI narration.

Portuguese (Brazil) interface labels. Keep ad slots clearly distinguishable so they don't get confused with editorial content, and make sure no ad placement causes layout shift.
```

---

## Prompt 2 — Página de leitura do post (Article)

```
Using the Palestrino Gomes design system, design the ARTICLE / POST READING PAGE for the football blog. Mobile-first, then desktop.

Include:
- The same dark top navigation bar with the "P" monogram.
- A breadcrumb (Home > Category > Post title).
- Article header: category tag, large uppercase headline, author line ("por Palestrino Gomes"), publish date, and estimated reading time.
- A large cover image.
- The article body with comfortable reading typography: paragraphs, subheadings, bold text, blockquotes, and inline links.
- An embedded YouTube video block within the body (placeholder), since each post pairs with a video.
- An affiliate product card embedded mid-article: product image, title, price area, green "Ver no Mercado Livre" button, and a small "link de afiliado" disclosure label.
- Two in-article ad slot placeholders (one mid-content, one at the end), clearly marked.
- Social share buttons (WhatsApp, X, Facebook, copy link).
- A "Posts relacionados" section at the bottom with 3 related article cards.
- Footer.

NO comments section (the site intentionally has none). Portuguese (Brazil) labels. Optimize for reading comfort on mobile.
```

---

## Prompt 3 — Listagem por categoria

```
Using the Palestrino Gomes design system, design a CATEGORY LISTING PAGE (e.g. the "Análises" category) for the football blog. Mobile-first.

Include:
- Dark top navigation with the "P" monogram.
- A category header: the category name as a large uppercase title, a one-line description, and the neon accent.
- A responsive grid of article cards (cover image, category tag, title, excerpt, date, reading time).
- A clearly marked banner ad slot placeholder near the top of the list.
- SEO-friendly pagination at the bottom (numbered pages, previous/next).
- Footer.

Portuguese (Brazil) labels.
```

---

## Prompt 4 — Painel admin: login

```
Using the Palestrino Gomes design system (dark theme, brand greens), design an ADMIN LOGIN screen. This is a private area for a single administrator.

Include:
- Centered card on a dark background with subtle green neon glow.
- The circular "P" monogram logo at the top.
- Title "Painel Palestrino Gomes".
- Email and password fields (clean, readable on dark).
- A primary neon-green "Entrar" button.
- A small note that access is restricted to the administrator.

Keep it minimal, focused, and secure-feeling. Portuguese (Brazil) labels.
```

---

## Prompt 5 — Painel admin: editor de post (WYSIWYG)

```
Using the Palestrino Gomes design system, design an ADMIN POST EDITOR screen — a WYSIWYG editor that prioritizes fast, easy publishing. Desktop-first (admin works on a computer), but usable on tablet.

Layout:
- A slim dark sidebar with admin navigation: Posts, Categorias, Tags, Produtos de afiliado, Configurações.
- Main area: a large title input at the top, then a rich-text WYSIWYG editor.
- A formatting toolbar with: bold, italic, lists, link, heading levels, image upload (drag-and-drop), a "inserir vídeo do YouTube" button, and a "inserir produto de afiliado" button.
- A right-hand settings panel with: publish status (rascunho / publicado / agendado), category selector, tags, cover image upload, and an SEO section (slug, meta title, meta description, Open Graph image).
- Top-right action buttons: "Salvar rascunho", "Pré-visualizar", and a primary "Publicar".

The whole experience should feel quick and uncluttered — write, format with buttons, insert media, publish. Portuguese (Brazil) labels. Dark theme.
```

---

## Prompt 6 (opcional) — Página de recomendações (vitrine de afiliados)

```
Using the Palestrino Gomes design system, design a "Recomendações" PAGE that showcases affiliate products. Mobile-first.

Include:
- Dark top navigation with the "P" monogram.
- A page header explaining these are products the channel recommends, with a clear "links de afiliado" disclosure.
- A responsive grid of affiliate product cards: product image, title, price area, and a green "Ver no Mercado Livre" button.
- One banner ad slot placeholder.
- Footer.

Portuguese (Brazil) labels.
```

---

## Dicas de uso no Stitch

- **Gere na ordem:** o Prompt 0 estabelece tokens e componentes; os seguintes reaproveitam. Se o Stitch "esquecer" o estilo entre telas, cole no início do prompt seguinte um resumo curto da paleta e da tipografia.
- **Itere por tela:** depois de gerar, peça ajustes específicos ("aumente o contraste do texto secundário", "deixe o card de produto mais compacto").
- **Exporte os tokens:** ao final, peça ao Stitch o resumo dos tokens (cores, tipografia, espaçamento) — esses valores entram direto no tema do Angular quando partirmos pro código.
- **Mantenha a linha de marca:** ao ajustar, evite pedir o escudo oficial ou a mascote do clube; fique na identidade própria do canal (monograma "P", nome, verde).
```
