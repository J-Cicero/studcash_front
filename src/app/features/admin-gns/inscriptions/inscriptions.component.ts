import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InscriptionAnnuelleService } from '../../../core/services/inscription-annuelle.service';
import { StudentService, DocumentResponse } from '../../../core/services/student.service';
import { DocumentEtudiantService } from '../../../core/services/document-etudiant.service';
import { ScolariteYearService } from '../../../core/services/scolarite-year.service';
import { FormsModule } from '@angular/forms';

import { WalletService } from '../../../core/services/wallet.service';

@Component({
  selector: 'app-inscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscriptions.component.html',
  styleUrls: ['./inscriptions.component.scss']
})
export class InscriptionsComponent implements OnInit {
  inscriptions: any[] = [];
  filteredInscriptions: any[] = [];
  
  isLoading = true;
  errorMessage = '';
  searchQuery = '';
  filterKyc: string = 'ALL';
  activeYear: string | null = null;

  // Selection state
  selectedInscriptionIds: Set<string> = new Set<string>();
  isAllSelected = false;
  isFreezeLoading = false;

  selectedInscription: any | null = null;
  studentDocuments: any[] = [];
  isLoadingDocs = false;
  hasMandatoryDocs = false;

  selectedDocumentForPreview: any = null;
  sanitizedPdfUrl: SafeResourceUrl | null = null;

  showRejectModal = false;
  rejectionReasonInput = '';

  constructor(
    private inscriptionService: InscriptionAnnuelleService,
    private studentService: StudentService,
    private documentEtudiantService: DocumentEtudiantService,
    private scolariteYearService: ScolariteYearService,
    private sanitizer: DomSanitizer,
    private walletService: WalletService
  ) {}

  ngOnInit(): void {
    this.loadActiveYear();
  }

  loadActiveYear() {
    this.scolariteYearService.getActiveYear().subscribe({
      next: (year) => {
        this.activeYear = year ? year.label : null;
        this.loadInscriptions();
      },
      error: (err) => {
        console.log("Aucune année scolaire active trouvée.");
        this.activeYear = null;
        this.loadInscriptions(); // On continue même sans année active
      }
    });
  }

