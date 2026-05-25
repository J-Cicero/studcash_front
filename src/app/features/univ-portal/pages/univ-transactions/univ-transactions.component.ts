import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { PaiementService } from '../../../../core/services/paiement.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PaiementResponse } from '../../../../core/models/gns-admin.model';

@Component({
  selector: 'app-univ-transactions',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, SkeletonModule, ButtonModule],
  templateUrl: './univ-transactions.component.html',
  styleUrls: ['./univ-transactions.component.scss']
})
export class UnivTransactionsComponent implements OnInit {
  isLoading = signal(false);
  transactions = signal<PaiementResponse[]>([]);
  totalElements = signal(0);

  private paiementService = inject(PaiementService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(page: number = 0, size: number = 20) {
    const univId = this.authService.universityId();
    if (!univId) return;

    this.isLoading.set(true);
    this.paiementService.getByUniversite(univId, page, size).subscribe({
      next: (data) => {
        this.transactions.set(data.content);
        this.totalElements.set(data.totalElements);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching transactions', err);
        this.isLoading.set(false);
      }
    });
  }

  getTypeClass(type: string): string {
    switch (type) {
        case 'SCOLARITE_UNIVERSITY': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        case 'ENTRANT': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        case 'SORTANT': return 'bg-rose-50 text-rose-700 border-rose-100';
        default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }
}
