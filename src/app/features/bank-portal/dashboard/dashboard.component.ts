import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { 
  BankPortalService, 
  BanqueInfo,
  BankFinancialSummary
} from '../../../core/services/bank-portal.service';
import { ShortNumberPipe } from '../../../core/pipes/short-number.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ShortNumberPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  banqueInfo: BanqueInfo | null = null;
  financialSummary: BankFinancialSummary | null = null;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private bankPortalService: BankPortalService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
  }

  loadData(): void {
    const operatorId = this.authService.currentUserValue?.trackingId;
    if (!operatorId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    
    // Load bank info
    this.bankPortalService.getBanqueInfo(operatorId).subscribe({
      next: (bank) => {
        this.banqueInfo = bank;
        this.loadFinancialSummary(operatorId);
      },
      error: (err) => {
        console.error("Erreur Info Banque:", err);
        // Continue to load financial summary even if bank info fails
        this.loadFinancialSummary(operatorId);
      }
    });
  }

  loadFinancialSummary(operatorId: string): void {
    this.bankPortalService.getFinancialSummary(operatorId).subscribe({
      next: (data) => {
        this.financialSummary = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur Résumé Financier:", err);
        // Set default values so the cards render empty (0 FCFA)
        this.financialSummary = {
          totalScolariteUniversites: 0,
          totalDepensesAchats: 0,
          totalCommissionsAchats: 0,
          totalNetCommercants: 0,
          totalCommissionsBanque: 0
        };
        this.isLoading = false;
      }
    });
  }

}
