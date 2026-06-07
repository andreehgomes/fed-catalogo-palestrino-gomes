import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs/operators';
import { FigurinhasAuthService } from '../services/figurinhas-auth.service';
import { FigurinhasService } from '../services/figurinhas.service';
import { mensagemErroLoginGoogle } from '../../../core/services/auth-error.util';

@Component({
  selector: 'app-figurinhas-login',
  standalone: true,
  templateUrl: './figurinhas-login.component.html',
  styleUrl: './figurinhas-login.component.scss',
})
export class FigurinhasLoginComponent {
  private authService = inject(FigurinhasAuthService);
  private figurinhasService = inject(FigurinhasService);
  private router = inject(Router);

  constructor() {
    // Se já autenticado com Google, vai direto pro álbum
    toObservable(this.authService.usuario)
      .pipe(
        filter(u => u !== undefined),
        take(1),
      )
      .subscribe(user => {
        const isGoogle = user?.providerData?.some(p => p.providerId === 'google.com');
        if (isGoogle) {
          this.router.navigate(['/figurinhas/album']);
        }
      });
  }

  carregando = signal(false);
  erro = signal<string | null>(null);

  async entrar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      await this.authService.entrarComGoogle();
      const user = this.authService.usuario();
      if (user) {
        this.figurinhasService
          .salvar({
            uid: user.uid,
            displayName: user.displayName ?? 'Usuário',
            photoURL: user.photoURL,
            email: user.email ?? '',
            quantidade: {},
            tenho: [],
            repetidas: [],
          })
          .subscribe();
      }
      this.router.navigate(['/figurinhas/album']);
    } catch (e: unknown) {
      this.erro.set(mensagemErroLoginGoogle(e));
    } finally {
      this.carregando.set(false);
    }
  }
}
