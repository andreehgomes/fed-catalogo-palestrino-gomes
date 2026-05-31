# Plano de Desenvolvimento: Tabela de Classificação do Campeonato Brasileiro

**Data:** 31/05/2026
**Projeto:** fed-catalogo-palestrino-gomes (Angular 20 + SSR)
**Análise base:** [docs/analise/classificacao-brasileirao.md](../analise/classificacao-brasileirao.md)
**Branch alvo:** main

---

## Visão Geral

Será criada a página pública `/classificacao` exibindo a tabela da Série A do Campeonato Brasileiro com dados vindos da API gratuita **football-data.org** (competition code `BSA`). Os dados são buscados no servidor (SSR) via `HttpClient`, transferidos ao browser por `TransferState` (sem double-fetch) e mantidos em cache em memória com TTL de 2 horas.

O `NavbarComponent` receberá um link estático "Classificação" posicionado antes das categorias editoriais. A rota usará `RenderMode.Server` para garantir HTML completo ao GoogleBot e ao AdSense — requisito duro do projeto.

O `ClassificacaoService` será o único ponto de integração com a API externa. A chave de API (`FOOTBALL_DATA_API_KEY`) é lida de variável de ambiente no servidor e nunca exposta ao browser.

---

## Convenções Obrigatórias

Extraídas do `CLAUDE.md` e dos padrões já presentes no projeto:

- **Standalone components** — sem `NgModule`
- **`inject()`** — nunca injeção por construtor
- **`ChangeDetectionStrategy.OnPush`** — em todo componente apresentacional
- **Signals** (`signal`, `computed`, `toSignal`) — estado reativo; sem `BehaviorSubject` exposto
- **`takeUntilDestroyed()`** — em toda subscrição de Observable dentro de componente
- **`trackBy` / `track`** — obrigatório em todo `@for`
- **`loading="lazy"`** — em imagens fora do viewport inicial (escudos dos times abaixo do dobra)
- **Prettier**: aspas simples, 100 chars, parser Angular para `.html`
- **SCSS**: usar tokens de `src/styles/_tokens.scss`; nunca valores literais de cor ou fonte
- **Lazy loading de rota**: `loadComponent` com import dinâmico
- **`provideHttpClient(withFetch())`** — obrigatório para SSR com Node.js 18+ (substitui `XMLHttpRequest`)
- **Sem comentários** salvo invariante não-óbvia

---

## Fases de Implementação

### Fase 1 — Fundação (model, config, rota)

**Objetivo:** preparar a infraestrutura que as fases seguintes dependem. Nada visível ao usuário ainda.

---

#### Tarefa 1.1 — Model de dados

**Arquivo a criar:** `src/app/core/models/classificacao.model.ts`

**O que fazer:**

```typescript
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
  temporada: number;
  rodadaAtual: number;
  atualizadoEm: Date;
  times: ClassificacaoTime[];
}
```

**Critério:** arquivo compila sem erros (`ng build --dry-run`).

---

#### Tarefa 1.2 — Habilitar `HttpClient`

**Arquivo a modificar:** `src/app/app.config.ts`

**O que fazer:** adicionar `provideHttpClient(withFetch())` ao array `providers`. O `withFetch()` é obrigatório no SSR com Angular 20 — sem ele, o servidor usa `XMLHttpRequest` que não existe no Node.js.

```typescript
import { provideHttpClient, withFetch } from '@angular/common/http';

// dentro de providers:
provideHttpClient(withFetch()),
```

**Critério:** `ng build` conclui sem erro de provider. O `HttpClient` pode ser injetado em qualquer serviço.

---

#### Tarefa 1.3 — Rota client-side

**Arquivo a modificar:** `src/app/app.routes.ts`

**O que fazer:** inserir a rota **antes** das rotas de slug dinâmico (`:categoria`, `:categoria/:slug`), para evitar que `/classificacao` seja capturado como uma categoria.

```typescript
{
  path: 'classificacao',
  loadComponent: () =>
    import('./features/classificacao/classificacao.component').then(
      m => m.ClassificacaoComponent
    ),
},
```

**Critério:** navegar para `/classificacao` não redireciona para a página de categoria.

---

#### Tarefa 1.4 — Rota SSR

**Arquivo a modificar:** `src/app/app.routes.server.ts`

**O que fazer:** adicionar entrada com `RenderMode.Server` (não `Prerender` — dados mudam a cada rodada).

