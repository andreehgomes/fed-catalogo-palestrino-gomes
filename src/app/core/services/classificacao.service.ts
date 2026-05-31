import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ClassificacaoTabela, ClassificacaoTime } from '../models/classificacao.model';

const CLASSIFICACAO_KEY = makeStateKey<ClassificacaoTabela>('classificacao');
const TTL_MS = 2 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class ClassificacaoService {
  private readonly http = inject(HttpClient);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);

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
      // Navegação client-side: usa proxy para evitar CORS
      return this.http.get<any>('/api/classificacao').pipe(
        map(res => this.mapear(res)),
        tap(tabela => this._cache.set({ data: tabela, ts: Date.now() })),
      );
    }

    // Servidor: chama a API diretamente e popula o TransferState
    const apiKey = process.env['FOOTBALL_DATA_API_KEY'] ?? '';
    return this.http
      .get<any>('https://api.football-data.org/v4/competitions/BSA/standings', {
        headers: { 'X-Auth-Token': apiKey },
      })
      .pipe(
        map(res => this.mapear(res)),
        tap(tabela => {
          this._cache.set({ data: tabela, ts: Date.now() });
          this.transferState.set(CLASSIFICACAO_KEY, tabela);
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
