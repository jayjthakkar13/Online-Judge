import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProblemsetService, Problem } from './problemset.service';

@Component({
  selector: "app-problemset",
  imports: [CommonModule],
  templateUrl: "./problemset.component.html",
  styleUrl: "./problemset.component.css",
})
export class ProblemsetComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly problemsetService = inject(ProblemsetService);

  readonly problems = signal<Problem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.fetchProblems();
  }

  fetchProblems(): void {
    this.loading.set(true);
    this.error.set(null);

    const request = this.problemsetService.fetchProblems();
    request.subscribe({
        next: (res) => {
          this.problems.set(res);
          this.loading.set(false);
        },
        error: (err) => {
          if (err.status === 401) {
            localStorage.clear();
            this.router.navigateByUrl("/auth");
          }
          this.error.set('Failed to load problems');
          this.loading.set(false);
        }
      });
  }

  openProblem(name: string): void {
    this.router.navigateByUrl(`/problem/${name}`);
  }
}
