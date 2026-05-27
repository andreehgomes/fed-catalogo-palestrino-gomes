import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConfigSiteService } from '../../core/services/config-site.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contato',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.scss',
})
export class ContatoComponent implements OnInit {
  private configService = inject(ConfigSiteService);
  private title = inject(Title);

  config = toSignal(this.configService.get());

  ngOnInit(): void {
    this.title.setTitle('Contato | Palestrino Gomes');
  }
}
