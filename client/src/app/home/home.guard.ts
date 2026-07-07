import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const homeGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('onlinejudge.token');
  return token ? router.parseUrl('/home'): true;
};