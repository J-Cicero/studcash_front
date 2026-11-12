import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { UserService } from '../../core/services/user.service';
import { ScolariteYearService } from '../../core/services/scolarite-year.service';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { AcademicYearContextService, ScolariteYear } from '../../core/services/academic-year-context.service';

export interface SearchModuleItem {
  title: string;
  category: string;
  description: string;
  route: string;
  keywords: string[];
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationBellComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {
  activeYear: ScolariteYear | null = null;
  allYears: ScolariteYear[] = [];
  selectedYearTrackingId: string = '';

  // Global Header Search
  globalSearch: string = '';
  isSearchOpen: boolean = false;
  isSearchingUsers: boolean = false;
  userSearchResults: any[] = [];
  private searchSubject = new Subject<string>();

  modules: SearchModuleItem[] = [
    { title: 'Inscriptions & Dossiers KYC', category: 'Étudiants', description: 'Validation des dossiers étudiants et pièces justificatives', route: '/admin-gns/inscriptions', keywords: ['inscription', 'etudiant', 'matricule', 'dossier', 'kyc', 'validation', 'boursier'] },
    { title: 'Gestion des Utilisateurs', category: 'Administration', description: 'Supervision des comptes GNS, DBS, banques et commerçants', route: '/admin-gns/utilisateurs', keywords: ['utilisateur', 'user', 'compte', 'admin', 'banque', 'etudiant', 'marchand'] },
    { title: 'Cartes Étudiantes & QR', category: 'Cartes NFC', description: 'Émission, activation et statut des cartes étudiantes', route: '/admin-gns/cards', keywords: ['carte', 'nfc', 'qr', 'rfid', 'badge', 'impression'] },
    { title: 'Versements Étudiants', category: 'Finances', description: 'Recharge et versement des bourses universitaires', route: '/admin-gns/versements/etudiants', keywords: ['versement', 'bourse', 'avance', 'solde', 'etudiant', 'masse'] },
    { title: 'Quotas Boutiques', category: 'Finances', description: 'Gestion des quotas de vente et recharges marchands', route: '/admin-gns/versements/boutiques', keywords: ['quota', 'boutique', 'recharge', 'commercant', 'marchand'] },
    { title: 'Transactions & Dépenses', category: 'Finances', description: 'Suivi des flux financiers et prélèvements sur bourses', route: '/admin-gns/transactions', keywords: ['transaction', 'depense', 'flux', 'prelevement', 'bourse', 'achat'] },
    { title: 'Années Universitaires', category: 'Configuration', description: 'Gestion des sessions académiques et clôtures', route: '/admin-gns/scolarite', keywords: ['annee', 'scolarite', 'universitaire', 'session', 'cloture'] },
    { title: 'Universités Partenaires', category: 'Configuration', description: 'Gestion des universités et établissements rattachés', route: '/admin-gns/universites', keywords: ['universite', 'ul', 'campus', 'etablissement'] },
    { title: 'Paramètres du Système', category: 'Configuration', description: 'Taux de commission, plafonds et configurations', route: '/admin-gns/parametres', keywords: ['parametre', 'config', 'plafond', 'taux', 'reglage'] }
  ];

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private scolariteYearService: ScolariteYearService,
    public yearContext: AcademicYearContextService,
    private userService: UserService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.searchSubject.pipe(
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe(query => {
      this.executeUserSearch(query);
    });
  }

  ngOnInit(): void {
    this.loadYears();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isSearchOpen = false;
    }
  }

  get filteredModules(): SearchModuleItem[] {
    if (!this.globalSearch || !this.globalSearch.trim()) {
      return this.modules.slice(0, 4); // Quick suggestions
    }
    const q = this.globalSearch.trim().toLowerCase();
    return this.modules.filter(m => 
      m.title.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.keywords.some(k => k.toLowerCase().includes(q))
    );
  }

  onSearchFocus(): void {
    this.isSearchOpen = true;
  }

  onSearchInput(): void {
    this.isSearchOpen = true;
    this.searchSubject.next(this.globalSearch);
  }

  private executeUserSearch(query: string): void {
    if (!query || query.trim().length < 2) {
      this.userSearchResults = [];
      this.isSearchingUsers = false;
      return;
    }
    this.isSearchingUsers = true;
    this.userService.searchUsers(query.trim()).subscribe({
      next: (users) => {
        this.userSearchResults = (users || []).slice(0, 5);
        this.isSearchingUsers = false;
      },
      error: () => {
        this.userSearchResults = [];
        this.isSearchingUsers = false;
      }
    });
  }

  onSearchSubmit(): void {
    const q = this.globalSearch.trim();
    if (!q) return;

    // 1. If matches a module first
    const matchedModule = this.filteredModules[0];
    if (this.filteredModules.length === 1 && matchedModule) {
      this.selectModule(matchedModule);
      return;
    }

    // 2. If matching users exist, navigate to users page with search
    if (this.userSearchResults.length > 0) {
      this.router.navigate(['/admin-gns/utilisateurs'], { queryParams: { search: q } });
      this.closeSearch();
      return;
    }

    // 3. Otherwise navigate to inscriptions with search
    if (matchedModule) {
      this.selectModule(matchedModule);
    } else {
      this.router.navigate(['/admin-gns/inscriptions'], { queryParams: { search: q } });
      this.closeSearch();
    }
  }

  selectModule(module: SearchModuleItem): void {
    this.router.navigate([module.route]);
    this.closeSearch();
  }

  selectUser(user: any): void {
    const searchTerm = user.email || user.lastName || '';
    this.router.navigate(['/admin-gns/utilisateurs'], { queryParams: { search: searchTerm } });
    this.closeSearch();
  }

  clearSearch(): void {
    this.globalSearch = '';
    this.userSearchResults = [];
    this.isSearchOpen = false;
  }

  closeSearch(): void {
    this.isSearchOpen = false;
  }

  loadYears(): void {
    this.scolariteYearService.getAll().subscribe({
      next: (res: any) => {
        // API returns a paginated Page object: { content: [], totalElements: N }
        const years: ScolariteYear[] = res?.content || res || [];
        this.allYears = years;
        const active = years.find((y: any) => y.isOpen);
        if (active) {
          this.activeYear = active;
          this.selectedYearTrackingId = active.trackingId;
          this.yearContext.setSelectedYear(active);
        } else if (years.length > 0) {
          this.selectedYearTrackingId = years[0].trackingId;
          this.yearContext.setSelectedYear(years[0]);
        }
      },
      error: (err: any) => console.error('Erreur chargement années', err)
    });
  }

  onYearChange(): void {
    const found = this.allYears.find(y => y.trackingId === this.selectedYearTrackingId) ?? null;
    this.yearContext.setSelectedYear(found);
  }

  get isReadOnly(): boolean {
    return this.yearContext.isReadOnly;
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
