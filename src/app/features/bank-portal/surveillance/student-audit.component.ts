import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { 
  BankPortalService, 
  StudentLiquidationInfo,
  StudentDepense
} from '../../../core/services/bank-portal.service';

@Component({
  selector: 'app-student-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-audit.component.html',
  styleUrls: ['./student-audit.component.scss']
})
export class StudentAuditComponent implements OnInit {
  students: StudentLiquidationInfo[] = [];
  filteredStudents: StudentLiquidationInfo[] = [];
  searchTerm: string = '';
  isLoading = false;
  
  selectedStudent: StudentLiquidationInfo | null = null;
  depenses: StudentDepense[] = [];
  isLoadingDepenses = false;

  constructor(
    private bankPortalService: BankPortalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    const operatorId = this.authService.currentUserValue?.trackingId;
    if (!operatorId) return;

    this.isLoading = true;
    this.bankPortalService.getStudents(operatorId).subscribe({
      next: (data: any) => {
        this.students = data;
        this.filteredStudents = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.students.filter(s => 
      s.nom.toLowerCase().includes(term) || 
      s.prenom.toLowerCase().includes(term) ||
      s.numEtudiant.toLowerCase().includes(term)
    );
  }

  selectStudent(student: StudentLiquidationInfo): void {
    this.selectedStudent = student;
    this.loadDepenses(student.studentTrackingId);
  }

  loadDepenses(studentTrackingId: string): void {
    this.isLoadingDepenses = true;
    this.bankPortalService.getStudentDepenses(studentTrackingId).subscribe({
      next: (data: any) => {
        // Sort chronologically, latest first
        this.depenses = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.isLoadingDepenses = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoadingDepenses = false;
      }
    });
  }
}
