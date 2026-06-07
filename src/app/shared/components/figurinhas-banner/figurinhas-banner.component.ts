import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-figurinhas-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './figurinhas-banner.component.html',
  styleUrl: './figurinhas-banner.component.scss',
})
export class FigurinhasBannerComponent {
  // Esconde a <img> caso o arquivo ainda não exista (o banner funciona só com o gradiente)
  imgOk = signal(true);

  onImgError(): void {
    this.imgOk.set(false);
  }
}
