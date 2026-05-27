import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Post } from '../../../core/models/post.model';
import { CategoryChipComponent } from '../category-chip/category-chip.component';
import { Pilar } from '../../../core/models/categoria.model';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [RouterLink, DatePipe, CategoryChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.scss',
})
export class ArticleCardComponent {
  post = input.required<Post>();
  categoriaPilar = input<Pilar>('analises');
}
