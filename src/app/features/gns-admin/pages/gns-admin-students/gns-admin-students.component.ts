import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService, StudentResponse } from '../../../../shared/services/student.service';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gns-admin-students',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, SkeletonModule, DialogModule, InputTextModule, FormsModule],
  templateUrl: './gns-admin-students.component.html',
  styleUrls: ['./gns-admin-students.component.scss']
})
export class GnsAdminStudentsComponent implements OnInit {
  selectedStudents: StudentResponse[] = [];
  selectedStudentId = signal<string | null>(null);
  zoomLevel = signal<number>(1);
  isCreateStudentPanelOpen = signal<boolean>(false);
  isLoading = signal(false);
  
  students = signal<StudentResponse[]>([]);
  totalElements = signal<number>(0);
  
  stats = signal<any>({
    totalStudents: 0,
    activeStudents: 0,
    verifiedKyc: 0,
    blockedStudents: 0
  });

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadStats();
  }

  loadStats() {
    this.studentService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Erreur chargement stats étudiants', err)
    });
  }

  loadStudents(page: number = 0, size: number = 10): void {
    this.isLoading.set(true);
    this.studentService.getStudents(page, size).subscribe({
      next: (pageData) => {
        this.students.set(pageData.content);
        this.totalElements.set(pageData.totalElements);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement étudiants', err);
        this.isLoading.set(false);
      }
    });
  }

  selectStudent(id: string) {
    this.selectedStudentId.set(id);
    this.zoomLevel.set(1);
  }

  closePanel() {
    this.selectedStudentId.set(null);
  }

  zoomIn() {
    this.zoomLevel.update(z => Math.min(z + 0.2, 3));
  }

  zoomOut() {
    this.zoomLevel.update(z => Math.max(z - 0.2, 0.5));
  }

  openCreateStudentPanel() {
    this.isCreateStudentPanelOpen.set(true);
  }

  closeCreateStudentPanel() {
    this.isCreateStudentPanelOpen.set(false);
  }
}
