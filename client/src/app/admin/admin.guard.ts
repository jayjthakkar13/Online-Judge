import { CanMatchFn } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

const getRoleFromToken = (): string | null => {
  const jwtHelper = new JwtHelperService();
  const token = localStorage.getItem('onlinejudge.token');
  if (!token || jwtHelper.isTokenExpired(token)) {
    return null;
  }
  try {
    const decoded = jwtHelper.decodeToken(token);
    return decoded ? decoded.role : null;
  } catch (error) {
    return null;
  }
}

export const isAdminGuard: CanMatchFn = () => {
  const role = getRoleFromToken();
  return role === 'admin';
};

export const isUserGuard: CanMatchFn = () => {
  const role = getRoleFromToken();
  return role === 'user';
}