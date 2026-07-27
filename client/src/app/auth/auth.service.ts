import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
	token: string;
	user: {
    name: string;
    email: string;
    role: string;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = `http://localhost:5000/auth`;

	private static readonly TOKEN_KEY = 'onlinejudge.token';
	private static readonly EMAIL = 'onlinejudge.userEmail';
  private static readonly ROLE = 'onlinejudge.role'

	register(name: string, email: string, password: string): Observable<AuthResponse> {
		return this.http
			.post<AuthResponse>(`${this.baseUrl}/register`, { userName: name, userEmail: email, userPassword: password })
			.pipe(tap(res => this.setSession(res)));
	}

	login(email: string, password: string): Observable<AuthResponse> {
		return this.http
			.post<AuthResponse>(`${this.baseUrl}/login`, { userEmail: email, userPassword: password })
			.pipe(tap(res => this.setSession(res)));
	}

	clearSession(): void {
		localStorage.removeItem(AuthService.TOKEN_KEY);
		localStorage.removeItem(AuthService.EMAIL);
		localStorage.removeItem(AuthService.ROLE);
	}

	getToken(): string | null {
		return localStorage.getItem(AuthService.TOKEN_KEY);
	}

  getRole(): string | null {
		return localStorage.getItem(AuthService.ROLE);
	}

	isAuthenticated(): boolean {
		return !!this.getToken();
	}

	private setSession(res: AuthResponse): void {
		localStorage.setItem(AuthService.TOKEN_KEY, res.token);
		localStorage.setItem(AuthService.EMAIL, res.user.email);
		localStorage.setItem(AuthService.ROLE, res.user.role);
	}
}