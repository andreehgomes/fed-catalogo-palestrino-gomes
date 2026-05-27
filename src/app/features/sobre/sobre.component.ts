import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConfigSiteService } from '../../core/services/config-site.service';
import { SeoService } from '../../core/services/seo.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-sobre',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sobre.component.html',
  styleUrl: './sobre.component.scss',
})
export class SobreComponent implements OnInit {
  private configService = inject(ConfigSiteService);
  private title = inject(Title);

  config = toSignal(this.configService.get());

  ngOnInit(): void {
    this.title.setTitle('Sobre | Palestrino Gomes');
  }
}
