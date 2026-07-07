import { Component, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { SubmissionDocument } from "./submissions.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { SubmissionsService } from "./submissions.service";
import { CodemirrorModule } from "@ctrl/ngx-codemirror";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-submissions",
  imports: [CodemirrorModule, DatePipe, FormsModule, RouterLink],
  templateUrl: "./submissions.component.html",
  styleUrl: "./submissions.component.css",
})
export class SubmissionsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly submissionsService = inject(SubmissionsService);

  readonly name = signal<string>('');
  readonly title = signal<string>('');
  readonly submissions = signal<SubmissionDocument[]>([]);
  readonly selectedSubmission = signal<SubmissionDocument | null>(null);

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
}
