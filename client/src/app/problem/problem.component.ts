import { Component, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Language, SubmissionService } from './problem.service';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { FormsModule } from '@angular/forms';
import { EditorConfiguration } from 'codemirror';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';

@Component({
  selector: "app-problem",
  imports: [CodemirrorModule, FormsModule],
  templateUrl: "./problem.component.html",
  styleUrl: "./problem.component.css",
})
export class ProblemComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly submissionService = inject(SubmissionService);

  readonly running = signal<boolean>(false);
  readonly showResult = signal<boolean>(false);
  readonly name = signal<string>('');
  readonly title = signal<string>('');
  readonly statement = signal<string>('');
  readonly code = signal<string>('');
  readonly language = signal<Language>('cpp');
  readonly input = signal<string>('');
  readonly output = signal<string>('');
  readonly verdict = signal<'' | 'Accepted' | 'Rejected'>('');
  readonly tab = signal<'input' | 'output'>('input');
  readonly editorOptions = computed<EditorConfiguration> (() => ({
      theme: 'material-darker',
      lineNumbers: true,
      mode: this.language() === 'cpp'
      ? 'text/x-c++src'
      : this.language() === 'c'
      ? 'text/x-csrc'
      : 'python',
      tabSize: 4,
      indentUnit: 4
    })
  );

  constructor() {
    this.route.paramMap.subscribe(params => {
      const name = params.get('problemName') ?? 'unknown-problem';
      this.name.set(name);

      const request = this.submissionService.getProblem(this.name());
      request.subscribe({
        next: (res) => {
          this.title.set(res.title);
          this.statement.set(res.statement);
        }
      });
    });
    this.code.set(this.submissionService.getTemplate(this.language()));
  }

  setLanguage(language: Language) {
    this.language.set(language);
    this.code.set(this.submissionService.getTemplate(language));
  }

  viewSubmissions() {
    this.router.navigate([`home/submissions/${this.name()}`]);
  }

  runCode() {
    this.running.set(true);
    const request = this.submissionService.run(this.name(), this.code(), this.language(), this.input());
    request.subscribe({
      next: (res) => {
        this.output.set(res.data);
        this.verdict.set(res.verdict ? "Accepted" : "Rejected");
        this.running.set(false);
        this.showResult.set(true);
        this.tab.set('output');
      }
    });
  }

  submitCode() {
    this.running.set(true);
    const request = this.submissionService.submit(this.name(), this.code(), this.language());
    request.subscribe({
      next: (res) => {
        this.router.navigateByUrl(`/home/submissions/${this.name()}`);
        this.running.set(false);
      },
      error: (err) => {
        console.log(err);
        this.running.set(false);
      }
    });
  }
}