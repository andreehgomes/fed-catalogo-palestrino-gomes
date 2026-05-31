import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { ClassificacaoService } from '../../core/services/classificacao.service';
import { ClassificacaoTabela } from '../../core/models/classificacao.model';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-classificacao',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './classificacao.component.html',
  styleUrl: './classificacao.component.scss',
})
export class ClassificacaoComponent {
  private readonly service = inject(ClassificacaoService);
  private readonly seo = inject(SeoService);

  readonly tabela = signal<ClassificacaoTabela | null>(null);
  readonly erro = signal(false);

  constructor() {
    this.seo.setClassificacao();

    this.service
      .obterTabela()
      .pipe(
        catchError(() => {
          this.erro.set(true);
          return EMPTY;
        }),
        takeUntilDestroyed(),
      )
      .subscribe(t => this.tabela.set(t));
  }

  zonaClasse(posicao: number): string {
    if (posicao <= 4) return 'zona--libertadores';
    if (posicao <= 6) return 'zona--libertadores-pre';
    if (posicao <= 12) return 'zona--sulamericana';
    if (posicao >= 18) return 'zona--rebaixamento';
    return '';
  }

  ehPalmeiras(nome: string): boolean {
    return nome.toLowerCase().includes('palmeiras');
  }
}
