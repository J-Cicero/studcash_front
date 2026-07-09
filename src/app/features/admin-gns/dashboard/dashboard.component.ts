import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, GlobalStats } from '../../../core/services/dashboard.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { ScolariteYearService, ScolariteYear } from '../../../core/services/scolarite-year.service';
import { StudentService } from '../../../core/services/student.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { LiquidationService } from '../../../core/services/liquidation.service';
import Chart from 'chart.js/auto';
import { catchError, of } from 'rxjs';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, KpiCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef;
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef;
  
  lineChart: any;
  pieChart: any;

  stats: GlobalStats | null = null;
  activeYear: ScolariteYear | null = null;
  isLoadingStats = true;

  // KPIs states
  totalEtudiants = 0;
  isTotalEtudiantsLoading = true;
  totalEtudiantsError = false;

  totalGnsCommission = 0;
  totalBankCommission = 0;

  lowQuotaBoutiques = 0;
  isLowQuotaBoutiquesLoading = true;
  lowQuotaBoutiquesError = false;

  pendingLiquidations = 0;
  isPendingLiquidationsLoading = true;
  pendingLiquidationsError = false;

  // Chart states
  isLineChartLoading = true;
  isPieChartLoading = true;

  constructor(
    private dashboardService: DashboardService,
    private transactionService: TransactionService,
    private scolariteYearService: ScolariteYearService,
    private studentService: StudentService,
    private boutiqueService: BoutiqueService,
    private liquidationService: LiquidationService
  ) {}

  ngOnInit(): void {
    this.loadActiveYear();
    this.loadGlobalStats();
    
    // Load KPIs
    this.loadTotalEtudiants();
    this.loadLowQuotaBoutiques();
    this.loadPendingLiquidations();

    // Load Charts
    setTimeout(() => {
      this.loadChartStats();
    }, 200); // Small delay to let canvas render
  }

  ngAfterViewInit(): void {}

  // --- Header Data ---
  loadActiveYear() {
    this.scolariteYearService.getActiveYear().subscribe({
      next: (year) => {
        this.activeYear = year;
      },
      error: () => {
        this.activeYear = null;
      }
    });
  }

  loadGlobalStats() {
    this.dashboardService.getGlobalStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.totalGnsCommission = res.totalGnsCommission;
        this.totalBankCommission = res.totalBankCommission;
        this.isLoadingStats = false;
      },
      error: () => {
        this.isLoadingStats = false;
      }
    });
  }

  // --- KPIs ---
  loadTotalEtudiants() {
    this.studentService.getTotalStudents().pipe(
      catchError(() => {
        this.totalEtudiantsError = true;
        return of(0);
      })
    ).subscribe((res) => {
      this.totalEtudiants = res || 0;
      this.isTotalEtudiantsLoading = false;
    });
  }

  loadLowQuotaBoutiques() {
    this.boutiqueService.getLowQuotaCount().pipe(
      catchError(() => {
        this.lowQuotaBoutiquesError = true;
        return of(0);
      })
    ).subscribe((val) => {
      this.lowQuotaBoutiques = val || 0;
      this.isLowQuotaBoutiquesLoading = false;
    });
  }

  loadPendingLiquidations() {
    this.liquidationService.getPendingTotal().pipe(
      catchError(() => {
        this.pendingLiquidationsError = true;
        return of(0);
      })
    ).subscribe((val) => {
      this.pendingLiquidations = val || 0;
      this.isPendingLiquidationsLoading = false;
    });
  }

  // --- Charts ---


  initLineChart(data: any[]) {
    if (!this.lineChartCanvas || !data || data.length === 0) return;

    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    const labels = data.map(d => d.date || d.label || d.mois || '');
    const volumes = data.map(d => d.volume || d.value || d.montant || 0);

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Évolution Transactions',
          data: volumes,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  initPieChart(data: any[]) {
    if (!this.pieChartCanvas || !data || data.length === 0) return;

    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    const labels = data.map(d => d.type || d.label || d.statut || 'Inconnu');
    const counts = data.map(d => d.count || d.value || d.total || 0);

    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        cutout: '70%'
      }
    });
  }

  loadChartStats() {
    this.transactionService.getChartStats().subscribe({
      next: (res) => {
        if (res.monthlyVolume) {
          this.initLineChart(res.monthlyVolume);
        }
        if (res.boutiqueShare) {
          const shareData = res.boutiqueShare.length > 0 ? res.boutiqueShare : [
            { label: 'Aucune transaction', volume: 1 }
          ];
          this.initPieChart(shareData);
        }
        this.isLineChartLoading = false;
        this.isPieChartLoading = false;
      },
      error: () => {
        this.initLineChart([
          { label: 'Janvier', volume: 0 },
          { label: 'Février', volume: 0 },
          { label: 'Mars', volume: 0 }
        ]);
        this.initPieChart([
          { label: 'Aucune donnée', volume: 1 }
        ]);
        this.isLineChartLoading = false;
        this.isPieChartLoading = false;
      }
    });
  }
}
