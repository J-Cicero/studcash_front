import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { BankPortalService, StudentLiquidationInfo, StudentDepense } from '../../../core/services/bank-portal.service';

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
  isLiquidating = false;
  liquidationSuccess = false;

  totalDepenses: number = 0;

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
      next: (data) => {
        this.students = data;
        this.filteredStudents = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.students.filter(s => 
      (s.nom && s.nom.toLowerCase().includes(term)) || 
      (s.prenom && s.prenom.toLowerCase().includes(term)) ||
      (s.numEtudiant && s.numEtudiant.toLowerCase().includes(term))
    );
  }

  selectStudent(student: StudentLiquidationInfo): void {
    this.selectedStudent = student;
    this.isLoadingDepenses = true;
    this.liquidationSuccess = false;
    
    this.bankPortalService.getStudentDepenses(student.studentTrackingId).subscribe({
      next: (data) => {
        this.depenses = data;
        this.totalDepenses = this.depenses.reduce((acc, curr) => acc + curr.montant, 0);
        this.isLoadingDepenses = false;
      },
      error: (err) => {
        console.error(err);
        this.depenses = [];
        this.totalDepenses = 0;
        this.isLoadingDepenses = false;
      }
    });
  }

  liquider(): void {
    if (!this.selectedStudent) return;
    this.isLiquidating = true;
    this.bankPortalService.marquerTraite(this.selectedStudent.studentTrackingId).subscribe({
      next: () => {
        this.isLiquidating = false;
        this.liquidationSuccess = true;
        this.depenses = [];
        this.totalDepenses = 0;
        this.loadStudents();
      },
      error: (err) => {
        console.error('Erreur lors de la liquidation', err);
        this.isLiquidating = false;
      }
    });
  }
}
