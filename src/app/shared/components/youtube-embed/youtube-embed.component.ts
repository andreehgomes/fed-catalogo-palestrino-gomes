import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

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

  reproduzindo = signal(false);

  thumbUrl = computed(() => `https://img.youtube.com/vi/${this.videoId()}/hqdefault.jpg`);
  embedUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.videoId()}?autoplay=1`,
    ),
  );

  reproduzir(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.reproduzindo.set(true);
    }
  }
}
