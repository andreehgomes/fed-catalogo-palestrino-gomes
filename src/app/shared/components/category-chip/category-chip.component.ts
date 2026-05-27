import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pilar } from '../../../core/models/categoria.model';

const PILAR_CORES: Record<Pilar, string> = {
  analises: '#1a7341',
  taticas: '#0d4f8b',
  opiniao: '#8b3a0d',
  historia: '#6b2d8b',
};

@Component({
  selector: 'app-category-chip',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-chip.component.html',
  styleUrl: './category-chip.component.scss',
})
export class CategoryChipComponent {
  pilar = input.required<Pilar>();
  label = input.required<string>();
  href = input<string>();

  cor = computed(() => PILAR_CORES[this.pilar()]);
}
