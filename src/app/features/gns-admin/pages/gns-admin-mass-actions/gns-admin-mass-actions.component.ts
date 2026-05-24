import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { UniversiteService } from '../../../../core/services/universite.service';
import { ScolariteYearService, ScolariteYear } from '../../../../core/services/scolarite-year.service';
import { VersementService } from '../../../../core/services/versement.service';

@Component({
  selector: 'app-gns-admin-mass-actions',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, SkeletonModule],
  templateUrl: './gns-admin-mass-actions.component.html',
  styleUrls: ['./gns-admin-mass-actions.component.scss']
})
export class GnsAdminMassActionsComponent implements OnInit, OnDestroy {
  progress = signal(0);
  isLoading = signal(false);
  
  univStats = signal<any[]>([]);
  schoolYears = signal<ScolariteYear[]>([]);
  activeYear = signal<ScolariteYear | null>(null);
  disbursementHistory = signal<any[]>([]);

  private univService = inject(UniversiteService);
  private yearService = inject(ScolariteYearService);
  private versementService = inject(VersementService);

  private progressInterval: any;

  ngOnInit() {
    this.loadData();
    this.loadHistory();
  }

  loadData() {
    this.univService.getSummaryStats().subscribe(data => this.univStats.set(data));
    this.yearService.getAll().subscribe(years => {
        this.schoolYears.set(years);
        this.activeYear.set(years.find(y => y.estOuverte) || null);
    });
  }

  loadHistory() {
    this.versementService.getAll(0, 10).subscribe({
        next: (data) => this.disbursementHistory.set(data.content),
        error: (err) => console.error('Error fetching history', err)
    });
  }

  triggerMassDisbursement() {
    if (!this.activeYear()) return;
    
    this.isLoading.set(true);
    this.progress.set(10);
    
    this.versementService.disburseMassStudents(this.activeYear()!.trackingId).subscribe({
        next: (res) => {
            this.progress.set(100);
            this.isLoading.set(false);
            // Re-load stats to see changes if any
            this.loadData();
        },
        error: (err) => {
            console.error('Error in mass disbursement', err);
            this.isLoading.set(false);
            this.progress.set(0);
        }
    });

    // Simple fake progress animation
    this.progressInterval = setInterval(() => {
        if (this.progress() < 90) {
            this.progress.update(v => v + 5);
        }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }
}
