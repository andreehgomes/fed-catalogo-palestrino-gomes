import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { CopaService } from '../../core/services/copa.service';
import { CopaData, FaseCopa } from '../../core/models/copa.model';
import { SeoService } from '../../core/services/seo.service';

type Aba = 'grupos' | 'jogos' | 'mata-mata';

@Component({
  selector: 'app-copa',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './copa.component.html',
  styleUrl: './copa.component.scss',
})
export class CopaComponent {
  private readonly service = inject(CopaService);
  private readonly seo = inject(SeoService);

  readonly copa = signal<CopaData | null>(null);
  readonly erro = signal(false);
  readonly aba = signal<Aba>('grupos');
  readonly busca = signal('');

  readonly temGrupos = computed(() => (this.copa()?.grupos.length ?? 0) > 0);
  readonly temMataMata = computed(() => (this.copa()?.mataMata.length ?? 0) > 0);

  // Grupos filtrados pelo país pesquisado: mostra apenas o(s) grupo(s) que
  // contêm uma seleção cujo nome casa com a busca.
  readonly gruposFiltrados = computed(() => {
    const c = this.copa();
    if (!c) return [];
    const q = this.normaliza(this.busca());
    if (!q) return c.grupos;
    return c.grupos.filter(g => g.times.some(t => this.normaliza(t.nome).includes(q)));
  });

  readonly rodadasGruposFiltradas = computed(() => {
    const c = this.copa();
    return c ? this.filtrarFases(c.rodadasGrupos) : [];
  });

  readonly mataMataFiltrado = computed(() => {
    const c = this.copa();
    return c ? this.filtrarFases(c.mataMata) : [];
  });

  constructor() {
    this.seo.setCopa();

    this.service
      .obterCopa()
      .pipe(
        catchError(() => {
          this.erro.set(true);
          return EMPTY;
        }),
        takeUntilDestroyed(),
      )
      .subscribe(c => {
        this.copa.set(c);
        if (!c.grupos.length && c.rodadasGrupos.length) this.aba.set('jogos');
      });
  }

  selecionar(aba: Aba): void {
    this.aba.set(aba);
  }

  atualizarBusca(valor: string): void {
    this.busca.set(valor);
  }

  limparBusca(): void {
    this.busca.set('');
  }

  // Remove acentos e caixa para uma busca tolerante (ex.: "mexico" acha "México").
  private normaliza(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }

  private filtrarFases(fases: FaseCopa[]): FaseCopa[] {
    const q = this.normaliza(this.busca());
    if (!q) return fases;
    return fases
      .map(f => ({
        ...f,
        jogos: f.jogos.filter(
          j => this.normaliza(j.timeCasa).includes(q) || this.normaliza(j.timeFora).includes(q),
        ),
      }))
      .filter(f => f.jogos.length > 0);
  }

  ehBrasil(nome: string): boolean {
    const n = nome.toLowerCase();
    return n.includes('brazil') || n.includes('brasil');
  }

  zonaClasse(posicao: number): string {
    if (posicao <= 2) return 'zona--classificado';
    if (posicao === 3) return 'zona--repescagem';
    return '';
  }
}
