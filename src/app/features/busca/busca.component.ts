import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PostService } from '../../core/services/post.service';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { Post } from '../../core/models/post.model';

@Component({
  selector: 'app-busca',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ArticleCardComponent],
  templateUrl: './busca.component.html',
  styleUrl: './busca.component.scss',
})
export class BuscaComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  termo = '';
  carregando = signal(false);
  resultados = signal<Post[]>([]);

  private readonly queryTermo = toSignal(
    this.route.queryParams.pipe(map(q => (q['q'] as string) ?? '')),
    { initialValue: '' },
  );

  ngOnInit(): void {
    this.termo = this.queryTermo();
    if (this.termo) {
      this.executarBusca(this.termo);
    }
  }

  buscar(): void {
    this.router.navigate([], {
      queryParams: { q: this.termo || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    if (this.termo.length > 2) {
      this.executarBusca(this.termo);
    } else {
      this.resultados.set([]);
    }
  }

  private executarBusca(termo: string): void {
    this.carregando.set(true);
    this.postService.getPublicados(100).subscribe({
      next: posts => {
        const lower = termo.toLowerCase();
        this.resultados.set(
          posts.filter(
            p =>
              p.titulo.toLowerCase().includes(lower) ||
              p.excerpt?.toLowerCase().includes(lower),
          ),
        );
        this.carregando.set(false);
      },
      error: () => {
        this.resultados.set([]);
        this.carregando.set(false);
      },
    });
  }
}
