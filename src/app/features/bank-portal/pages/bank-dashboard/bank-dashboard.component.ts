import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { BankPortalService, StudentLiquidationInfo } from '../../../../core/services/bank-portal.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-bank-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, SkeletonModule, ButtonModule],
  templateUrl: './bank-dashboard.component.html',
  styleUrls: ['./bank-dashboard.component.scss']
})
export class BankDashboardComponent implements OnInit {
  isLoading = signal(true);
  stats = signal({
    totalLiquidations: 0,
    mandatsAttente: 0,
    tauxLiquidation: 0
  });

  chartData: any;
  chartOptions: any;

  private bankService = inject(BankPortalService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const operatorId = "79633e9d-72e7-4953-b295-5853507d3913"; // Simulation, replace with auth actual id later
    this.isLoading.set(true);

    this.bankService.getStudents(operatorId).subscribe({
      next: (students) => {
        const total = students.reduce((acc, s) => acc + s.resteAPayer, 0);
        this.stats.set({
            totalLiquidations: total,
            mandatsAttente: 0, // Need separate count if available
            tauxLiquidation: 100
        });
        this.initCharts();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Bank Dashboard Error', err);
        this.isLoading.set(false);
      }
    });
  }

  initCharts() {
    this.chartData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [{
        label: 'Volume Liquidation',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: '#4F46E5',
        borderRadius: 8
      }]
    };
    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    };
  }
}