```typescript
{ path: 'classificacao', renderMode: RenderMode.Server },
```

**Critério:** `ng build` gera o bundle SSR sem erros; a rota aparece no log do servidor como server-rendered.

---

### Fase 2 — Serviço de dados

**Objetivo:** encapsular toda a lógica de busca, mapeamento da resposta da API e cache em memória.

---

#### Tarefa 2.1 — `ClassificacaoService`

**Arquivo a criar:** `src/app/core/services/classificacao.service.ts`

**O que fazer:**

O serviço deve:
1. Buscar `GET https://api.football-data.org/v4/competitions/BSA/standings` com o header `X-Auth-Token`
2. Mapear a resposta bruta para `ClassificacaoTabela`
3. Usar `TransferState` para evitar double-fetch (SSR → browser)
4. Manter cache em `signal` com timestamp; não re-buscar se o dado tiver menos de 2 horas

```typescript
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ClassificacaoTabela, ClassificacaoTime } from '../models/classificacao.model';

const CLASSIFICACAO_KEY = makeStateKey<ClassificacaoTabela>('classificacao');
const TTL_MS = 2 * 60 * 60 * 1000; // 2 horas

@Injectable({ providedIn: 'root' })
export class ClassificacaoService {
  private readonly http = inject(HttpClient);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _cache = signal<{ data: ClassificacaoTabela; ts: number } | null>(null);

  obterTabela(): Observable<ClassificacaoTabela> {
    // 1. Browser: verificar TransferState (dado vindo do SSR)
    if (!isPlatformServer(this.platformId)) {
      const transferido = this.transferState.get(CLASSIFICACAO_KEY, null);
      if (transferido) {
        this.transferState.remove(CLASSIFICACAO_KEY);
        this._cache.set({ data: transferido, ts: Date.now() });
        return of(transferido);
      }
      const cached = this._cache();
      if (cached && Date.now() - cached.ts < TTL_MS) {
        return of(cached.data);
      }
    }

    // 2. Servidor ou cache expirado: buscar na API
    const apiKey = typeof process !== 'undefined' ? process.env['FOOTBALL_DATA_API_KEY'] : '';
    return this.http
      .get<any>('https://api.football-data.org/v4/competitions/BSA/standings', {
        headers: { 'X-Auth-Token': apiKey ?? '' },
      })
      .pipe(
        map(res => this.mapear(res)),
        tap(tabela => {
          this._cache.set({ data: tabela, ts: Date.now() });
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(CLASSIFICACAO_KEY, tabela);
          }
        }),
      );
  }

  private mapear(res: any): ClassificacaoTabela {
    const tabela = res.standings?.[0]?.table ?? [];
    const times: ClassificacaoTime[] = tabela.map((entry: any) => ({
      posicao: entry.position,
      nome: entry.team.name,
      nomeAbreviado: entry.team.shortName ?? entry.team.tla,
      escudoUrl: entry.team.crest,
      pontos: entry.points,
      jogos: entry.playedGames,
      vitorias: entry.won,
      empates: entry.draw,
      derrotas: entry.lost,
      golsPro: entry.goalsFor,
      golsContra: entry.goalsAgainst,
      saldoGols: entry.goalDifference,
    }));
    return {
      temporada: res.season?.startDate?.substring(0, 4) ?? new Date().getFullYear(),
      rodadaAtual: res.season?.currentMatchday ?? 0,
      atualizadoEm: new Date(),
      times,
    };
  }
}
```

**Critério:**
- Em SSR: a chamada HTTP para football-data.org aparece nos logs do servidor; `TransferState` é populado
- No browser: a aba Network não mostra requisição para football-data.org ao carregar a página (dado vindo do `TransferState`)
- Recarregar dentro de 2h: sem nova requisição à API

---

### Fase 3 — Componente de página

**Objetivo:** implementar a página `/classificacao` com tabela responsiva e zonas visuais por classificação.

---

#### Tarefa 3.1 — Estrutura do componente

**Arquivo a criar:** `src/app/features/classificacao/classificacao.component.ts`

**O que fazer:**

