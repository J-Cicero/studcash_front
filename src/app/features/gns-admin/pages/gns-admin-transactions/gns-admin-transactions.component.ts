import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { PaiementService } from '../../../../core/services/paiement.service';

@Component({
  selector: 'app-gns-admin-transactions',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, SkeletonModule, ButtonModule],
  templateUrl: './gns-admin-transactions.component.html',
  styleUrls: ['./gns-admin-transactions.component.scss']
})
export class GnsAdminTransactionsComponent implements OnInit {
  isLoading = signal(false);
  transactions = signal<any[]>([]);
  totalElements = signal(0);

  private paiementService = inject(PaiementService);

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(page: number = 0, size: number = 20) {
    this.isLoading.set(true);
    this.paiementService.getAll(page, size).subscribe({
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
        case 'BOURSE': return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'PRET': return 'bg-purple-50 text-purple-700 border-purple-100';
        case 'ACHAT': return 'bg-rose-50 text-rose-700 border-rose-100';
        default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }
}
