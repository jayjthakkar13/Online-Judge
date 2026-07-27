import { Component, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Language, ProblemService } from './problem.service';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { FormsModule } from '@angular/forms';
import { EditorConfiguration } from 'codemirror';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';
import { MarkdownComponent } from "ngx-markdown";

@Component({
  selector: "app-problem",
  imports: [CodemirrorModule, FormsModule, MarkdownComponent],
  templateUrl: "./problem.component.html",
  styleUrl: "./problem.component.css",
})
export class ProblemComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly problemService = inject(ProblemService);

  readonly running = signal<boolean>(false);
  readonly showResult = signal<boolean>(false);
  readonly name = signal<string>('');
  readonly title = signal<string>('');
  readonly statement = signal<string>('');
  readonly inputInfo = signal<string>('');
  readonly outputInfo = signal<string>('');
  readonly timeLimit = signal<number>(0);
  readonly memoryLimit = signal<number>(0);
  readonly examples = signal<Array<{ input: string; output: string }>>([]);
  readonly constraints = signal<Array<string>>([]);
  readonly code = signal<string>('');
  readonly language = signal<Language>('cpp');
  readonly inputTab = signal<string>('');
  readonly outputTab = signal<string>('');
  readonly verdict = signal<'Accepted' | 'Rejected' | null>(null);
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

      const request = this.problemService.getProblem(this.name());
      request.subscribe({
        next: (res) => {
          this.title.set(res.title);
          this.statement.set(res.statement);
          this.inputInfo.set(res.input);
          this.outputInfo.set(res.output);
          this.timeLimit.set(res.timeLimit);
          this.memoryLimit.set(res.memoryLimit);
          this.examples.set(res.examples);
          this.constraints.set(res.constraints);
        },
        error: (err) => {
          console.log(err);
        }
      });
    });
    this.code.set(this.problemService.getTemplate(this.language()));
  }

  setLanguage(language: Language) {
    this.language.set(language);
    this.code.set(this.problemService.getTemplate(language));
  }

  viewSubmissions() {
    this.router.navigateByUrl(`/submissions/${this.name()}`);
  }

  runCode() {
    this.running.set(true);
    const request = this.problemService.run(this.name(), this.code(), this.language(), this.inputTab(), this.timeLimit(), this.memoryLimit());
    request.subscribe({
      next: (res) => {
        this.outputTab.set(res.data);
        this.verdict.set(res.verdict ? "Accepted" : "Rejected");
        this.running.set(false);
        this.showResult.set(true);
        this.tab.set('output');
      },
      error: (res) => {
        this.outputTab.set(res.error.data);
        this.verdict.set(res.error.verdict ? "Accepted" : "Rejected");
        this.running.set(false);
        this.showResult.set(true);
        this.tab.set('output');
      }
    });
  }

  submitCode() {
    this.running.set(true);
    const request = this.problemService.submit(this.name(), this.code(), this.language(), this.timeLimit(), this.memoryLimit());
    request.subscribe({
      next: (res) => {
        this.router.navigateByUrl(`/submissions/${this.name()}`);
        this.running.set(false);
      },
      error: (err) => {
        this.running.set(false);
      }
    });
  }
}