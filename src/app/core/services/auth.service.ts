import { computed, inject, Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

const ADMIN_EMAIL = 'andrefelipefeliciogomes@gmail.com';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  readonly usuario = toSignal(user(this.auth));
  readonly autenticado = () => !!this.usuario();
  readonly isAdmin = computed(() => this.usuario()?.email === ADMIN_EMAIL);

  async login(email: string, senha: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, senha);
  }

  async loginComGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
}
