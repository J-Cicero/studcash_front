import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService, StudentResponse, DocumentResponse } from '../../../core/services/student.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscriptions.component.html',
  styleUrls: ['./inscriptions.component.scss']
})
export class InscriptionsComponent implements OnInit {
  students: StudentResponse[] = [];
  filteredStudents: StudentResponse[] = [];
  
  // Pagination / Filter
  isLoading = true;
  errorMessage = '';
  searchQuery = '';
  filterKyc: string = 'ALL';

  // Details Modal/Sidebar
  selectedStudent: StudentResponse | null = null;
  studentDocuments: DocumentResponse[] = [];
  isLoadingDocs = false;

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents() {
    this.isLoading = true;
    this.errorMessage = '';
    
    if (this.filterKyc !== 'ALL') {
      this.studentService.findByStatutKYC(this.filterKyc).subscribe({
        next: (res) => {
          this.students = res.content || [];
          this.applyFilter();
          this.isLoading = false;
        },
        error: (err) => {
          this.students = [];
          this.applyFilter();
          this.isLoading = false;
        }
      });
    } else {
      this.studentService.findAll().subscribe({
        next: (res) => {
          this.students = res.content || [];
          this.applyFilter();
          this.isLoading = false;
        },
        error: (err) => {
          this.students = [];
          this.applyFilter();
          this.isLoading = false;
        }
      });
    }
  }

  applyFilter() {
    if (!this.searchQuery) {
      this.filteredStudents = this.students;
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredStudents = this.students.filter(s => 
      (s.nom && s.nom.toLowerCase().includes(q)) || 
      (s.prenom && s.prenom.toLowerCase().includes(q)) || 
      (s.email && s.email.toLowerCase().includes(q))
    );
  }

  setKycFilter(statut: string) {
    this.filterKyc = statut;
    this.loadStudents();
  }

  viewDetails(student: StudentResponse) {
    this.selectedStudent = student;
    this.studentDocuments = [];
    this.isLoadingDocs = true;
    
    this.studentService.getDocuments(student.trackingId).subscribe({
      next: (res) => {
        this.studentDocuments = res.content || [];
        this.isLoadingDocs = false;
      },
      error: (err) => {
        if(err.status !== 404) {
          console.error("Erreur docs", err);
        }
        this.isLoadingDocs = false;
      }
    });
  }

  closeDetails() {
    this.selectedStudent = null;
    this.studentDocuments = [];
  }

  getShortId(id: string): string {
    if (!id) return '';
    return id.substring(0, 8).toUpperCase();
  }
}

