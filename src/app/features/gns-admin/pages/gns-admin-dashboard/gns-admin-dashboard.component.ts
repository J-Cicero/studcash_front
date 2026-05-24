import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AdminService } from '../../../../core/services/admin.service';
import { PaiementService } from '../../../../core/services/paiement.service';
import { UniversiteService } from '../../../../core/services/universite.service';
import { BoutiqueService } from '../../../../core/services/boutique.service';

@Component({
  selector: 'app-gns-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, TableModule, SkeletonModule, ButtonModule, RouterLink, TagModule],
  templateUrl: './gns-admin-dashboard.component.html',
  styleUrls: ['./gns-admin-dashboard.component.scss']
})
export class GnsAdminDashboardComponent implements OnInit {
  isLoading = signal(true);
  
  // KPI Data
  stats = signal<any>(null);
  
  // Charts
  lineData: any;
  lineOptions: any;
  donutData: any;
  donutOptions: any;
  
  // Tables & Alerts
  recentTransactions = signal<any[]>([]);
  quotaAlerts = signal<any[]>([]);

  private adminService = inject(AdminService);
  private paiementService = inject(PaiementService);
  private univService = inject(UniversiteService);
  private boutiqueService = inject(BoutiqueService);

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading.set(true);
    
    const requests = {
      global: this.adminService.getGlobalStats(),
      flux: this.adminService.getFluxMensuel(),
      univs: this.univService.getSummaryStats(),
      txns: this.paiementService.getAll(0, 5),
      alerts: this.boutiqueService.getAlertesQuota(0.10, 0, 5)
    };

    forkJoin(requests).subscribe({
      next: (results) => {
        this.stats.set(results.global);
        this.recentTransactions.set(results.txns.content);
        this.quotaAlerts.set(results.alerts.content);
        
        this.initLineChart(results.flux);
        this.initDonutChart(results.univs);
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Dashboard Data Load Error', err);
        this.isLoading.set(false);
      }
    });
  }

  initLineChart(fluxData: any[]) {
    this.lineData = {
      labels: fluxData.map(d => d.mois),
      datasets: [
        {
          label: 'Bourses Émises',
          data: fluxData.map(d => d.bourses),
          borderColor: '#4F46E5',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Remboursements',
          data: fluxData.map(d => d.remboursements),
          borderColor: '#94a3b8',
          borderDash: [5, 5],
          tension: 0.4,
          fill: false
        }
      ]
    };

    this.lineOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { border: { display: false } }
      }
    };
  }

  initDonutChart(univStats: any[]) {
    this.donutData = {
      labels: univStats.map(u => u.code),
      datasets: [{
        data: univStats.map(u => u.nbEtudiants),
        backgroundColor: ['#4F46E5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
        hoverBackgroundColor: ['#4338ca']
      }]
    };

    this.donutOptions = {
      cutout: '70%',
      plugins: { legend: { position: 'bottom' } }
    };
  }
}
