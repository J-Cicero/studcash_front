import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { BoutiqueService, BoutiqueResponse } from '../../../../core/services/boutique.service';
import { WalletService } from '../../../../core/services/wallet.service';
import { forkJoin, map } from 'rxjs';

export interface BoutiqueWithWallet extends BoutiqueResponse {
  solde: number;
  plafond: number;
  utilisation: number;
}

@Component({
  selector: 'app-gns-admin-wallets-monitor',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, SkeletonModule, DialogModule],
  templateUrl: './gns-admin-wallets-monitor.component.html',
  styleUrls: ['./gns-admin-wallets-monitor.component.scss']
})
export class GnsAdminWalletsMonitorComponent implements OnInit {
  isModalOpen = signal(false);
  isCreateWalletModalOpen = signal(false);
  isLoading = signal(false);

  boutiques = signal<BoutiqueWithWallet[]>([]);
  
  criticalCount = computed(() => this.boutiques().filter(b => b.utilisation > 90).length);

  private boutiqueService = inject(BoutiqueService);
  private walletService = inject(WalletService);

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
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen.set(false);
    document.body.style.overflow = 'auto';
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
