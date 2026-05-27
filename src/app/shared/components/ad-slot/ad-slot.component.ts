import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  PLATFORM_ID,
  inject,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AdFormato = 'leaderboard' | 'rectangle' | 'mobile-banner';

const ALTURAS: Record<AdFormato, string> = {
  leaderboard: '90px',
  rectangle: '250px',
  'mobile-banner': '50px',
};

declare const adsbygoogle: unknown[];

@Component({
  selector: 'app-ad-slot',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ad-slot.component.html',
  styleUrl: './ad-slot.component.scss',
})
export class AdSlotComponent implements AfterViewInit {
  slotId = input.required<string>();
  publisherId = input('');
  formato = input<AdFormato>('rectangle');

  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  @HostBinding('style.minHeight') get minHeight() {
    return ALTURAS[this.formato()];
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      try {
        (adsbygoogle || []).push({});
      } catch {
        // AdSense não carregado ainda — slot será preenchido quando o script carregar
      }
    }
  }
}
