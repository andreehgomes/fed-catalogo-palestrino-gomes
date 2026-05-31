# Análise — Tabela de Classificação do Campeonato Brasileiro

> Data: 31/05/2026
> Escopo: feature nova — página `/classificacao` com atualização automática de dados

---

## Objetivo

Adicionar uma aba **"Classificação"** no menu principal que exibe a tabela da Série A do Campeonato Brasileiro com dados atualizados automaticamente, sem intervenção manual.

---

## Fonte de dados

### Opção recomendada: football-data.org (tier gratuito)

| Atributo | Detalhe |
|---|---|
| URL base | `https://api.football-data.org/v4` |
| Endpoint standings | `GET /competitions/BSA/standings` |
| Autenticação | Header `X-Auth-Token: <API_KEY>` |
| Tier gratuito | 10 req/min, sem custo |
| Dados retornados | Pos, Time, PJ, V, E, D, GP, GC, SG, Pts |
| Cobertura | Série A completa (20 times) |

> `BSA` é o código da Brasileirão Série A na football-data.org. Necessário criar conta gratuita em football-data.org para obter a chave.

### Alternativas avaliadas e descartadas

| API | Motivo da descarte |
|---|---|
| API-Football (RapidAPI) | Limite de 100 req/dia no tier gratuito — muito restrito |
| apifootball.com | Dados menos confiáveis e docs fragmentadas |
| Sofascore (não oficial) | Sem autenticação mas API instável e sem SLA |

---

## Arquitetura de integração

O projeto ainda não possui Firebase Cloud Functions. Por isso a solução é dividida em duas fases:

### Fase A — Curto prazo (implementação imediata)

**Angular SSR faz a chamada HTTP diretamente com `HttpClient` + `TransferState`.**

```
Browser request
    │
    ▼
Angular SSR (Express)
    │  HttpClient → football-data.org/v4/competitions/BSA/standings
    │  Resposta serializada via TransferState
    ▼
HTML com dados embutidos enviado ao browser
    │
    ▼
Browser hidrata sem nova requisição (TransferState replay)
    │
    ▼
Cache em memória (Angular signal): revalida a cada 2h na mesma sessão
```

- A chave de API fica em variável de ambiente do servidor (`process.env.FOOTBALL_DATA_API_KEY`) — nunca chega ao browser.
- `TransferState` evita o double-fetch SSR → client que desperdiçaria a cota da API.
- No browser, o dado é mantido em signal com timestamp; nova requisição só ocorre se o usuário recarregar a página depois de 2h.

**Artefatos a criar:**
| Arquivo | Propósito |
|---|---|
| `src/app/core/models/classificacao.model.ts` | Interfaces `ClassificacaoTime`, `ClassificacaoTabela` |
| `src/app/core/services/classificacao.service.ts` | Fetch + TransferState + cache em memória |
| `src/app/features/classificacao/classificacao.component.ts` | Página pública |
| `src/app/features/classificacao/classificacao.component.html` | Tabela responsiva |
| `src/app/features/classificacao/classificacao.component.scss` | Estilos (destaque Palmeiras, zona de classificação/rebaixamento) |

**Configuração necessária:**
- Adicionar `provideHttpClient(withFetch())` em `app.config.ts` (requerido para SSR com `fetch` nativo)
- Variável de ambiente `FOOTBALL_DATA_API_KEY` no servidor (Firebase App Hosting injeta via Cloud Secret Manager)
- Rota `/classificacao` com `RenderMode.Server` em `app.routes.server.ts`

### Fase B — Longo prazo (quando Cloud Functions estiverem ativas)

**Scheduled Cloud Function atualiza Firestore a cada 2 horas; Angular lê do Firestore.**

```
Cloud Scheduler (cron: a cada 2h)
    │
    ▼
Cloud Function `atualizarClassificacao`
    │  Fetch football-data.org → transforma → salva em Firestore
    ▼
Firestore: coleção `classificacao_serie_a` (documento único `temporada_atual`)
    │
    ▼
Angular SSR lê Firestore (como já faz para posts)
    ▼
Browser via TransferState / Firestore realtime (opcional)
```

Vantagens sobre a Fase A:
- Zero chamadas de API pelo Angular (cliente ou servidor)
- Atualização em segundo plano mesmo sem visitas ao site
- Chave de API fica exclusivamente na Cloud Function
- Possibilidade de notificações em tempo real (Firestore onSnapshot)

---

## Estrutura da página `/classificacao`

### Dados exibidos na tabela

| Coluna | Descrição |
|---|---|
| # | Posição na tabela |
| Time | Escudo (PNG) + nome abreviado |
| PJ | Partidas jogadas |
| V | Vitórias |
| E | Empates |
| D | Derrotas |
| GP | Gols pró |
| GC | Gols contra |
| SG | Saldo de gols |
| Pts | Pontos (coluna em destaque) |

### Tratamento visual das zonas

| Zona | Cor da borda / fundo | Posições |
|---|---|---|
| Libertadores (fase de grupos) | `--color-verde` | 1–4 |
| Libertadores (pré-fase) | `--color-verde` (opaco) | 5–6 |
| Sul-Americana | `--color-amarelo` | 7–12 |
| Rebaixamento | `--color-vermelho` | 18–20 |
| Palmeiras | `--color-verde` bold + fundo sutil | Posição atual |

