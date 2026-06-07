import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import {
  CookieBannerComponent,
  ConsentimentoValor,
} from './shared/components/cookie-banner/cookie-banner.component';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CookieBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private analytics = inject(AnalyticsService);
  private router = inject(Router);

  private url = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)),
    { initialValue: null },
  );

  isAdmin = computed(() => {
    const event = this.url();
    const url = event instanceof NavigationEnd ? event.urlAfterRedirects : this.router.url;
    return url.startsWith('/admin');
  });

  // Rotas de figurinhas têm layout próprio (header full-width + container interno),
  // então ficam fora do main-content do shell.
  isFigurinhas = computed(() => {
    const event = this.url();
    const url = event instanceof NavigationEnd ? event.urlAfterRedirects : this.router.url;
    return url.startsWith('/figurinhas');
  });

  onConsentimento(valor: ConsentimentoValor): void {
    if (valor === 'aceito') {
      this.analytics.ativar('G-XXXXXXXXXX');
    }
  }
}
