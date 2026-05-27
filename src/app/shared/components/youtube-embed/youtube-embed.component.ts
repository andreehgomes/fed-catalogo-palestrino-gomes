import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

function extrairYoutubeId(valor: string): string {
  try {
    const url = new URL(valor);
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('?')[0];
    if (url.searchParams.has('v')) return url.searchParams.get('v')!;
    if (url.pathname.startsWith('/embed/')) return url.pathname.split('/embed/')[1].split('?')[0];
  } catch {
    // não é uma URL — assume que já é o ID
  }
  return valor.trim();
}

@Component({
  selector: 'app-youtube-embed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './youtube-embed.component.html',
  styleUrl: './youtube-embed.component.scss',
})
export class YouTubeEmbedComponent {
  videoId = input.required<string>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  reproduzindo = signal(false);

  private resolvedId = computed(() => extrairYoutubeId(this.videoId()));

  thumbUrl = computed(() => `https://img.youtube.com/vi/${this.resolvedId()}/hqdefault.jpg`);
  embedUrl = computed(() => {
    const origin = this.document.location.origin;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.resolvedId()}?autoplay=1&mute=1&origin=${origin}`,
    );
  });

  reproduzir(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.reproduzindo.set(true);
    }
  }
}
