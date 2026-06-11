import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs';

export function figurinhasAuthGuard(
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) {
  const auth = inject(Auth);
  const router = inject(Router);
  // Volta para a rota que o usuário tentou acessar (ex.: /figurinhas/album)
  const returnUrl = state.url || '/figurinhas/album';
  return authState(auth).pipe(
    take(1),
    map(userState => {
      const isGoogle = userState?.providerData?.some(p => p.providerId === 'google.com');
      return isGoogle
        ? true
        : router.createUrlTree(['/admin/login'], { queryParams: { returnUrl } });
    }),
  );
}
