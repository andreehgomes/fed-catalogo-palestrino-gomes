import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoriaService } from '../../../core/services/categoria.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly categoriaService = inject(CategoriaService);
  readonly auth = inject(AuthService);
  categorias = toSignal(this.categoriaService.getTodas(), { initialValue: [] });
  menuAberto = signal(false);

  toggleMenu(): void {
    this.menuAberto.set(!this.menuAberto());
  }

  sair(): void {
    this.auth.logout();
  }
}
