import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  paginaAtual = input.required<number>();
  totalPaginas = input.required<number>();

  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));
}
