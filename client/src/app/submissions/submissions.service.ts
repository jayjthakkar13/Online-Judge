import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SubmissionDocument {
  _id: string;
  code: string;
  language: string;
  verdict: "Accepted" | "Rejected";
  createdAt: Date;
}

interface SubmissionResponse {
  title: string;
  submissions: SubmissionDocument[];
}

interface aiResponse {
  success: boolean;
  response: string
}

@Injectable({ providedIn: 'root' })
export class SubmissionsService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = `http://localhost:5000`;

  fetchSubmissions(name: string): Observable<SubmissionResponse> {
    return this.http
      .get<SubmissionResponse>(`${this.baseUrl}/submissions/${name}`);
  }

  askAI(code: string, name: string): Observable<aiResponse> {
    const payload = { code, name };
    return this.http
      .post<aiResponse>(`${this.baseUrl}/ai-review`, payload);
  }
}