import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProdutoAfiliadoService } from '../../../core/services/produto-afiliado.service';
import { ProdutoAfiliado } from '../../../core/models/produto-afiliado.model';
import { AdminTabelaComponent, AdminColuna } from '../shared/admin-tabela/admin-tabela.component';

@Component({
  selector: 'app-admin-afiliados',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AdminTabelaComponent],
  templateUrl: './admin-afiliados.component.html',
  styleUrl: './admin-afiliados.component.scss',
})
export class AdminAfiliadosComponent {
  private service = inject(ProdutoAfiliadoService);

  produtos = toSignal(this.service.getTodos(), { initialValue: [] as ProdutoAfiliado[] });
  linhas = computed(() => this.produtos() as unknown as Record<string, unknown>[]);
  editando = signal<ProdutoAfiliado | null>(null);

  readonly colunas: AdminColuna[] = [
    { chave: 'titulo', label: 'Título' },
    { chave: 'preco', label: 'Preço', width: '120px', tipo: 'moeda' },
  ];
  salvando = signal(false);

  novoTitulo = signal('');
  novaImagemUrl = signal('');
  novoPreco = signal(0);
  novoLink = signal('');
  novoDisclosure = signal('Links de afiliado — ao comprar, podemos receber comissão sem custo para você.');

  iniciarEdicao(p: ProdutoAfiliado | Record<string, unknown>): void {
    const prod = p as ProdutoAfiliado;
    this.editando.set({ ...prod });
    this.novoTitulo.set(prod.titulo);
    this.novaImagemUrl.set(prod.imagemUrl);
    this.novoPreco.set(prod.preco);
    this.novoLink.set(prod.linkAfiliado);
    this.novoDisclosure.set(prod.disclosure);
  }

  cancelar(): void {
    this.editando.set(null);
    this.limpar();
  }

  async salvar(): Promise<void> {
    if (!this.novoTitulo() || !this.novoLink()) return;
    this.salvando.set(true);
    try {
      await this.service.salvar({
        id: this.editando()?.id,
        titulo: this.novoTitulo(),
        imagemUrl: this.novaImagemUrl(),
        preco: this.novoPreco(),
        linkAfiliado: this.novoLink(),
        disclosure: this.novoDisclosure(),
      });
      this.editando.set(null);
      this.limpar();
    } finally {
      this.salvando.set(false);
    }
  }

  async excluir(id: string): Promise<void> {
    if (!confirm('Excluir este produto?')) return;
    await this.service.excluir(id);
  }

  private limpar(): void {
    this.novoTitulo.set('');
    this.novaImagemUrl.set('');
    this.novoPreco.set(0);
    this.novoLink.set('');
    this.novoDisclosure.set('Links de afiliado — ao comprar, podemos receber comissão sem custo para você.');
  }
}
