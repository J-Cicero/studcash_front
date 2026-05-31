import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VersementService } from '../../../core/services/versement.service';

@Component({
  selector: 'app-versements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './versements.component.html',
  styleUrls: ['./versements.component.scss']
})
export class VersementsComponent implements OnInit {
  isProcessing = false;
  successMessage = '';
  errorMessage = '';
  
  versementForm: FormGroup;
  resetForm: FormGroup;

  activeTab: 'versement' | 'reset' = 'versement';

  constructor(private fb: FormBuilder, private versementService: VersementService) {
    this.versementForm = this.fb.group({
      target: ['students', Validators.required],
      scolariteYearTrackingId: [''],
      montantFixe: [null],
      seuil: [null],
      montantQuota: [null]
    });

    this.resetForm = this.fb.group({
      target: ['students', Validators.required],
      scolariteYearTrackingId: ['']
    });
  }

  ngOnInit(): void {}

  setTab(tab: 'versement' | 'reset') {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
  }

  onVersementSubmit() {
    if (this.versementForm.invalid) return;
    this.isProcessing = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    const val = this.versementForm.value;
    
    if (val.target === 'students') {
      this.versementService.masseEtudiants({
        scolariteYearTrackingId: val.scolariteYearTrackingId,
        montantFixe: val.montantFixe
      }).subscribe({
        next: (res) => {
          this.isProcessing = false;
          this.successMessage = res || 'Versement étudiant effectué.';
        },
        error: (err) => {
          this.isProcessing = false;
          this.errorMessage = 'Erreur lors du versement.';
        }
      });
    } else {
      this.versementService.masseBoutiques({
        seuil: val.seuil,
        montantQuota: val.montantQuota
      }).subscribe({
        next: (res) => {
          this.isProcessing = false;
          this.successMessage = res || 'Recharge boutique effectuée.';
        },
        error: (err) => {
          this.isProcessing = false;
          this.errorMessage = 'Erreur lors de la recharge.';
        }
      });
    }
  }

  onResetSubmit() {
    if (this.resetForm.invalid) return;
    this.isProcessing = true;
    this.successMessage = '';
    this.errorMessage = '';

    const val = this.resetForm.value;
    
    if (val.target === 'students') {
      this.versementService.resetMasseEtudiants({
        scolariteYearTrackingId: val.scolariteYearTrackingId
      }).subscribe({
        next: (res) => {
          this.isProcessing = false;
          this.successMessage = res || 'Remise à zéro étudiants effectuée.';
        },
        error: (err) => {
          this.isProcessing = false;
          this.errorMessage = 'Erreur lors de la remise à zéro.';
        }
      });
    } else {
      this.versementService.resetMasseBoutiques({
        scolariteYearTrackingId: val.scolariteYearTrackingId
      }).subscribe({
        next: (res) => {
          this.isProcessing = false;
          this.successMessage = res || 'Remise à zéro boutiques effectuée.';
        },
        error: (err) => {
          this.isProcessing = false;
          this.errorMessage = 'Erreur lors de la remise à zéro.';
        }
      });
    }
  }
}
