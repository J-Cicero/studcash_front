import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';

import { AdminService } from '../../../../core/services/admin.service';
import { UniversiteService } from '../../../../core/services/universite.service';
import { ScolariteYearService } from '../../../../core/services/scolarite-year.service';

@Component({
  selector: 'app-dbs-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, TableModule, SkeletonModule, ButtonModule, TagModule],
  templateUrl: './dbs-dashboard.component.html',
  styleUrls: ['./dbs-dashboard.component.scss']
})
export class DbsDashboardComponent implements OnInit {
  isLoading = signal(true);
  stats = signal<any>(null);
  activeYear = signal<any>(null);
  
  univStats = signal<any[]>([]);

  donutData: any;
  donutOptions: any;

  private adminService = inject(AdminService);
  private univService = inject(UniversiteService);
  private yearService = inject(ScolariteYearService);

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading.set(true);
    
    const requests = {
      global: this.adminService.getGlobalStats(),
      univs: this.univService.getSummaryStats(),
      year: this.yearService.getActive()
    };

    forkJoin(requests).subscribe({
      next: (res) => {
        this.stats.set(res.global);
        this.univStats.set(res.univs);
        this.activeYear.set(res.year);
        this.initCharts(res.univs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('DBS Dashboard Error', err);
        this.isLoading.set(false);
      }
    });
  }

  initCharts(univs: any[]) {
    this.donutData = {
      labels: univs.map(u => u.code),
      datasets: [{
        data: univs.map(u => u.nbEtudiants),
        backgroundColor: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'],
        hoverOffset: 4
      }]
    };

    this.donutOptions = {
      cutout: '70%',
      plugins: { legend: { position: 'bottom' } }
    };
  }
}
