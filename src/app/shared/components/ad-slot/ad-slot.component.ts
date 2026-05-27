import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  PLATFORM_ID,
  ViewChild,
  inject,
  input,
  signal,
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
  publisherId = input('ca-pub-8924296256560362');
  formato = input<AdFormato>('rectangle');

  @ViewChild('insEl') insEl?: ElementRef<HTMLElement>;

  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly visible = signal(false);

  @HostBinding('style.display') get display() {
    if (!this.isBrowser) return '';
    return this.visible() ? '' : 'none';
  }

  @HostBinding('style.minHeight') get minHeight() {
    if (!this.isBrowser) return ALTURAS[this.formato()];
    return this.visible() ? ALTURAS[this.formato()] : '0';
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    try {
      (adsbygoogle || []).push({});
    } catch {
      // script ainda não carregou
    }

    const ins = this.insEl?.nativeElement;
    if (!ins) return;

    const observer = new MutationObserver(() => {
      const status = ins.getAttribute('data-ad-status');
      if (status === 'filled') {
        this.visible.set(true);
        observer.disconnect();
      } else if (status === 'unfilled') {
        observer.disconnect();
      }
    });

    observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });

    // se após 5s o AdSense não respondeu (conta pendente, bloqueador), mantém oculto
    setTimeout(() => observer.disconnect(), 5000);
  }
}
