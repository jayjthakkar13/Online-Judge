import { Component, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { SubmissionDocument } from "./submissions.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { SubmissionsService } from "./submissions.service";
import { CodemirrorModule } from "@ctrl/ngx-codemirror";
import { FormsModule } from "@angular/forms";
import { MarkdownComponent } from "ngx-markdown";

@Component({
  selector: "app-submissions",
  imports: [CodemirrorModule, DatePipe, FormsModule, MarkdownComponent, RouterLink],
  templateUrl: "./submissions.component.html",
  styleUrl: "./submissions.component.css"
})
export class SubmissionsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly submissionsService = inject(SubmissionsService);

  readonly isAiLoading = signal<boolean>(false);
  readonly name = signal<string>('');
  readonly title = signal<string>('');
  readonly submissions = signal<SubmissionDocument[]>([]);
  readonly selectedSubmission = signal<SubmissionDocument | null>(null);
  readonly aiResponse = signal<string | null>(null);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const name = params.get('problemName') ?? 'unknown-problem';
      this.name.set(name);
    });
    const request = this.submissionsService.fetchSubmissions(this.name());
    request.subscribe({
      next: (res) => {
        this.title.set(res.title);
        this.submissions.set(res.submissions);
      }
    });
  }

  copyCode() {
    const code = this.selectedSubmission()?.code;
    if (!code) return;
    navigator.clipboard.writeText(code);
  }

  askAI(code: string) {
    this.isAiLoading.set(true);
    this.aiResponse.set(null);
    const request = this.submissionsService.askAI(code, this.name());
    request.subscribe({
      next: (res) => {
        this.aiResponse.set(res.response);
        this.isAiLoading.set(false);
      },
      error: (err: any) => {
        if (err.status === 429) {
          this.aiResponse.set("AI review limit reached. Please try again in a minute.");
        } else {
          this.aiResponse.set("Something went wrong.");
        }
        console.error(err);
        this.isAiLoading.set(false);
      }
    });
  }

  closeModal() {
    this.selectedSubmission.set(null);
    this.isAiLoading.set(false);
    this.aiResponse.set(null);
  }
}
