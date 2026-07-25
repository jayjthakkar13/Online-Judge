import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Problem } from '../problemset/problemset.service';

export type Language = 'c' | 'cpp' | 'py';

export interface SubmitResponse {
  data: string;
  verdict: boolean;
}

@Injectable({ providedIn: 'root' })
export class SubmissionService {
  private readonly http = inject(HttpClient);
	private readonly baseUrl = `http://localhost:5000`;

  getProblem(name: string): Observable<Problem> {
    return this.http
      .get<Problem>(`${this.baseUrl}/problem/${name}`);
  }

  getTemplate(language: Language) {
    switch (language) {
      case 'c':
        return `#include <stdio.h>

int main() {
    // write solution here

    return 0;
}`;

      case 'cpp':
        return `#include <bits/stdc++.h>
using namespace std;

int main() {
    // write solution here
    
    return 0;
}`;

      case 'py':
        return `# write solution here
print("Hello")`;
    }
  }

  run(name: string, code: string, language: Language, input: string, timeLimit: number, memoryLimit: number): Observable<SubmitResponse> {
    const payload = {
      problemName: name,
      language: language,
      code: code,
      input: input,
      timeLimit: timeLimit,
      memoryLimit: memoryLimit
    };
    return this.http
      .post<SubmitResponse>(`${this.baseUrl}/run`, payload);
  }

  submit(name: string, code: string, language: Language, timeLimit: number, memoryLimit: number): Observable<SubmitResponse> {
    const payload = {
      name: name,
      code: code,
      language: language,
      timeLimit: timeLimit,
      memoryLimit: memoryLimit
    };
    return this.http
      .post<SubmitResponse>(`${this.baseUrl}/submit`, payload);
  }
}