import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, TransactionResponse } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  transactions: TransactionResponse[] = [];
  
  // KPIs
  volumeValide: number = 0;
  // commissionsTotales: number = 0; // Removed as no longer available from backend
  
  isLoading = false;
  isLoadingStats = false;
  errorMessage = '';

  filterType: string = 'ALL';
  filterStatut: string = 'ALL';

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadTransactions();
  }

  loadStats() {
    this.isLoadingStats = true;
    
    this.transactionService.getVolumeValide().subscribe({
      next: (val: number) => {
        this.volumeValide = val || 0;
        // this.commissionsTotales = val?.totalGnsCommission || 0; // Removed
        this.isLoadingStats = false;
      },
      error: () => {
        this.volumeValide = 0;
        // this.commissionsTotales = 0; // Removed
        this.isLoadingStats = false;
      }
    });
    // Set commissionsTotales to 0 or handle as not applicable
    // this.commissionsTotales = 0; // No longer needed as property removed
  }

  loadTransactions() {
    this.isLoading = true;
    this.errorMessage = '';

    // The backend might not have findByType/Statut yet, so we fallback to findAll and filter locally if needed
    this.transactionService.findAll(0, 100).subscribe({
      next: (res) => {
        let list = res.content || res || [];

        // Simple local filtering if backend endpoints are not ready yet
        if (this.filterStatut !== 'ALL') {
          list = list.filter((t: any) => t.status === this.filterStatut); // Changed 'statut' to 'status' as per new TransactionResponse
        }
        
        this.transactions = list;
        this.isLoading = false;
      },
      error: (err) => {
        this.transactions = [];
        this.isLoading = false;
        this.errorMessage = 'Erreur de chargement des transactions';
      }
    });
  }

  setFilterType(type: string) {
    this.filterType = type;
    this.filterStatut = 'ALL';
    this.loadTransactions();
  }

  setFilterStatut(statut: string) {
    this.filterStatut = statut;
    this.filterType = 'ALL';
    this.loadTransactions();
  }

  resetFilters() {
    this.filterType = 'ALL';
    this.filterStatut = 'ALL';
    this.loadTransactions();
  }

  getShortId(id: string): string {
    if (!id) return '';
    return id.substring(0, 8).toUpperCase();
  }

  formatNumberCompact(value: number): string {
    if (!value && value !== 0) return '0';
    return new Intl.NumberFormat('fr-FR', {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1
    }).format(value);
  }

  formatNumber(value: number): string {
    if (!value && value !== 0) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
  }
}
