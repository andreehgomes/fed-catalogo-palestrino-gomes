import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { FigurinhasAuthService } from '../services/figurinhas-auth.service';
import { FigurinhasService } from '../services/figurinhas.service';
import { AdSlotComponent } from '../../../shared/components/ad-slot/ad-slot.component';
import { FigurinhasAfiliadosComponent } from '../figurinhas-afiliados/figurinhas-afiliados.component';
import { GRUPOS_FIGURINHAS, TOTAL_FIGURINHAS } from '../data/figurinhas.data';
import { GrupoFigurinhas, TimeFigurinhas } from '../models/figurinha.model';
import { EMPTY, Subject } from 'rxjs';
import { debounceTime, filter, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-figurinhas-album',
  standalone: true,
  imports: [FormsModule, AdSlotComponent, FigurinhasAfiliadosComponent],
  templateUrl: './figurinhas-album.component.html',
  styleUrl: './figurinhas-album.component.scss',
})
export class FigurinhasAlbumComponent {
  private authService = inject(FigurinhasAuthService);
  private figurinhasService = inject(FigurinhasService);
  private router = inject(Router);

  readonly grupos = GRUPOS_FIGURINHAS;
  readonly totalFigurinhas = TOTAL_FIGURINHAS;

  grupoAtivo = signal<string>('FWC');
  quantidade = signal<Record<string, number>>({});
  whatsappInput = signal('');
  cidadeInput = signal('');
  aceitaTrocaInput = signal(false);
  popoverAberto = signal(false);
  carregando = signal(true);
  salvando = signal(false);

  private salvar$ = new Subject<void>();

  grupoAtivoData = computed<GrupoFigurinhas>(
    () => this.grupos.find(g => g.grupo === this.grupoAtivo())!,
  );

  // Filtro por código/nome do país (ex: "BRA" ou "Brasil")
  filtroPais = signal('');

  private timesFiltrados = computed<TimeFigurinhas[] | null>(() => {
    const f = this.filtroPais().trim().toUpperCase();
    if (!f) return null;
    return this.grupos.flatMap(g =>
      g.times.filter(
        t => t.sigla.startsWith(f) || t.pais.toUpperCase().includes(f),
      ),
    );
  });

  filtrando = computed(() => this.timesFiltrados() !== null);

  // Times exibidos na área de conteúdo: resultado do filtro ou o grupo ativo
  timesExibidos = computed<TimeFigurinhas[]>(
    () => this.timesFiltrados() ?? this.grupoAtivoData().times,
  );

  tituloConteudo = computed(() => {
    const filtrados = this.timesFiltrados();
    if (filtrados === null) return this.grupoAtivoData().nome;
    if (!filtrados.length) return 'Nenhum país encontrado';
    return `${filtrados.length} seleç${filtrados.length > 1 ? 'ões' : 'ão'} encontrada${filtrados.length > 1 ? 's' : ''}`;
  });

  limparFiltro(): void {
    this.filtroPais.set('');
  }

  totalTenho = computed(() =>
    Object.values(this.quantidade()).filter(q => q >= 1).length,
  );
  totalRepetidas = computed(() =>
    Object.values(this.quantidade()).filter(q => q >= 2).length,
  );
  totalFaltando = computed(() => this.totalFigurinhas - this.totalTenho());

