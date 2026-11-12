import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InscriptionAnnuelleService } from '../../../core/services/inscription-annuelle.service';
import { StudentService } from '../../../core/services/student.service';
import { DocumentEtudiantService } from '../../../core/services/document-etudiant.service';
import { ScolariteYearService } from '../../../core/services/scolarite-year.service';
import { AcademicYearContextService } from '../../../core/services/academic-year-context.service';
import { FormsModule } from '@angular/forms';

import { WalletService } from '../../../core/services/wallet.service';
import { AuthService } from '../../../core/services/auth.service';

import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

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

  // Menus 3 points (Global & par ligne)
  showGlobalActionsMenu = false;
  openRowMenuId: string | null = null;

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

  canValidate = false;

  constructor(
    private inscriptionService: InscriptionAnnuelleService,
    private studentService: StudentService,
    private documentEtudiantService: DocumentEtudiantService,
    private scolariteYearService: ScolariteYearService,
    private yearContext: AcademicYearContextService,
    private sanitizer: DomSanitizer,
    private walletService: WalletService,
    private authService: AuthService,
    private confirmService: ConfirmDialogService,
    private route: ActivatedRoute
  ) {}

  @HostListener('document:click')
  closeMenus(): void {
    this.showGlobalActionsMenu = false;
    this.openRowMenuId = null;
  }

  toggleGlobalMenu(event: Event): void {
    event.stopPropagation();
    this.openRowMenuId = null;
    this.showGlobalActionsMenu = !this.showGlobalActionsMenu;
  }

  toggleRowMenu(trackingId: string, event: Event): void {
    event.stopPropagation();
    this.showGlobalActionsMenu = false;
    this.openRowMenuId = this.openRowMenuId === trackingId ? null : trackingId;
  }

  ngOnInit(): void {
    this.canValidate = this.authService.hasRole('ADMIN_BANQUE') || this.authService.hasRole('ADMIN_GNS');
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
    });

    // Synchroniser avec le sélecteur d'année scolaire du header
    this.yearContext.selectedYear$.subscribe(year => {
      if (year) {
        this.activeYear = year.label;
        this.loadInscriptions();
      } else {
        this.loadActiveYear();
      }
    });
  }

  loadActiveYear() {
    this.scolariteYearService.getActiveYear().subscribe({
      next: (year) => {
        this.activeYear = year ? year.label : null;
        this.loadInscriptions();
      },
      error: () => {
        this.activeYear = null;
        this.loadInscriptions();
      }
    });
  }

  loadInscriptions() {
    this.isLoading = true;
    this.errorMessage = '';
    this.inscriptionService.findAll().subscribe({
      next: (res) => {
        const all = res?.content || (Array.isArray(res) ? res : []);
        if (this.activeYear) {
          const matching = all.filter((i: any) => !i.academicYearLabel || i.academicYearLabel === this.activeYear);
          this.inscriptions = matching.length > 0 ? matching : all;
        } else {
          this.inscriptions = all;
        }
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        // Le backend renvoie 404 quand la page d'inscriptions est vide
        this.inscriptions = [];
        this.filteredInscriptions = [];
        if (err?.status !== 404) {
          this.errorMessage = 'Erreur lors du chargement des inscriptions';
        }
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    let list = this.inscriptions || [];

    if (this.filterKyc && this.filterKyc !== 'ALL') {
      list = list.filter((i: any) => i.status === this.filterKyc);
    }

    if (!this.searchQuery || !this.searchQuery.trim()) {
      this.filteredInscriptions = list;
      return;
    }

    const q = this.searchQuery.trim().toLowerCase();
    this.filteredInscriptions = list.filter((i: any) => {
      const nom = (i.studentLastName || '').toLowerCase();
      const prenom = (i.studentFirstName || '').toLowerCase();
      const fullName = `${prenom} ${nom}`.trim();
      const reverseName = `${nom} ${prenom}`.trim();
      const matricule = (i.studentIdNumber || i.matricule || '').toLowerCase();
      const level = (i.studyLevel || '').toLowerCase();
      const status = (i.status || '').toLowerCase();
      const univ = (i.universiteNom || i.universityName || '').toLowerCase();

      return nom.includes(q) ||
             prenom.includes(q) ||
             fullName.includes(q) ||
             reverseName.includes(q) ||
             matricule.includes(q) ||
             level.includes(q) ||
             status.includes(q) ||
             univ.includes(q);
    });
  }

  setKycFilter(statut: string) {
    this.filterKyc = statut;
    this.applyFilter();
  }

  viewDetails(ins: any) {
    this.openRowMenuId = null;
    this.selectedInscription = ins;
    this.studentDocuments = [];
    this.isLoadingDocs = true;
    this.hasMandatoryDocs = false;
    
    const inscriptionTrackingId = ins.trackingId;
    
    this.documentEtudiantService.findByInscriptionId(inscriptionTrackingId).subscribe({
      next: (res) => {
        const docs = res?.content || (Array.isArray(res) ? res : []);
        if (docs.length > 0) {
          this.studentDocuments = docs;
          this.hasMandatoryDocs = true;
          this.selectDocument(this.studentDocuments[0]);
          this.isLoadingDocs = false;
        } else if (ins.studentTrackingId) {
          this.loadStudentDocsFallback(ins.studentTrackingId);
        } else {
          this.isLoadingDocs = false;
        }
      },
      error: () => {
        if (ins.studentTrackingId) {
          this.loadStudentDocsFallback(ins.studentTrackingId);
        } else {
          this.studentDocuments = [];
          this.hasMandatoryDocs = false;
          this.isLoadingDocs = false;
        }
      }
    });
  }

  private loadStudentDocsFallback(studentTrackingId: string) {
    this.documentEtudiantService.findByStudentId(studentTrackingId).subscribe({
      next: (res) => {
        const docs = res?.content || (Array.isArray(res) ? res : []);
        this.studentDocuments = docs;
        this.hasMandatoryDocs = docs.length > 0;
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
      this.confirmService.alert('Veuillez saisir le motif du rejet.', 'Motif obligatoire', 'warning');
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

  synchronizeInscription(ins?: any) {
    this.openRowMenuId = null;
    const target = ins || this.selectedInscription;
    if (!target) return;

    this.inscriptionService.synchroniser(target.trackingId).subscribe({
      next: () => {
        this.loadInscriptions();
        if (this.selectedInscription) {
          this.closeDetails();
        }
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

  async freezeInscriptionWallet(ins: any, geler: boolean) {
    if (!ins.walletTrackingId) {
      this.confirmService.alert("Cet étudiant n'a pas de portefeuille associé.", "Portefeuille introuvable", "warning");
      return;
    }
    const actionName = geler ? "geler" : "dégeler";
    const confirmed = await this.confirmService.confirm({
      title: `${geler ? 'Gel' : 'Dégel'} de portefeuille`,
      message: `Voulez-vous vraiment ${actionName} le portefeuille de l'étudiant ?`,
      confirmText: geler ? 'Geler' : 'Dégeler',
      type: geler ? 'warning' : 'info'
    });

    if (!confirmed) return;

    this.isFreezeLoading = true;
    this.walletService.freezeWallet(ins.walletTrackingId, geler).subscribe({
      next: () => {
        this.isFreezeLoading = false;
        ins.walletStatus = geler ? 'GELE' : 'ACTIF';
        this.loadInscriptions();
      },
      error: (err) => {
        this.isFreezeLoading = false;
        this.confirmService.alert(`Erreur lors de l'opération de ${actionName} du compte.`, "Erreur", "danger");
      }
    });
  }

  async freezeSelectedInscriptions(geler: boolean) {
    const walletIds = this.getSelectedWalletIds();
    if (walletIds.length === 0) {
      this.confirmService.alert("Aucun portefeuille valide trouvé dans la sélection.", "Portefeuilles introuvables", "warning");
      return;
    }
    const actionName = geler ? "geler" : "dégeler";
    const confirmed = await this.confirmService.confirm({
      title: `${geler ? 'Gel' : 'Dégel'} en masse`,
      message: `Voulez-vous vraiment ${actionName} les portefeuilles des ${walletIds.length} étudiants sélectionnés ?`,
      confirmText: geler ? 'Geler' : 'Dégeler',
      type: geler ? 'warning' : 'info'
    });

    if (!confirmed) return;

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
        this.confirmService.alert(`Erreur lors du ${actionName} en masse des comptes.`, "Erreur", "danger");
      }
    });
  }

  async freezeAllStudents(geler: boolean) {
    const actionName = geler ? "geler TOUS les" : "dégeler TOUS les";
    const confirmed = await this.confirmService.confirm({
      title: `ATTENTION: ${geler ? 'Gel' : 'Dégel'} global`,
      message: `Voulez-vous vraiment ${actionName} portefeuilles étudiants du système ?`,
      confirmText: geler ? 'Geler tout' : 'Dégeler tout',
      type: 'danger'
    });

    if (!confirmed) return;

    this.isFreezeLoading = true;
    this.walletService.gelerTousLesWallets(geler).subscribe({
      next: () => {
        this.isFreezeLoading = false;
        this.loadInscriptions();
      },
      error: (err) => {
        this.isFreezeLoading = false;
        this.confirmService.alert(`Erreur lors du ${actionName} portefeuilles étudiants.`, "Erreur", "danger");
      }
    });
  }
}
