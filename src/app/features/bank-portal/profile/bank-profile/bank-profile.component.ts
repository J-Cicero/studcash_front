import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { BankPortalService, BanqueInfo } from '../../../../core/services/bank-portal.service';

@Component({
  selector: 'app-bank-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 animate-fade-in-up">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
            Mon Profil
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Informations de votre compte agent et de votre banque</p>
        </div>
      </div>

      <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-12 space-y-3">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-sm text-slate-500 font-medium animate-pulse">Chargement des données...</p>
      </div>

      <div *ngIf="updateSuccess" class="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-4 border border-emerald-200 dark:border-emerald-800/50 flex items-center space-x-3 text-emerald-800 dark:text-emerald-300">
        <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-sm font-semibold">Profil mis à jour avec succès ! (Simulation)</span>
      </div>

      <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Agent Info Edit Form -->
        <div class="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/60">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Modifier mes informations</h2>
            <button *ngIf="!isEditMode" type="button" (click)="toggleEditMode()" class="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40">
              Modifier
            </button>
            <button *ngIf="isEditMode" type="button" (click)="cancelEditMode()" class="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors dark:text-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700">
              Annuler
            </button>
          </div>
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Prénom</label>
                <input type="text" formControlName="firstName" [ngClass]="{'bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed': !isEditMode, 'bg-white dark:bg-slate-800': isEditMode}" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nom</label>
                <input type="text" formControlName="lastName" [ngClass]="{'bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed': !isEditMode, 'bg-white dark:bg-slate-800': isEditMode}" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email <span class="text-[10px] text-slate-400 normal-case">(Non modifiable)</span></label>
              <input type="email" formControlName="email" class="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 cursor-not-allowed">
            </div>

            <div *ngIf="isEditMode" class="animate-fade-in">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nouveau Mot de Passe</label>
              <input type="password" formControlName="password" placeholder="Laissez vide pour ne pas modifier" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
            </div>

            <div class="pt-2" *ngIf="isEditMode">
              <button type="submit" [disabled]="profileForm.invalid || isUpdating" class="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center animate-fade-in">
                <svg *ngIf="isUpdating" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>

        <!-- Bank Info Card -->
        <div class="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/60">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Informations de la Banque</h2>
          <div class="space-y-4" *ngIf="banqueInfo">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nom de la Banque</p>
              <p class="font-medium text-slate-900 dark:text-white">{{ banqueInfo.nom }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Code Banque</p>
              <p class="font-medium text-slate-900 dark:text-white">{{ banqueInfo.code }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Compte Central GNS (Pour vos virements)</p>
              <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 mt-1">
                <p *ngIf="banqueInfo.compteCentralGns" class="text-sm font-mono text-blue-800 dark:text-blue-300">{{ banqueInfo.compteCentralGns }}</p>
                <p *ngIf="!banqueInfo.compteCentralGns" class="text-sm font-mono text-blue-800 dark:text-blue-300 opacity-70">En attente de configuration GNS...</p>
              </div>
            </div>
          </div>
          <div *ngIf="!banqueInfo" class="text-sm text-amber-600 dark:text-amber-400">
            Impossible de charger les informations de votre banque.
          </div>
        </div>
      </div>
    </div>
  `
})
export class BankProfileComponent implements OnInit {
  banqueInfo: BanqueInfo | null = null;
  isLoading = true;
  isUpdating = false;
  updateSuccess = false;
  isEditMode = false;
  profileForm: FormGroup;
  originalValues: any;

  constructor(
    public authService: AuthService,
    private bankPortalService: BankPortalService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: [{value: '', disabled: true}, Validators.required],
      lastName: [{value: '', disabled: true}, Validators.required],
      email: [{value: '', disabled: true}],
      password: ['']
    });
  }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      this.originalValues = {
        firstName: user.firstName,
        lastName: user.lastName
      };
    }

    const operatorId = user?.trackingId;
    if (!operatorId) {
      this.isLoading = false;
      return;
    }

    this.bankPortalService.getBanqueInfo(operatorId).subscribe({
      next: (bank) => {
        this.banqueInfo = bank;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur Info Banque:", err);
        this.isLoading = false;
      }
    });
  }

  toggleEditMode() {
    this.isEditMode = true;
    this.profileForm.get('firstName')?.enable();
    this.profileForm.get('lastName')?.enable();
  }

  cancelEditMode() {
    this.isEditMode = false;
    this.profileForm.get('firstName')?.disable();
    this.profileForm.get('lastName')?.disable();
    this.profileForm.get('password')?.setValue('');
    if (this.originalValues) {
      this.profileForm.patchValue(this.originalValues);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    
    this.isUpdating = true;
    this.updateSuccess = false;
    
    // Simulation
    setTimeout(() => {
      this.isUpdating = false;
      this.updateSuccess = true;
      
      this.originalValues = {
        firstName: this.profileForm.get('firstName')?.value,
        lastName: this.profileForm.get('lastName')?.value
      };
      
      this.cancelEditMode();
      
      const currentUser = this.authService.currentUserValue;
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          firstName: this.originalValues.firstName,
          lastName: this.originalValues.lastName
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      setTimeout(() => this.updateSuccess = false, 4000);
    }, 800);
  }
}
