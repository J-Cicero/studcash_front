import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UniversiteService } from '../../../core/services/universite.service';

@Component({
  selector: 'app-universities',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './universities.component.html',
  styleUrls: ['./universities.component.scss']
})
export class UniversitiesComponent implements OnInit {
  universities: any[] = [];
  summaryStats: any[] = [];
  isLoading = false;
  isCreating = false;
  showForm = false;
  
  successMessage = '';
  errorMessage = '';
  
  createForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private universiteService: UniversiteService
  ) {
    this.createForm = this.fb.group({
      code: ['', Validators.required],
      nom: ['', Validators.required],
      ville: [''],
      estActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadUniversities();
    this.loadSummaryStats();
  }

  loadUniversities() {
    this.isLoading = true;
    this.universiteService.findAll().subscribe({
      next: (res) => {
        this.universities = res.content || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = "Erreur lors du chargement des universités.";
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  loadSummaryStats() {
    this.universiteService.getSummaryStats().subscribe({
      next: (res) => {
        this.summaryStats = res;
      },
      error: (err) => {
        console.error("Erreur chargement stats:", err);
      }
    });
  }

  getStatsForUniversite(trackingId: string): any {
    return this.summaryStats.find(s => s.trackingId === trackingId) || null;
  }

  onSubmit() {
    if (this.createForm.invalid) return;

    this.isCreating = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = this.createForm.value;

    this.universiteService.create(payload).subscribe({
      next: (res) => {
        this.isCreating = false;
        this.showForm = false;
        this.successMessage = `Université ${res.nom} créée avec succès.`;
        this.createForm.reset({ estActive: true });
        this.loadUniversities();
        this.loadSummaryStats();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err) => {
        this.isCreating = false;
        this.errorMessage = "Erreur lors de la création de l'université.";
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  toggleUniversiteStatus(univ: any) {
    this.universiteService.updateEtat(univ.trackingId, !univ.estActive).subscribe({
      next: (res) => {
        this.loadUniversities();
        this.successMessage = `Université ${res.nom} ${res.estActive ? 'activée' : 'désactivée'}.`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = "Erreur lors du changement de statut.";
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  formatNumberCompact(value: number | null | undefined): string {
    if (value == null || isNaN(value)) return '0';
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace(/\.0$/, '') + ' M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1).replace(/\.0$/, '') + ' k';
    }
    return value.toString();
  }
}
