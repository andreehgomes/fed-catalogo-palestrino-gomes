# Palestrino Gomes — Portal / Blog · Análise de Requisitos

> Site de conteúdo com monetização (AdSense + afiliados Mercado Livre)
> **Stack:** Angular 20 · Firebase (Auth, Firestore, Storage, App Hosting)
> **Versão 1.1 — 26/05/2026**

---

## Sumário

1. [Visão geral do projeto](#1-visão-geral-do-projeto)
2. [Escopo](#2-escopo)
3. [Atores e papéis](#3-atores-e-papéis)
4. [Requisitos funcionais](#4-requisitos-funcionais)
5. [Requisitos não-funcionais](#5-requisitos-não-funcionais)
6. [Arquitetura técnica sugerida](#6-arquitetura-técnica-sugerida)
7. [Considerações de monetização e conformidade](#7-considerações-de-monetização-e-conformidade)
8. [Riscos, premissas e pontos em aberto](#8-riscos-premissas-e-pontos-em-aberto)
9. [Próximos passos sugeridos](#9-próximos-passos-sugeridos)

---

## 1. Visão geral do projeto

Este documento levanta os requisitos funcionais e não-funcionais para o site próprio do canal Palestrino Gomes — um portal de conteúdo (blog / site de notícias) onde serão publicadas as análises e a repercussão de jogos, mercado, arbitragem e história do clube, no mesmo DNA editorial do canal: palmeirense apaixonado e bem informado, com opinião sempre amparada em argumento, dado ou contexto.

O site cumpre três objetivos estratégicos:

1. **Criar um ativo próprio de distribuição.** Hoje o canal depende quase inteiramente do feed de Shorts do YouTube para ser distribuído. Um portal indexado pelo Google é uma fonte de tráfego que não desaparece quando o algoritmo muda.
2. **Abrir frentes de receita.** O canal ainda não monetiza. O site permite receita por anúncios (Google AdSense) e por comissão de afiliados (links do Mercado Livre incorporados nos posts).
3. **Fechar o ciclo de conteúdo.** Cada pauta passa a render um trio: o Short (vitrine no feed), o vídeo longo (aprofundamento) e o post no site (texto indexável e monetizável). O roteiro que já é produzido para os vídeos vira a base do post, transformando um trabalho em três ativos.

**Decisão de arquitetura central:** o site será renderizado no servidor (SSR). Angular, por padrão, monta a página no navegador — o que entrega ao Google e ao robô do AdSense um HTML praticamente vazio, prejudicando indexação e a própria aprovação no programa de anúncios. Por isso o portal usa Server-Side Rendering com Angular + Firebase App Hosting, que entrega o HTML já preenchido.

**Nota sobre hospedagem:** a participação de novos projetos Angular no antigo "frameworks experiment" do Firebase Hosting foi encerrada; a recomendação oficial do Firebase passou a ser o App Hosting, que cobre de forma unificada CDN, SSR (build no Cloud Build, execução no Cloud Run, cache no Cloud CDN) e guarda de segredos no Cloud Secret Manager. É sobre essa base que o projeto é desenhado.

---

## 2. Escopo

### 2.1. Dentro do escopo (versão inicial)

- Portal público de leitura: home, post, categorias, tags, busca e páginas institucionais.
- Painel administrativo próprio, com login do André, para escrever e gerenciar as publicações.
- Monetização por Google AdSense (blocos de anúncio configuráveis).
- Monetização por afiliados do Mercado Livre via links gerados manualmente pelo André e incorporados nos posts/páginas.
- Fundamentos de SEO (SSR, meta tags, sitemap, dados estruturados) e conformidade (LGPD, consentimento de cookies, divulgação de afiliados, aviso de uso de IA).

### 2.2. Fora do escopo (por ora)

- Integração automática com a API do Mercado Livre para puxar catálogo de produtos. Fica registrado como evolução futura — a arquitetura deve ser desenhada para acomodá-la sem reescrita.
- Cadastro e login de leitores / área de membros.
- **Comentários nos posts** — decisão tomada pelo cliente: o site não terá seção de comentários (reduz moderação, spam e risco). Pode ser reavaliado no futuro.
- **Newsletter / captura de e-mail** — decisão tomada pelo cliente: fica de fora por enquanto. Pode entrar em uma fase posterior como canal de reengajamento da audiência fora do algoritmo.
- Loja própria (e-commerce) com checkout no site.
- Aplicativo móvel nativo.

---

## 3. Atores e papéis

| Ator | Descrição | Acesso |
|---|---|---|
| **Administrador (André)** | Responsável pelo canal. Cria, edita e publica conteúdo; gere categorias, produtos de afiliado e configurações. | Autenticado, acesso total ao painel |
| **Leitor / visitante** | Público palmeirense que chega via Google, redes sociais ou links nos vídeos. Lê posts e clica em anúncios/produtos. | Anônimo, somente leitura do conteúdo público |
| **Robôs (Google, AdSense, redes)** | Crawlers de busca e de pré-visualização de links que indexam e leem o conteúdo do servidor. | Anônimo, leem o HTML renderizado (SSR) |

---

## 4. Requisitos funcionais

Cada requisito recebe um identificador (RF-xx), o módulo a que pertence e uma prioridade (Essencial = necessário para o lançamento; Recomendado = entra logo após; Opcional = desejável quando houver folga).

| ID | Módulo | Requisito | Prioridade |
|---|---|---|---|
| RF-01 | Conteúdo público | Exibir a página inicial (home) com posts em destaque, posts recentes e categorias do canal. Confirmada como parte do lançamento (o site "completo" pedido pelo cliente). | Essencial |
| RF-02 | Conteúdo público | Exibir a página de leitura de um post (análise) com título, corpo, data, categoria, autor (Palestrino Gomes) e tempo de leitura. | Essencial |
| RF-03 | Conteúdo público | Listar posts por categoria/editoria (pós-jogo, mercado, arbitragem, história do clube, etc.), espelhando a matriz de formatos do briefing. | Essencial |
| RF-04 | Conteúdo público | Listar posts por tag (jogador, adversário, competição) e por busca textual no site. | Recomendado |
| RF-05 | Conteúdo público | Página de arquivo paginada (posts mais antigos), com paginação amigável a SEO. | Recomendado |
| RF-06 | Conteúdo público | Embedar vídeos do YouTube (longo e Short) dentro do post, fechando o trio Short + vídeo longo + post. | Essencial |
| RF-07 | Conteúdo público | Páginas institucionais estáticas: Sobre, Política de Privacidade, Contato e aviso de uso de IA. | Essencial |
| RF-08 | Monetização — AdSense | Inserir blocos de anúncio do Google AdSense em posições definidas (topo, meio do conteúdo, barra lateral, fim do post), de forma centralizada e configurável. | Essencial |
| RF-09 | Monetização — AdSense | Servir o arquivo ads.txt na raiz do domínio com o publisher ID, exigido pela verificação do AdSense. | Essencial |
| RF-10 | Monetização — Mercado Livre | Permitir que o admin cole links de afiliado do Mercado Livre e os incorpore no corpo do post como blocos de produto (imagem, título, botão "Ver no Mercado Livre"). | Essencial |
| RF-11 | Monetização — Mercado Livre | Cadastrar uma "vitrine" de produtos reutilizáveis (cards de afiliado) que possam ser inseridos em vários posts e/ou em uma página fixa de recomendações. | Recomendado |
| RF-12 | Monetização — Mercado Livre | Marcar todo link de afiliado com `rel="sponsored nofollow"` e exibir aviso de relação de afiliado, por conformidade legal e de SEO. | Essencial |
| RF-13 | Painel admin | Autenticar o administrador via Firebase Authentication (login restrito ao André) antes de acessar qualquer rota administrativa. | Essencial |
| RF-14 | Painel admin | Criar, editar, salvar como rascunho, publicar, despublicar e agendar posts a partir de um editor de texto rico **WYSIWYG** (o que se vê é o que se publica — sem markdown nem HTML na mão): formatação por botões (negrito, listas, links), imagem por arrastar/soltar, e botões dedicados para inserir embed de vídeo do YouTube e bloco de produto de afiliado. Prioriza facilidade e agilidade de publicação. | Essencial |
| RF-15 | Painel admin | Fazer upload de imagens (capa e imagens do corpo) para o Firebase Storage, com geração de versões otimizadas para web. | Essencial |
| RF-16 | Painel admin | Editar os campos de SEO de cada post: título da aba (title), meta description, slug da URL, imagem de compartilhamento (Open Graph) e categoria. | Essencial |
| RF-17 | Painel admin | Gerenciar categorias e tags (criar, renomear, remover). | Recomendado |
| RF-18 | Painel admin | Pré-visualizar o post como ele aparecerá no site antes de publicar. | Recomendado |
| RF-19 | SEO & distribuição | Gerar automaticamente sitemap.xml e mantê-lo atualizado conforme posts são publicados. | Essencial |
| RF-20 | SEO & distribuição | Gerar meta tags por página (title, description, canonical, Open Graph, Twitter Card) renderizadas no HTML do servidor (SSR). | Essencial |
| RF-21 | SEO & distribuição | Incluir dados estruturados (JSON-LD do tipo Article/NewsArticle e BreadcrumbList) em cada post. | Recomendado |
| RF-22 | SEO & distribuição | Disponibilizar feed RSS/Atom das publicações. | Opcional |
| RF-23 | Engajamento | Botões de compartilhamento para WhatsApp, X/Twitter, Facebook e cópia de link. | Recomendado |
| RF-24 | Engajamento | Bloco de "posts relacionados" ao fim de cada análise (mesma categoria/tag). | Recomendado |
| RF-26 | Analytics & conformidade | Integrar Google Analytics 4 (ou equivalente) para medir tráfego, origem e comportamento. | Essencial |
| RF-27 | Analytics & conformidade | Banner de consentimento de cookies (LGPD) controlando o disparo de anúncios e analytics antes do aceite. | Essencial |
| RF-28 | Analytics & conformidade | Aviso visível de que parte do conteúdo do canal usa narração/IA, alinhado ao compliance já adotado no YouTube. | Recomendado |

---

## 5. Requisitos não-funcionais

Atributos de qualidade do sistema — desempenho, segurança, custo, conformidade e manutenção. Para um site que vive de busca orgânica e de anúncios, vários destes (desempenho e SEO em especial) são tão críticos quanto os funcionais.

| ID | Categoria | Requisito | Prioridade |
|---|---|---|---|
| RNF-01 | Desempenho / SEO | As páginas públicas devem ser renderizadas no servidor (SSR via Angular + Firebase App Hosting), entregando HTML com conteúdo já preenchido para indexação e para a aprovação do AdSense. | Essencial |
| RNF-02 | Desempenho | Boas notas de Core Web Vitals (LCP, CLS, INP) — meta de carregamento principal abaixo de ~2,5s em conexão móvel típica. Anúncios não podem causar "pulo" de layout (CLS). | Essencial |
| RNF-03 | Responsividade | Layout mobile-first: a maior parte da audiência vem do feed de Shorts no celular, então o site precisa ser impecável em telas pequenas. | Essencial |
| RNF-04 | Segurança | Rotas administrativas e operações de escrita protegidas por autenticação; regras de segurança do Firestore/Storage que só permitem escrita ao usuário-admin autenticado e leitura pública apenas dos posts publicados. | Essencial |
| RNF-05 | Segurança | Chaves sensíveis e segredos guardados no Cloud Secret Manager (suportado pelo App Hosting), nunca no código-fonte versionado. | Essencial |
| RNF-06 | Disponibilidade / Escala | Infraestrutura serverless (Cloud Run sob o App Hosting) que escala com o tráfego, com CDN (Cloud CDN) à frente para servir conteúdo cacheado rapidamente. | Recomendado |
| RNF-07 | Custo | Operar dentro do nível gratuito/baixo do Firebase enquanto o tráfego é pequeno; custo deve crescer de forma proporcional ao tráfego e não antes da receita. | Essencial |
| RNF-08 | Manutenibilidade | Código Angular 20 organizado por funcionalidades (standalone components, lazy loading por rota), facilitando evolução e a futura troca de links manuais do ML por integração via API. | Recomendado |
| RNF-09 | Acessibilidade | Conformidade básica de acessibilidade (contraste, navegação por teclado, textos alternativos em imagens), que também favorece SEO. | Recomendado |
| RNF-10 | Conformidade legal | Aderência à LGPD (consentimento, política de privacidade) e às políticas do Programa AdSense e do Programa de Afiliados do Mercado Livre (divulgação de afiliação, marcação de links). | Essencial |
| RNF-11 | Compatibilidade | Funcionar nos navegadores modernos (Chrome, Safari, Firefox, Edge) nas versões recentes, com degradação graciosa. | Recomendado |
| RNF-12 | Backup / Integridade | Os dados de conteúdo (posts, categorias) no Firestore devem ter rotina de exportação/backup periódica para evitar perda do acervo editorial. | Recomendado |
| RNF-13 | Internacionalização | Conteúdo e interface em português do Brasil; sem necessidade de múltiplos idiomas neste momento (decisão consciente, não esquecimento). | Opcional |

---

## 6. Arquitetura técnica sugerida

Mapa de como os requisitos se traduzem em componentes concretos da stack escolhida.

| Camada | Tecnologia | Papel no projeto |
|---|---|---|
| Frontend / Renderização | Angular 20 com SSR | Renderiza as páginas públicas no servidor (HTML pronto para SEO e AdSense) e hidrata no cliente para a navegação fluida. Componentes standalone, lazy loading por rota. |
| Hospedagem | Firebase App Hosting (Cloud Run + Cloud CDN + Cloud Build) | Build automático a partir do repositório Git, execução serverless do SSR, cache de borda. Solução oficial recomendada para Angular. |
| Autenticação | Firebase Authentication | Login do administrador (André). Protege as rotas e operações de escrita do painel. |
| Banco de dados | Cloud Firestore | Armazena posts, categorias, tags, produtos de afiliado e configurações. Leitura pública dos posts publicados; escrita só do admin. |
| Arquivos | Firebase Storage | Imagens de capa e do corpo dos posts, com versões otimizadas para web. |
| Segredos | Cloud Secret Manager | Guarda chaves de API e segredos fora do código-fonte. |
| Monetização | Google AdSense + Programa de Afiliados Mercado Livre | AdSense via blocos no layout SSR; afiliados via links manuais incorporados nos posts (com marcação sponsored/nofollow). |
| Medição | Google Analytics 4 + Search Console | Tráfego, origem, comportamento e desempenho de indexação. |

### 6.1. Modelo de dados inicial (Firestore)

Coleções previstas, em alto nível:

- **posts** — título, slug, conteúdo (rich text), resumo, categoria, tags, imagem de capa, status (rascunho/publicado/agendado), data de publicação, campos de SEO, IDs dos vídeos do YouTube relacionados.
- **categorias** — nome, slug, descrição (espelham a matriz de formatos do briefing).
- **tags** — nome, slug (jogadores, adversários, competições).
- **produtos_afiliado** — título, imagem, link de afiliado do Mercado Livre, observação. Reutilizáveis em vários posts.
- **config** — posições e códigos dos blocos de AdSense, textos institucionais, dados de contato.

---

## 7. Considerações de monetização e conformidade

### 7.1. Google AdSense

- A aprovação do AdSense para um site novo costuma levar de semanas a meses e exige conteúdo original, útil e com volume mínimo. Recomenda-se lançar com 15 a 20 análises densas e reais, não dezenas de textos rasos — qualidade aprova, quantidade vazia reprova.
- O conteúdo assistido por IA não é proibido pelo AdSense, desde que tenha valor editorial. O DNA do canal (opinião com argumento, paráfrase com fonte citada, ângulo autoral) já atende a essa exigência; o risco real é publicar conteúdo genérico só para encher página de anúncio.
- O arquivo `ads.txt` na raiz do domínio é obrigatório para validar o publisher e proteger a receita.
- Os anúncios não podem deslocar o layout durante o carregamento (impacta o Core Web Vitals e a experiência) nem ser posicionados de forma enganosa.

### 7.2. Afiliados do Mercado Livre

- Modelo inicial: o André gera os links de afiliado na própria conta do Mercado Livre e os incorpora nos posts — sem integração via API neste momento.
- Todo link de afiliado deve ser marcado com `rel="sponsored nofollow"` e acompanhado de aviso de relação de afiliado, por exigência tanto de SEO quanto de transparência com o leitor.
- A arquitetura registra a integração automática via API como evolução futura: a coleção de produtos de afiliado já nasce desenhada para, mais à frente, ser populada automaticamente sem reescrever o site.

### 7.3. Expectativa de retorno

Nos primeiros meses o site é investimento, não caixa. O AdSense só paga com tráfego relevante e o afiliado depende de volume de cliques. O retorno aparece quando o Google indexa o acervo e o tráfego orgânico — somado ao tráfego que os próprios vídeos enviam para o site — começa a girar. A simulação financeira do projeto deve refletir esse atraso entre custo e receita.

---

## 8. Riscos, premissas e pontos em aberto

### 8.1. Premissas

- Domínio próprio confirmado: **palestrinogomes.com.br** (em processo de compra). Será a URL canônica do site; o arquivo `ads.txt` exigido pelo AdSense deve ficar na raiz desse domínio (`palestrinogomes.com.br/ads.txt`).
- Há um único administrador (André); não há necessidade inicial de múltiplos perfis de acesso.
- O conteúdo é em português do Brasil, sem multi-idioma nesta fase.
- Os roteiros já produzidos para os vídeos servem de base para os posts, reduzindo o esforço de redação.

### 8.2. Riscos

- **SEO mal feito:** se o site não for SSR e bem otimizado, não ranqueia e o AdSense pode reprovar. *Mitigação:* SSR desde o início e checklist de SEO por post.
- **Reprovação no AdSense:** conteúdo raso ou pouco volume reprova. *Mitigação:* lançar com acervo inicial denso e original.
- **Custo antes da receita:** uso indevido de recursos pagos do Firebase pode gerar custo sem retorno. *Mitigação:* começar no nível gratuito e monitorar consumo.
- **Dependência de plataformas de terceiros:** mudanças de política do AdSense, do Mercado Livre ou do Firebase afetam o projeto. *Mitigação:* backup do acervo e arquitetura que permite migrar.

### 8.3. Pontos em aberto a decidir

Todos os pontos que estavam em aberto na versão 1.0 foram decididos:

- ~~Domínio próprio a registrar~~ → **definido:** palestrinogomes.com.br (em compra).
- ~~Editor de texto rico do painel~~ → **definido:** editor WYSIWYG com foco em facilidade/agilidade (ver RF-14); o componente específico será escolhido na fase de implementação.
- ~~Política de comentários~~ → **definido:** sem comentários (ver seção 2.2).
- ~~Newsletter no lançamento ou depois~~ → **definido:** fora do escopo por enquanto (ver seção 2.2).

Nenhuma pendência de decisão de produto em aberto no momento. O próximo ponto de definição é técnico e ocorre na implementação: escolha do componente de editor WYSIWYG e do registrador de domínio.

---

## 9. Próximos passos sugeridos

1. Validar e priorizar esta lista de requisitos (confirmar o que é Essencial para o lançamento).
2. Registrar o domínio e criar o projeto no Firebase.
3. Montar o esqueleto do Angular 20 com SSR e o deploy inicial no App Hosting.
4. Modelar o Firestore e as regras de segurança (leitura pública / escrita só admin).
5. Construir o painel admin (login + editor de posts) e o portal público.
6. Produzir o acervo inicial de 15–20 análises e só então solicitar o AdSense.
7. Atualizar a simulação financeira do projeto com os custos de infraestrutura e o atraso esperado da receita.

---

*Documento vivo — atualizar conforme as decisões em aberto forem fechadas e o projeto evoluir.*
