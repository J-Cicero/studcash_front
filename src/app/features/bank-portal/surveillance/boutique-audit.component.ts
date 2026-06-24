import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { 
  BankPortalService, 
  BoutiqueLiquidationInfo,
  BoutiqueVersementInfo,
  VenteNonLiquidee
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
  
  ventesNonLiquidees: VenteNonLiquidee[] = [];
  selectedBoutique: BoutiqueLiquidationInfo | null = null;
  isLoadingVentes = false;
  isLiquidating = false;
  liquidationSuccess = false;

  totalVentes: number = 0;

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
    this.isLoadingVentes = true;
    this.liquidationSuccess = false;
    
    this.bankPortalService.getVentesNonLiquidees(boutique.boutiqueTrackingId).subscribe({
      next: (data) => {
        this.ventesNonLiquidees = data;
        this.totalVentes = this.ventesNonLiquidees.reduce((acc, curr) => acc + curr.montant, 0);
        this.isLoadingVentes = false;
      },
      error: (err) => {
        console.error(err);
        this.ventesNonLiquidees = [];
        this.totalVentes = 0;
        this.isLoadingVentes = false;
      }
    });
  }

  liquider(): void {
    if (!this.selectedBoutique || this.ventesNonLiquidees.length === 0) return;
    
    this.isLiquidating = true;
    this.bankPortalService.liquidateBoutique(this.selectedBoutique.boutiqueTrackingId).subscribe({
      next: () => {
        this.isLiquidating = false;
        this.liquidationSuccess = true;
        // Optionally refresh ventes
        this.ventesNonLiquidees = [];
        this.totalVentes = 0;
        
        // Refresh boutiques to update solde
        this.loadData();
      },
      error: (err) => {
        console.error('Erreur lors de la liquidation', err);
        this.isLiquidating = false;
      }
    });
  }
}
