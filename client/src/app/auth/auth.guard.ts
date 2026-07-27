import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService } from './auth.service';

export const isAuthenticatedGuard: CanMatchFn = () => {
	const auth = inject(AuthService);
	return auth.isAuthenticated();
};

export const isUnauthenticatedGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  return !auth.isAuthenticated();
}