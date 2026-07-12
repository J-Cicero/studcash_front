import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { BankPortalService } from '../../../core/services/bank-portal.service';
import { WalletService } from '../../../core/services/wallet.service';
import { DocumentEtudiantService } from '../../../core/services/document-etudiant.service';
import { DocumentMerchantService } from '../../../core/services/document-merchant.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { DocumentAdminService } from '../../../core/services/document-admin.service';

interface WalletAlert {
  id: string;
  walletId?: string;
  type: 'Etudiant' | 'Boutique';
  name: string;
  numEtudiant?: string;
  typeBourse?: string;
  scholarshipAmount?: number;
  spentAmount?: number;
  balance: number;
  status: 'ACTIF' | 'GELE' | 'BLOQUE';
  suspiciousActivity: boolean;
  lastTransactionDate: Date;
  numeroCompte?: string;
  ownerName?: string;
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

  selectedWallet: WalletAlert | null = null;
  entityDocuments: any[] = [];
  isLoadingDocs = false;
  hasMandatoryDocs = false;
  selectedDocumentForPreview: any = null;
  sanitizedPdfUrl: SafeResourceUrl | null = null;

  // Custom Reject Modal State
  showRejectModal = false;
  rejectionReasonInput = '';

  // Custom Confirm Action Modal State
  showConfirmModal = false;
  confirmActionType: 'GELE' | 'ACTIF' | 'MASS_GELE' | null = null;
  confirmWalletTarget: WalletAlert | null = null;
  confirmMessage = '';
  confirmTitle = '';

  // Liquidation Student State
  selectedStudentForLiquidation: WalletAlert | null = null;
  isLiquidationLoading = false;
  liquidationSuccess = false;

