import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { UniversiteService } from '../../../core/services/universite.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-universities',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConfirmDialogComponent],
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
  openRowMenuId: string | null = null;
  
  successMessage = '';
  errorMessage = '';
  
  createForm: FormGroup;
  searchQuery = '';

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
  }

  @HostListener('document:click')
  closeRowMenu(): void {
    this.openRowMenuId = null;
  }

  toggleRowMenu(trackingId: string, event: Event): void {
    event.stopPropagation();
    this.openRowMenuId = this.openRowMenuId === trackingId ? null : trackingId;
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
        const unmappedUniversities = res.content || [];
        // Load summary stats right after universities are fetched
        this.universiteService.getSummaryStats().subscribe({
          next: (statsRes) => {
            this.summaryStats = statsRes || [];
            // Map stats directly to the university objects
            this.universities = unmappedUniversities.map((u: any) => {
              const uStats = this.summaryStats.find(s => 
                s.trackingId && s.trackingId.toLowerCase() === u.trackingId.toLowerCase()
              );
              return { ...u, stats: uStats || { nbEtudiants: 0, nbEligibles: 0 } };
            });
            this.isLoading = false;
          },
          error: (err) => {
            console.error(err);
            this.summaryStats = [];
            this.universities = unmappedUniversities.map((u: any) => ({ ...u, stats: { nbEtudiants: 0, nbEligibles: 0 } }));
            this.isLoading = false;
          }
        });
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
    // Legacy method kept if needed, but the mapping is now handled in loadUniversities
  }

  getStatsForUniversite(trackingId: string): any {
    // Deprecated in template: template should use u.stats.nbEtudiants directly
    if (!trackingId || !this.summaryStats) return null;
    return this.summaryStats.find(s => 
      s.trackingId && s.trackingId.toLowerCase() === trackingId.toLowerCase()
    );
  }

  get filteredUniversities(): any[] {
    if (!this.searchQuery || !this.searchQuery.trim()) {
      return this.universities;
    }
    const q = this.searchQuery.trim().toLowerCase();
    return this.universities.filter(u => {
      const code = (u.code || '').toLowerCase();
      const nom = (u.fullName || '').toLowerCase();
      const ville = (u.city || '').toLowerCase();
      return code.includes(q) || nom.includes(q) || ville.includes(q);
    });
  }

  openCreateModal() {
    this.editingUniv = null;
    this.createForm.reset({
      code: '',
      nom: '',
      ville: '',
      isActive: true
    });
    this.errorMessage = '';
    this.showForm = true;
  }

  closeModal() {
    this.showForm = false;
    this.editingUniv = null;
    this.createForm.reset({ isActive: true });
    this.errorMessage = '';
  }

  openEditModal(u: any) {
    this.openRowMenuId = null;
    this.editingUniv = u;
    this.createForm.patchValue({
      code: u.code,
      nom: u.fullName,
      ville: u.city,
      isActive: u.isActive
    });
    this.errorMessage = '';
    this.showForm = true;
  }

  onSubmit() {
    if (this.createForm.invalid) return;

    this.isCreating = true;
    this.errorMessage = '';
    const universityData = {
      fullName: (this.createForm.value.nom || '').trim(),
      code: (this.createForm.value.code || '').trim().toUpperCase(),
      city: (this.createForm.value.ville || '').trim(),
      isActive: this.createForm.value.isActive !== false
    };

    if (this.editingUniv) {
      this.universiteService.update(this.editingUniv.trackingId, universityData).subscribe({
        next: () => {
          this.loadUniversities();
          this.closeModal();
          this.successMessage = "Université modifiée avec succès.";
          this.isCreating = false;
          setTimeout(() => this.successMessage = '', 4000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || err.error?.error || "Erreur lors de la modification.";
          this.isCreating = false;
        }
      });
    } else {
      this.universiteService.create(universityData).subscribe({
        next: () => {
          this.loadUniversities();
          this.closeModal();
          this.successMessage = "Université ajoutée avec succès.";
          this.isCreating = false;
          setTimeout(() => this.successMessage = '', 4000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || err.error?.error || "Erreur lors de la création de l'université.";
          this.isCreating = false;
        }
      });
    }
  }

  toggleUniversiteStatus(univ: any) {
    this.openRowMenuId = null;
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
    this.openRowMenuId = null;
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
