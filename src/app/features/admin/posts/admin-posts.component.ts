import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { Post, PostStatus } from '../../../core/models/post.model';
import { AdminTabelaComponent, AdminColuna } from '../shared/admin-tabela/admin-tabela.component';

type Filtro = PostStatus | 'todos';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AdminTabelaComponent],
  templateUrl: './admin-posts.component.html',
  styleUrl: './admin-posts.component.scss',
})
export class AdminPostsComponent {
  private postService = inject(PostService);

  todos = toSignal(this.postService.getTodos(), { initialValue: [] as Post[] });
  filtroAtivo = signal<Filtro>('todos');

  filtrados = computed<Post[]>(() => {
    const f = this.filtroAtivo();
    if (f === 'todos') return this.todos();
    return this.todos().filter(p => p.status === f);
  });

  linhas = computed(() => this.filtrados() as unknown as Record<string, unknown>[]);

  readonly colunas: AdminColuna[] = [
    { chave: 'titulo', label: 'Título' },
    { chave: 'destaque', label: '', width: '110px', tipo: 'flag-destaque' },
    { chave: 'status', label: 'Status', width: '130px', tipo: 'badge-status' },
    { chave: 'publicadoEm', label: 'Publicado em', width: '150px', tipo: 'data' },
  ];

  readonly editLink = (linha: Record<string, unknown>) =>
    ['/admin/posts', linha['id'], 'editar'];

  readonly filtros: { valor: Filtro; label: string }[] = [
    { valor: 'todos', label: 'Todos' },
    { valor: 'publicado', label: 'Publicados' },
    { valor: 'rascunho', label: 'Rascunhos' },
    { valor: 'agendado', label: 'Agendados' },
  ];

  setFiltro(f: Filtro): void {
    this.filtroAtivo.set(f);
  }

  async excluir(id: string): Promise<void> {
    if (!confirm('Excluir este post permanentemente?')) return;
    await this.postService.excluir(id);
  }
}
