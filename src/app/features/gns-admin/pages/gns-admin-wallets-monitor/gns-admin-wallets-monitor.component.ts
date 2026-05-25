import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { BoutiqueService, BoutiqueResponse } from '../../../../core/services/boutique.service';
import { WalletService } from '../../../../core/services/wallet.service';
import { VersementService } from '../../../../core/services/versement.service';
import { forkJoin, map } from 'rxjs';

export interface BoutiqueWithWallet extends BoutiqueResponse {
  solde: number;
  plafond: number;
  utilisation: number;
}

@Component({
  selector: 'app-gns-admin-wallets-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule, ButtonModule, SkeletonModule, DialogModule, InputTextModule],
  templateUrl: './gns-admin-wallets-monitor.component.html',
  styleUrls: ['./gns-admin-wallets-monitor.component.scss']
})
export class GnsAdminWalletsMonitorComponent implements OnInit {
  isModalOpen = signal(false);
  isCreateWalletModalOpen = signal(false);
  isLoading = signal(false);
  seuil = signal<number | null>(null);
  montantQuota = signal<number | null>(null);
  isSubmittingQuota = signal(false);

  boutiques = signal<BoutiqueWithWallet[]>([]);
  
  criticalCount = computed(() => this.boutiques().filter(b => b.utilisation > 90).length);

  private boutiqueService = inject(BoutiqueService);
  private walletService = inject(WalletService);
  private versementService = inject(VersementService);

  ngOnInit(): void {
    this.loadBoutiques();
  }

  loadBoutiques() {
    this.isLoading.set(true);
    this.boutiqueService.getAll(0, 50).subscribe({
      next: (data) => {
        const obs = data.content.map(b => 
          this.walletService.getById(b.walletTrackingId).pipe(
            map(w => ({
              ...b,
              solde: w.solde,
              plafond: w.plafond,
              utilisation: w.plafond > 0 ? ((w.plafond - w.solde) / w.plafond) * 100 : 0
            }))
          )
        );

        if (obs.length === 0) {
            this.boutiques.set([]);
            this.isLoading.set(false);
            return;
        }

        forkJoin(obs).subscribe({
          next: (results) => {
            this.boutiques.set(results);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Error fetching wallets', err);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error fetching boutiques', err);
        this.isLoading.set(false);
      }
    });
  }

  openModal() {
    this.seuil.set(null);
    this.montantQuota.set(null);
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen.set(false);
    document.body.style.overflow = 'auto';
  }

  confirmQuotaAdjustment() {
    const seuil = this.seuil();
    const montantQuota = this.montantQuota();

    if (seuil === null || seuil < 0 || montantQuota === null || montantQuota <= 0) {
      return;
    }

    this.isSubmittingQuota.set(true);
    this.versementService.rechargeMassBoutiques(seuil, montantQuota).subscribe({
      next: () => {
        this.isSubmittingQuota.set(false);
        this.closeModal();
        this.loadBoutiques();
      },
      error: (err) => {
        console.error('Error recharging boutique quotas', err);
        this.isSubmittingQuota.set(false);
      }
    });
  }

  openCreateWalletModal() {
    this.isCreateWalletModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeCreateWalletModal() {
    this.isCreateWalletModalOpen.set(false);
    document.body.style.overflow = 'auto';
  }
}
