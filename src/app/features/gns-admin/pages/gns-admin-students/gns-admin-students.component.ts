import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService, StudentResponse } from '../../../../shared/services/student.service';
import { UniversiteService } from '../../../../core/services/universite.service';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-gns-admin-students',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, SkeletonModule, DialogModule, InputTextModule, FormsModule, ReactiveFormsModule, FloatLabelModule, DropdownModule],
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

  studentForm: FormGroup;
  universities = signal<any[]>([]);

  constructor(private studentService: StudentService, private fb: FormBuilder, private univService: UniversiteService) {
    this.studentForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      numEtudiantUniv: ['', Validators.required],
      universiteTrackingId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadStats();
    this.univService.getAll(0, 100).subscribe(data => {
      this.universities.set(data.content.map(u => ({ label: u.nom, value: u.trackingId })));
    });
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

  submitForm() {
    if (this.studentForm.valid) {
      this.isLoading.set(true);
      const payload = { ...this.studentForm.value };
      
      this.studentService.createStudent(payload).subscribe({
        next: (res) => {
          console.log('Student created successfully:', res);
          this.loadStudents();
          this.loadStats();
          this.closeCreateStudentPanel();
        },
        error: (err) => {
          console.error('Error creating student', err);
          this.isLoading.set(false);
        }
      });
    }
  }
}
