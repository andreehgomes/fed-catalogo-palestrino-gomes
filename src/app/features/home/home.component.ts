import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { PostService } from '../../core/services/post.service';
import { SeoService } from '../../core/services/seo.service';
import { HeroCardComponent } from '../../shared/components/hero-card/hero-card.component';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { AdSlotComponent } from '../../shared/components/ad-slot/ad-slot.component';
import { Post } from '../../core/models/post.model';
import { Pilar } from '../../core/models/categoria.model';

const PILARES: { pilar: Pilar; label: string }[] = [
  { pilar: 'analises', label: 'Análises' },
  { pilar: 'taticas', label: 'Táticas' },
  { pilar: 'opiniao', label: 'Opinião' },
  { pilar: 'historia', label: 'História' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroCardComponent, ArticleCardComponent, AdSlotComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly seoService = inject(SeoService);

  readonly pilares = PILARES;

  private readonly todos = toSignal(
    this.postService.getPublicados(50).pipe(
      catchError(err => { console.error('[Home] getPublicados:', err); return of([] as Post[]); }),
    ),
    { initialValue: [] as Post[] },
  );

  destaque = computed(() => this.todos().find(p => p.destaque) ?? this.todos()[0] ?? null);
  recentes = computed(() => this.todos().slice(0, 8));

  ngOnInit(): void {
    this.seoService.setHome();
  }

  pilarDoPost(_post: Post): Pilar {
    return 'analises';
  }

  postsPorPilar(pilar: Pilar): Post[] {
    return this.todos()
      .filter(p => p.categoriaSlug?.toLowerCase().includes(pilar))
      .slice(0, 4);
  }
}
