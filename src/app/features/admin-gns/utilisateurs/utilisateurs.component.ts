import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, forkJoin, of, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { UserService } from '../../../core/services/user.service';
import { UniversiteService } from '../../../core/services/universite.service';
import { BanqueService } from '../../../core/services/banque.service';
import { StudentService } from '../../../core/services/student.service';
import { DocumentService } from '../../../core/services/document.service';
import { DocumentEtudiantService } from '../../../core/services/document-etudiant.service';
import { DocumentMerchantService } from '../../../core/services/document-merchant.service';
import { WalletService } from '../../../core/services/wallet.service';
import { AuthService } from '../../../core/services/auth.service';
import { Page } from '../../../core/models/page.model';
import { UserResponse } from '../../../core/models/user.model';
import { DocumentResponse } from '../../../core/models/document.model';

import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent implements OnInit {
  users: UserResponse[] = [];
  isLoading = false;
  errorMessage = '';

  filterRole = 'ALL';
  roles = ['ALL', 'ADMIN_GNS', 'ADMIN_DBS', 'ADMIN_BANQUE', 'COMMERCANT', 'ETUDIANT'];

  get filteredUsers() {
    let list = this.users || [];
    if (this.filterRole !== 'ALL') {
      list = list.filter(u => u.role === this.filterRole);
    }
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(u => {
        const nom = (u.lastName || '').toLowerCase();
        const prenom = (u.firstName || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const phone = (u.phoneNumber || '').toLowerCase();
        const fullName = `${prenom} ${nom}`.trim();
        const reverseName = `${nom} ${prenom}`.trim();
        return nom.includes(q) || prenom.includes(q) || fullName.includes(q) || reverseName.includes(q) || email.includes(q) || phone.includes(q);
      });
    }
    return list;
  }

  // Menus 3 points (Global & par ligne)
  showGlobalActionsMenu = false;
  openRowMenuId: string | null = null;
  canValidate = false;

  // Selection state
  selectedUserIds: Set<string> = new Set<string>();
  isAllSelected = false;
  isFreezeLoading = false;

  // Pagination
  currentPage = 0;
  pageSize = 50;
  totalElements = 0;

  // Search
  searchQuery = '';
  searchSubject = new Subject<string>();

  // Modals
  userToDelete: UserResponse | null = null;
  showDeleteModal = false;
  isProcessingDelete = false;

  userToRestore: UserResponse | null = null;
  showRestoreModal = false;
  isProcessingRestore = false;

  showCreateModal = false;
  newUserForm: any = { nom: '', prenom: '', telephone: '', email: '', motDePasse: '', role: 'ADMIN_BANQUE', universiteTrackingId: '', banqueTrackingId: '' };
  isProcessingCreate = false;

  // Documents Modal
  selectedUser: UserResponse | null = null;
  userDocuments: DocumentResponse[] = [];
  isLoadingDocs = false;
  hasMandatoryDocs = false;
  selectedDocumentForPreview: any = null;
  sanitizedPdfUrl: SafeResourceUrl | null = null;
  showDocRejectModal = false;
  docRejectionReasonInput = '';
  isDocActionLoading = false;
  
  universites: any[] = [];
  banques: any[] = [];

  constructor(
    private userService: UserService,
    private universiteService: UniversiteService,
    private banqueService: BanqueService,
    private studentService: StudentService,
    private documentService: DocumentService,
    private documentEtudiantService: DocumentEtudiantService,
    private documentMerchantService: DocumentMerchantService,
    private walletService: WalletService,
    private authService: AuthService,
    private confirmService: ConfirmDialogService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.trim()) {
        this.searchUsers(query);
      } else {
        this.loadUsers();
      }
    });
  }

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
        this.onSearchChange(this.searchQuery);
      }
    });
    this.loadUsers();
    this.loadEntities();
  }

  loadEntities() {
    this.universiteService.findAll().subscribe((res: any) => this.universites = res.content || []); 
    this.banqueService.getAllBanques().subscribe((res: any) => this.banques = res || []); 
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    this.userService.getAllUsers(this.currentPage, this.pageSize).subscribe({
      next: (res: Page<UserResponse>) => { 
        this.users = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.isLoading = false;
      },
      error: (err: any) => { 
        if(err.status === 404) this.users = [];
        else this.errorMessage = 'Erreur lors du chargement des utilisateurs.';
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    this.newUserForm = { nom: '', prenom: '', telephone: '', email: '', motDePasse: '', role: 'ADMIN_BANQUE', universiteTrackingId: '', banqueTrackingId: '' };
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  createUser() {
    this.isProcessingCreate = true;
    
    this.newUserForm.role = 'ADMIN_BANQUE';
    
    if (!this.newUserForm.banqueTrackingId) {
      this.confirmService.alert("Veuillez sélectionner une banque pour l'administrateur de banque.", "Sélection requise", "warning");
      this.isProcessingCreate = false;
      return;
    }

    const requestPayload = {
      lastName: this.newUserForm.nom,
      firstName: this.newUserForm.prenom,
      phoneNumber: this.newUserForm.telephone,
      email: this.newUserForm.email,
      password: this.newUserForm.motDePasse,
      role: 'ADMIN_BANQUE',
      bankTrackingId: this.newUserForm.banqueTrackingId
    };

    this.userService.createAdminBanque(requestPayload).subscribe({
      next: () => {
        this.isProcessingCreate = false;
        this.closeCreateModal();
        this.loadUsers();
      },
      error: (err: any) => { 
        this.isProcessingCreate = false;
        const msg = err.error?.message || "Erreur lors de la création de l'utilisateur.";
        this.confirmService.alert(msg, "Erreur", "danger");
      }
    });
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  searchUsers(query: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.userService.searchUsers(query).subscribe({
      next: (res: UserResponse[]) => { 
        this.users = res || [];
        this.isLoading = false;
      },
      error: (err: any) => { 
        if(err.status === 404) this.users = [];
        else this.errorMessage = 'Erreur lors de la recherche.';
        this.isLoading = false;
      }
    });
  }

  confirmDelete(user: UserResponse) {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  executeDelete() {
    if (!this.userToDelete) return;
    this.isProcessingDelete = true;
    
    this.userService.deleteUser(this.userToDelete.trackingId).subscribe({
      next: () => {
        this.isProcessingDelete = false;
        this.closeDeleteModal();
        if (this.searchQuery.trim()) {
          this.searchUsers(this.searchQuery);
        } else {
          this.loadUsers();
        }
      },
      error: (err: any) => { 
        this.isProcessingDelete = false;
        this.confirmService.alert("Erreur lors de la suppression de l'utilisateur.", "Erreur", "danger");
      }
    });
  }

  confirmRestore(user: UserResponse) {
    this.userToRestore = user;
    this.showRestoreModal = true;
  }

  closeRestoreModal() {
    this.showRestoreModal = false;
    this.userToRestore = null;
  }

  executeRestore() {
    if (!this.userToRestore) return;
    this.isProcessingRestore = true;
    
    this.userService.updateUserEtat(this.userToRestore.trackingId, true).subscribe({
      next: () => {
        this.isProcessingRestore = false;
        this.closeRestoreModal();
        if (this.searchQuery.trim()) {
          this.searchUsers(this.searchQuery);
        } else {
          this.loadUsers();
        }
      },
      error: (err: any) => { 
        this.isProcessingRestore = false;
        this.confirmService.alert("Erreur lors de la réactivation de l'utilisateur.", "Erreur", "danger");
      }
    });
  }

  getRoleColorClass(role: string): string {
    switch(role) {
      case 'ADMIN_GNS':
      case 'ADMIN_DBS':
      case 'ADMIN_BANQUE':
      case 'BANQUE':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  }

  isPdfDocument(doc: any): boolean {
    if (!doc || !doc.fileUrl) return false;
    const cleanUrl = doc.fileUrl.split('?')[0].split('#')[0].toLowerCase();
    return cleanUrl.endsWith('.pdf') || doc.fileUrl.startsWith('data:application/pdf');
  }

  selectDocument(doc: any) {
    this.selectedDocumentForPreview = doc;
    if (this.isPdfDocument(doc)) {
      this.sanitizedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc.fileUrl);
    } else {
      this.sanitizedPdfUrl = null;
    }
  }

  viewDetails(user: UserResponse) {
    this.openRowMenuId = null;
    this.selectedUser = user;
    this.userDocuments = [];
    this.selectedDocumentForPreview = null;
    this.sanitizedPdfUrl = null;
    this.isLoadingDocs = true;
    this.hasMandatoryDocs = false;

    const docMap = new Map<string, any>();

    const addDocs = (docs: any) => {
      const list = Array.isArray(docs) ? docs : (docs?.content || []);
      if (Array.isArray(list)) {
        list.forEach(doc => {
          const url = doc?.fileUrl || doc?.urlDocument;
          if (doc && url) {
            const normalized = {
              ...doc,
              fileUrl: url,
              documentType: doc.documentType || doc.typeDocument || 'DOCUMENT'
            };
            if (!docMap.has(url)) {
              docMap.set(url, normalized);
            }
          }
        });
      }
    };

    const requests: { [key: string]: Observable<any> } = {
      generic: this.documentService.getDocumentsByOwner(user.trackingId).pipe(catchError(() => of([]))),
      compte: this.banqueService.getCompteBancaireByOwner(user.trackingId).pipe(catchError(() => of(null)))
    };

    if (user.role === 'ETUDIANT') {
      requests['roleDocs'] = this.documentEtudiantService.findByStudentId(user.trackingId).pipe(catchError(() => of([])));
    } else if (user.role === 'COMMERCANT') {
      requests['roleDocs'] = this.documentMerchantService.findByMerchantId(user.trackingId).pipe(catchError(() => of([])));
    }

    forkJoin(requests).subscribe({
      next: (results) => {
        if (results['roleDocs']) {
          addDocs(results['roleDocs']);
        }
        addDocs(results['generic']);

        const compte = results['compte'];
        if (compte && compte.ribUrl && !docMap.has(compte.ribUrl)) {
          docMap.set(compte.ribUrl, {
            trackingId: compte.ribDocumentTrackingId || compte.trackingId || 'RIB-' + user.trackingId,
            documentType: 'RIB',
            fileUrl: compte.ribUrl,
            ownerTrackingId: user.trackingId,
            status: 'VALIDE',
            uploadedAt: new Date().toISOString()
          });
        }

        this.userDocuments = Array.from(docMap.values());
        this.hasMandatoryDocs = this.userDocuments.some(doc =>
          doc.documentType === 'MANDAT_BANCAIRE' ||
          doc.documentType === 'RIB' ||
          doc.documentType === 'MANDAT' ||
          doc.documentType === 'RIB_COMPTE_BANCAIRE'
        );
        this.isLoadingDocs = false;
        if (this.userDocuments.length > 0) {
          this.selectDocument(this.userDocuments[0]);
        }
      },
      error: () => {
        this.isLoadingDocs = false;
      }
    });
  }

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
    if (!this.selectedDocumentForPreview || !this.selectedUser) return;
    if (status === 'REJETE' && !rejectionReason) {
      this.openDocRejectModal();
      return;
    }

    this.isDocActionLoading = true;
    const docId = this.selectedDocumentForPreview.trackingId;
    const request$ = this.selectedUser.role === 'COMMERCANT'
      ? this.documentMerchantService.updateDocumentStatus(docId, status, rejectionReason)
      : this.documentEtudiantService.updateDocumentStatus(docId, status, rejectionReason);

    request$.subscribe({
      next: () => {
        this.isDocActionLoading = false;
        if (this.selectedDocumentForPreview) {
          this.selectedDocumentForPreview.status = status;
          this.selectedDocumentForPreview.rejectionReason = rejectionReason;
        }
        this.loadUsers();
      },
      error: () => {
        this.isDocActionLoading = false;
        this.confirmService.alert("Erreur lors de la mise à jour du statut du document.", "Erreur", "danger");
      }
    });
  }

  closeDetails() {
    this.selectedUser = null;
    this.userDocuments = [];
    this.selectedDocumentForPreview = null;
    this.sanitizedPdfUrl = null;
  }

  toggleSelectAll() {
    this.isAllSelected = !this.isAllSelected;
    if (this.isAllSelected) {
      this.filteredUsers.forEach(u => this.selectedUserIds.add(u.trackingId));
    } else {
      this.selectedUserIds.clear();
    }
  }

  toggleSelectUser(userId: string) {
    if (this.selectedUserIds.has(userId)) {
      this.selectedUserIds.delete(userId);
    } else {
      this.selectedUserIds.add(userId);
    }
    this.isAllSelected = this.filteredUsers.length > 0 && this.selectedUserIds.size === this.filteredUsers.length;
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUserIds.has(userId);
  }

  getSelectedWalletIds(): string[] {
    return this.filteredUsers
      .filter(u => this.selectedUserIds.has(u.trackingId) && (u as any).walletTrackingId)
      .map(u => (u as any).walletTrackingId);
  }

  async freezeUser(user: any, geler: boolean) {
    if (!user.walletTrackingId) {
      this.confirmService.alert("Cet utilisateur n'a pas de portefeuille associé.", "Portefeuille introuvable", "warning");
      return;
    }
    const actionName = geler ? "geler" : "dégeler";
    const confirmed = await this.confirmService.confirm({
      title: `${geler ? 'Gel' : 'Dégel'} de portefeuille`,
      message: `Voulez-vous vraiment ${actionName} le portefeuille de ${user.firstName} ${user.lastName} ?`,
      confirmText: geler ? 'Geler' : 'Dégeler',
      type: geler ? 'warning' : 'info'
    });

    if (!confirmed) return;

    this.isFreezeLoading = true;
    this.walletService.freezeWallet(user.walletTrackingId, geler).subscribe({
      next: () => {
        this.isFreezeLoading = false;
        user.walletStatus = geler ? 'GELE' : 'ACTIF';
        this.loadUsers();
      },
      error: (err) => {
        this.isFreezeLoading = false;
        this.confirmService.alert(`Erreur lors de l'opération de ${actionName} du compte.`, "Erreur", "danger");
      }
    });
  }

  async freezeSelectedUsers(geler: boolean) {
    const walletIds = this.getSelectedWalletIds();
    if (walletIds.length === 0) {
      this.confirmService.alert("Aucun portefeuille valide trouvé dans la sélection.", "Portefeuilles introuvables", "warning");
      return;
    }
    const actionName = geler ? "geler" : "dégeler";
    const confirmed = await this.confirmService.confirm({
      title: `${geler ? 'Gel' : 'Dégel'} en masse`,
      message: `Voulez-vous vraiment ${actionName} les portefeuilles des ${walletIds.length} utilisateurs sélectionnés ?`,
      confirmText: geler ? 'Geler' : 'Dégeler',
      type: geler ? 'warning' : 'info'
    });

    if (!confirmed) return;

    this.isFreezeLoading = true;
    this.walletService.freezeWalletsBulk(walletIds, geler).subscribe({
      next: () => {
        this.isFreezeLoading = false;
        this.selectedUserIds.clear();
        this.isAllSelected = false;
        this.loadUsers();
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
        this.loadUsers();
      },
      error: (err) => {
        this.isFreezeLoading = false;
        this.confirmService.alert(`Erreur lors du ${actionName} portefeuilles étudiants.`, "Erreur", "danger");
      }
    });
  }
}
