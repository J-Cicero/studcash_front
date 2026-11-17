import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ScolariteYearService } from '../../../core/services/scolarite-year.service';
import { InscriptionAnnuelleService } from '../../../core/services/inscription-annuelle.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-scolarite-years',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './scolarite-years.component.html',
  styleUrls: []
})
export class ScolariteYearsComponent implements OnInit {
  scolariteYears: any[] = [];
  allInscriptions: any[] = [];
  isLoading = false;
  isCreating = false;
  showForm = false;
  
  successMessage = '';
  errorMessage = '';
  openRowMenuId: string | null = null;
  
  createForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private scolariteYearService: ScolariteYearService,
    private inscriptionService: InscriptionAnnuelleService,
    private confirmService: ConfirmDialogService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      libelle: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required]
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openRowMenuId = null;
  }

  toggleRowMenu(trackingId: string, event: Event): void {
    event.stopPropagation();
    this.openRowMenuId = this.openRowMenuId === trackingId ? null : trackingId;
  }

  ngOnInit(): void {
    this.loadYearsAndStats();
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  loadYearsAndStats() {
    this.isLoading = true;
    this.scolariteYearService.getAll().subscribe({
      next: (res) => {
        const years = res.content || res || [];
        this.inscriptionService.findAll(0, 1000).subscribe({
          next: (insRes) => {
            this.allInscriptions = insRes.content || insRes || [];
            this.scolariteYears = years.map((y: any) => this.enrichYearWithStats(y));
            this.isLoading = false;
          },
          error: () => {
            this.scolariteYears = years.map((y: any) => this.enrichYearWithStats(y));
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = "Erreur lors du chargement des années scolaires.";
      }
    });
  }

  loadYears() {
    this.loadYearsAndStats();
  }

  private enrichYearWithStats(year: any): any {
    const label = (year.label || '').trim();
    const matching = (this.allInscriptions || []).filter((ins: any) =>
      ins.scolariteYearTrackingId === year.trackingId ||
      ins.anneeScolaireTrackingId === year.trackingId ||
      (ins.academicYearLabel && ins.academicYearLabel.trim() === label) ||
      (ins.anneeAcademique && ins.anneeAcademique.trim() === label) ||
      (!ins.academicYearLabel && !ins.anneeAcademique && year.isOpen)
    );

    const totalInscriptions = matching.length;
    const activeCount = matching.filter((i: any) => i.status === 'ACTIVE' || i.statut === 'ACTIF' || i.statut === 'VALIDE').length;
    const pendingCount = matching.filter((i: any) => i.status === 'EN_ATTENTE' || i.status === 'DOCUMENTS_EN_COURS' || i.statut === 'EN_ATTENTE_VALIDATION').length;
    const scholarshipCount = matching.filter((i: any) => i.isEligibleForScholarship === true || i.status === 'ACTIVE' || (i.allocatedBudget && i.allocatedBudget > 0)).length;
    const totalBudget = matching.reduce((acc: number, i: any) => acc + (Number(i.allocatedBudget) || (i.status === 'ACTIVE' ? 36000 : 0)), 0);

    let durationDays = 0;
    let progressPercent = 0;
    if (year.startDate && year.endDate) {
      const start = new Date(year.startDate).getTime();
      const end = new Date(year.endDate).getTime();
      const now = Date.now();
      if (end > start) {
        durationDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
        if (now <= start) progressPercent = 0;
        else if (now >= end) progressPercent = 100;
        else progressPercent = Math.round(((now - start) / (end - start)) * 100);
      }
    }

    return {
      ...year,
      totalInscriptions,
      activeCount,
      pendingCount,
      scholarshipCount,
      totalBudget,
      durationDays,
      progressPercent
    };
  }

  get activeYearObj(): any | null {
    return (this.scolariteYears || []).find(y => y.isOpen) || null;
  }

  get totalInscriptionsGlobal(): number {
    return (this.allInscriptions || []).length;
  }

  get totalScholarshipGlobal(): number {
    return (this.allInscriptions || []).filter((i: any) => i.isEligibleForScholarship === true || i.status === 'ACTIVE' || (i.allocatedBudget && i.allocatedBudget > 0)).length;
  }

  get totalBudgetGlobal(): number {
    return (this.allInscriptions || []).reduce((acc: number, i: any) => acc + (Number(i.allocatedBudget) || (i.status === 'ACTIVE' ? 36000 : 0)), 0);
  }

  formatNumber(val: number): string {
    if (!val && val !== 0) return '0';
    return new Intl.NumberFormat('fr-FR').format(val);
  }

  goToInscriptions(): void {
    this.openRowMenuId = null;
    this.router.navigate(['/admin-gns/inscriptions']);
  }

  isYearEditable(year: any): boolean {
    return year.isOpen === true;
  }

  async cloturerYear(year: any) {
    this.openRowMenuId = null;
    const confirmed = await this.confirmService.confirm({
      title: 'Clôture de l\'année scolaire',
      message: `Êtes-vous sûr de vouloir clôturer l'année ${year.label} ?`,
      confirmText: 'Clôturer',
      type: 'warning'
    });

    if (confirmed) {
      this.scolariteYearService.cloturer(year.trackingId).subscribe({
        next: () => {
          this.successMessage = "Année clôturée avec succès.";
          this.loadYears();
        },
        error: () => this.errorMessage = "Erreur lors de la clôture."
      });
    }
  }

  async deleteYear(year: any) {
    this.openRowMenuId = null;
    const confirmed = await this.confirmService.confirm({
      title: 'Suppression d\'année scolaire',
      message: `Êtes-vous sûr de vouloir supprimer l'année ${year.label} ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      type: 'danger'
    });

    if (confirmed) {
      this.scolariteYearService.delete(year.trackingId).subscribe({
        next: () => {
          this.successMessage = "Année scolaire supprimée avec succès.";
          this.loadYears();
        },
        error: () => this.errorMessage = "Erreur lors de la suppression de l'année scolaire."
      });
    }
  }

  onSubmit() {
    if (this.createForm.invalid) return;

    this.isCreating = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      label: this.createForm.value.libelle,
      startDate: this.createForm.value.dateDebut,
      endDate: this.createForm.value.dateFin,
      isOpen: true
    };

    this.scolariteYearService.create(payload).subscribe({
      next: (res) => {
        this.isCreating = false;
        this.successMessage = `Année ${res.label || payload.label} créée avec succès.`;
        this.createForm.reset();
        this.showForm = false;
        this.loadYears();
      },
      error: (err) => {
        this.isCreating = false;
        const msg = err.error?.message || err.message || "Erreur lors de la création de l'année scolaire.";
        this.errorMessage = msg;
      }
    });
  }
}
