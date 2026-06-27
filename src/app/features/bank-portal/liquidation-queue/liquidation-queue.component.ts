import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { 
  BankPortalService, 
  BoutiqueLiquidationInfo,
  VenteNonLiquidee
} from '../../../core/services/bank-portal.service';

@Component({
  selector: 'app-liquidation-queue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './liquidation-queue.component.html',
  styleUrls: ['./liquidation-queue.component.scss']
})
export class LiquidationQueueComponent implements OnInit {
  boutiques: BoutiqueLiquidationInfo[] = [];
  isLoading = false;
  
  selectedBoutique: BoutiqueLiquidationInfo | null = null;
  ventesDetails: VenteNonLiquidee[] = [];
  isLoadingDetails = false;
  
  referenceVirement = '';
  isValidating = false;
  validationSuccess = false;

  constructor(
    private bankPortalService: BankPortalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBoutiques();
  }

  loadBoutiques(): void {
    const operatorId = this.authService.currentUserValue?.trackingId;
    if (!operatorId) return;

    this.isLoading = true;
    this.bankPortalService.getBoutiques(operatorId).subscribe({
      next: (data: any) => {
        this.boutiques = data.filter((b: any) => b.soldeWallet > 0);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  selectBoutique(boutique: BoutiqueLiquidationInfo): void {
    this.selectedBoutique = boutique;
    this.validationSuccess = false;
    this.referenceVirement = '';
    this.loadVentesDetails(boutique.boutiqueTrackingId);
  }

  closeDetails(): void {
    this.selectedBoutique = null;
    this.ventesDetails = [];
  }

  loadVentesDetails(boutiqueTrackingId: string): void {
    this.isLoadingDetails = true;
    this.bankPortalService.getVentesNonLiquidees(boutiqueTrackingId).subscribe({
      next: (data: any) => {
        this.ventesDetails = data;
        this.isLoadingDetails = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoadingDetails = false;
      }
    });
  }

  get totalVentesBrutes(): number {
    const total = this.ventesDetails.reduce((acc, curr) => acc + curr.montant, 0);
    // Fallback if data is inconsistent (e.g. backend error returned 500 but solde is > 0)
    if (total === 0 && this.selectedBoutique && this.selectedBoutique.soldeWallet > 0) {
      return this.selectedBoutique.soldeWallet;
    }
    return total;
  }

  get commissions(): number {
    if (!this.selectedBoutique) return 0;
    const diff = this.totalVentesBrutes - this.selectedBoutique.soldeWallet;
    return diff > 0 ? diff : 0;
  }

  validerVirement(): void {
    if (!this.selectedBoutique || !this.referenceVirement.trim()) return;

    this.isValidating = true;
    this.bankPortalService.validerLiquidation(this.selectedBoutique.boutiqueTrackingId, this.referenceVirement).subscribe({
      next: () => {
        this.isValidating = false;
        this.validationSuccess = true;
        
        // Remove from list
        this.boutiques = this.boutiques.filter(b => b.boutiqueTrackingId !== this.selectedBoutique?.boutiqueTrackingId);
        
        setTimeout(() => {
          this.closeDetails();
        }, 2000);
      },
      error: (err: any) => {
        console.error(err);
        this.isValidating = false;
        alert("Erreur lors de la validation du virement.");
      }
    });
  }
}
