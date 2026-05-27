import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { PostService } from '../../../core/services/post.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { TagService } from '../../../core/services/tag.service';
import { ProdutoAfiliadoService } from '../../../core/services/produto-afiliado.service';
import { Post, PostStatus } from '../../../core/models/post.model';
import { Categoria } from '../../../core/models/categoria.model';
import { ProdutoAfiliado } from '../../../core/models/produto-afiliado.model';

@Component({
  selector: 'app-admin-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './admin-editor.component.html',
  styleUrl: './admin-editor.component.scss',
})
export class AdminEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(Storage);
  private postService = inject(PostService);
  private categoriaService = inject(CategoriaService);
  private tagService = inject(TagService);
  private produtoService = inject(ProdutoAfiliadoService);

  categorias = toSignal(this.categoriaService.getTodas(), { initialValue: [] as Categoria[] });
  tags = toSignal(this.tagService.getTodas(), { initialValue: [] });
  produtos = toSignal(this.produtoService.getTodos(), { initialValue: [] as ProdutoAfiliado[] });

  postId = signal<string | null>(null);
  salvando = signal(false);
  uploading = signal(false);
  uploadProgress = signal(0);
  erro = signal('');

  titulo = signal('');
  excerpt = signal('');
  corpo = signal('');
  coverUrl = signal('');
  coverCaption = signal('');
  coverCredit = signal('');
  youtubeId = signal('');
  categoriaId = signal('');
  tagsIds = signal<string[]>([]);
  afiliadosIds = signal<string[]>([]);
  buscaAfiliado = signal('');
  status = signal<PostStatus>('rascunho');
  metaTitle = signal('');
  metaDescription = signal('');
  tempoDeLeituraMin = signal(5);

  categoriaSlugSelecionada = computed(() => {
    const cat = this.categorias().find(c => c.id === this.categoriaId());
    return cat?.slug ?? '';
  });

  produtosSelecionados = computed(() =>
    this.produtos().filter(p => this.afiliadosIds().includes(p.id)),
  );

  produtosFiltrados = computed(() => {
    const busca = this.buscaAfiliado().toLowerCase().trim();
    return this.produtos()
      .filter(p => !this.afiliadosIds().includes(p.id))
      .filter(p => !busca || p.titulo.toLowerCase().includes(busca))
      .slice(0, 8);
  });

  readonly statusOpcoes: PostStatus[] = ['rascunho', 'publicado', 'agendado'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.postId.set(id);
      this.postService.getById(id).subscribe(post => {
        if (post) this.carregarPost(post);
      });
    }
  }

  private carregarPost(post: Post): void {
    this.titulo.set(post.titulo);
    this.excerpt.set(post.excerpt);
    this.corpo.set(post.corpo);
    this.coverUrl.set(post.coverUrl);
    this.coverCaption.set(post.coverCaption ?? '');
    this.coverCredit.set(post.coverCredit ?? '');
    this.youtubeId.set(post.youtubeId ?? '');
    this.categoriaId.set(post.categoriaId);
    this.tagsIds.set(post.tags ?? []);
    this.afiliadosIds.set(post.afiliados ?? []);
    this.status.set(post.status);
    this.metaTitle.set(post.metaTitle ?? '');
    this.metaDescription.set(post.metaDescription ?? '');
    this.tempoDeLeituraMin.set(post.tempoDeLeituraMin);
  }

  async salvar(): Promise<void> {
    if (!this.titulo() || !this.categoriaId()) {
      this.erro.set('Título e categoria são obrigatórios.');
      return;
    }
    this.erro.set('');
    this.salvando.set(true);

    const slug = this.gerarSlug(this.titulo());
    const raw: Record<string, unknown> = {
      id: this.postId() ?? undefined,
      titulo: this.titulo(),
      excerpt: this.excerpt(),
      corpo: this.corpo(),
      coverUrl: this.coverUrl(),
      coverCaption: this.coverCaption() || undefined,
      coverCredit: this.coverCredit() || undefined,
      youtubeId: this.youtubeId() || undefined,
      categoriaId: this.categoriaId(),
      categoriaSlug: this.categoriaSlugSelecionada(),
      tags: this.tagsIds(),
      status: this.status(),
      metaTitle: this.metaTitle() || undefined,
      metaDescription: this.metaDescription() || undefined,
      tempoDeLeituraMin: this.tempoDeLeituraMin(),
      slug,
      publicadoEm: new Date(),
      atualizadoEm: new Date(),
      afiliados: this.afiliadosIds(),
    };
    const payload = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined),
    ) as Partial<Post> & { id?: string };

    try {
      const id = await this.postService.salvar(payload);
      this.router.navigateByUrl('/admin/posts');
    } catch (e: unknown) {
      console.error('[AdminEditor] salvar:', e);
      const msg = (e as { message?: string })?.message ?? String(e);
      this.erro.set('Erro ao salvar: ' + msg);
    } finally {
      this.salvando.set(false);
    }
  }

  async uploadCapa(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop();
    const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storageRef = ref(this.storage, path);
    const task = uploadBytesResumable(storageRef, file);

    this.uploading.set(true);
    this.uploadProgress.set(0);

    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        snap => this.uploadProgress.set(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        err => { this.erro.set('Erro no upload: ' + err.message); this.uploading.set(false); reject(err); },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          this.coverUrl.set(url);
          this.uploading.set(false);
          resolve();
        },
      );
    });
  }

  private gerarSlug(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  toggleTag(id: string): void {
    const atual = this.tagsIds();
    if (atual.includes(id)) {
      this.tagsIds.set(atual.filter(t => t !== id));
    } else {
      this.tagsIds.set([...atual, id]);
    }
  }

  toggleAfiliado(id: string): void {
    const atual = this.afiliadosIds();
    if (atual.includes(id)) {
      this.afiliadosIds.set(atual.filter(a => a !== id));
    } else {
      this.afiliadosIds.set([...atual, id]);
    }
  }
}
