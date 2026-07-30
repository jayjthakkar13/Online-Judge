import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Problem } from "../problemset/problemset.service";
import { Observable } from "rxjs";

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

  updateProblem(problem: Problem): Observable<Problem> {
    return this.http
      .put<Problem>(`${this.baseUrl}/${problem.name}`, problem);
  }

  addProblem(problem: Problem): Observable<Problem> {
    return this.http
      .post<Problem>(`${this.baseUrl}/create`, problem);
  }

  deleteProblem(name: string) {
    return this.http
      .delete(`${this.baseUrl}/${name}`);
  }
}