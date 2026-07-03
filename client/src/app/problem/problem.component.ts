import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Language, SubmissionService } from './problem.service';

@Component({
  selector: "app-problem",
  imports: [],
  templateUrl: "./problem.component.html",
  styleUrl: "./problem.component.css",
})
export class ProblemComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly submissionService = inject(SubmissionService);

  readonly running = signal<boolean>(false);
  readonly name = signal<string>('');
  readonly statement = signal<string>('');
  readonly code = signal<string>('');
  readonly language = signal<Language>('cpp');
  readonly output = signal<string>('');
  readonly verdict = signal<'' | 'Accepted' | 'Rejected'>('');

  constructor() {
    this.route.paramMap.subscribe(params => {
      const name = params.get('problemName') ?? 'unknown-problem';
      this.name.set(name);
    });
    const request = this.submissionService.getProblem(this.name());
    request.subscribe({
      next: (res) => {
        this.statement.set(res.statement);
      }
    });
    this.code.set(this.submissionService.getTemplate(this.language()));
  }

  setLanguage(language: Language) {
    this.language.set(language);
    this.code.set(this.submissionService.getTemplate(language));
  }

  setCode(value: string) {
    this.code.set(value);
  }

  runCode() {
    this.running.set(true);
    const request = this.submissionService.run(this.name(), this.code(), this.language());
    request.subscribe({
      next: (res) => {
        this.output.set(res.data);
        this.verdict.set(res.verdict ? "Accepted" : "Rejected");
      }
    });
    this.running.set(false);
  }
}