import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { UniversiteService } from '../../../../core/services/universite.service';
import { PaiementService } from '../../../../core/services/paiement.service';
import { ScolariteService } from '../../../../core/services/scolarite.service';

@Component({
  selector: 'app-univ-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, TableModule, SkeletonModule, ButtonModule],
  templateUrl: './univ-dashboard.component.html',
  styleUrls: ['./univ-dashboard.component.scss']
})
export class UnivDashboardComponent implements OnInit {
  isLoading = signal(true);
  currentDate = signal('');
  
  univDetails = signal<any>(null);
  stats = signal({
    nbStudents: 0,
    totalEncaisse: 0,
    pretsEnAttente: 0
  });

  chartData: any;
  chartOptions: any;
  
  recentTransactions = signal<any[]>([]);

  private authService = inject(AuthService);
  private univService = inject(UniversiteService);
  private paiementService = inject(PaiementService);
  private scolariteService = inject(ScolariteService);

  ngOnInit(): void {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    this.currentDate.set(new Date().toLocaleDateString('fr-FR', options));
    this.loadAllData();
  }

  loadAllData() {
    const univId = this.authService.universityId();
    if (!univId) {
        console.warn('No university ID found for current user');
        this.isLoading.set(false);
        return;
    }

    this.isLoading.set(true);

    const requests = {
      details: this.univService.getByTrackingId(univId),
      txns: this.paiementService.getByUniversite(univId, 0, 5),
      prets: this.scolariteService.getByUniversite(univId)
    };

    forkJoin(requests).subscribe({
      next: (res) => {
        this.univDetails.set(res.details);
        this.recentTransactions.set(res.txns.content);
        
        this.stats.set({
            nbStudents: 0, // Placeholder
            totalEncaisse: res.details.soldeWallet || 0,
            pretsEnAttente: res.prets.filter(p => !p.estRembourse).length
        });

        this.initChart();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Univ Dashboard Error', err);
        this.isLoading.set(false);
      }
    });
  }

  initChart() {
    this.chartData = {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [
            {
                label: 'Encaissements Scolarité',
                data: [45, 52, 48, 61, 58, 74],
                borderColor: '#4F46E5',
                tension: 0.4
            }
        ]
    };
    this.chartOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
    };
  }
}
