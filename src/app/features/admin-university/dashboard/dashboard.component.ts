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
      return new Date(+y, +m - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    });

    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    let gradientTotal = ctx.createLinearGradient(0, 0, 0, 400);
    gradientTotal.addColorStop(0, 'rgba(99, 102, 241, 0.4)');   // Indigo 500
    gradientTotal.addColorStop(1, 'rgba(99, 102, 241, 0.05)');

    if (this.chart) this.chart.destroy();
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Montant Total (FCFA)',
            data: sortedKeys.map(k => monthlyMap[k].total),
            backgroundColor: gradientTotal,
            borderColor: '#6366f1', // Indigo 500
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#6366f1',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'yMontant'
          },
          {
            label: 'Nombre d\'Étudiants',
            data: sortedKeys.map(k => monthlyMap[k].count),
            type: 'bar',
            backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald 500
            borderRadius: 4,
            barThickness: 10,
            yAxisID: 'yCount'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { 
            position: 'top', 
            labels: { 
              color: '#64748b', 
              font: { family: 'Inter', weight: 'bold' },
              usePointStyle: true,
              boxWidth: 8
            } 
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(51, 65, 85, 0.5)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) { label += ' : '; }
                if (context.parsed.y !== null) {
                   if (context.datasetIndex === 0) {
                     label += new Intl.NumberFormat('fr-FR').format(context.parsed.y) + ' FCFA';
                   } else {
                     label += context.parsed.y;
                   }
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: { 
            ticks: { color: '#64748b', font: { family: 'Inter' } }, 
            grid: { display: false } 
          },
          yMontant: {
            type: 'linear', 
            position: 'left',
            beginAtZero: true,
            ticks: { 
              color: '#6366f1', 
              font: { family: 'Inter', weight: 'bold' },
              callback: (value) => new Intl.NumberFormat('fr-FR', { notation: "compact" , compactDisplay: "short" }).format(Number(value))
            }, 
            grid: { color: 'rgba(226, 232, 240, 0.5)' },
            border: { display: false }
          },
          yCount: {
            type: 'linear', 
            position: 'right',
            beginAtZero: true,
            ticks: { 
              color: '#10b981', 
              font: { family: 'Inter', weight: 'bold' },
              stepSize: 1
            }, 
            grid: { drawOnChartArea: false },
            border: { display: false }
          }
        }
      }
    });
  }

  getSoldeClass(): string {
    const level = this.wallet?.niveauSolde;
    if (!level) return 'text-slate-500 dark:text-slate-400';
    if (level === 'EPUISE') return 'text-red-500 dark:text-red-400';
    if (level === 'CRITIQUE') return 'text-orange-500 dark:text-orange-400';
    if (level === 'FAIBLE') return 'text-amber-500 dark:text-amber-400';
    return 'text-emerald-500 dark:text-emerald-400';
  }
}
