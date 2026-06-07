import { inject, Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class FigurinhasAuthService {
  private readonly auth = inject(Auth);

  readonly usuario = toSignal(user(this.auth));

  autenticadoComGoogle = () =>
    this.usuario()?.providerData?.some(p => p.providerId === 'google.com') ?? false;

  async entrarComGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async sair(): Promise<void> {
    await signOut(this.auth);
  }
}
