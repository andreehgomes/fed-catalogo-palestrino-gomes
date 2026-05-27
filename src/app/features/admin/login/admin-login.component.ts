import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  senha = '';
  erro = signal('');
  carregando = signal(false);

  async entrar(): Promise<void> {
    if (!this.email || !this.senha) return;
    this.erro.set('');
    this.carregando.set(true);
    try {
      await this.auth.login(this.email, this.senha);
      this.router.navigateByUrl('/admin/posts');
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? '';
      const mensagens: Record<string, string> = {
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/user-disabled': 'Conta desativada.',
        'auth/operation-not-allowed': 'Login por e-mail/senha não está habilitado no Firebase Console.',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente em alguns minutos.',
      };
      this.erro.set(mensagens[code] ?? `Erro: ${code || 'desconhecido'}`);
    } finally {
      this.carregando.set(false);
    }
  }
}
