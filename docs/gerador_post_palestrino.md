# Guia de Geração de Post — Palestrino Gomes

> Use este documento como prompt base para o Claude gerar os dados completos de um post do site, a partir de um roteiro ou matéria criada com base no `briefing_palestrino_gomes_v9.md`.


---

## Como usar

1. Cole este documento inteiro como contexto ao Claude.
2. Informe o roteiro / matéria base logo abaixo (ou peça ao Claude para criar um antes).
3. O Claude deve devolver um bloco **"Dados do Post"** preenchido com todos os campos listados na seção 3.

---

## 1. Contexto do site

O site **palestrinogomes.com.br** é um portal de conteúdo atrelado ao canal do YouTube **Palestrino Gomes** — canal de análise e opinião sobre o Palmeiras. Cada post do site completa o trio: Short + Vídeo Longo + Post. O post aprofunda o tema do vídeo e é a peça que o Google indexa e o AdSense monetiza.

### Categorias disponíveis

Cada categoria tem um `pilar` editorial fixo. Escolha sempre a que melhor representa o tema central do post.

| Slug da categoria | Nome | Pilar |
|---|---|---|
| `analises` | Análises | `analises` |
| `taticas` | Táticas | `taticas` |
| `opiniao` | Opinião | `opiniao` |
| `historia` | História | `historia` |

> O campo salvo é o **ID do documento Firestore**, mas na geração use o slug acima para indicar a categoria — o André converte para ID na hora de cadastrar.

### Tags sugeridas por tipo de conteúdo

Use como referência. Tags são os nomes e temas mais relevantes do post.

- **Jogadores:** nome do jogador em português jornalístico (ex.: Estêvão, Veiga, Flaco López)
- **Adversários:** nome do time (ex.: Corinthians, Flamengo, Atlético-MG)
- **Competições:** Brasileirão, Libertadores, Copa do Brasil, Copa do Mundo de Clubes
- **Temas:** Mercado, Arbitragem, Abel Ferreira, Seleção Brasileira
- **Formato do conteúdo:** Pós-jogo, Pré-jogo, Análise Tática, Polêmica

> Tags são IDs Firestore, mas liste-as pelo nome — o André relaciona com os documentos. Se uma tag ainda não existir no sistema, indique isso com `[nova]` ao lado.

---

## 2. Regras de produção do corpo do post

O `corpo` do post é escrito em HTML limpo. Siga as regras abaixo:

### 2.1. Estrutura recomendada

```
<h2>Subtítulo da seção</h2>
<p>Parágrafo de desenvolvimento...</p>

<h2>Outra seção</h2>
<p>...</p>
```

### 2.2. O que usar

- `<h2>` para subdivisões principais do post (não usar `<h1>` — o título do post já ocupa o H1 da página)
- `<h3>` para subdivisões secundárias dentro de um `<h2>`
- `<p>` para parágrafos normais
- `<strong>` para ênfase em palavras-chave (use com moderação — máximo 2-3 por parágrafo)
- `<em>` para itálico quando necessário
- `<ul>` / `<ol>` + `<li>` para listas
- `<blockquote>` para citações de fontes (ex.: trecho de declaração de jogador ou técnico)

### 2.3. O que NÃO usar

- Nenhum `<h1>` — já existe na página
- Nenhum `style=""` inline
- Nenhum `<div>` de layout — o template do site cuida disso
- Nenhuma imagem embutida no corpo (`<img>`) — imagens de capa vão no campo `coverUrl`; o André insere imagens de corpo via editor depois
- Nenhum link de afiliado no HTML — afiliados são gerenciados pelo campo separado `afiliadosIds`
- Nenhum embed de YouTube no HTML — o embed é controlado pelo campo `youtubeId`

### 2.4. Tom e estilo do texto

