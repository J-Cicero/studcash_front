import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, GlobalStats, FluxMensuel } from '../../../core/services/dashboard.service';
import { PaiementService, PaiementResponse } from '../../../core/services/paiement.service';
import { ScolariteYearService, ScolariteYear } from '../../../core/services/scolarite-year.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  chart: any;

  stats: GlobalStats | null = null;
  fluxData: FluxMensuel[] = [];
  recentTransactions: PaiementResponse[] = [];
  
  isLoadingStats = true;
  isLoadingFlux = true;
  isLoadingTxns = true;

  activeYear: ScolariteYear | null = null;

  constructor(
    private dashboardService: DashboardService,
    private paiementService: PaiementService,
    private scolariteYearService: ScolariteYearService
  ) {}

  ngOnInit(): void {
    this.loadActiveYear();
    this.loadGlobalStats();
    this.loadFluxMensuel();
    this.loadRecentTransactions();
  }

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

  ngAfterViewInit(): void {
    // Chart will be initialized when data is loaded
  }

  loadGlobalStats() {
    const defaultStats: GlobalStats = {
      totalBourses: 0,
      totalStudents: 0,
      totalBoutiques: 0,
      totalUniversities: 0,
      totalTransactions: 0,
      totalEligibles: 0,
      totalPending: 0,
      verificationRate: 0,
      volumeToday: 0,
      failedTxns: 0,
      successRate: 0
    };

    this.dashboardService.getGlobalStats().subscribe({
      next: (res) => {
        this.stats = res ? { ...defaultStats, ...res } : defaultStats;
        this.isLoadingStats = false;
      },
      error: () => {
        this.stats = defaultStats;
        this.isLoadingStats = false;
      }
    });
  }

  loadFluxMensuel() {
    this.dashboardService.getFluxMensuel().subscribe({
      next: (res) => {
        this.fluxData = res;
        this.isLoadingFlux = false;
        this.initChart();
      },
      error: () => this.isLoadingFlux = false
    });
  }

  loadRecentTransactions() {
    this.paiementService.findAll(0, 5).subscribe({
      next: (res) => {
        this.recentTransactions = res.content || [];
        this.isLoadingTxns = false;
      },
      error: () => this.isLoadingTxns = false
    });
  }

  initChart() {
    if (!this.chartCanvas || this.fluxData.length === 0) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    
    const labels = this.fluxData.map(d => d.mois);
    const versements = this.fluxData.map(d => d.bourses);
    const achats = this.fluxData.map(d => d.remboursements); // PAIEMENTS include both ACHAT and SCOLARITE

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Versements Bourses',
            data: versements,
            borderColor: '#4f46e5', // indigo-600
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Volume Paiements',
            data: achats,
            borderColor: '#06b6d4', // cyan-500
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) { label += ': '; }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('fr-FR').format(context.parsed.y) + ' FCFA';
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return this.formatNumberCompact(Number(value));
              }
            }
          }
        }
      }
    });
  }

  formatNumberCompact(value: number | undefined | null): string {
    if (value === null || value === undefined) return '0';
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace(/\.0$/, '') + ' M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1).replace(/\.0$/, '') + ' K';
    }
    return value.toString();
  }

  getShortId(id: string): string {
    if (!id) return '';
    return id.substring(0, 8).toUpperCase();
  }
}

