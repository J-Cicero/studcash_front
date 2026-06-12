import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScolariteYearService } from '../../../core/services/scolarite-year.service';

@Component({
  selector: 'app-scolarite-years',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './scolarite-years.component.html',
  styleUrls: []
})
export class ScolariteYearsComponent implements OnInit {
  scolariteYears: any[] = [];
  isLoading = false;
  isCreating = false;
  showForm = false;
  
  successMessage = '';
  errorMessage = '';
  
  createForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private scolariteYearService: ScolariteYearService
  ) {
    this.createForm = this.fb.group({
      libelle: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadYears();
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  loadYears() {
    this.isLoading = true;
    this.scolariteYearService.getAll().subscribe({
      next: (res) => {
        this.scolariteYears = res.content || res || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = "Erreur lors du chargement des années scolaires.";
      }
    });
  }

  isYearEditable(year: any): boolean {
    return year.estActive === true;
  }

  cloturerYear(year: any) {
    if (confirm(`Êtes-vous sûr de vouloir clôturer l'année ${year.libelle} ?`)) {
      this.scolariteYearService.cloturer(year.trackingId).subscribe({
        next: () => {
          this.successMessage = "Année clôturée avec succès.";
          this.loadYears();
        },
        error: () => this.errorMessage = "Erreur lors de la clôture."
      });
    }
  }

  onSubmit() {
    if (this.createForm.invalid) return;

    this.isCreating = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = this.createForm.value;

    this.scolariteYearService.create(payload).subscribe({
      next: (res) => {
        this.isCreating = false;
        this.successMessage = `Année ${res.libelle || payload.libelle} créée avec succès.`;
        this.createForm.reset();
        this.showForm = false;
        this.loadYears();
      },
      error: (err) => {
        this.isCreating = false;
        this.errorMessage = "Erreur lors de la création de l'année scolaire.";
      }
    });
  }
}
