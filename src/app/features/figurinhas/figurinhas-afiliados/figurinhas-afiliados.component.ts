import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ProdutoAfiliadoService } from '../../../core/services/produto-afiliado.service';
import { ProdutoAfiliado } from '../../../core/models/produto-afiliado.model';
import { AffiliateCardComponent } from '../../../shared/components/affiliate-card/affiliate-card.component';

/**
 * Carrossel de produtos afiliados das páginas de figurinhas.
 * Exibe apenas produtos marcados com "Exibir nas páginas de Figurinhas" no admin.
 * Se nenhum produto estiver marcado, a seção não é renderizada.
 */
@Component({
  selector: 'app-figurinhas-afiliados',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AffiliateCardComponent],
  templateUrl: './figurinhas-afiliados.component.html',
  styleUrl: './figurinhas-afiliados.component.scss',
})
export class FigurinhasAfiliadosComponent {
  private produtoService = inject(ProdutoAfiliadoService);

  @ViewChild('track') track?: ElementRef<HTMLElement>;

  produtos = toSignal(
    this.produtoService.getExibidosNasFigurinhas().pipe(
      catchError(err => {
        console.error('[FigurinhasAfiliados]', err);
        return of([] as ProdutoAfiliado[]);
      }),
    ),
    { initialValue: [] as ProdutoAfiliado[] },
  );

  rolar(direcao: -1 | 1): void {
    const el = this.track?.nativeElement;
    if (!el) return;
    // Avança o número de cards inteiros visíveis (largura do card + gap)
    const card = el.querySelector<HTMLElement>('.fig-afiliados__item');
    const passo = card ? card.offsetWidth + 16 : el.clientWidth * 0.9;
    const visiveis = Math.max(1, Math.floor(el.clientWidth / passo));
    const destino = Math.max(
      0,
      Math.min(el.scrollLeft + direcao * passo * visiveis, el.scrollWidth - el.clientWidth),
    );
    this.animarScroll(el, destino);
  }

  // Animação própria: o scroll suave nativo é ignorado quando o sistema
  // operacional está com animações reduzidas (prefers-reduced-motion).
  private animarScroll(el: HTMLElement, destino: number, duracao = 300): void {
    const inicio = el.scrollLeft;
    const delta = destino - inicio;
    if (!delta) return;
    // Aba sem frames (oculta/minimizada): aplica direto, sem animação
    if (document.hidden) {
      el.scrollLeft = destino;
      return;
    }
    const t0 = performance.now();
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - t0) / duracao);
      const easeOut = 1 - Math.pow(1 - t, 3);
      el.scrollLeft = inicio + delta * easeOut;
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }
}
