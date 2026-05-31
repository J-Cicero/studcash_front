import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDbsService, StudentDbsStatsResponse } from '../../../core/services/admin-dbs.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-etudiants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etudiants.component.html',
  styleUrl: './etudiants.component.scss'
})
export class EtudiantsComponent implements OnInit {
  students: StudentDbsStatsResponse[] = [];
  isLoading = true;
  errorMessage = '';

  // Pagination
  currentPage = 0;
  pageSize = 50;
  totalElements = 0;

  // Search
  searchQuery = '';

  constructor(private adminDbsService: AdminDbsService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminDbsService.getStudentStats(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.totalElements = res.totalElements || res.content?.length || 0;
        this.students = res.content || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement', err);
        this.errorMessage = 'Erreur lors du chargement des étudiants.';
        this.isLoading = false;
      }
    });
  }
  
  get filteredStudents(): StudentDbsStatsResponse[] {
    if (!this.searchQuery) return this.students;
    const q = this.searchQuery.toLowerCase();
    return this.students.filter(s => 
      (s.nom && s.nom.toLowerCase().includes(q)) || 
      (s.prenom && s.prenom.toLowerCase().includes(q)) || 
      (s.numEtudiantUniv && s.numEtudiantUniv.toLowerCase().includes(q))
    );
  }
}


