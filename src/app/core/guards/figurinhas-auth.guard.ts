import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { map, take } from 'rxjs';

export function figurinhasAuthGuard() {
  const auth = inject(Auth);
  const router = inject(Router);
  return authState(auth).pipe(
    take(1),
    map(userState => {
      const isGoogle = userState?.providerData?.some(p => p.providerId === 'google.com');
      return isGoogle ? true : router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: '/figurinhas' } });
    }),
  );
}
