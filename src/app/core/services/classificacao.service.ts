import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ClassificacaoTabela, ClassificacaoTime } from '../models/classificacao.model';
import { SSR_ORIGIN } from '../tokens/ssr-origin.token';

const CLASSIFICACAO_KEY = makeStateKey<ClassificacaoTabela>('classificacao');
const TTL_MS = 2 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class ClassificacaoService {
  private readonly http = inject(HttpClient);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ssrOrigin = inject(SSR_ORIGIN, { optional: true }) ?? '';

  private readonly _cache = signal<{ data: ClassificacaoTabela; ts: number } | null>(null);

  obterTabela(): Observable<ClassificacaoTabela> {
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

    // SSR: usa http://localhost:PORT/api/classificacao (proxy local com cache Firebase)
    // Browser: usa /api/classificacao (mesmo proxy, ssrOrigin é string vazia)
    return this.http.get<any>(`${this.ssrOrigin}/api/classificacao`).pipe(
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
      temporada: Number(res.season?.startDate?.substring(0, 4) ?? new Date().getFullYear()),
      rodadaAtual: res.season?.currentMatchday ?? 0,
      atualizadoEm: new Date(),
      times,
    };
  }
}
