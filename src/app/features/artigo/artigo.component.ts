import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { EMPTY, combineLatest, map, switchMap } from 'rxjs';
import { PostService } from '../../core/services/post.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { ProdutoAfiliadoService } from '../../core/services/produto-afiliado.service';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { AdSlotComponent } from '../../shared/components/ad-slot/ad-slot.component';
import { AffiliateCardComponent } from '../../shared/components/affiliate-card/affiliate-card.component';
import { YouTubeEmbedComponent } from '../../shared/components/youtube-embed/youtube-embed.component';
import { CompactCardComponent } from '../../shared/components/compact-card/compact-card.component';
import { Post } from '../../core/models/post.model';
import { Categoria } from '../../core/models/categoria.model';
import { ProdutoAfiliado } from '../../core/models/produto-afiliado.model';

@Component({
  selector: 'app-artigo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    BreadcrumbComponent,
    AdSlotComponent,
    AffiliateCardComponent,
    YouTubeEmbedComponent,
    CompactCardComponent,
  ],
  templateUrl: './artigo.component.html',
  styleUrl: './artigo.component.scss',
})
export class ArtigoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly postService = inject(PostService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly produtoService = inject(ProdutoAfiliadoService);
  private readonly seoService = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly params$ = this.route.params;

  post = toSignal(
    this.params$.pipe(
      map(p => p['slug'] as string),
      switchMap(slug => this.postService.getBySlug(slug)),
    ),
    { initialValue: undefined as Post | undefined },
  );

  cat = toSignal(
    this.params$.pipe(
      map(p => p['categoria'] as string),
      switchMap(slug => this.categoriaService.getBySlug(slug)),
    ),
    { initialValue: undefined as Categoria | undefined },
  );

  afiliados = toSignal(
    this.params$.pipe(
      map(p => p['slug'] as string),
      switchMap(slug =>
        this.postService.getBySlug(slug).pipe(
          switchMap(post =>
            post?.afiliados?.length
              ? combineLatest(post.afiliados.map(id => this.produtoService.getById(id)))
              : EMPTY,
          ),
          map(lista => lista.filter((p): p is ProdutoAfiliado => p !== undefined)),
        ),
      ),
    ),
    { initialValue: [] as ProdutoAfiliado[] },
  );

  relacionados = toSignal(
    this.params$.pipe(
      map(p => p['categoria'] as string),
      switchMap(slug =>
        this.categoriaService.getBySlug(slug).pipe(
          switchMap(cat =>
            cat ? this.postService.getPorCategoria(cat.id, 4) : EMPTY,
          ),
        ),
      ),
      map(posts => posts.slice(0, 3)),
    ),
    { initialValue: [] as Post[] },
  );

  corpoSafe = computed(() =>
    this.post()?.corpo
      ? this.sanitizer.bypassSecurityTrustHtml(this.post()!.corpo)
      : '',
  );

  breadcrumb = computed<BreadcrumbItem[]>(() => [
    { label: 'Home', url: '/' },
    { label: this.cat()?.nome ?? '', url: this.cat() ? `/${this.cat()!.slug}` : undefined },
    { label: this.post()?.titulo ?? '' },
  ]);

  constructor() {
    // effect() em vez de ngOnInit: os dados chegam async do Firestore,
    // então no ngOnInit post()/cat() ainda são undefined e o SEO nunca era aplicado.
    effect(() => {
      const post = this.post();
      const cat = this.cat();
      if (post && cat) {
        this.seoService.setArtigo(post, cat.slug);
        this.seoService.addArtigoJsonLd(post, cat.slug, cat.nome);
      }
    });
  }

  shareWhatsApp = computed(() => {
    const post = this.post();
    const cat = this.cat();
    if (!post || !cat) return '#';
    const url = `https://palestrinogomes.com.br/${cat.slug}/${post.slug}`;
    return `https://wa.me/?text=${encodeURIComponent(post.titulo + ' ' + url)}`;
  });

  shareX = computed(() => {
    const post = this.post();
    const cat = this.cat();
    if (!post || !cat) return '#';
    const url = `https://palestrinogomes.com.br/${cat.slug}/${post.slug}`;
    return `https://x.com/intent/tweet?text=${encodeURIComponent(post.titulo)}&url=${encodeURIComponent(url)}`;
  });

  copiarLink(): void {
    const post = this.post();
    const cat = this.cat();
    if (!post || !cat) return;
    const url = `https://palestrinogomes.com.br/${cat.slug}/${post.slug}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }
}
