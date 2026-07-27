import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: "app-home",
  imports: [RouterOutlet],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent {
  private readonly auth = inject(AuthService);
	private readonly router = inject(Router);

  readonly isAuthenticated: boolean = this.auth.isAuthenticated();

  goHome(): void {
    this.router.navigateByUrl('/');
  }

  logout(): void {
    this.auth.clearSession();
		this.router.navigateByUrl('/');
  }
}