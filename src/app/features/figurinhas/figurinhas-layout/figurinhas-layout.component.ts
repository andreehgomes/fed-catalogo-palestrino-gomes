import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { take } from 'rxjs';
import { FigurinhasAuthService } from '../services/figurinhas-auth.service';
import { FigurinhasService } from '../services/figurinhas.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-figurinhas-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './figurinhas-layout.component.html',
  styleUrl: './figurinhas-layout.component.scss',
})
export class FigurinhasLayoutComponent implements OnInit {
  private readonly authService = inject(FigurinhasAuthService);
  private readonly figurinhasService = inject(FigurinhasService);
  private readonly generalAuth = inject(AuthService);

  ngOnInit(): void {
    const user = this.generalAuth.usuario();
    if (!user) return;

    // Cria o perfil apenas se ainda não existir (novo usuário).
    // Não usa salvar() incondicionalmente pois sobrescreveria tenho/repetidas/quantidade.
    this.figurinhasService
      .meuPerfil(user.uid)
      .pipe(take(1))
      .subscribe(perfil => {
        if (perfil) return;
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
      });
  }

}
