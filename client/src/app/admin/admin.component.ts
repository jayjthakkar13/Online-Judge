import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Problem } from '../problemset/problemset.service';
import { AdminService, ProblemCard, TestCase } from './admin.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly problems = signal<ProblemCard[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly showModal = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  
  currentProblem!: Problem;
  testCases!: TestCase[];

  ngOnInit(): void {
    this.currentProblem = this.adminService.getEmptyProblem();
    this.fetchProblems();
  }

  fetchProblems(): void {
    this.loading.set(true);
    this.error.set(null);
    const request = this.adminService.fetchProblems();
    request.subscribe({
      next: (data) => {
        this.problems.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load problems.');
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.currentProblem = this.adminService.getEmptyProblem();
    this.testCases = [];
    this.showModal.set(true);
  }

  openEditModal(name: string, event: Event): void {
    event.stopPropagation();
    this.isEditMode.set(true);
    const request = this.adminService.getProblem(name);
    request.subscribe({
      next: (res) => {
        this.currentProblem = res.problem;
        this.testCases = res.testCases;
        this.showModal.set(true);
      },
      error: (err) => this.error.set(err.error?.message || 'Failed to fetch the problem.')
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.fetchProblems();
  }

  addExample(): void {
    this.currentProblem.examples.push({ input: '', output: '' });
  }

  removeExample(index: number): void {
    if (this.currentProblem.examples.length > 1) {
      this.currentProblem.examples.splice(index, 1);
    }
  }

  addConstraint(): void {
    this.currentProblem.constraints.push('');
  }

  removeConstraint(index: number): void {
    if (this.currentProblem.constraints.length > 1) {
      this.currentProblem.constraints.splice(index, 1);
    }
  }

  addTestCase() {
    this.testCases.push({ input: '', output: '' });
  }

  removeTestCase(index: number): void {
    if (this.testCases.length > 1) {
      this.testCases.splice(index, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  saveProblem(): void {
    if (!this.currentProblem.name || !this.currentProblem.title || this.testCases.length === 0) {
      this.error.set('Name and Title are required.');
      return;
    }
    this.currentProblem.constraints = this.currentProblem.constraints.filter(c => c.trim() !== '');

    if (this.isEditMode()) {
      const request = this.adminService.updateProblem(this.currentProblem, this.testCases);
      request.subscribe({
        next: (updated) => {
          this.problems.update((list) =>
            list.map((item) => (item.name === updated.name ? updated : item))
          );
          this.closeModal();
        },
        error: (err) => this.error.set(err.error?.message || 'Failed to update problem.')
      });
    } else {
      const request = this.adminService.addProblem(this.currentProblem, this.testCases);
      request.subscribe({
        next: (created) => {
          this.problems.update((list) => [...list, created]);
          this.closeModal();
        },
        error: (err) => this.error.set(err.error?.message || 'Failed to create problem.')
      });
    }
  }

  deleteProblem(p: ProblemCard, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${p.title}"?`)) return;
    
    const request = this.adminService.deleteProblem(p.name);
    request.subscribe({
      next: () => {
        this.problems.update((list) => list.filter((item) => item.name !== p.name));
      },
      error: (err) => this.error.set(err.error?.message || 'Failed to delete problem.')
    });
  }
}