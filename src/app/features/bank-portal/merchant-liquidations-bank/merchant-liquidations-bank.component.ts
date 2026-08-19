import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

export interface MerchantLiquidationItem {
  trackingId: string;
  boutiqueTrackingId: string;
  boutiqueName: string;
  merchantName: string;
  accountNumber: string;
  amountToLiquidate: number;
  createdAt: string;
  validatedAt: string | null;
  status: 'EN_ATTENTE' | 'PAYE' | string;
}

@Component({
  selector: 'app-merchant-liquidations-bank',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-liquidations-bank.component.html',
  styleUrls: ['./merchant-liquidations-bank.component.scss']
})
export class MerchantLiquidationsBankComponent implements OnInit {
  liquidations: MerchantLiquidationItem[] = [];
  isLoading = false;
  searchQuery = '';
  activeTab: 'ALL' | 'EN_ATTENTE' | 'PAYE' = 'ALL';

  // Details Modal
  selectedLiquidation: MerchantLiquidationItem | null = null;
  bundledTransactions: any[] = [];
  isLoadingDetails = false;

  // Validation state
  referenceVirement = '';
  isValidating = false;
  validationSuccess = false;

  constructor(
    private http: HttpClient,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadLiquidations();
  }

  loadLiquidations(): void {
    this.isLoading = true;
    this.http.get<MerchantLiquidationItem[]>(`${environment.apiUrl}/liquidations/all`).subscribe({
      next: (data) => {
        this.liquidations = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement liquidations marchands:', err);
        this.liquidations = [];
        this.isLoading = false;
      }
    });
  }

  setTab(tab: 'ALL' | 'EN_ATTENTE' | 'PAYE'): void {
    this.activeTab = tab;
  }

  get filteredLiquidations(): MerchantLiquidationItem[] {
    return this.liquidations.filter(item => {
      const matchTab = this.activeTab === 'ALL' || item.status === this.activeTab;
      if (!this.searchQuery) return matchTab;
      const q = this.searchQuery.toLowerCase();
      const matchSearch = (
        (item.boutiqueName && item.boutiqueName.toLowerCase().includes(q)) ||
        (item.merchantName && item.merchantName.toLowerCase().includes(q)) ||
        (item.trackingId && item.trackingId.toLowerCase().includes(q)) ||
        (item.accountNumber && item.accountNumber.toLowerCase().includes(q))
      );
      return matchTab && matchSearch;
    });
  }

  get totalAmount(): number {
    return this.liquidations.reduce((sum, item) => sum + (item.amountToLiquidate || 0), 0);
  }

  get pendingAmount(): number {
    return this.liquidations
      .filter(item => item.status === 'EN_ATTENTE')
      .reduce((sum, item) => sum + (item.amountToLiquidate || 0), 0);
  }

  get pendingCount(): number {
    return this.liquidations.filter(item => item.status === 'EN_ATTENTE').length;
  }

  get paidCount(): number {
    return this.liquidations.filter(item => item.status === 'PAYE').length;
  }

  openDetails(item: MerchantLiquidationItem): void {
    this.selectedLiquidation = item;
    this.isLoadingDetails = true;
    this.referenceVirement = '';
    this.validationSuccess = false;
    this.bundledTransactions = [];

    this.http.get<any[]>(`${environment.apiUrl}/transactions/liquidation/${item.trackingId}`).subscribe({
      next: (txs) => {
        this.bundledTransactions = txs || [];
        this.isLoadingDetails = false;
      },
      error: (err) => {
        console.error('Erreur transactions regroupées marchand:', err);
        this.isLoadingDetails = false;
      }
    });
  }

  closeDetails(): void {
    this.selectedLiquidation = null;
    this.bundledTransactions = [];
    this.referenceVirement = '';
    this.validationSuccess = false;
  }

  validerLiquidation(): void {
    if (!this.selectedLiquidation) return;
    if (!this.referenceVirement || !this.referenceVirement.trim()) {
      this.confirmService.alert('Veuillez saisir la référence du virement bancaire pour le règlement.', 'Référence requise', 'warning');
      return;
    }

    this.isValidating = true;
    const trackingId = this.selectedLiquidation.trackingId;
    const url = `${environment.apiUrl}/liquidations/${trackingId}/valider?referenceVirement=${encodeURIComponent(this.referenceVirement.trim())}`;

    this.http.patch<MerchantLiquidationItem>(url, {}).subscribe({
      next: (res) => {
        this.isValidating = false;
        this.validationSuccess = true;
        this.loadLiquidations();
        setTimeout(() => this.closeDetails(), 1600);
      },
      error: (err) => {
        console.error(err);
        this.isValidating = false;
        this.confirmService.alert(err?.error?.message || 'Erreur lors de la validation du règlement marchand.', 'Erreur', 'danger');
      }
    });
  }

  getShortId(id: string): string {
    return id ? id.substring(0, 8).toUpperCase() : '';
  }

  formatNumber(val: number): string {
    if (!val && val !== 0) return '0';
    return new Intl.NumberFormat('fr-FR').format(val);
  }
}
