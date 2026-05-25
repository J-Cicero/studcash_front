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
import { StudentService } from '../../../../shared/services/student.service';
import { InscriptionService } from '../../../../core/services/inscription.service';
import { Universite } from '../../../../core/models/universite.model';
import { PaiementResponse } from '../../../../core/models/gns-admin.model';
import { InscriptionAnnuelleResponse } from '../../../../core/services/inscription.service';
import { PretScolariteResponse } from '../../../../core/services/scolarite.service';

interface UnivDashboardStats {
  nbStudents: number;
  totalEncaisse: number;
  pretsEnAttente: number;
}

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
  
  univDetails = signal<Universite | null>(null);
  stats = signal<UnivDashboardStats>({
    nbStudents: 0,
    totalEncaisse: 0,
    pretsEnAttente: 0
  });

  chartData: any;
  chartOptions: any;
  
  recentTransactions = signal<PaiementResponse[]>([]);
  rejectedStudents = signal<InscriptionAnnuelleResponse[]>([]);

  private authService = inject(AuthService);
  private univService = inject(UniversiteService);
  private paiementService = inject(PaiementService);
  private scolariteService = inject(ScolariteService);
  private studentService = inject(StudentService);
  private inscriptionService = inject(InscriptionService);

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
      prets: this.scolariteService.getByUniversite(univId),
      students: this.studentService.getStudentsByUniversite(univId, 0, 1),
      inscriptions: this.inscriptionService.getByUniversite(univId, 0, 50)
    };

    forkJoin(requests).subscribe({
      next: (res) => {
        this.univDetails.set(res.details);
        this.recentTransactions.set(res.txns.content);
        this.rejectedStudents.set((res.inscriptions.content || []).filter((i) => i.statut === 'REJETEE'));
        
        this.stats.set({
            nbStudents: res.students.totalElements,
            totalEncaisse: res.details.soldeWallet || 0,
          pretsEnAttente: (res.prets as PretScolariteResponse[]).filter(p => !p.estRembourse).length
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
