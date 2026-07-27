import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Location } from "@angular/common";

@Component({
  selector: "app-not-found",
  imports: [],
  templateUrl: "./not-found.component.html",
  styleUrl: "./not-found.component.css",
})
export class NotFoundComponent {
  private location = inject(Location);
  private router = inject(Router);

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigateByUrl('/');
  }
}