  loadInscriptions() {
    this.isLoading = true;
    this.inscriptionService.findAll().subscribe({
      next: (res) => {
        const all = res.content || [];
        // Si pas d'année active, on peut soit tout afficher, soit rien
        if (this.activeYear) {
          this.inscriptions = all.filter((i: any) => i.academicYearLabel === this.activeYear);
        } else {
          this.inscriptions = all; // Option: Afficher tout s'il n'y a pas d'année active
        }
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des inscriptions';
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    if (!this.searchQuery) {
      this.filteredInscriptions = this.inscriptions;
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredInscriptions = this.inscriptions.filter(i => 
      (i.studentLastName && i.studentLastName.toLowerCase().includes(q)) || 
      (i.studentFirstName && i.studentFirstName.toLowerCase().includes(q))
    );
  }

  setKycFilter(statut: string) {
    this.filterKyc = statut;
    this.loadInscriptions(); 
  }

  viewDetails(ins: any) {
    this.selectedInscription = ins;
    this.studentDocuments = [];
    this.isLoadingDocs = true;
    this.hasMandatoryDocs = false;
    
    // Fetch documents attached to this specific inscription
    const inscriptionTrackingId = ins.trackingId;
    
    this.documentEtudiantService.findByInscriptionId(inscriptionTrackingId).subscribe({
      next: (res) => {
        let docs = res.content || res || [];
        this.studentDocuments = docs;
        this.hasMandatoryDocs = true;
        if (this.studentDocuments.length > 0) this.selectDocument(this.studentDocuments[0]);
        this.isLoadingDocs = false;
      },
      error: () => {
        this.studentDocuments = [];
        this.hasMandatoryDocs = false;
        this.isLoadingDocs = false;
      }
    });
  }

  selectDocument(doc: any) {
    this.selectedDocumentForPreview = doc;
    if (doc.documentType === 'MANDAT_BANCAIRE' || (doc.fileUrl && doc.fileUrl.endsWith('.pdf'))) {
      this.sanitizedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc.fileUrl);
    } else {
      this.sanitizedPdfUrl = null;
    }
  }

  // Document-level action state
  showDocRejectModal = false;
  docRejectionReasonInput = '';
  isDocActionLoading = false;

  openDocRejectModal() {
    this.docRejectionReasonInput = '';
    this.showDocRejectModal = true;
  }

  closeDocRejectModal() {
    this.showDocRejectModal = false;
    this.docRejectionReasonInput = '';
  }

  confirmDocReject() {
    if (!this.docRejectionReasonInput.trim()) return;
    this.showDocRejectModal = false;
    this.updateSingleDocStatus('REJETE', this.docRejectionReasonInput.trim());
  }

  updateSingleDocStatus(status: 'VALIDE' | 'REJETE', rejectionReason?: string) {
    if (!this.selectedDocumentForPreview) return;
    if (status === 'REJETE' && !rejectionReason) {
      this.openDocRejectModal();
      return;
    }

    this.isDocActionLoading = true;
    const docId = this.selectedDocumentForPreview.trackingId;

    this.documentEtudiantService.updateDocumentStatus(docId, status, rejectionReason).subscribe({
      next: (res) => {
        this.isDocActionLoading = false;
        if (this.selectedDocumentForPreview) {
          this.selectedDocumentForPreview.status = status;
          this.selectedDocumentForPreview.rejectionReason = rejectionReason;
        }
      },
      error: (err) => {
        this.isDocActionLoading = false;
        console.error("Erreur lors de la mise à jour du statut du document", err);
      }
    });
  }

  openRejectModal() {
    this.rejectionReasonInput = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.rejectionReasonInput = '';
  }

  confirmReject() {
    if (!this.rejectionReasonInput.trim()) {
      alert('Veuillez saisir le motif du rejet.');
      return;
    }
    this.showRejectModal = false;
    this.executeStatusUpdate('REJETEE', this.rejectionReasonInput.trim());
  }

  updateStatus(statut: string) {
    if (!this.selectedInscription) return;

    if (statut === 'REJETEE') {
      this.openRejectModal();
      return;
    }
    
    this.executeStatusUpdate(statut);
  }

  private executeStatusUpdate(statut: string, motif?: string) {
    this.inscriptionService.updateStatus(this.selectedInscription.trackingId, statut, motif).subscribe({
      next: () => {
        this.loadInscriptions(); // Recharger la liste
        this.closeDetails();
      },
      error: (err) => {
        console.error("Erreur mise à jour statut", err);
      }
    });
  }

  synchronizeInscription() {
    if (!this.selectedInscription) return;

    this.inscriptionService.synchroniser(this.selectedInscription.trackingId).subscribe({
      next: () => {
        this.loadInscriptions();
        this.closeDetails();
      },
      error: (err) => {
        console.error("Erreur synchronisation", err);
      }
    });
  }

  closeDetails() {
    this.selectedInscription = null;
    this.studentDocuments = [];
    this.selectedDocumentForPreview = null;
  }

  toggleSelectAll() {
    this.isAllSelected = !this.isAllSelected;
    if (this.isAllSelected) {
      this.filteredInscriptions.forEach(i => this.selectedInscriptionIds.add(i.trackingId));
    } else {
      this.selectedInscriptionIds.clear();
    }
  }

  toggleSelectInscription(id: string) {
    if (this.selectedInscriptionIds.has(id)) {
      this.selectedInscriptionIds.delete(id);
    } else {
      this.selectedInscriptionIds.add(id);
    }
    this.isAllSelected = this.filteredInscriptions.length > 0 && this.selectedInscriptionIds.size === this.filteredInscriptions.length;
  }

  isInscriptionSelected(id: string): boolean {
    return this.selectedInscriptionIds.has(id);
  }

  getSelectedWalletIds(): string[] {
    return this.filteredInscriptions
      .filter(i => this.selectedInscriptionIds.has(i.trackingId) && i.walletTrackingId)
      .map(i => i.walletTrackingId);
  }

  freezeInscriptionWallet(ins: any, geler: boolean) {
    if (!ins.walletTrackingId) {
      alert("Cet étudiant n'a pas de portefeuille associé.");
      return;
    }
    const actionName = geler ? "geler" : "dégeler";
    if (!confirm(`Voulez-vous vraiment ${actionName} le portefeuille de l'étudiant ?`)) return;

    this.isFreezeLoading = true;
    this.walletService.freezeWallet(ins.walletTrackingId, geler).subscribe({
      next: () => {
        this.isFreezeLoading = false;
        ins.walletStatus = geler ? 'GELE' : 'ACTIF';
        this.loadInscriptions();
      },
      error: (err) => {
        this.isFreezeLoading = false;
        alert(`Erreur lors de l'opération de ${actionName} du compte.`);
      }
    });
  }

  freezeSelectedInscriptions(geler: boolean) {
    const walletIds = this.getSelectedWalletIds();
    if (walletIds.length === 0) {
      alert("Aucun portefeuille valide trouvé dans la sélection.");
      return;
    }
    const actionName = geler ? "geler" : "dégeler";
    if (!confirm(`Voulez-vous vraiment ${actionName} les portefeuilles des ${walletIds.length} étudiants sélectionnés ?`)) return;

    this.isFreezeLoading = true;
    this.walletService.freezeWalletsBulk(walletIds, geler).subscribe({
      next: () => {
        this.isFreezeLoading = false;
        this.selectedInscriptionIds.clear();
        this.isAllSelected = false;
        this.loadInscriptions();
      },
      error: (err) => {
        this.isFreezeLoading = false;
        alert(`Erreur lors du ${actionName} en masse des comptes.`);
      }
    });
  }

  freezeAllStudents(geler: boolean) {
    const actionName = geler ? "geler TOUS les" : "dégeler TOUS les";
    if (!confirm(`ATTENTION: Voulez-vous vraiment ${actionName} portefeuilles étudiants du système ?`)) return;

    this.isFreezeLoading = true;
    this.walletService.gelerTousLesWallets(geler).subscribe({
      next: () => {
        this.isFreezeLoading = false;
        this.loadInscriptions();
      },
      error: (err) => {
        this.isFreezeLoading = false;
        alert(`Erreur lors du ${actionName} portefeuilles étudiants.`);
      }
    });
  }
}