```typescript
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClassificacaoService } from '../../core/services/classificacao.service';
import { ClassificacaoTabela } from '../../core/models/classificacao.model';
import { SeoService } from '../../core/services/seo.service';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-classificacao',
  standalone: true,
  imports: [DecimalPipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './classificacao.component.html',
  styleUrl: './classificacao.component.scss',
})
export class ClassificacaoComponent implements OnInit {
  private readonly service = inject(ClassificacaoService);
  private readonly seo = inject(SeoService);

  tabela = toSignal(this.service.obterTabela(), { initialValue: null });
  erro = signal(false);

  ngOnInit(): void {
    const ano = new Date().getFullYear();
    this.seo.setMetaTags({
      title: `Classificação Campeonato Brasileiro ${ano} | Palestrino Gomes`,
      description: `Tabela de classificação do Brasileirão Série A ${ano} atualizada. Veja a posição do Palmeiras e de todos os times.`,
      url: 'https://palestrinogomes.com.br/classificacao',
    });
  }

  zonaClasse(posicao: number): string {
    if (posicao <= 4) return 'zona--libertadores';
    if (posicao <= 6) return 'zona--libertadores-pre';
    if (posicao <= 12) return 'zona--sulamericana';
    if (posicao >= 18) return 'zona--rebaixamento';
    return '';
  }

  ehPalmeiras(nome: string): boolean {
    return nome.toLowerCase().includes('palmeiras');
  }
}
```

**Critério:** componente compila; TypeScript strict não aponta erros.

---

#### Tarefa 3.2 — Template HTML

**Arquivo a criar:** `src/app/features/classificacao/classificacao.component.html`

**O que fazer:** tabela semântica com `<thead>` / `<tbody>`, `aria-label` na tabela, aplicação das classes de zona por posição, destaque do Palmeiras, exibição do escudo via `NgOptimizedImage` com fallback de texto.

Estrutura de referência:

```html
<section class="classificacao">
  <h1 class="classificacao__titulo">Brasileirão Série A {{ tabela()?.temporada }}</h1>

  @if (tabela(); as t) {
    <p class="classificacao__meta">
      {{ t.rodadaAtual }}ª rodada ·
      Atualizado em {{ t.atualizadoEm | date:'dd/MM/yyyy HH:mm' }}
    </p>

    <div class="classificacao__wrapper">
      <table class="classificacao__tabela" aria-label="Tabela de classificação do Brasileirão">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col" class="col-time">Time</th>
            <th scope="col">PJ</th>
            <th scope="col">V</th>
            <th scope="col" class="col-ocultar-mobile">E</th>
            <th scope="col" class="col-ocultar-mobile">D</th>
            <th scope="col" class="col-ocultar-mobile">GP</th>
            <th scope="col" class="col-ocultar-mobile">GC</th>
            <th scope="col">SG</th>
            <th scope="col" class="col-pts">Pts</th>
          </tr>
        </thead>
        <tbody>
          @for (time of t.times; track time.posicao) {
            <tr [class]="zonaClasse(time.posicao)" [class.palmeiras]="ehPalmeiras(time.nome)">
              <td class="col-pos">{{ time.posicao }}</td>
              <td class="col-time">
                <img
                  [ngSrc]="time.escudoUrl"
                  [alt]="time.nome"
                  width="24"
                  height="24"
                  loading="lazy"
                  class="escudo"
                />
                <span class="time-nome">{{ time.nomeAbreviado }}</span>
              </td>
              <td>{{ time.jogos }}</td>
              <td>{{ time.vitorias }}</td>
              <td class="col-ocultar-mobile">{{ time.empates }}</td>
              <td class="col-ocultar-mobile">{{ time.derrotas }}</td>
              <td class="col-ocultar-mobile">{{ time.golsPro }}</td>
              <td class="col-ocultar-mobile">{{ time.golsContra }}</td>
              <td>{{ time.saldoGols > 0 ? '+' + time.saldoGols : time.saldoGols }}</td>
              <td class="col-pts">{{ time.pontos }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <p class="classificacao__fonte">
      Dados: <a href="https://www.football-data.org" target="_blank" rel="noopener">football-data.org</a>
    </p>
  } @else if (erro()) {
    <p class="classificacao__erro">Não foi possível carregar a tabela. Tente novamente em alguns minutos.</p>
  } @else {
    <div class="classificacao__loading" aria-live="polite">Carregando tabela...</div>
  }
</section>
```

**Critério:** renderiza 20 linhas com posição, escudo, nome, estatísticas e pontos. Em mobile, colunas E/D/GP/GC ficam ocultas.

---

#### Tarefa 3.3 — Estilos SCSS

**Arquivo a criar:** `src/app/features/classificacao/classificacao.component.scss`

