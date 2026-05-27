import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProdutoAfiliado } from '../../../core/models/produto-afiliado.model';

@Component({
  selector: 'app-affiliate-card',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './affiliate-card.component.html',
  styleUrl: './affiliate-card.component.scss',
})
export class AffiliateCardComponent {
  produto = input.required<ProdutoAfiliado>();
}
