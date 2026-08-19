import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { BankPortalService, MerchantKycInfo } from '../../../core/services/bank-portal.service';
import { WalletService } from '../../../core/services/wallet.service';
import { DocumentEtudiantService } from '../../../core/services/document-etudiant.service';
import { DocumentMerchantService } from '../../../core/services/document-merchant.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentAdminService } from '../../../core/services/document-admin.service';

interface WalletAlert {
  id: string;
  walletId?: string;
  type: 'Etudiant' | 'Marchand';
  name: string;
  numEtudiant?: string;
  typeBourse?: string;
  scholarshipAmount?: number;
  spentAmount?: number;
  balance: number;
  status: 'ACTIF' | 'GELE' | 'BLOQUE' | 'EN_ATTENTE';
  suspiciousActivity: boolean;
  lastTransactionDate: Date;
  numeroCompte?: string;
  ownerName?: string;
  // Merchant-specific
  email?: string;
  phoneNumber?: string;
  kycStatus?: string;
  nomsBoutiques?: string[];
  nombreBoutiques?: number;
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

  activeTab: 'Etudiant' | 'Marchand' = 'Etudiant';

  // Filters
  statusFilter = 'ALL';
  searchTerm = '';

  selectedWallet: WalletAlert | null = null;
  entityDocuments: any[] = [];
  isLoadingDocs = false;
  hasMandatoryDocs = false;
  selectedDocumentForPreview: any = null;
  sanitizedPdfUrl: SafeResourceUrl | null = null;

  // Check if all docs are validated (for wallet activation)
  get allDocsValidated(): boolean {
    return this.entityDocuments.length > 0 &&
      this.entityDocuments.every(d => d.status === 'VALIDE');
  }

  get hasAnyPendingDoc(): boolean {
    return this.entityDocuments.some(d => d.status === 'EN_ATTENTE');
  }

  // Custom Reject Modal State
  showRejectModal = false;
  rejectionReasonInput = '';

  // Custom Confirm Action Modal State
  showConfirmModal = false;
  confirmActionType: 'GELE' | 'ACTIF' | 'MASS_GELE' | null = null;
  confirmWalletTarget: WalletAlert | null = null;
  confirmMessage = '';
  confirmTitle = '';

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
      merchants: this.bankPortalService.getMerchants(operatorId)
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

        const merchantWallets: WalletAlert[] = res.merchants.map((m: MerchantKycInfo) => {
          const status = (m.walletStatus as 'ACTIF' | 'GELE' | 'BLOQUE' | 'EN_ATTENTE') || 'EN_ATTENTE';
          return {
            id: m.merchantTrackingId,
            walletId: m.walletTrackingId,
            type: 'Marchand' as const,
            name: `${m.nom} ${m.prenom}`,
            email: m.email,
            phoneNumber: m.phoneNumber,
            kycStatus: m.kycStatus,
            numeroCompte: m.numeroCompte,
            balance: m.soldeWallet || 0,
            status: status,
            suspiciousActivity: false,
            lastTransactionDate: new Date(),
            nomsBoutiques: m.nomsBoutiques || [],
            nombreBoutiques: m.nombreBoutiques || 0,
          };
        });

        this.wallets = [...studentWallets, ...merchantWallets];
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