O post segue o mesmo DNA do canal: **palmeirense enérgico, estressado e bem informado**. Não é neutro, mas tem rigor — opinião sempre com argumento, dado ou contexto. Regras fixas do `briefing_palestrino_gomes_v9.md`, item 2.1, valem integralmente:

- Proibido sentimentalismo piegas ("lágrimas nos olhos", "emoção que não cabe no peito")
- O post não se autoelogia — não escreva "leia nossa análise completa" ou "aqui a verdade sobre"
- Energia e irritação no lugar de poesia
- Grafia jornalística normal dos nomes (Sosa, Fuchs, Jhon Arias, Luighi) — **não usar substituições fonéticas do ElevenLabs**

### 2.5. Tamanho recomendado por formato

| Formato do vídeo | Tamanho do post |
|---|---|
| Short pós-jogo / pauta quente | 400–600 palavras |
| Pós-jogo longo (vitória / derrota / empate) | 700–1.000 palavras |
| Pré-jogo / análise tática | 800–1.200 palavras |
| Análise de rivais | 600–900 palavras |
| Polêmica de arbitragem | 600–800 palavras |
| Notícia séria | 400–600 palavras |
| História do clube / ídolos | 1.200–2.000 palavras |
| Provocação / zoeira | 300–500 palavras |

---

## 3. Campos do post — o que preencher

Ao receber um roteiro ou matéria, o Claude deve devolver os campos abaixo no formato exato da seção 4.

### 3.1. Campos obrigatórios

| Campo | Tipo | Regra |
|---|---|---|
| `titulo` | string | Título do post. Pode ser igual ao título do vídeo longo ou variação da mesma família semântica. Entre 45 e 70 caracteres. Sem emojis, sem CAPSLOCK em frase inteira. |
| `categoriaSlug` | string | Slug da categoria da tabela da seção 1 (`analises`, `taticas`, `opiniao`, `historia`). |
| `corpo` | HTML | Corpo completo do post seguindo as regras da seção 2. |

### 3.2. Campos recomendados

| Campo | Tipo | Regra |
|---|---|---|
| `excerpt` | string | Resumo de 1 a 3 frases. Aparece nos cards da home e como fallback da meta description. Máximo 160 caracteres. Tom editorial do canal. Não entregar spoiler da conclusão. |
| `tags` | string[] | Lista de nomes de tags (ver seção 1). Entre 3 e 7 tags por post. |
| `youtubeId` | string | Apenas o ID do vídeo (ex.: `dQw4w9WgXcQ`), não a URL completa. Extrair do link do vídeo longo correspondente, se fornecido. Se não fornecido, deixar vazio. |
| `tempoDeLeituraMin` | number | Estimativa de minutos de leitura. Calcular: total de palavras do corpo ÷ 200 (velocidade média de leitura), arredondado pra cima. Mínimo 1. |

### 3.3. Campos de SEO (recomendados)

| Campo | Tipo | Regra |
|---|---|---|
| `metaTitle` | string | Título da aba do navegador e do resultado no Google. Máximo 60 caracteres. Se igual ao `titulo`, deixar vazio (o sistema usa o título automaticamente). |
| `metaDescription` | string | Descrição do resultado no Google. Entre 120 e 155 caracteres. Deve conter a palavra-chave principal. Se igual ao `excerpt`, deixar vazio. |

### 3.4. Campos automáticos (não preencher)

Estes campos são gerados automaticamente pelo sistema e **não devem constar** no bloco de dados:

| Campo | Geração |
|---|---|
| `slug` | Gerado automaticamente a partir do `titulo` |
| `publicadoEm` | Definido pelo sistema no momento do save |
| `atualizadoEm` | Definido pelo Firestore automaticamente |
| `id` | Gerado pelo Firestore |

### 3.5. Campos gerenciados pelo André manualmente

Não preencher — dependem de dados que o André tem no sistema:

