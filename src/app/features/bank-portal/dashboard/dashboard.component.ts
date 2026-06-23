import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { 
  BankPortalService, 
  BanqueInfo,
  BankFinancialSummary
} from '../../../core/services/bank-portal.service';
import { Chart, registerables } from 'chart.js';
import { ShortNumberPipe } from '../../../core/pipes/short-number.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ShortNumberPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  banqueInfo: BanqueInfo | null = null;
  financialSummary: BankFinancialSummary | null = null;
  isLoading = true;

  @ViewChild('activityChart') activityChartRef!: ElementRef;
  private chartInstance: any = null;

  constructor(
    private authService: AuthService,
    private bankPortalService: BankPortalService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Chart is rendered after data loads
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
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
        setTimeout(() => this.initChart(), 100);
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
        setTimeout(() => this.initChart(), 100);
      }
    });
  }

  initChart(): void {
    if (!this.activityChartRef) return;
    
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.activityChartRef.nativeElement.getContext('2d');

    // Gradient for the chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)'); // blue-600
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

    // Mock data for the last 7 days (since there is no real endpoint for historical data)
    const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const data = [120000, 190000, 150000, 250000, 220000, 180000, 300000];

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Volume (FCFA)',
          data: data,
          borderColor: '#2563eb', // blue-600
          backgroundColor: gradient,
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#2563eb',
          pointBorderWidth: 2,
          pointRadius: 4,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function(context: any) {
                return (context.parsed.y || 0).toLocaleString() + ' FCFA';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(148, 163, 184, 0.1)',
              tickLength: 0
            },
            ticks: {
              color: '#64748b',
              font: { size: 10 }
            },
            border: { display: false }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748b',
              font: { size: 10 }
            },
            border: { display: false }
          }
        }
      }
    });
  }
}
