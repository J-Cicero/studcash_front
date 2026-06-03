import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { BankPortalService } from '../../../core/services/bank-portal.service';
import { WalletService } from '../../../core/services/wallet.service';

interface WalletAlert {
  id: string; // studentTrackingId or boutiqueTrackingId
  walletId?: string; // walletTrackingId
  type: 'Etudiant' | 'Boutique';
  name: string;
  numEtudiant?: string; // only for student
  typeBourse?: string; // only for student
  scholarshipAmount?: number; // only for student
  spentAmount?: number; // only for student
  balance: number; // resteAPayer for student, soldeWallet for boutique
  status: 'ACTIF' | 'GELE' | 'BLOQUE';
  suspiciousActivity: boolean;
  lastTransactionDate: Date;
  numeroCompte?: string; // only for boutique
  ownerName?: string; // only for boutique
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

  activeTab: 'Etudiant' | 'Boutique' = 'Etudiant';

  // Filters
  statusFilter = 'ALL';
  searchTerm = '';

  constructor(
    private authService: AuthService,
    private bankPortalService: BankPortalService,
    private walletService: WalletService
  ) {}

  ngOnInit(): void {
    this.loadWallets();
  }

  loadWallets(): void {
    const operatorId = this.authService.currentUserValue?.trackingId;
    if (!operatorId) {
      this.isLoading = false;
      this.actionMessage = "Opérateur non identifié. Veuillez vous reconnecter.";
      return;
    }

    this.isLoading = true;
    forkJoin({
      students: this.bankPortalService.getStudents(operatorId),
      boutiques: this.bankPortalService.getBoutiques(operatorId)
    }).subscribe({
      next: (res) => {
        const studentWallets: WalletAlert[] = res.students.map(s => {
          const status = (s.walletStatus as 'ACTIF' | 'GELE' | 'BLOQUE') || 'ACTIF';
          return {
            id: s.studentTrackingId,
            walletId: s.walletTrackingId,
            type: 'Etudiant' as const,
            name: `${s.nom} ${s.prenom}`,
            numEtudiant: s.numEtudiant,
            typeBourse: s.typeBourse,
            scholarshipAmount: s.bourseTotale,
            spentAmount: s.depensesStudCash,
            balance: s.resteAPayer,
            status: status,
            suspiciousActivity: false,
            lastTransactionDate: new Date(),
            numeroCompte: s.numeroCompte
          };
        });

        const boutiqueWallets: WalletAlert[] = res.boutiques.map(b => {
          const status = (b.walletStatus as 'ACTIF' | 'GELE' | 'BLOQUE') || 'ACTIF';
          const isSuspicious = b.soldeWallet > 50000 && status === 'ACTIF'; // Flag high balance in demo
          return {
            id: b.boutiqueTrackingId,
            walletId: b.walletTrackingId,
            type: 'Boutique' as const,
            name: b.nomBoutique,
            ownerName: b.proprietaireNom,
            numeroCompte: b.numeroCompte,
            balance: b.soldeWallet,
            status: status,
            suspiciousActivity: isSuspicious,
            lastTransactionDate: new Date(),
          };
        });

        this.wallets = [...studentWallets, ...boutiqueWallets];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des portefeuilles :", err);
        this.actionMessage = "Erreur lors du chargement des portefeuilles.";
        this.isLoading = false;
      }
    });
  }

  switchTab(tab: 'Etudiant' | 'Boutique'): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters(): void {
    let temp = this.wallets.filter(w => w.type === this.activeTab);

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
        w.name.toLowerCase().includes(term) ||
        (w.numEtudiant && w.numEtudiant.toLowerCase().includes(term)) ||
        (w.typeBourse && w.typeBourse.toLowerCase().includes(term)) ||
        (w.ownerName && w.ownerName.toLowerCase().includes(term)) ||
        (w.numeroCompte && w.numeroCompte.toLowerCase().includes(term))
      );
    }

    this.filteredWallets = temp;
  }

  updateWalletStatus(wallet: WalletAlert, newStatus: 'ACTIF' | 'GELE' | 'BLOQUE') {
    if (!wallet.walletId) {
      this.actionMessage = "Impossible de modifier le statut : identifiant de portefeuille manquant.";
      return;
    }
    this.isActionLoading = true;
    this.actionMessage = '';

    // First fetch the raw wallet state to preserve fields (such as balance, creation date, type, etc.)
    this.walletService.getByTrackingId(wallet.walletId).subscribe({
      next: (currentWallet) => {
        const req = {
          ...currentWallet,
          statutWallet: newStatus
        };

        this.walletService.updateWallet(wallet.walletId!, req).subscribe({
          next: () => {
            this.actionMessage = `Portefeuille de "${wallet.name}" mis à jour avec le statut ${newStatus}.`;
            this.isActionLoading = false;
            this.loadWallets();
          },
          error: (err) => {
            this.actionMessage = `Erreur lors de la mise à jour du portefeuille.`;
            this.isActionLoading = false;
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.actionMessage = `Impossible de récupérer les informations du portefeuille.`;
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