| Campo | Motivo |
|---|---|
| `categoriaId` | André converte o `categoriaSlug` para o ID do Firestore |
| `afiliadosIds` | André seleciona os produtos cadastrados no sistema |
| `coverUrl` | André faz upload da thumbnail do vídeo ou de imagem específica |
| `coverCaption` | André preenche após escolher a imagem de capa. Ex.: `"Endrick comemora gol na Arena Barueri"`. Opcional — omitir se a imagem for autoexplicativa. |
| `coverCredit` | André preenche com a fonte da imagem. Ex.: `"Foto: Cesar Greco / SE Palmeiras"`. **Obrigatório quando a imagem não for de autoria própria.** |
| `status` | André define se publica diretamente ou salva como rascunho |

---

## 4. Formato de entrega (bloco de dados)

O Claude deve entregar os dados do post neste formato exato. Campos opcionais que não se aplicam ao tema podem ser omitidos.

```
---
DADOS DO POST — [TÍTULO RESUMIDO]
---

titulo: [título do post, 45–70 caracteres]

categoriaSlug: [analises | taticas | opiniao | historia]

excerpt: |
  [resumo de 1–3 frases, máximo 160 caracteres]

tags:
  - [tag 1]
  - [tag 2]
  - [tag 3 — indicar [nova] se ainda não existe no sistema]

youtubeId: [ID do vídeo ou vazio]

tempoDeLeituraMin: [número inteiro, mínimo 1]

metaTitle: [título SEO, máximo 60 chars — omitir se igual ao titulo]

metaDescription: |
  [descrição SEO, 120–155 chars — omitir se igual ao excerpt]

corpo: |
  <h2>Primeiro subtítulo</h2>
  <p>...</p>

  <h2>Segundo subtítulo</h2>
  <p>...</p>

  [... resto do HTML do corpo ...]

---
NOTAS DE PRODUÇÃO
---

- [Qualquer observação relevante para o André na hora de publicar]
- [Ex.: "youtubeId ainda não disponível — inserir após publicar o vídeo longo"]
- [Ex.: "tag 'Copa do Mundo de Clubes' ainda não cadastrada no sistema [nova]"]
- [Ex.: "coverCaption sugerida: 'Abel Ferreira orienta jogadores no treino desta semana'"]
- [Ex.: "coverCredit: preencher com a fonte da imagem após o upload — obrigatório se não for foto própria"]
```

---

## 5. Checklist de verificação antes de entregar

Antes de finalizar o bloco de dados, o Claude deve confirmar:

- [ ] `titulo` entre 45 e 70 caracteres, sem CAPSLOCK em frase inteira, sem emojis
- [ ] `categoriaSlug` é um dos quatro slugs válidos da tabela
- [ ] `excerpt` tem no máximo 160 caracteres
- [ ] `corpo` usa apenas as tags HTML permitidas (seção 2.2)
- [ ] `corpo` não contém links de afiliado, embeds de YouTube, imagens ou estilos inline
- [ ] Nenhuma substituição fonética do ElevenLabs nos textos (Sosa, não Sôça; Fuchs, não Fucs; ge.globo, não G É)
- [ ] Nenhum sentimentalismo piegas no texto (regra do briefing, item 2.1)
- [ ] `tempoDeLeituraMin` calculado com base no total de palavras ÷ 200
- [ ] Tags listadas pelo nome em português jornalístico, novas marcadas com `[nova]`

---

## 6. Exemplo de solicitação ao Claude

> "Com base no roteiro do vídeo longo sobre [tema], gere os dados completos do post seguindo o `gerador_post_palestrino.md`. O ID do vídeo no YouTube é `xxxxxxxxxxx`."

Ou:

> "Crie um roteiro de vídeo longo sobre [tema] com base no `briefing_palestrino_gomes_v9.md` e, logo após, gere os dados do post correspondente seguindo o `gerador_post_palestrino.md`."

---

*Documento criado em 27/05/2026. Atualizar conforme novas categorias, tags ou campos forem adicionados ao sistema.*
