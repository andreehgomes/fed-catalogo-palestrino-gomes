import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-privacidade',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacidade.component.html',
  styleUrl: './privacidade.component.scss',
})
export class PrivacidadeComponent implements OnInit {
  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('Política de Privacidade | Palestrino Gomes');
  }
}
