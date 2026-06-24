import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { 
  BankPortalService, 
  BanqueInfo,
  BankFinancialSummary
} from '../../../core/services/bank-portal.service';
import { ShortNumberPipe } from '../../../core/pipes/short-number.pipe';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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
  chart: any;
  
  private _profitChartRef!: ElementRef;

  @ViewChild('profitChart') set profitChartRef(ref: ElementRef) {
    if (ref && !this.chart) {
      this._profitChartRef = ref;
      setTimeout(() => this.initChart(), 10);
    }
  }

  constructor(
    private authService: AuthService,
    private bankPortalService: BankPortalService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
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
        // Chart will be initialized by the ViewChild setter
      },
      error: (err) => {
        console.error("Erreur Résumé Financier:", err);
        // Set default values so the cards render empty (0 FCFA)
        this.financialSummary = {
          totalScolariteUniversites: 0,
          totalDepensesAchats: 0,
          totalCommissionsAchats: 0,
          totalNetCommercants: 0,
          totalCommissionsBanque: 0,
          monthlyProfits: []
        };
        this.isLoading = false;
        // Chart will be initialized by the ViewChild setter
      }
    });
  }

  initChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    
    if (!this._profitChartRef || !this.financialSummary?.monthlyProfits) return;

    const ctx = this._profitChartRef.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [{
          label: 'Profits Bancaires (FCFA)',
          data: this.financialSummary.monthlyProfits,
          borderColor: '#3b82f6', // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 1000,
            ticks: {
              color: 'rgba(148, 163, 184, 0.8)',
              callback: function(value) {
                return new Intl.NumberFormat('fr-FR').format(value as number);
              }
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            }
          },
          x: {
            ticks: {
              color: 'rgba(148, 163, 184, 0.8)'
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

}
