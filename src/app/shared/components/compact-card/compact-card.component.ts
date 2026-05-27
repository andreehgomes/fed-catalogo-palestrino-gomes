import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Post } from '../../../core/models/post.model';

@Component({
  selector: 'app-compact-card',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compact-card.component.html',
  styleUrl: './compact-card.component.scss',
})
export class CompactCardComponent {
  post = input.required<Post>();
}
