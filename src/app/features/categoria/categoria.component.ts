import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, map, switchMap } from 'rxjs';
import { PostService } from '../../core/services/post.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { SeoService } from '../../core/services/seo.service';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { AdSlotComponent } from '../../shared/components/ad-slot/ad-slot.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { Post } from '../../core/models/post.model';
import { Categoria } from '../../core/models/categoria.model';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-categoria',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ArticleCardComponent, AdSlotComponent, BreadcrumbComponent, PaginationComponent],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.scss',
})
export class CategoriaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly postService = inject(PostService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly seoService = inject(SeoService);

  private readonly slug$ = this.route.params.pipe(map(p => p['categoria'] as string));

  cat = toSignal(this.slug$.pipe(switchMap(s => this.categoriaService.getBySlug(s))), {
    initialValue: undefined as Categoria | undefined,
  });

  private readonly todosPosts = toSignal(
    this.slug$.pipe(
      switchMap(slug =>
        this.categoriaService.getBySlug(slug).pipe(
          switchMap(cat => (cat ? this.postService.getPorCategoria(cat.id, 100) : EMPTY)),
        ),
      ),
    ),
    { initialValue: [] as Post[] },
  );

  paginaAtual = toSignal(this.route.queryParams.pipe(map(q => Number(q['p'] ?? 1))), {
    initialValue: 1,
  });

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.todosPosts().length / PAGE_SIZE)));

  paginados = computed(() => {
    const start = (this.paginaAtual() - 1) * PAGE_SIZE;
    return this.todosPosts().slice(start, start + PAGE_SIZE);
  });

  breadcrumb = computed<BreadcrumbItem[]>(() => [
    { label: 'Home', url: '/' },
    { label: this.cat()?.nome ?? '' },
  ]);

  ngOnInit(): void {
    const cat = this.cat();
    if (cat) {
      this.seoService.setCategoria(cat);
    }
  }
}
