import { CanMatchFn, Router } from '@angular/router';

export const isAdminGuard: CanMatchFn = () => {
  const role = localStorage.getItem('onlinejudge.role');
  return role === 'admin';
};

export const isUserGuard: CanMatchFn = () => {
  const role = localStorage.getItem('onlinejudge.role');
  return role === 'user';
}