import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-landing",
  imports: [],
  templateUrl: "./landing.component.html",
  styleUrl: "./landing.component.css",
})
export class LandingComponent {
  private readonly router = inject(Router);

  goToLogin() {
    this.router.navigate([`auth`]);
  }
}
