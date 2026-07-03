import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: "app-home",
  imports: [RouterOutlet, RouterLinkWithHref],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent {
  private readonly auth = inject(AuthService);
	private readonly router = inject(Router);

  logout(): void {
    this.auth.clearSession();
		this.router.navigateByUrl('/auth');
  }
}