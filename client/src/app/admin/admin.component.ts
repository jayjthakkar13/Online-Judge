import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Problem } from '../problemset/problemset.service';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000';
  private readonly adminService = inject(AdminService);

  readonly problems = signal<Problem[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly showModal = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  
  currentProblem!: Problem;

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
    this.showModal.set(true);
  }

  openEditModal(p: Problem, event: Event): void {
    event.stopPropagation();
    this.isEditMode.set(true);
    this.currentProblem = p;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
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

  trackByIndex(index: number): number {
    return index;
  }

  saveProblem(): void {
    if (!this.currentProblem.name || !this.currentProblem.title) {
      this.error.set('Name and Title are required.');
      return;
    }
    this.currentProblem.constraints = this.currentProblem.constraints.filter(c => c.trim() !== '');

    if (this.isEditMode()) {
      const request = this.adminService.updateProblem(this.currentProblem);
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
      const request = this.adminService.addProblem(this.currentProblem);
      request.subscribe({
        next: (created) => {
          this.problems.update((list) => [...list, created]);
          this.closeModal();
        },
        error: (err) => this.error.set(err.error?.message || 'Failed to create problem.')
      });
    }
  }

  deleteProblem(p: Problem, event: Event): void {
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