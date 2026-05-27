import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  inject,
  output,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

const CHAVE_STORAGE = 'cookie_consent';

export type ConsentimentoValor = 'aceito' | 'recusado';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.scss',
})
export class CookieBannerComponent {
  consentimentoEmitido = output<ConsentimentoValor>();

  private readonly platformId = inject(PLATFORM_ID);

  visivel = signal(this.deveExibir());

  aceitar(): void {
    this.salvar('aceito');
    this.consentimentoEmitido.emit('aceito');
    this.visivel.set(false);
  }

  recusar(): void {
    this.salvar('recusado');
    this.consentimentoEmitido.emit('recusado');
    this.visivel.set(false);
  }

  private deveExibir(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !localStorage.getItem(CHAVE_STORAGE);
  }

  private salvar(valor: ConsentimentoValor): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(CHAVE_STORAGE, valor);
    }
  }
}