**O que fazer:** usar tokens de `_tokens.scss`. Definir classes de zona com `border-left` colorida. Linha do Palmeiras com fundo sutil (`--color-primary-container` com opacidade 15%). Tabela com scroll horizontal em mobile.

Estrutura de referência:

```scss
@use '../../../styles/tokens' as *;

.classificacao {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--space-stack-lg) var(--space-margin-mobile);

  @media (min-width: 768px) {
    padding-inline: var(--space-margin-desktop);
  }

  &__titulo {
    font-family: var(--font-headline);
    font-size: var(--text-h2-size);
    font-weight: var(--text-h2-weight);
    text-transform: uppercase;
    color: var(--color-display-cream);
    margin-bottom: var(--space-stack-sm);
  }

  &__meta {
    font-size: var(--text-caption-size);
    color: var(--color-text-muted);
    margin-bottom: var(--space-stack-md);
  }

  &__wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: var(--radius);
    border: 1px solid var(--color-outline-variant);
  }

  &__tabela {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-body);
    font-size: var(--text-body-size);
    color: var(--color-text-primary);
    background: var(--color-surface-card);

    thead tr {
      background: var(--color-surface-container-high);
    }

    th, td {
      padding: 0.625rem 0.75rem;
      text-align: center;
      white-space: nowrap;
    }

    th {
      font-size: var(--text-label-size);
      font-weight: var(--text-label-weight);
      letter-spacing: var(--text-label-tracking);
      text-transform: uppercase;
      color: var(--color-text-muted);
      font-family: var(--font-label);
    }

    tbody tr {
      border-bottom: 1px solid var(--color-outline-variant);
      transition: background 0.15s;

      &:last-child { border-bottom: none; }
      &:hover { background: var(--color-surface-container); }
    }

    .col-time { text-align: left; }
    .col-pts { font-weight: 700; color: var(--color-primary); }
    .col-pos { color: var(--color-text-muted); font-size: var(--text-caption-size); }
  }

  // Zonas de classificação — borda esquerda colorida
  .zona--libertadores     { border-left: 3px solid var(--color-primary); }
  .zona--libertadores-pre { border-left: 3px solid color-mix(in srgb, var(--color-primary) 50%, transparent); }
  .zona--sulamericana     { border-left: 3px solid #c8a000; }
  .zona--rebaixamento     { border-left: 3px solid var(--color-error-container); }

  // Linha do Palmeiras
  .palmeiras {
    background: color-mix(in srgb, var(--color-primary-container) 12%, transparent);
    font-weight: 600;
  }

  // Escudo
  .escudo {
    width: 24px;
    height: 24px;
    object-fit: contain;
    vertical-align: middle;
    margin-right: 0.5rem;
  }

  .time-nome { vertical-align: middle; }

  // Ocultar colunas detalhadas em mobile
  @media (max-width: 599px) {
    .col-ocultar-mobile { display: none; }
  }

  &__fonte {
    margin-top: var(--space-stack-sm);
    font-size: var(--text-caption-size);
    color: var(--color-text-muted);
    text-align: right;

    a { color: var(--color-primary); }
  }

  &__erro, &__loading {
    padding: var(--space-stack-md);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-body-size);
  }
}
```

**Critério:** zonas visuais renderizadas corretamente; sem valores literais de cor ou fonte fora dos tokens.

---

### Fase 4 — Navbar e navegação

**Objetivo:** expor a nova página no menu principal.

---

#### Tarefa 4.1 — Item "Classificação" no Navbar

**Arquivo a modificar:** `src/app/shared/components/navbar/navbar.component.html`

**O que fazer:** adicionar link estático com `routerLink="/classificacao"` e `routerLinkActive="navbar__link--ativo"` **antes** do `@for` de categorias. Isso garante que "Classificação" seja o primeiro item no menu.

```html
<!-- Inserir antes do @for de categorias -->
<a
  routerLink="/classificacao"
  routerLinkActive="navbar__link--ativo"
  class="navbar__link"
>
  Classificação
</a>
```

**Nenhuma alteração necessária** em `navbar.component.ts` — é um link estático.

**Critério:** item "Classificação" aparece no menu em todas as páginas; fica com a classe `navbar__link--ativo` ao acessar `/classificacao`; menu mobile também exibe o item.

---

### Fase 5 — Qualidade e validação

**Objetivo:** garantir SSR correto, ausência de double-fetch e comportamento de erro.

---

#### Tarefa 5.1 — Validar SSR e TransferState

