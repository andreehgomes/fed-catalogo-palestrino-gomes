import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FigurinhasAuthService } from '../services/figurinhas-auth.service';
import { FigurinhasService } from '../services/figurinhas.service';
import { FigurinhasUsuario } from '../models/figurinha.model';
import { TODOS_CODIGOS } from '../data/figurinhas.data';
import { AdSlotComponent } from '../../../shared/components/ad-slot/ad-slot.component';
import { FigurinhasAfiliadosComponent } from '../figurinhas-afiliados/figurinhas-afiliados.component';
import { EMPTY } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

interface FigurinhaQtd { codigo: string; qty: number; }

interface ResultadoTroca {
  usuario: FigurinhasUsuario;
  TemOQuePreciso: FigurinhaQtd[];
  EuTenhoOQuePrecisa: FigurinhaQtd[];
  whatsappHref: string | null;
  emailHref: string;
}

type Modo = 'codigo' | 'parceiros';

@Component({
  selector: 'app-figurinhas-trocar',
  standalone: true,
  imports: [FormsModule, AdSlotComponent, FigurinhasAfiliadosComponent],
  templateUrl: './figurinhas-trocar.component.html',
  styleUrl: './figurinhas-trocar.component.scss',
})
export class FigurinhasTrocarComponent {
  private authService = inject(FigurinhasAuthService);
  private figurinhasService = inject(FigurinhasService);

  modo = signal<Modo>('codigo');

  // Modo: busca por código
  busca = signal('');
  buscaUpper = computed(() => this.busca().trim().toUpperCase());
  codigoValido = computed(() => TODOS_CODIGOS.includes(this.buscaUpper()));

  // Estado compartilhado
  resultados = signal<ResultadoTroca[]>([]);
  filtroCidade = signal('');
  buscando = signal(false);
  buscaFeita = signal(false);
  erro = signal<string | null>(null);

  resultadosFiltrados = computed(() => {
    const filtro = this.filtroCidade().trim().toLowerCase();
    if (!filtro) return this.resultados();
    return this.resultados().filter(r =>
      r.usuario.cidade?.toLowerCase().includes(filtro),
    );
  });

  meuPerfil = signal<FigurinhasUsuario | null>(null);

  meusFaltando = computed(() => {
    const perfil = this.meuPerfil();
    if (!perfil) return [];
    return TODOS_CODIGOS.filter(c => !perfil.tenho.includes(c));
  });

  constructor() {
    // Mantém o perfil em tempo real (sem take(1)) para que alterações feitas
    // no álbum (repetidas, "Aparecer nas trocas") reflitam aqui sem reload.
    toObservable(this.authService.usuario)
      .pipe(
        filter(u => u !== undefined),
        take(1),
        switchMap(user => {
          if (!user) return EMPTY;
          return this.figurinhasService.meuPerfil(user.uid);
        }),
        takeUntilDestroyed(),
      )
      .subscribe(perfil => {
        if (perfil) this.meuPerfil.set(perfil);
      });
  }

  trocarModo(novo: Modo): void {
    this.modo.set(novo);
    this.resultados.set([]);
    this.buscaFeita.set(false);
    this.erro.set(null);
    this.busca.set('');
  }

  buscar(): void {
    if (this.modo() === 'codigo') this.buscarPorCodigo();
    else this.buscarParceiros();
  }

  private buscarPorCodigo(): void {
    const codigo = this.buscaUpper();
    if (!codigo) return;

    this.buscando.set(true);
    this.buscaFeita.set(false);
    this.erro.set(null);

    this.figurinhasService
      .buscarPorRepetida(codigo)
      .pipe(take(1))
      .subscribe({
        next: usuarios => {
          this.resultados.set(this.calcularResultados(usuarios));
          this.buscaFeita.set(true);
          this.buscando.set(false);
        },
        error: () => {
          this.erro.set('Erro ao buscar. Tente novamente.');
          this.buscando.set(false);
        },
      });
  }

  buscarParceiros(): void {
    const faltando = this.meusFaltando();
    if (!faltando.length) return;

    this.buscando.set(true);
    this.buscaFeita.set(false);
    this.erro.set(null);

    this.figurinhasService
      .buscarParceiros(faltando)
      .pipe(take(1))
      .subscribe({
        next: usuarios => {
          const resultados = this.calcularResultados(usuarios)
            // Só mostra quem tem troca mútua (eu tenho o que ele precisa também)
            .filter(r => r.EuTenhoOQuePrecisa.length > 0)
            // Ordena por quem oferece mais figurinhas que preciso
            .sort((a, b) => b.TemOQuePreciso.length - a.TemOQuePreciso.length);

          this.resultados.set(resultados);
          this.buscaFeita.set(true);
          this.buscando.set(false);
        },
        error: () => {
          this.erro.set('Erro ao buscar. Tente novamente.');
          this.buscando.set(false);
        },
      });
  }

  private calcularResultados(usuarios: FigurinhasUsuario[]): ResultadoTroca[] {
    const meu = this.meuPerfil();
    const meuUid = this.authService.usuario()?.uid;
    const meusFaltando = this.meusFaltando();
    const minhasRepetidas = meu?.repetidas ?? [];

    return usuarios
      .filter(u => u.uid !== meuUid && u.aceitaTroca === true)
      .map(u => {
        const temOQuePreciso = (u.repetidas ?? [])
          .filter(c => meusFaltando.includes(c))
          .slice(0, 10)
          .map(c => ({ codigo: c, qty: (u.quantidade?.[c] ?? 2) - 1 }));

        const euTenhoOQuePrecisa = minhasRepetidas
          .filter(c => !(u.tenho ?? []).includes(c))
          .slice(0, 10)
          .map(c => ({ codigo: c, qty: (meu?.quantidade?.[c] ?? 2) - 1 }));

        const msg = this.buildMensagem(u.displayName, temOQuePreciso, euTenhoOQuePrecisa);

        return {
          usuario: u,
          TemOQuePreciso: temOQuePreciso,
          EuTenhoOQuePrecisa: euTenhoOQuePrecisa,
          whatsappHref: u.whatsapp ? this.buildWhatsappHref(u.whatsapp, msg) : null,
          emailHref: this.buildEmailHref(u.email, msg),
        };
      });
  }

  private buildMensagem(nome: string, quero: FigurinhaQtd[], ofereço: FigurinhaQtd[]): string {
    const linhas = [
      `Olá ${nome}! Vi no site do Palestrino Gomes que podemos trocar figurinhas da Copa 2026.`,
    ];
    if (quero.length) linhas.push(`\nPreciso das suas repetidas: ${quero.map(f => f.codigo).join(', ')}`);
    if (ofereço.length) linhas.push(`Posso te oferecer: ${ofereço.map(f => f.codigo).join(', ')}`);
    linhas.push('\nTopa a troca? 🤝');
    return linhas.join('\n');
  }

  private buildWhatsappHref(numero: string, msg: string): string {
    const digits = numero.replace(/\D/g, '');
    const num = digits.length <= 11 ? `55${digits}` : digits;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }

  private buildEmailHref(email: string, msg: string): string {
    return `mailto:${email}?subject=${encodeURIComponent('Troca de figurinhas Copa 2026')}&body=${encodeURIComponent(msg)}`;
  }

  limpar(): void {
    this.busca.set('');
    this.resultados.set([]);
    this.filtroCidade.set('');
    this.buscaFeita.set(false);
    this.erro.set(null);
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.modo() === 'codigo' && this.codigoValido()) this.buscar();
  }
}
