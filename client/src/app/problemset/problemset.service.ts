import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Problem {
  name: string;
  statement: string;
}

@Injectable({ providedIn: 'root' })
export class ProblemsetService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = `http://localhost:5000`;

  fetchProblems(): Observable<Problem[]> {
    return this.http
      .get<Problem[]>(`${this.baseUrl}/problemset`);
  }
}