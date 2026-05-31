import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaiementService, PaiementResponse } from '../../../core/services/paiement.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  transactions: PaiementResponse[] = [];
  stats: any = {
    totalVolume: 0,
    totalCommission: 0,
    totalCount: 0
  };
  isLoading = false;
  isLoadingStats = false;
  errorMessage = '';

  filterType: string = 'ALL';
  filterStatut: string = 'ALL';

  constructor(private paiementService: PaiementService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadTransactions();
  }

  loadStats() {
    this.isLoadingStats = true;
    this.paiementService.getStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.isLoadingStats = false;
      },
      error: (err) => {
        console.error("Erreur chargement stats paiements", err);
        this.isLoadingStats = false;
      }
    });
  }

  loadTransactions() {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.filterType !== 'ALL') {
      this.paiementService.findByType(this.filterType, 0, 50).subscribe({
        next: (res) => {
          this.transactions = res.content || [];
          this.isLoading = false;
        },
        error: (err) => {
          this.transactions = [];
          this.isLoading = false;
        }
      });
    } else if (this.filterStatut !== 'ALL') {
      this.paiementService.findByStatut(this.filterStatut, 0, 50).subscribe({
        next: (res) => {
          this.transactions = res.content || [];
          this.isLoading = false;
        },
        error: (err) => {
          this.transactions = [];
          this.isLoading = false;
        }
      });
    } else {
      this.paiementService.findAll(0, 50).subscribe({
        next: (res) => {
          this.transactions = res.content || [];
          this.isLoading = false;
        },
        error: (err) => {
          this.transactions = [];
          this.isLoading = false;
        }
      });
    }
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
