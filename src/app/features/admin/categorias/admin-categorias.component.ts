import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Categoria, Pilar } from '../../../core/models/categoria.model';
import { AdminTabelaComponent, AdminColuna } from '../shared/admin-tabela/admin-tabela.component';

const PILARES: Pilar[] = ['analises', 'taticas', 'opiniao', 'historia'];

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AdminTabelaComponent],
  templateUrl: './admin-categorias.component.html',
  styleUrl: './admin-categorias.component.scss',
})
export class AdminCategoriasComponent {
  private service = inject(CategoriaService);

  categorias = toSignal(this.service.getTodas(), { initialValue: [] as Categoria[] });
  linhas = computed(() => this.categorias() as unknown as Record<string, unknown>[]);
  editando = signal<Categoria | null>(null);

  readonly colunas: AdminColuna[] = [
    { chave: 'nome', label: 'Nome' },
    { chave: 'slug', label: 'Slug' },
    { chave: 'pilar', label: 'Pilar', width: '120px', tipo: 'badge-pilar' },
  ];
  salvando = signal(false);
  readonly pilares = PILARES;

  novoNome = signal('');
  novoSlug = signal('');
  novaDescricao = signal('');
  novoPilar = signal<Pilar>('analises');

  iniciarEdicao(cat: Categoria | Record<string, unknown>): void {
    const c = cat as Categoria;
    this.editando.set({ ...c });
    this.novoNome.set(c.nome);
    this.novoSlug.set(c.slug);
    this.novaDescricao.set(c.descricao);
    this.novoPilar.set(c.pilar);
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
        descricao: this.novaDescricao(),
        pilar: this.novoPilar(),
      });
      this.editando.set(null);
      this.limpar();
    } finally {
      this.salvando.set(false);
    }
  }

  async excluir(id: string): Promise<void> {
    if (!confirm('Excluir esta categoria?')) return;
    await this.service.excluir(id);
  }

  private limpar(): void {
    this.novoNome.set('');
    this.novoSlug.set('');
    this.novaDescricao.set('');
    this.novoPilar.set('analises');
  }

  private gerarSlug(nome: string): string {
    return nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  }
}
