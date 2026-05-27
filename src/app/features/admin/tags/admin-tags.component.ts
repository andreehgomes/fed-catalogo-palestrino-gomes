import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TagService } from '../../../core/services/tag.service';
import { Tag } from '../../../core/models/tag.model';
import { AdminTabelaComponent, AdminColuna } from '../shared/admin-tabela/admin-tabela.component';

@Component({
  selector: 'app-admin-tags',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AdminTabelaComponent],
  templateUrl: './admin-tags.component.html',
  styleUrl: './admin-tags.component.scss',
})
export class AdminTagsComponent {
  private service = inject(TagService);

  tags = toSignal(this.service.getTodas(), { initialValue: [] as Tag[] });
  linhas = computed(() => this.tags() as unknown as Record<string, unknown>[]);
  editando = signal<Tag | null>(null);
  salvando = signal(false);

  readonly colunas: AdminColuna[] = [
    { chave: 'nome', label: 'Nome' },
    { chave: 'slug', label: 'Slug' },
  ];

  novoNome = signal('');
  novoSlug = signal('');

  iniciarEdicao(tag: Tag | Record<string, unknown>): void {
    const t = tag as Tag;
    this.editando.set({ ...t });
    this.novoNome.set(t.nome);
    this.novoSlug.set(t.slug);
  }

  cancelar(): void {
    this.editando.set(null);
    this.limpar();
  }

  async salvar(): Promise<void> {
    if (!this.novoNome()) return;
    this.salvando.set(true);
    try {
      await this.service.salvar({
        id: this.editando()?.id,
        nome: this.novoNome(),
        slug: this.novoSlug() || this.gerarSlug(this.novoNome()),
      });
      this.editando.set(null);
      this.limpar();
    } finally {
      this.salvando.set(false);
    }
  }

  async excluir(id: string): Promise<void> {
    if (!confirm('Excluir esta tag?')) return;
    await this.service.excluir(id);
  }

  private limpar(): void {
    this.novoNome.set('');
    this.novoSlug.set('');
  }

  private gerarSlug(nome: string): string {
    return nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  }
}
