import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Problem } from '../problemset/problemset.service';

export type Language = 'c' | 'cpp' | 'python';

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

      case 'python':
        return `# write solution here
print("Hello")`;
    }
  }

  run(name: string, code: string, language: Language): Observable<SubmitResponse> {
    return this.http
      .post<SubmitResponse>(`${this.baseUrl}/submit`, { userEmail: localStorage.getItem('onlinejudge.userEmail'), problemName: name, language: language, code: code });
  }
}

interface NewSubmission {
  userEmail: string;
  problemName: string;
  language: "C" | "C++" | "Python";
  code: string;
}