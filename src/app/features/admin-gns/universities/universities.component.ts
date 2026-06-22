import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UniversiteService } from '../../../core/services/universite.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-universities',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './universities.component.html',
  styleUrls: ['./universities.component.scss']
})
export class UniversitiesComponent implements OnInit {
  universities: any[] = [];
  summaryStats: any[] = [];
  isLoading = false;
  isCreating = false;
  showForm = false;
  editingUniv: any | null = null;
  
  successMessage = '';
  errorMessage = '';
  
  createForm: FormGroup;

  // Custom Confirmation Dialog state
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  onConfirmCallback: (() => void) | null = null;

  constructor(
    private fb: FormBuilder,
    private universiteService: UniversiteService
  ) {
    this.createForm = this.fb.group({
      code: ['', Validators.required],
      nom: ['', Validators.required],
      ville: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadUniversities();
    this.loadSummaryStats();
  }

  confirmAction(title: string, message: string, callback: () => void) {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.onConfirmCallback = callback;
    this.showConfirmModal = true;
  }

  onModalConfirm() {
    if (this.onConfirmCallback) {
      this.onConfirmCallback();
    }
    this.showConfirmModal = false;
    this.onConfirmCallback = null;
  }

  onModalCancel() {
    this.showConfirmModal = false;
    this.onConfirmCallback = null;
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
        this.summaryStats = res || [];
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getStatsForUniversite(trackingId: string): any {
    return this.summaryStats.find(s => s.trackingId === trackingId);
  }

  openEditModal(u: any) {
    this.editingUniv = u;
    this.createForm.patchValue({
      code: u.code,
      nom: u.fullName,
      ville: u.city,
      isActive: u.isActive
    });
    this.showForm = true;
  }

  onSubmit() {
    if (this.createForm.invalid) return;

    this.isCreating = true;
    const universityData = {
      fullName: this.createForm.value.nom,
      code: this.createForm.value.code,
      city: this.createForm.value.ville,
      isActive: this.createForm.value.isActive
    };

    if (this.editingUniv) {
      this.universiteService.update(this.editingUniv.trackingId, universityData).subscribe({
        next: () => {
          this.loadUniversities();
          this.loadSummaryStats();
          this.showForm = false;
          this.editingUniv = null;
          this.createForm.reset({ isActive: true });
          this.successMessage = "Université modifiée avec succès.";
          this.isCreating = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || "Erreur lors de la modification.";
          this.isCreating = false;
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
    } else {
      this.universiteService.create(universityData).subscribe({
        next: () => {
          this.loadUniversities();
          this.loadSummaryStats();
          this.showForm = false;
          this.createForm.reset({ isActive: true });
          this.successMessage = "Université ajoutée avec succès.";
          this.isCreating = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || "Erreur lors de la création.";
          this.isCreating = false;
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
    }
  }

  toggleUniversiteStatus(univ: any) {
    this.universiteService.updateEtat(univ.trackingId, !univ.isActive).subscribe({
      next: (res) => {
        this.loadUniversities();
        this.successMessage = `Université ${res.fullName} ${res.isActive ? 'activée' : 'désactivée'}.`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = "Erreur lors du changement de statut.";
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  deleteUniversite(univ: any) {
    this.confirmAction(
      'Suppression d\'université',
      `Êtes-vous sûr de vouloir supprimer l'université ${univ.fullName} ?`,
      () => {
        this.universiteService.delete(univ.trackingId).subscribe({
          next: () => {
            this.loadUniversities();
            this.successMessage = `Université ${univ.fullName} supprimée.`;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (err: any) => {
            this.errorMessage = err.error?.message || "Erreur lors de la suppression.";
            setTimeout(() => this.errorMessage = '', 5000);
          }
        });
      }
    );
  }

}