  constructor(
    private authService: AuthService,
    private bankPortalService: BankPortalService,
    private walletService: WalletService,
    private documentEtudiantService: DocumentEtudiantService,
    private documentMerchantService: DocumentMerchantService,
    private documentAdminService: DocumentAdminService,
    private sanitizer: DomSanitizer
  ) { }

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
            scholarshipAmount: s.bourseTotale || 0,
            spentAmount: s.depensesStudCash || 0,
            balance: s.resteAPayer || 0,
            status: status,
            suspiciousActivity: false,
            lastTransactionDate: new Date(),
            numeroCompte: s.numeroCompte
          };
        });

        const boutiqueWallets: WalletAlert[] = res.boutiques.map(b => {
          const status = (b.walletStatus as 'ACTIF' | 'GELE' | 'BLOQUE') || 'ACTIF';
          const isSuspicious = b.soldeWallet > 50000 && status === 'ACTIF';
          return {
            id: b.merchantTrackingId || b.boutiqueTrackingId,
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

  // ---- MASS FREEZE STUDENTS ----
  massFreezeStudents() {
    const studentsToFreeze = this.filteredWallets.filter(w => w.status !== 'GELE' && w.walletId);
    if (studentsToFreeze.length === 0) {
      this.actionMessage = "Tous les étudiants affichés sont déjà gelés.";
      return;
    }

    this.confirmActionType = 'MASS_GELE';
    this.confirmTitle = 'Gel en masse';
    this.confirmMessage = `Vous êtes sur le point de geler ${studentsToFreeze.length} portefeuille(s). Continuer ?`;
    this.showConfirmModal = true;
  }

  executeMassFreeze() {
    const studentsToFreeze = this.filteredWallets.filter(w => w.status !== 'GELE' && w.walletId);
    this.isActionLoading = true;
    
    // Create an array of observables for updating each wallet
    const requests = studentsToFreeze.map(w => {
      // Pour une vraie implémentation, on devrait avoir un endpoint /bulk-freeze
      // Ici on simule l'appel séquentiel via l'observable ou on met à jour localement si pas d'API bulk
      return new Promise((resolve) => {
        // Simulation d'une mise à jour de masse (idéalement à remplacer par un appel API Bulk)
        setTimeout(() => {
           w.status = 'GELE';
           resolve(true);
        }, 100);
      });
    });

    Promise.all(requests).then(() => {
      this.isActionLoading = false;
      this.actionMessage = `${studentsToFreeze.length} portefeuilles ont été gelés avec succès.`;
      this.applyFilters();
    });
  }

  // ---- SINGLE WALLET STATUS UPDATE ----
  updateWalletStatus(wallet: WalletAlert, newStatus: 'ACTIF' | 'GELE' | 'BLOQUE') {
    if (!wallet.walletId) {
      this.actionMessage = "Impossible de modifier le statut : identifiant manquant.";
      return;
    }
    this.isActionLoading = true;
    this.actionMessage = '';

    this.walletService.getByTrackingId(wallet.walletId).subscribe({
      next: (currentWallet) => {
        const req = {
          ...currentWallet,
          statutWallet: newStatus
        };

        this.walletService.updateWallet(wallet.walletId!, req).subscribe({
          next: () => {
            this.actionMessage = `Portefeuille de "${wallet.name}" mis à jour avec le statut ${newStatus}.`;
            wallet.status = newStatus; // update local instantly
            this.isActionLoading = false;
          },
          error: (err) => {
            this.actionMessage = `Erreur lors de la mise à jour du portefeuille.`;
            this.isActionLoading = false;
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.actionMessage = `Impossible de récupérer les informations.`;
        this.isActionLoading = false;
      }
    });
  }

  gelerWallet(wallet: WalletAlert) {
    this.confirmActionType = 'GELE';
    this.confirmWalletTarget = wallet;
    this.confirmTitle = 'Confirmer le gel';
    this.confirmMessage = `Voulez-vous vraiment geler le portefeuille de ${wallet.name} ?`;
    this.showConfirmModal = true;
  }

  debloquerWallet(wallet: WalletAlert) {
    this.confirmActionType = 'ACTIF';
    this.confirmWalletTarget = wallet;
    this.confirmTitle = 'Confirmer le dégel';
    this.confirmMessage = `Voulez-vous vraiment dégeler (réactiver) le portefeuille de ${wallet.name} ?`;
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.confirmActionType = null;
    this.confirmWalletTarget = null;
  }

  executeConfirmAction() {
    if (this.confirmActionType === 'GELE' && this.confirmWalletTarget) {
      this.updateWalletStatus(this.confirmWalletTarget, 'GELE');
    } else if (this.confirmActionType === 'ACTIF' && this.confirmWalletTarget) {
      this.updateWalletStatus(this.confirmWalletTarget, 'ACTIF');
    } else if (this.confirmActionType === 'MASS_GELE') {
      this.executeMassFreeze();
    }
    this.closeConfirmModal();
  }

  // ---- STUDENT LIQUIDATION MODAL ----
  openLiquidationModal(student: WalletAlert) {
    this.selectedStudentForLiquidation = student;
    this.liquidationSuccess = false;
  }

  closeLiquidationModal() {
    this.selectedStudentForLiquidation = null;
    this.liquidationSuccess = false;
    this.isLiquidationLoading = false;
  }

  confirmStudentLiquidation() {
    if (!this.selectedStudentForLiquidation) return;
    
    this.isLiquidationLoading = true;

    // Simulation de l'appel backend pour StudentLiquidationRequest
    setTimeout(() => {
      this.isLiquidationLoading = false;
      this.liquidationSuccess = true;
      // Remise à zéro du solde virtuel après liquidation
      this.selectedStudentForLiquidation!.balance = 0;
      
      setTimeout(() => {
        this.closeLiquidationModal();
      }, 2500);
    }, 1500);
  }

  // ---- KYC DOCUMENTS LOGIC ----
  viewDetails(wallet: WalletAlert) {
    this.selectedWallet = wallet;
    this.entityDocuments = [];
    this.isLoadingDocs = true;
    this.hasMandatoryDocs = false;
    this.selectedDocumentForPreview = null;
    this.sanitizedPdfUrl = null;

    if (wallet.type === 'Etudiant') {
      this.documentEtudiantService.findByStudentId(wallet.id).subscribe({
        next: (res) => {
          let docs = res.content || res || [];
          this.entityDocuments = docs.filter((d: any) => 
            ['RIB', 'MANDAT', 'MANDAT_BANCAIRE', 'PIECE_IDENTITE', 'RECIPISSE'].includes(d.documentType)
          );
          if (this.entityDocuments.length > 0) this.selectDocument(this.entityDocuments[0]);
          this.isLoadingDocs = false;
        },
        error: () => { this.isLoadingDocs = false; }
      });
    } else {
      this.documentMerchantService.findByMerchantId(wallet.id).subscribe({
        next: (res) => {
          let docs = res.content || res || [];
          this.entityDocuments = docs.filter((d: any) => 
            ['RIB_BOUTIQUE', 'RIB', 'PIECE_IDENTITE', 'RECIPISSE'].includes(d.documentType)
          );
          if (this.entityDocuments.length > 0) this.selectDocument(this.entityDocuments[0]);
          this.isLoadingDocs = false;
        },
        error: () => { this.isLoadingDocs = false; }
      });
    }
  }

  selectDocument(doc: any) {
    this.selectedDocumentForPreview = doc;
    if (doc.documentType === 'MANDAT' || doc.documentType === 'MANDAT_BANCAIRE' || (doc.fileUrl && doc.fileUrl.endsWith('.pdf'))) {
      this.sanitizedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc.fileUrl);
    } else {
      this.sanitizedPdfUrl = null;
    }
  }

  closeDetails() {
    this.selectedWallet = null;
    this.selectedDocumentForPreview = null;
    this.sanitizedPdfUrl = null;
  }

  openRejectModal() {
    this.rejectionReasonInput = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
  }

  confirmReject() {
    if (!this.rejectionReasonInput.trim()) return;
    this.showRejectModal = false;
    this.updateDocumentStatus('REJETE', this.rejectionReasonInput.trim());
  }

  updateDocumentStatus(status: 'VALIDE' | 'REJETE', rejectionReason?: string) {
    if (!this.selectedDocumentForPreview || !this.selectedWallet) return;
    if (status === 'REJETE' && !rejectionReason) {
      this.openRejectModal();
      return;
    }

    this.isActionLoading = true;
    const docId = this.selectedDocumentForPreview.trackingId;
    const request$ = this.selectedWallet.type === 'Etudiant' 
      ? this.documentAdminService.updateStudentDocumentStatus(docId, status, rejectionReason)
      : this.documentAdminService.updateMerchantDocumentStatus(docId, status, rejectionReason);

    request$.subscribe({
      next: () => {
        this.isActionLoading = false;
        this.actionMessage = `Document ${status} avec succès.`;
        if (this.selectedDocumentForPreview) {
          this.selectedDocumentForPreview.status = status;
          this.selectedDocumentForPreview.rejectionReason = rejectionReason;
        }
      },
      error: () => { this.isActionLoading = false; }
    });
  }
}
