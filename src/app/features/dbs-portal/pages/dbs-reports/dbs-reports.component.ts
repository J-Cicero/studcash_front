import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { UniversiteService } from '../../../../core/services/universite.service';
import { InscriptionService } from '../../../../core/services/inscription.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dbs-reports',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SkeletonModule, TagModule],
  templateUrl: './dbs-reports.component.html',
  styleUrls: ['./dbs-reports.component.scss']
})
export class DbsReportsComponent implements OnInit {
  isLoading = signal(true);
  univStats = signal<any[]>([]);

  private univService = inject(UniversiteService);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.univService.getSummaryStats().subscribe({
      next: (data) => {
        this.univStats.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching report stats', err);
        this.isLoading.set(false);
      }
    });
  }
}
