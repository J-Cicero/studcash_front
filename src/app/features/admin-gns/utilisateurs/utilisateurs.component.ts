import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { UniversiteService } from '../../../core/services/universite.service';
import { BanqueService } from '../../../core/services/banque.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface UserResponse {
  trackingId: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  telephone?: string;
  dateInscription: string;
  estActif: boolean;
}

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
  roles = ['ALL', 'ADMIN_GNS', 'ADMIN_DBS', 'UNIVERSITY_ADMIN', 'ADMIN_BANQUE', 'COMMERCANT', 'ETUDIANT'];

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
  newUserForm: any = { nom: '', prenom: '', telephone: '', email: '', motDePasse: '', role: 'ADMIN_DBS', universiteTrackingId: '', banquePartenaireTrackingId: '' };
  isProcessingCreate = false;
  
  universites: any[] = [];
  banques: any[] = [];

  constructor(
    private userService: UserService,
    private universiteService: UniversiteService,
    private banqueService: BanqueService
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
      next: (res) => {
        this.users = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.isLoading = false;
      },
      error: (err) => {
        if(err.status === 404) this.users = [];
        else this.errorMessage = 'Erreur lors du chargement des utilisateurs.';
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    this.newUserForm = { nom: '', prenom: '', telephone: '', email: '', motDePasse: '', role: 'ADMIN_GNS', universiteTrackingId: '', banqueTrackingId: '' };
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  createUser() {
    this.isProcessingCreate = true;
    
    let request;
    if (this.newUserForm.role === 'ADMIN_BANQUE') {
      if (!this.newUserForm.banqueTrackingId) {
        alert("Veuillez sélectionner une banque pour l'administrateur de banque.");
        this.isProcessingCreate = false;
        return;
      }
      request = this.userService.createAdminBanque(this.newUserForm);
    } else {
      request = this.userService.register(this.newUserForm);
    }

    request.subscribe({
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
      next: (res) => {
        this.users = res || [];
        this.isLoading = false;
      },
      error: (err) => {
        if(err.status === 404) this.users = [];
        else this.errorMessage = 'Erreur lors de la recherche.';
        this.isLoading = false;
      }
    });
  }

  // --- Deletion ---
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
        
        // Refresh based on search state
        if (this.searchQuery.trim()) {
          this.searchUsers(this.searchQuery);
        } else {
          this.loadUsers();
        }
      },
      error: () => {
        this.isProcessingDelete = false;
        alert("Erreur lors de la suppression de l'utilisateur.");
      }
    });
  }

  // --- Restoration ---
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
        
        // Refresh based on search state
        if (this.searchQuery.trim()) {
          this.searchUsers(this.searchQuery);
        } else {
          this.loadUsers();
        }
      },
      error: () => {
        this.isProcessingRestore = false;
        alert("Erreur lors de la réactivation de l'utilisateur.");
      }
    });
  }

  getRoleColorClass(role: string): string {
    switch(role) {
      case 'ADMIN_GNS': return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-800';
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
}