### Metadados exibidos

- Rodada atual (ex: "17ª rodada")
- Data/hora da última atualização (ex: "Atualizado em 31/05/2026 às 14:30")
- Link "Fonte: football-data.org" (obrigação contratual do tier gratuito)

---

## Integração no menu principal

### Navbar atual

O `NavbarComponent` carrega categorias dinamicamente do Firestore e as exibe como links. O "Classificação" é um link estático — não vem do Firestore.

**Modificação necessária no template (`navbar.component.html`):**
- Adicionar item fixo "Classificação" com `routerLink="/classificacao"` e `routerLinkActive="active"`
- Posição sugerida: primeiro item do menu, antes das categorias editoriais (maior relevância para o público do canal)

**Modificação no componente (`navbar.component.ts`):**
- Nenhuma lógica adicional necessária; é um link estático como `/busca`

---

## Rota e SSR

```typescript
// app.routes.ts — adicionar
{
  path: 'classificacao',
  loadComponent: () =>
    import('./features/classificacao/classificacao.component').then(
      m => m.ClassificacaoComponent
    )
}

// app.routes.server.ts — adicionar
{
  path: 'classificacao',
  renderMode: RenderMode.Server
}
```

> `RenderMode.Server` (não Prerender) porque os dados mudam frequentemente e não há lista finita de parâmetros para pre-render.

---

## SEO

| Tag | Valor |
|---|---|
| `<title>` | `Classificação Campeonato Brasileiro {{ano}} \| Palestrino Gomes` |
| `meta description` | `Tabela de classificação do Brasileirão Série A {{ano}} atualizada. Veja a posição do Palmeiras e de todos os times.` |
| OG title / description | Idem ao title / description |
| JSON-LD | `ItemList` com os 20 times em ordem (estrutura válida para rich snippets de tabela) |
| Canonical | `https://palestrinogomes.com.br/classificacao` |

---

## Modelo de dados

```typescript
// classificacao.model.ts

export interface ClassificacaoTime {
  posicao: number;
  nome: string;
  nomeAbreviado: string;
  escudoUrl: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
}

export interface ClassificacaoTabela {
  temporada: number;        // ex: 2025
  rodadaAtual: number;      // ex: 17
  atualizadoEm: Date;
  times: ClassificacaoTime[];
}
```

---

## Checklist de implementação

### Pré-requisitos
- [ ] Criar conta em football-data.org e obter API key gratuita
- [ ] Cadastrar `FOOTBALL_DATA_API_KEY` no Cloud Secret Manager do Firebase
- [ ] Confirmar que `provideHttpClient(withFetch())` não conflita com providers AngularFire existentes

### Desenvolvimento
- [ ] Criar model `classificacao.model.ts`
- [ ] Criar `ClassificacaoService` com fetch + TransferState + cache em memória (TTL 2h)
- [ ] Criar `ClassificacaoComponent` standalone com tabela responsiva
- [ ] Adicionar rota em `app.routes.ts` e `app.routes.server.ts`
- [ ] Adicionar item "Classificação" ao `NavbarComponent`
- [ ] Aplicar tokens de design (`_tokens.scss`) para zonas de classificação
- [ ] Configurar meta tags + JSON-LD via `SeoService`

### Qualidade
- [ ] Testar SSR: verificar que o HTML gerado pelo servidor contém a tabela completa (não vazia)
- [ ] Testar hidratação: verificar que não ocorre double-fetch no DevTools (Network)
- [ ] Testar responsividade: em mobile, colunas V/E/D/GP/GC podem ser ocultadas, mantendo Pos/Time/Pts/SG
- [ ] Testar erro de API: exibir mensagem de fallback amigável se a API estiver indisponível

### Futuro (Fase B)
- [ ] Criar Cloud Function `atualizarClassificacao` (Node.js) com cron a cada 2h
- [ ] Migrar serviço para ler de Firestore em vez de football-data.org diretamente
- [ ] Remover `FOOTBALL_DATA_API_KEY` do escopo do servidor Angular; mover para a Function

---

## Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| API football-data.org indisponível | Baixa | Exibir última tabela cacheada (TransferState); mensagem de "dados temporariamente indisponíveis" |
| Mudança no schema da API | Média | Adicionar validação no serviço; logar payload bruto no servidor para diagnóstico |
| Exceder limite de 10 req/min | Baixa (uma req por visita SSR com cache) | TransferState + cache em memória evitam múltiplas req |
| Imagem de escudo não disponível | Média | Fallback com letra inicial do time |
| Conflito `HttpClient` + AngularFire | Baixa | `withFetch()` é compatível; testar no build SSR |

---

## Estimativa de esforço

| Tarefa | Estimativa |
|---|---|
| Model + Service (Fase A) | ~2h |
| Componente + estilos responsivos | ~3h |
| Rota + SSR + meta tags | ~1h |
| Navbar (item estático) | ~30min |
| Testes manuais (SSR + hidratação + responsividade) | ~1h |
| **Total** | **~7–8h** |
