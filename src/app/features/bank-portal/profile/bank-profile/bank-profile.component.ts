import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { BankPortalService, BanqueInfo } from '../../../../core/services/bank-portal.service';

@Component({
  selector: 'app-bank-profile',
  standalone: true,
  imports: [CommonModule],
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

      <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Agent Info Card -->
        <div class="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/60">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Informations de l'Agent</h2>
          <div class="space-y-4">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nom Complet</p>
              <p class="font-medium text-slate-900 dark:text-white">{{ (authService.currentUser$ | async)?.firstName }} {{ (authService.currentUser$ | async)?.lastName }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</p>
              <p class="font-medium text-slate-900 dark:text-white">{{ (authService.currentUser$ | async)?.email }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rôle</p>
              <p class="font-medium text-slate-900 dark:text-white">Agent Bancaire</p>
            </div>
          </div>
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
                <p class="text-sm font-mono text-blue-800 dark:text-blue-300">En attente de configuration GNS...</p>
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

  constructor(
    public authService: AuthService,
    private bankPortalService: BankPortalService
  ) {}

  ngOnInit(): void {
    const operatorId = this.authService.currentUserValue?.trackingId;
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
}
