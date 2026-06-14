import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { 
  BankPortalService, 
  BoutiqueLiquidationInfo,
  BoutiqueVersementInfo
} from '../../../core/services/bank-portal.service';

@Component({
  selector: 'app-boutique-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './boutique-audit.component.html',
  styleUrls: ['./boutique-audit.component.scss']
})
export class BoutiqueAuditComponent implements OnInit {
  boutiques: BoutiqueLiquidationInfo[] = [];
  filteredBoutiques: BoutiqueLiquidationInfo[] = [];
  searchTerm: string = '';
  isLoading = false;
  
  allVersements: BoutiqueVersementInfo[] = [];
  boutiqueVersements: BoutiqueVersementInfo[] = [];
  selectedBoutique: BoutiqueLiquidationInfo | null = null;
  isLoadingVersements = false;

  constructor(
    private bankPortalService: BankPortalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const operatorId = this.authService.currentUserValue?.trackingId;
    if (!operatorId) return;

    this.isLoading = true;
    this.isLoadingVersements = true;

    // Load boutiques
    this.bankPortalService.getBoutiques(operatorId).subscribe({
      next: (data: any) => {
        this.boutiques = data;
        this.filteredBoutiques = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });

    // Preload all versements to allow instant filtering
    this.bankPortalService.getBoutiqueVersements(operatorId).subscribe({
      next: (data: any) => {
        this.allVersements = data;
        this.isLoadingVersements = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoadingVersements = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredBoutiques = this.boutiques.filter(b => 
      b.nomBoutique.toLowerCase().includes(term) || 
      b.proprietaireNom.toLowerCase().includes(term) ||
      b.numeroCompte.toLowerCase().includes(term)
    );
  }

  selectBoutique(boutique: BoutiqueLiquidationInfo): void {
    this.selectedBoutique = boutique;
    // Filter versements by boutique name or trackingId (assuming nomBoutique matches for now, 
    // ideally the backend sends boutiqueTrackingId in BoutiqueVersementInfo)
    this.boutiqueVersements = this.allVersements
      .filter(v => v.nomBoutique === boutique.nomBoutique)
      .sort((a, b) => new Date(b.dateVersement).getTime() - new Date(a.dateVersement).getTime());
  }
}
