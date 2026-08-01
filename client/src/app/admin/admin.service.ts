import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Problem } from "../problemset/problemset.service";
import { Observable } from "rxjs";

export interface TestCase {
  input: string,
  output: string
};

export interface ProblemCard {
  name: string,
  title: string,
  timeLimit: number,
  memoryLimit: number
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = process.env.SERVER_URL;

  getEmptyProblem(): Problem {
    return {
      name: '',
      title: '',
      statement: '',
      input: '',
      output: '',
      examples: [{ input: '', output: '' }],
      timeLimit: 1,
      memoryLimit: 256,
      constraints: ['']
    };
  }

  fetchProblems(): Observable<Problem[]> {
    return this.http
      .get<Problem[]>(`${this.baseUrl}/problemset`);
  }

  getProblem(name: string): Observable<{ problem: Problem, testCases: TestCase[] }> {
    return this.http
      .get<{ problem: Problem, testCases: TestCase[] }>(`${this.baseUrl}/problem/${name}`);
  }
  
  updateProblem(problem: Problem, testCases: TestCase[]): Observable<Problem> {
    const payload = { problem, testCases };
    return this.http
      .put<Problem>(`${this.baseUrl}/${problem.name}`, payload);
  }

  addProblem(problem: Problem, testCases: TestCase[]): Observable<Problem> {
    const payload = { problem, testCases };
    return this.http
      .post<Problem>(`${this.baseUrl}/create`, payload);
  }

  deleteProblem(name: string) {
    return this.http
      .delete(`${this.baseUrl}/${name}`);
  }
}