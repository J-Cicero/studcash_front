import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { UniversiteService } from '../../../core/services/universite.service';
import { BanqueService } from '../../../core/services/banque.service';
import { StudentService } from '../../../core/services/student.service';
import { DocumentService } from '../../../core/services/document.service'; 
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Page } from '../../../core/models/page.model';
import { UserResponse } from '../../../core/models/user.model';
import { DocumentResponse } from '../../../core/models/document.model'; 

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
    if (this.filterRole === 'ALL') return this.users;
    return this.users.filter(u => u.role === this.filterRole);
  }

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
  
  universites: any[] = [];
  banques: any[] = [];

  constructor(
    private userService: UserService,
    private universiteService: UniversiteService,
    private banqueService: BanqueService,
    private studentService: StudentService,
    private documentService: DocumentService
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

  ngOnInit(): void {
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
      alert("Veuillez sélectionner une banque pour l'administrateur de banque.");
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
        alert(msg);
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
        alert("Erreur lors de la suppression de l'utilisateur.");
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
        alert("Erreur lors de la réactivation de l'utilisateur.");
      }
    });
  }

  getRoleColorClass(role: string): string {
    switch(role) {
      case 'ADMIN_GNS': return 'bg-indigo-500 text-white border-indigo-500 dark:bg-indigo-700 dark:text-indigo-100 dark:border-indigo-700';
      case 'ADMIN_DBS': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800';
      case 'UNIVERSITY_ADMIN':
      case 'ADMINISTRATION_UNIVERSITAIRE':
      case 'ADMIN_UL': return 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-400 dark:border-teal-800';
      case 'ADMIN_BANQUE':
      case 'BANQUE': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800';
      case 'COMMERCANT': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800';
      case 'ETUDIANT': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  }

  viewDetails(user: UserResponse) {
    if (user.role !== 'ETUDIANT' && user.role !== 'COMMERCANT') {
      return; 
    }
    
    this.selectedUser = user;
    this.userDocuments = [];
    this.isLoadingDocs = true;
    this.hasMandatoryDocs = false;
    
    this.documentService.getDocumentsByOwner(user.trackingId).subscribe({
      next: (res: DocumentResponse[]) => { 
        this.userDocuments = res || [];
        
        // Also fetch CompteBancaire (RIB)
        let ownerId = user.trackingId;
        // Si c'est un commerçant, l'ID du compte bancaire est peut-être lié à sa boutique
        // mais pour l'instant essayons avec son propre ID, ou ajoutons-le si trouvé
        this.banqueService.getCompteBancaireByOwner(ownerId).subscribe({
          next: (compte) => {
             if (compte && compte.ribUrl) {
                this.userDocuments.push({
                   trackingId: compte.trackingId,
                   documentType: 'RIB_COMPTE_BANCAIRE',
                   fileUrl: compte.ribUrl,
                   ownerTrackingId: ownerId,
                   createdAt: new Date().toISOString()
                } as any);
             }
             this.hasMandatoryDocs = this.userDocuments.some(doc => doc.documentType === 'MANDAT_BANCAIRE' || doc.documentType === 'RIB' || doc.documentType === 'MANDAT' || doc.documentType === 'RIB_COMPTE_BANCAIRE');
             this.isLoadingDocs = false;
          },
          error: () => {
             this.hasMandatoryDocs = this.userDocuments.some(doc => doc.documentType === 'MANDAT_BANCAIRE' || doc.documentType === 'RIB' || doc.documentType === 'MANDAT');
             this.isLoadingDocs = false;
          }
        });
      },
      error: (err: any) => { 
        console.error('Erreur lors du chargement des documents', err);
        this.userDocuments = [];
        this.hasMandatoryDocs = false;
        
        // Try fetching only CompteBancaire if DocumentEtudiant fails
        let ownerId = user.trackingId;
        this.banqueService.getCompteBancaireByOwner(ownerId).subscribe({
          next: (compte) => {
             if (compte && compte.ribUrl) {
                this.userDocuments.push({
                   trackingId: compte.trackingId,
                   documentType: 'RIB_COMPTE_BANCAIRE',
                   fileUrl: compte.ribUrl,
                   ownerTrackingId: ownerId,
                   createdAt: new Date().toISOString()
                } as any);
                this.hasMandatoryDocs = true;
             }
             this.isLoadingDocs = false;
             this.errorMessage = "";
          },
          error: () => {
             this.isLoadingDocs = false;
             this.errorMessage = "Impossible de charger les documents.";
          }
        });
      }
    });
  }

  closeDetails() {
    this.selectedUser = null;
    this.userDocuments = [];
  }
}
