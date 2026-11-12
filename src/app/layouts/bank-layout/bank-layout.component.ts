import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { ScolariteYearService } from '../../core/services/scolarite-year.service';
import { AcademicYearContextService, ScolariteYear } from '../../core/services/academic-year-context.service';

export interface BankSearchModuleItem {
  title: string;
  category: string;
  description: string;
  route: string;
  keywords: string[];
}

@Component({
  selector: 'app-bank-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationBellComponent],
  templateUrl: './bank-layout.component.html',
  styleUrls: ['./bank-layout.component.scss']
})
export class BankLayoutComponent implements OnInit {
  allYears: ScolariteYear[] = [];
  selectedYearTrackingId: string = '';

  // Bank Header Search
  bankSearch: string = '';
  isSearchOpen: boolean = false;

  bankModules: BankSearchModuleItem[] = [
    { title: 'Dossiers KYC & Sécurité', category: 'Conformité', description: 'Surveillance des portefeuilles étudiants et marchands', route: '/bank-portal/surveillance', keywords: ['surveillance', 'kyc', 'etudiant', 'marchand', 'securite', 'gel'] },
    { title: 'Liquidations Marchands', category: 'Règlements', description: 'Validation des demandes de liquidation des commerçants', route: '/bank-portal/liquidations-marchands', keywords: ['liquidation', 'marchand', 'commercant', 'reglement', 'virement'] },
    { title: 'Liquidations Étudiants', category: 'Règlements', description: 'Prélèvements sur bourses et régularisation', route: '/bank-portal/liquidations-etudiants', keywords: ['liquidation', 'etudiant', 'bourse', 'prelevement'] },
    { title: 'Tableau de Bord Bancaire', category: 'Supervision', description: 'Vue globale des indicateurs financiers', route: '/bank-portal/dashboard', keywords: ['dashboard', 'tableau', 'bord', 'statistiques', 'kpi'] },
    { title: 'Mon Profil Bancaire', category: 'Compte', description: 'Informations de l\'opérateur bancaire', route: '/bank-portal/profile', keywords: ['profil', 'compte', 'banque'] }
  ];
  
  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private scolariteYearService: ScolariteYearService,
    public yearContext: AcademicYearContextService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadYears();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isSearchOpen = false;
    }
  }

  get filteredBankModules(): BankSearchModuleItem[] {
    if (!this.bankSearch || !this.bankSearch.trim()) {
      return this.bankModules.slice(0, 4);
    }
    const q = this.bankSearch.trim().toLowerCase();
    return this.bankModules.filter(m => 
      m.title.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.keywords.some(k => k.toLowerCase().includes(q))
    );
  }

  onSearchFocus(): void {
    this.isSearchOpen = true;
  }

  onSearchSubmit(): void {
    const q = this.bankSearch.trim();
    if (!q) return;

    if (this.filteredBankModules.length === 1) {
      this.selectModule(this.filteredBankModules[0]);
    } else {
      this.router.navigate(['/bank-portal/surveillance'], { queryParams: { search: q } });
      this.closeSearch();
    }
  }

  selectModule(mod: BankSearchModuleItem): void {
    this.router.navigate([mod.route]);
    this.closeSearch();
  }

  clearSearch(): void {
    this.bankSearch = '';
    this.isSearchOpen = false;
  }

  closeSearch(): void {
    this.isSearchOpen = false;
  }

  loadYears(): void {
    this.scolariteYearService.getAll().subscribe({
      next: (years: any[]) => {
        this.allYears = years;
        const active = years.find((y: any) => y.isOpen);
        if (active) {
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