**O que fazer:**
1. Executar `npm run build` e `npm run serve:ssr:fed-catalogo-palestrino-gomes`
2. Acessar `http://localhost:4200/classificacao` com JavaScript desabilitado no browser
3. Verificar que a tabela está no HTML da resposta (não carregada via XHR após)
4. Com JavaScript habilitado: abrir DevTools → Network → verificar que não há requisição para `football-data.org` no browser

**Critério:** tabela visível sem JS; aba Network não mostra chamada à API externa no browser.

---

#### Tarefa 5.2 — Validar erro de API

**O que fazer:** temporariamente passar uma API key inválida no `.env` local e acessar `/classificacao`.

**Critério:** exibe a mensagem de erro amigável ("Não foi possível carregar..."); não lança exception não tratada; sem `console.error` exposto ao usuário.

---

#### Tarefa 5.3 — Validar responsividade mobile

**O que fazer:** acessar `/classificacao` em viewport 375px (iPhone SE).

**Critério:**
- Tabela com scroll horizontal; não quebra o layout da página
- Colunas E, D, GP, GC ocultas; Pos, Time, V, SG, Pts visíveis
- Nome do time legível (não truncado agressivamente)

---

## Estrutura Final de Arquivos

```
src/app/
├── app.config.ts                                  [MODIFICAR — Fase 1.2]
├── app.routes.ts                                  [MODIFICAR — Fase 1.3]
├── app.routes.server.ts                           [MODIFICAR — Fase 1.4]
│
├── core/
│   ├── models/
│   │   └── classificacao.model.ts                 [CRIAR — Fase 1.1]
│   └── services/
│       └── classificacao.service.ts               [CRIAR — Fase 2.1]
│
├── features/
│   └── classificacao/
│       ├── classificacao.component.ts             [CRIAR — Fase 3.1]
│       ├── classificacao.component.html           [CRIAR — Fase 3.2]
│       └── classificacao.component.scss           [CRIAR — Fase 3.3]
│
└── shared/
    └── components/
        └── navbar/
            └── navbar.component.html              [MODIFICAR — Fase 4.1]
```

---

## Ordem de Execução Recomendada

```
1.1 model
  └─► 1.2 HttpClient config
        └─► 2.1 ClassificacaoService
              └─► 3.1 ClassificacaoComponent (.ts)
                    ├─► 3.2 Template (.html)
                    │     └─► 3.3 Estilos (.scss)
                    └─► 1.3 + 1.4 Rotas (paralelo com 3.x)
                              └─► 4.1 Navbar
                                    └─► 5.x Validação
```

As tarefas 1.3, 1.4 (rotas) podem ser feitas em paralelo com 3.2 e 3.3, pois não dependem do template finalizado.

---

## Critérios de Aceitação Globais

- [ ] `ng build` conclui sem erros ou warnings de TypeScript
- [ ] `/classificacao` renderiza a tabela completa com 20 times via SSR (HTML no source-view)
- [ ] Nenhuma requisição para `football-data.org` aparece no DevTools do browser
- [ ] Item "Classificação" visível no navbar em todas as páginas (desktop e mobile)
- [ ] `routerLinkActive` ativo ao estar em `/classificacao`
- [ ] Posição 1–4: borda verde (Libertadores); 18–20: borda vermelha (rebaixamento)
- [ ] Linha do Palmeiras com fundo sutil destacado
- [ ] Mobile (375px): tabela scroll horizontal, colunas detalhadas ocultas
- [ ] Sem JS: tabela ainda visível (SSR funciona corretamente)
- [ ] Erro de API: mensagem amigável, sem crash

---

## Pré-condições e Dependências Bloqueantes

| Dependência | Status | Ação necessária |
|---|---|---|
| Conta em football-data.org + API key | **Pendente** | Criar conta gratuita e anotar a key |
| `FOOTBALL_DATA_API_KEY` no ambiente local | **Pendente** | Adicionar em `.env` local (não commitar) |
| `FOOTBALL_DATA_API_KEY` no Cloud Secret Manager | Pendente (pós-deploy) | Cadastrar quando Firebase App Hosting estiver ativo |
| `SeoService.setMetaTags()` aceita campo `url` | A verificar | Confirmar assinatura do método antes da Fase 3.1 |

> **Primeira tarefa recomendada:** criar conta em football-data.org, obter a key, e iniciar pela **Tarefa 1.1** (model).
