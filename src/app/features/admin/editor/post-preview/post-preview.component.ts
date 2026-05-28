import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Post } from '../../../../core/models/post.model';
import { ProdutoAfiliado } from '../../../../core/models/produto-afiliado.model';
import { YouTubeEmbedComponent } from '../../../../shared/components/youtube-embed/youtube-embed.component';
import { AffiliateCardComponent } from '../../../../shared/components/affiliate-card/affiliate-card.component';

@Component({
  selector: 'app-post-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, YouTubeEmbedComponent, AffiliateCardComponent],
  templateUrl: './post-preview.component.html',
  styleUrl: './post-preview.component.scss',
})
export class PostPreviewComponent {
  private readonly sanitizer = inject(DomSanitizer);

  post = input.required<Post>();
  categoriaNome = input('');
  afiliados = input<ProdutoAfiliado[]>([]);

  corpoSafe = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.post().corpo ?? ''),
  );
}