  switchTab(tab: 'Etudiant' | 'Marchand'): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters(): void {
    let temp = this.wallets.filter(w => w.type === this.activeTab);

    if (this.statusFilter === 'suspect') {
      temp = temp.filter(w => w.suspiciousActivity);
    } else if (this.statusFilter !== 'ALL') {
      temp = temp.filter(w => w.status === this.statusFilter);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(w =>
        w.name.toLowerCase().includes(term) ||
        (w.numEtudiant && w.numEtudiant.toLowerCase().includes(term)) ||
        (w.email && w.email.toLowerCase().includes(term)) ||
        (w.phoneNumber && w.phoneNumber.toLowerCase().includes(term)) ||
        (w.nomsBoutiques && w.nomsBoutiques.some(b => b.toLowerCase().includes(term))) ||
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
    const requests = studentsToFreeze.map(w =>
      new Promise((resolve) => {
        setTimeout(() => { w.status = 'GELE'; resolve(true); }, 100);
      })
    );
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
        const req = { ...currentWallet, statutWallet: newStatus };
        this.walletService.updateWallet(wallet.walletId!, req).subscribe({
          next: () => {
            this.actionMessage = `Portefeuille de "${wallet.name}" mis à jour : ${newStatus}.`;
            wallet.status = newStatus;
            this.isActionLoading = false;
          },
          error: () => {
            this.actionMessage = `Erreur lors de la mise à jour du portefeuille.`;
            this.isActionLoading = false;
          }
        });
      },
      error: () => {
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
    this.confirmMessage = `Voulez-vous vraiment activer le portefeuille de ${wallet.name} ?`;
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
          const docs = res.content || res || [];
          // Show all docs — group by type and sort newest first so duplicates are visible
          this.entityDocuments = docs
            .filter((d: any) => ['RIB', 'MANDAT', 'MANDAT_BANCAIRE', 'PIECE_IDENTITE', 'RECIPISSE', 'COTE'].includes(d.documentType))
            .sort((a: any, b: any) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime());

          // Mark duplicates for UI display
          const typeSeen = new Set<string>();
          this.entityDocuments = this.entityDocuments.map((d: any) => {
            const isDuplicate = typeSeen.has(d.documentType);
            typeSeen.add(d.documentType);
            return { ...d, isDuplicate };
          });

          if (this.entityDocuments.length > 0) this.selectDocument(this.entityDocuments[0]);
          this.isLoadingDocs = false;
        },
        error: () => { this.isLoadingDocs = false; }
      });
    } else {
      // Marchand: use merchantTrackingId = wallet.id
      this.documentMerchantService.findByMerchantId(wallet.id).subscribe({
        next: (res) => {
          const docs = res.content || res || [];
          this.entityDocuments = docs.filter((d: any) =>
            ['RIB_BOUTIQUE', 'RIB', 'PIECE_IDENTITE', 'RECIPISSE', 'MANDAT', 'MANDAT_BANCAIRE'].includes(d.documentType)
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
        this.actionMessage = `Document ${status === 'VALIDE' ? 'validé' : 'rejeté'} avec succès.`;
        if (this.selectedDocumentForPreview) {
          this.selectedDocumentForPreview.status = status;
          this.selectedDocumentForPreview.rejectionReason = rejectionReason;
        }

        // Auto-activate wallet if all docs are now validated
        if (status === 'VALIDE' && this.allDocsValidated && this.selectedWallet?.walletId) {
          this.activateWallet(this.selectedWallet);
        }
      },
      error: () => { this.isActionLoading = false; }
    });
  }

  // ---- WALLET ACTIVATION ----
  activateWallet(wallet: WalletAlert) {
    if (!wallet.walletId) {
      this.actionMessage = `⚠️ Wallet introuvable pour ${wallet.name}. Vérifiez les boutiques associées.`;
      return;
    }
    this.isActionLoading = true;
    // geler=false → dégèle / active le wallet
    this.walletService.freezeWallet(wallet.walletId, false).subscribe({
      next: () => {
        wallet.status = 'ACTIF';
        if (this.selectedWallet?.id === wallet.id) this.selectedWallet!.status = 'ACTIF';
        this.isActionLoading = false;
        this.actionMessage = `✅ Wallet de "${wallet.name}" activé avec succès ! Les transactions sont maintenant autorisées.`;
      },
      error: (err) => {
        this.isActionLoading = false;
        this.actionMessage = `❌ Erreur lors de l'activation du wallet : ${err.error?.message || err.message}`;
      }
    });
  }
}
