import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UniversityPortalService } from '../../../core/services/university-portal.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('paiementChart') chartRef!: ElementRef<HTMLCanvasElement>;

  profile: any = null;
  universite: any = null;
  wallet: any = null;
  activeYear: any = null;

  totalStudents = 0;
  totalPaiementsCount = 0;
  totalPaiementsMontant = 0;
  paiements: any[] = [];

  isLoading = true;
  chart: Chart | null = null;

  constructor(private universityPortalService: UniversityPortalService) {}

  ngOnInit(): void {
    this.universityPortalService.getMyProfile().pipe(
      switchMap(profile => {
        this.profile = profile;
        return forkJoin({
          universite: this.universityPortalService.getUniversite(profile.universiteTrackingId),
          wallet: this.universityPortalService.getWallet(profile.walletTrackingId),
          students: this.universityPortalService.getStudents(profile.universiteTrackingId),
          paiements: this.universityPortalService.getPaiementsScolarite(profile.universiteTrackingId, 0, 500),
          activeYear: this.universityPortalService.getActiveScolariteYear()
        });
      })
    ).subscribe({
      next: (data) => {
        this.universite = data.universite;
        this.wallet = data.wallet;
        this.activeYear = data.activeYear;

        this.totalStudents = data.students.totalElements || data.students.content?.length || 0;

        const allPaiements = data.paiements.content || [];
        const valides = allPaiements.filter((p: any) => p.statutPaiement === 'VALIDE');
        this.paiements = allPaiements;
        this.totalPaiementsCount = valides.length;
        this.totalPaiementsMontant = valides.reduce((sum: number, p: any) => sum + (p.montantDebite || 0), 0);

        this.isLoading = false;
        setTimeout(() => this.buildChart(valides), 100);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit(): void {}

  buildChart(paiements: any[]): void {
    if (!this.chartRef?.nativeElement || paiements.length === 0) return;

    // Group by month
    const monthlyMap: Record<string, { count: number; total: number }> = {};
    paiements.forEach(p => {
      const date = new Date(p.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { count: 0, total: 0 };
      monthlyMap[key].count++;
      monthlyMap[key].total += p.montantDebite || 0;
    });

    const sortedKeys = Object.keys(monthlyMap).sort();
    const labels = sortedKeys.map(k => {
      const [y, m] = k.split('-');
      return new Date(+y, +m - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    });

    if (this.chart) this.chart.destroy();
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Montant (FCFA)',
            data: sortedKeys.map(k => monthlyMap[k].total),
            backgroundColor: 'rgba(99,102,241,0.7)',
            borderColor: 'rgba(99,102,241,1)',
            borderWidth: 2,
            borderRadius: 6,
            yAxisID: 'yMontant'
          },
          {
            label: 'Nombre de paiements',
            data: sortedKeys.map(k => monthlyMap[k].count),
            type: 'line',
            backgroundColor: 'rgba(16,185,129,0.2)',
            borderColor: 'rgba(16,185,129,1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            yAxisID: 'yCount'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: '#94a3b8', font: { family: 'Inter' } } }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
          yMontant: {
            type: 'linear', position: 'left',
            ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' }
          },
          yCount: {
            type: 'linear', position: 'right',
            ticks: { color: '#10b981' }, grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }

  getSoldeClass(): string {
    const level = this.wallet?.niveauSolde;
    if (level === 'EPUISE') return 'text-red-500 dark:text-red-400';
    if (level === 'CRITIQUE') return 'text-orange-500 dark:text-orange-400';
    if (level === 'FAIBLE') return 'text-yellow-500 dark:text-yellow-400';
    return 'text-emerald-500 dark:text-emerald-400';
  }
}