  constructor() {
    // Espera o Firebase Auth resolver (undefined = ainda carregando, null = não logado, User = logado)
    toObservable(this.authService.usuario)
      .pipe(
        filter(u => u !== undefined),
        take(1),
        switchMap(user => {
          const isGoogle = user?.providerData?.some(p => p.providerId === 'google.com');
          if (!isGoogle) {
            this.router.navigate(['/figurinhas/login']);
            this.carregando.set(false);
            return EMPTY;
          }
          return this.figurinhasService.meuPerfil(user!.uid).pipe(take(1));
        }),
      )
      .subscribe(perfil => {
        if (perfil?.whatsapp) this.whatsappInput.set(perfil.whatsapp);
        if (perfil?.cidade) this.cidadeInput.set(perfil.cidade);
        this.aceitaTrocaInput.set(perfil?.aceitaTroca ?? false);
        if (perfil?.quantidade) {
          this.quantidade.set({ ...perfil.quantidade });
        } else if (perfil?.tenho) {
          // migração de perfis antigos sem campo quantidade
          const qtd: Record<string, number> = {};
          perfil.tenho.forEach(c => (qtd[c] = 1));
          perfil.repetidas?.forEach(c => (qtd[c] = 2));
          this.quantidade.set(qtd);
        }
        this.carregando.set(false);
      });

    this.salvar$
      .pipe(
        debounceTime(800),
        switchMap(() => {
          this.salvando.set(true);
          const user = this.authService.usuario()!;
          const qtd = this.quantidade();
          const tenho = Object.keys(qtd).filter(c => qtd[c] >= 1);
          const repetidas = Object.keys(qtd).filter(c => qtd[c] >= 2);
          const whatsapp = this.whatsappInput().trim();
          const cidade = this.cidadeInput().trim();
          return this.figurinhasService.salvar({
            uid: user.uid,
            displayName: user.displayName ?? 'Usuário',
            photoURL: user.photoURL,
            email: user.email ?? '',
            ...(whatsapp ? { whatsapp } : {}),
            ...(cidade ? { cidade } : {}),
            aceitaTroca: this.aceitaTrocaInput(),
            quantidade: qtd,
            tenho,
            repetidas,
          });
        }),
      )
      .subscribe(() => this.salvando.set(false));
  }

  qtdFigurinha(codigo: string): number {
    return this.quantidade()[codigo] ?? 0;
  }

  estadoFigurinha(codigo: string): 'vazia' | 'tenho' | 'repetida' {
    const q = this.qtdFigurinha(codigo);
    if (q >= 2) return 'repetida';
    if (q === 1) return 'tenho';
    return 'vazia';
  }

  incrementar(codigo: string, event: Event): void {
    event.stopPropagation();
    const atual = this.qtdFigurinha(codigo);
    this.quantidade.set({ ...this.quantidade(), [codigo]: atual + 1 });
    this.salvar$.next();
  }

  decrementar(codigo: string, event: Event): void {
    event.stopPropagation();
    const atual = this.qtdFigurinha(codigo);
    if (atual <= 0) return;
    const novo = { ...this.quantidade() };
    if (atual === 1) {
      delete novo[codigo];
    } else {
      novo[codigo] = atual - 1;
    }
    this.quantidade.set(novo);
    this.salvar$.next();
  }

  agendarSalvamento(): void {
    this.salvar$.next();
  }

  onAceitaTrocaChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.aceitaTrocaInput.set(checked);
    this.agendarSalvamento();
  }

  togglePopover(): void {
    this.popoverAberto.set(!this.popoverAberto());
  }

  mascaraCelular(event: Event): void {
    const el = event.target as HTMLInputElement;
    const digits = el.value.replace(/\D/g, '').slice(0, 11);
    let v = '';
    if (digits.length > 0) v = `(${digits.slice(0, 2)}`;
    if (digits.length > 2) v += `) ${digits.slice(2, 7)}`;
    if (digits.length > 7) v += `-${digits.slice(7, 11)}`;
    el.value = v;
    this.whatsappInput.set(v);
    this.agendarSalvamento();
  }

  selecionarGrupo(grupo: string): void {
    this.grupoAtivo.set(grupo);
  }

  progressoGrupo(grupo: GrupoFigurinhas): number {
    const todos = grupo.times.flatMap(t => t.codigos);
    const tenho = todos.filter(c => this.qtdFigurinha(c) >= 1).length;
    return Math.round((tenho / todos.length) * 100);
  }

  siglasGrupo(grupo: GrupoFigurinhas): string {
    return grupo.times.map(t => t.sigla).join(' · ');
  }
}
