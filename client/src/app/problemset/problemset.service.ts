import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Problem {
  name: string,
  title: string,
  statement: string,
  input: string,
  output: string,
  examples: Array<{ input: string, output: string}>,
  timeLimit: number,
  memoryLimit: number,
  constraints: string[]
}

@Injectable({ providedIn: 'root' })
export class ProblemsetService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = process.env.SERVER_URL;

  fetchProblems(): Observable<Problem[]> {
    return this.http
      .get<Problem[]>(`${this.baseUrl}/problemset`);
  }
}