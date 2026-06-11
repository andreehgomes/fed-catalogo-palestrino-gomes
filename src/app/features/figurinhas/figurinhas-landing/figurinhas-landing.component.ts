import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { GRUPOS_FIGURINHAS, TOTAL_FIGURINHAS } from '../data/figurinhas.data';

@Component({
  selector: 'app-figurinhas-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './figurinhas-landing.component.html',
  styleUrl: './figurinhas-landing.component.scss',
})
export class FigurinhasLandingComponent implements OnInit {
  // Total de figurinhas e nº de seleções/coleções, derivados da fonte de dados.
  readonly totalFigurinhas = TOTAL_FIGURINHAS;
  readonly totalSelecoes = GRUPOS_FIGURINHAS.reduce((acc, g) => acc + g.times.length, 0);

  // Esconde a <img> de fundo do hero caso o arquivo ainda não exista
  // (o hero funciona apenas com o gradiente, igual ao banner da home).
  readonly imgOk = signal(true);

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.setFigurinhas();
  }

  onImgError(): void {
    this.imgOk.set(false);
  }
}
