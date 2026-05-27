import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

declare const gtag: (...args: unknown[]) => void;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  private ativo = false;

  ativar(measurementId: string): void {
    if (!isPlatformBrowser(this.platformId) || this.ativo) return;
    this.ativo = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer ?? [];
    // eslint-disable-next-line prefer-rest-params
    window.gtag = function (..._args: unknown[]) { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', measurementId);

    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(e => {
        gtag('event', 'page_view', { page_path: (e as NavigationEnd).urlAfterRedirects });
      });
  }

  trackEvent(acao: string, categoria: string, rotulo?: string): void {
    if (!isPlatformBrowser(this.platformId) || !this.ativo) return;
    gtag('event', acao, { event_category: categoria, event_label: rotulo });
  }
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
