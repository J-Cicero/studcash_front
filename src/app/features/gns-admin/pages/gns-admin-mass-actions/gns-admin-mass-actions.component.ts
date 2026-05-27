import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { ScolariteYearService, ScolariteYear } from '../../../../core/services/scolarite-year.service';
import { VersementService } from '../../../../core/services/versement.service';

@Component({
  selector: 'app-gns-admin-mass-actions',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule, ButtonModule, SkeletonModule, DialogModule, InputTextModule],
  templateUrl: './gns-admin-mass-actions.component.html',
  styleUrls: ['./gns-admin-mass-actions.component.scss']
})
export class GnsAdminMassActionsComponent implements OnInit, OnDestroy {
  progress = signal(0);
  isLoading = signal(false);
  isConfirmDialogOpen = signal(false);
  isConfirmBoutiqueDialogOpen = signal(false);
  
  montantFixe = signal<number | null>(null);
  
  // Parameters from DB (Used as default values but user can change them)
  montantQuota = signal<number | null>(null);
  seuilBoutique = signal<number | null>(null);
  

  schoolYears = signal<ScolariteYear[]>([]);
  activeYear = signal<ScolariteYear | null>(null);
  disbursementHistory = signal<any[]>([]);


  private yearService = inject(ScolariteYearService);
  private versementService = inject(VersementService);

  private progressInterval: any;

  ngOnInit() {
    this.loadData();
    this.loadHistory();
  }

  loadData() {
    this.yearService.getAll().subscribe(years => {
        this.schoolYears.set(years);
        this.activeYear.set(years.find(y => y.estOuverte) || null);
    });
  }

  loadHistory() {
    this.versementService.getAll(0, 10).subscribe({
        next: (data) => this.disbursementHistory.set(data.content),
        error: (err) => console.error('Error fetching history', err)
    });
  }

  triggerMassDisbursement() {
    if (!this.activeYear()) return;
    this.montantFixe.set(null); // Force user to enter
    this.isConfirmDialogOpen.set(true);
  }

  cancelMassDisbursement() {
    this.isConfirmDialogOpen.set(false);
  }

  confirmMassDisbursement() {
    if (!this.activeYear()) return;
    const montant = this.montantFixe();
    if (!montant || montant <= 0) return;

    this.isConfirmDialogOpen.set(false);
    this.isLoading.set(true);
    this.progress.set(10);
    
    // Pass the inputted amount to backend
    this.versementService.disburseMassStudents(this.activeYear()!.trackingId, montant).subscribe({
        next: (res) => {
            this.progress.set(100);
            this.isLoading.set(false);
            this.loadHistory();
            clearInterval(this.progressInterval);
        },
        error: (err) => {
            console.error('Error in mass disbursement', err);
            this.isLoading.set(false);
            this.progress.set(0);
            clearInterval(this.progressInterval);
        }
    });

  // Simple fake progress animation until SSE is implemented
    this.progressInterval = setInterval(() => {
        if (this.progress() < 90) {
            this.progress.update(v => v + 5);
        }
    }, 1000);
  }

  triggerMassBoutiqueRecharge() {
    this.isConfirmBoutiqueDialogOpen.set(true);
  }

  cancelMassBoutiqueRecharge() {
    this.isConfirmBoutiqueDialogOpen.set(false);
  }

  confirmMassBoutiqueRecharge() {
    const montant = this.montantQuota();
    const seuil = this.seuilBoutique();
    if (!montant || montant <= 0 || !seuil || seuil < 0) return;
    
    this.isConfirmBoutiqueDialogOpen.set(false);
    this.isLoading.set(true);
    
    this.versementService.rechargeMassBoutiques(seuil, montant).subscribe({
        next: (res) => {
            this.isLoading.set(false);
            this.loadHistory();
        },
        error: (err) => {
            console.error('Error in mass boutique recharge', err);
            this.isLoading.set(false);
        }
    });
  }

  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }
}
