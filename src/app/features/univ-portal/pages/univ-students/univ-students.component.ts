import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { StudentService, StudentResponse } from '../../../../shared/services/student.service';
import { AuthService } from '../../../../core/services/auth.service';

import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-univ-students',
  standalone: true,
  imports: [CommonModule, TableModule, SkeletonModule, TagModule, ButtonModule, DialogModule],
  templateUrl: './univ-students.component.html',
  styleUrls: ['./univ-students.component.scss']
})
export class UnivStudentsComponent implements OnInit {
  isLoading = signal(false);
  students = signal<StudentResponse[]>([]);
  totalElements = signal(0);

  private studentService = inject(StudentService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(page: number = 0, size: number = 10) {
    const univId = this.authService.universityId();
    if (!univId) return;

    this.isLoading.set(true);
    this.studentService.getStudentsByUniversite(univId, page, size).subscribe({
      next: (data) => {
        this.students.set(data.content);
        this.totalElements.set(data.totalElements);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching students', err);
        this.isLoading.set(false);
      }
    });
  }

}
