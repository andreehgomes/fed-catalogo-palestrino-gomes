import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConfigSiteService } from '../../../core/services/config-site.service';

@Component({
  selector: 'app-admin-configuracoes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './admin-configuracoes.component.html',
  styleUrl: './admin-configuracoes.component.scss',
})
export class AdminConfiguracoesComponent implements OnInit {
  private service = inject(ConfigSiteService);

  config = toSignal(this.service.get());
  salvando = signal(false);
  salvo = signal(false);

  publisherId = signal('');
  textoSobre = signal('');
  textoContato = signal('');

  ngOnInit(): void {
    const c = this.config();
    if (c) {
      this.publisherId.set(c.adsensePublisherId ?? '');
      this.textoSobre.set(c.textoSobre ?? '');
      this.textoContato.set(c.textoContato ?? '');
    }
  }

  async salvar(): Promise<void> {
    this.salvando.set(true);
    this.salvo.set(false);
    try {
      await this.service.salvar({
        adsensePublisherId: this.publisherId(),
        textoSobre: this.textoSobre(),
        textoContato: this.textoContato(),
      });
      this.salvo.set(true);
      setTimeout(() => this.salvo.set(false), 3000);
    } finally {
      this.salvando.set(false);
    }
  }
}
