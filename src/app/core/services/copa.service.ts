import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CopaData } from '../models/copa.model';
import { SSR_ORIGIN } from '../tokens/ssr-origin.token';

const COPA_KEY = makeStateKey<CopaData>('copa');
const TTL_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class CopaService {
  private readonly http = inject(HttpClient);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ssrOrigin = inject(SSR_ORIGIN, { optional: true }) ?? '';

  private readonly _cache = signal<{ data: CopaData; ts: number } | null>(null);

  obterCopa(): Observable<CopaData> {
    if (!isPlatformServer(this.platformId)) {
      const transferido = this.transferState.get(COPA_KEY, null);
      if (transferido) {
        this.transferState.remove(COPA_KEY);
        this._cache.set({ data: transferido, ts: Date.now() });
        return of(transferido);
      }
      const cached = this._cache();
      if (cached && Date.now() - cached.ts < TTL_MS) {
        return of(cached.data);
      }
    }

    // SSR: http://localhost:PORT/api/copa (proxy local). Browser: /api/copa.
    return this.http.get<CopaData>(`${this.ssrOrigin}/api/copa`).pipe(
      tap(data => {
        this._cache.set({ data, ts: Date.now() });
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(COPA_KEY, data);
        }
      }),
    );
  }
}
