import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDbsService, StudentDbsStatsResponse } from '../../../core/services/admin-dbs.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  students: StudentDbsStatsResponse[] = [];
  totalElements = 0;
  isLoading = true;
  errorMessage = '';
  searchQuery = '';

  constructor(private adminDbsService: AdminDbsService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminDbsService.getStudentStats(0, 50).subscribe({
      next: (res) => {
        this.students = res.content || [];
        this.totalElements = res.totalElements || this.students.length || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur de chargement du dashboard DBS', error);
        this.errorMessage = 'Impossible de charger les données réelles du tableau de bord DBS.';
        this.students = [];
        this.totalElements = 0;
        this.isLoading = false;
      }
    });
  }

  get filteredStudents(): StudentDbsStatsResponse[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.students;
    }

    return this.students.filter((student) => {
      const fullName = `${student.nom ?? ''} ${student.prenom ?? ''}`.toLowerCase();
      return fullName.includes(query)
        || (student.numEtudiantUniv ?? '').toLowerCase().includes(query)
        || (student.universiteNom ?? '').toLowerCase().includes(query)
        || (student.typeBourse ?? '').toLowerCase().includes(query);
    });
  }

  get totalSpent(): number {
    return this.students.reduce((sum, student) => sum + Number(student.argentDepense || 0), 0);
  }

  get tuitionPaidCount(): number {
    return this.students.filter((student) => student.paiementScolariteFait).length;
  }

  get universitiesCount(): number {
    return new Set(this.students.map((student) => student.universiteNom).filter((value): value is string => !!value)).size;
  }

  get scholarshipTypes(): number {
    return new Set(this.students.map((student) => student.typeBourse).filter((value): value is string => !!value)).size;
  }

  formatTypeBourse(typeBourse: string | null | undefined): string {
    return typeBourse && typeBourse.trim() ? typeBourse : 'Aucune';
  }
}
