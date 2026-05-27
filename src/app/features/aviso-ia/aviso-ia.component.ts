import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-aviso-ia',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aviso-ia.component.html',
  styleUrl: './aviso-ia.component.scss',
})
export class AvisoIaComponent implements OnInit {
  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('Aviso sobre Uso de IA | Palestrino Gomes');
  }
}
