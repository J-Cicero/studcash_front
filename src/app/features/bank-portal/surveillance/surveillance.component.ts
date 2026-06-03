import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletService, WalletResponse } from '../../../core/services/wallet.service';

interface WalletAlert {
  id: string;
  type: 'Etudiant' | 'Boutique';
  ownerName: string;
  balance: number;
  status: 'ACTIF' | 'GELE' | 'BLOQUE';
  suspiciousActivity: boolean;
  lastTransactionDate: Date;
  rawResponse: WalletResponse; // Keep reference to update it easily
}

@Component({
  selector: 'app-surveillance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './surveillance.component.html',
  styleUrls: ['./surveillance.component.scss']
})
export class SurveillanceComponent implements OnInit {
  wallets: WalletAlert[] = [];
  filteredWallets: WalletAlert[] = [];
  isLoading = true;
  isActionLoading = false;
  actionMessage = '';

  // Filters
  statusFilter = 'ALL';
  searchTerm = '';

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    this.loadWallets();
  }

  loadWallets(): void {
    this.isLoading = true;
    // Load student and boutique wallets
    this.walletService.filterWallets('ALL', 'ALL', 0, 100).subscribe({
      next: (res) => {
        const content: WalletResponse[] = res.content || [];
        this.wallets = content
          .filter(w => w.typeWallet === 'STUDENT' || w.typeWallet === 'BOUTIQUE')
          .map(w => {
            const isSuspicious = w.typeWallet === 'BOUTIQUE' && w.solde > 5000000 && w.statutWallet === 'ACTIF';
            return {
              id: w.trackingId,
              type: w.typeWallet === 'STUDENT' ? 'Etudiant' : 'Boutique',
              ownerName: w.ownerName || 'Inconnu',
              balance: w.solde,
              status: (w.statutWallet as 'ACTIF' | 'GELE' | 'BLOQUE') || 'ACTIF',
              suspiciousActivity: isSuspicious, // Boutique with high balance could be flagged
              lastTransactionDate: w.dateCreation ? new Date(w.dateCreation) : new Date(),
              rawResponse: w
            };
          });
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des portefeuilles :", err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let temp = [...this.wallets];

    // Status filter
    if (this.statusFilter === 'suspect') {
      temp = temp.filter(w => w.suspiciousActivity);
    } else if (this.statusFilter !== 'ALL') {
      temp = temp.filter(w => w.status === this.statusFilter);
    }

    // Search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(w => 
        w.ownerName.toLowerCase().includes(term) || 
        w.id.toLowerCase().includes(term)
      );
    }

    this.filteredWallets = temp;
  }

  updateWalletStatus(wallet: WalletAlert, newStatus: 'ACTIF' | 'GELE' | 'BLOQUE') {
    this.isActionLoading = true;
    this.actionMessage = '';

    const req = {
      typeWallet: wallet.rawResponse.typeWallet,
      statutWallet: newStatus,
      solde: wallet.rawResponse.solde,
      plafond: wallet.rawResponse.plafond,
      estVerrouille: wallet.rawResponse.estVerrouille,
      dateCreation: wallet.rawResponse.dateCreation
    };

    this.walletService.updateWallet(wallet.id, req).subscribe({
      next: (res) => {
        this.actionMessage = `Portefeuille de ${res.ownerName || 'Inconnu'} mis à jour avec le statut ${newStatus}.`;
        this.isActionLoading = false;
        this.loadWallets();
      },
      error: (err) => {
        this.actionMessage = `Erreur lors de la mise à jour du portefeuille.`;
        this.isActionLoading = false;
        console.error(err);
      }
    });
  }

  gelerWallet(id: string) {
    const w = this.wallets.find(w => w.id === id);
    if (w) this.updateWalletStatus(w, 'GELE');
  }

  bloquerWallet(id: string) {
    const w = this.wallets.find(w => w.id === id);
    if (w) this.updateWalletStatus(w, 'BLOQUE');
  }

  debloquerWallet(id: string) {
    const w = this.wallets.find(w => w.id === id);
    if (w) this.updateWalletStatus(w, 'ACTIF');
  }
}
