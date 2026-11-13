import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, TransactionResponse } from '../../../core/services/transaction.service';
import { BanqueService } from '../../../core/services/banque.service';
import { Banque } from '../../../core/models/banque.model';

export interface BankRevenueSummary {
  bankKey: string;
  bankTrackingId?: string;
  bankName: string;
  bankCode: string;
  transactionCount: number;
  studentCount: number;
  grossVolume: number;
  totalCommission: number;
  bankCommission: number;
  gnsCommission: number;
  transactions: TransactionResponse[];
}

@Component({
  selector: 'app-revenus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revenus.component.html',
  styleUrls: ['./revenus.component.scss']
})
export class RevenusComponent implements OnInit {
  isLoading = true;
  errorMessage = '';

  allTransactions: TransactionResponse[] = [];
  banques: Banque[] = [];
  bankSummaries: BankRevenueSummary[] = [];

  totalGrossVolume = 0;
  totalCommissionGlobal = 0;
  totalGnsRevenue = 0;
  totalBankRevenue = 0;
  validatedTxCount = 0;

  searchBankQuery = '';
  selectedBankSummary: BankRevenueSummary | null = null;
  modalSearchQuery = '';

  constructor(
    private transactionService: TransactionService,
    private banqueService: BanqueService
  ) { }

  ngOnInit(): void {
    this.loadRevenusData();
  }

  loadRevenusData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.banqueService.getAllBanques().subscribe({
      next: (banks) => {
        this.banques = banks || [];
        this.fetchTransactions();
      },
      error: () => {
        this.banques = [];
        this.fetchTransactions();
      }
    });
  }

  private fetchTransactions(): void {
    this.transactionService.findAll(0, 1000).subscribe({
      next: (res) => {
        const list: TransactionResponse[] = res?.content || res || [];
        this.allTransactions = list.filter(t => t.status === 'VALIDE' || t.status === 'VALIDEE' || !t.status);
        this.computeBreakdowns();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les données de revenus et commissions.';
        this.isLoading = false;
      }
    });
  }

  private computeBreakdowns(): void {
    const map = new Map<string, {
      bankTrackingId?: string;
      bankName: string;
      bankCode: string;
      students: Set<string>;
      grossVolume: number;
      totalCommission: number;
      bankCommission: number;
      gnsCommission: number;
      transactions: TransactionResponse[];
    }>();

    // Seed with all registered partner banks so every bank is visible even with 0 tx
    for (const b of this.banques) {
      const key = b.trackingId || b.code || b.name;
      map.set(key, {
        bankTrackingId: b.trackingId,
        bankName: b.name,
        bankCode: b.code || 'BNK',
        students: new Set<string>(),
        grossVolume: 0,
        totalCommission: 0,
        bankCommission: 0,
        gnsCommission: 0,
        transactions: []
      });
    }

    let gross = 0;
    let totComm = 0;
    let gnsRev = 0;
    let bankRev = 0;

    for (const tx of this.allTransactions) {
      const amount = Number(tx.amount) || 0;
      const gnsC = Number(tx.gnsCommission) || 0;
      const bankC = Number(tx.bankCommission) || 0;
      const totalC = Number(tx.totalCommission) || (gnsC + bankC);

      gross += amount;
      totComm += totalC;
      gnsRev += gnsC;
      bankRev += bankC;

      // Match bank by trackingId, code, or name
      let matchedKey: string | null = null;
      if (tx.bankTrackingId && map.has(tx.bankTrackingId)) {
        matchedKey = tx.bankTrackingId;
      } else if (tx.bankName || tx.bankCode) {
        for (const [k, v] of map.entries()) {
          if (
            (tx.bankCode && v.bankCode.toLowerCase() === tx.bankCode.toLowerCase()) ||
            (tx.bankName && v.bankName.toLowerCase() === tx.bankName.toLowerCase())
          ) {
            matchedKey = k;
            break;
          }
        }
      }

      if (!matchedKey) {
        matchedKey = tx.bankTrackingId || tx.bankCode || tx.bankName || 'UNASSIGNED_BANK';
        if (!map.has(matchedKey)) {
          map.set(matchedKey, {
            bankTrackingId: tx.bankTrackingId,
            bankName: tx.bankName || 'Banque Partenaire (Non rattachée)',
            bankCode: tx.bankCode || 'N/A',
            students: new Set<string>(),
            grossVolume: 0,
            totalCommission: 0,
            bankCommission: 0,
            gnsCommission: 0,
            transactions: []
          });
        }
      }

      const entry = map.get(matchedKey)!;
      entry.grossVolume += amount;
      entry.totalCommission += totalC;
      entry.bankCommission += bankC;
      entry.gnsCommission += gnsC;
      if (tx.senderTrackingId) {
        entry.students.add(tx.senderTrackingId);
      }
      entry.transactions.push(tx);
    }

    this.totalGrossVolume = gross;
    this.totalCommissionGlobal = totComm;
    this.totalGnsRevenue = gnsRev;
    this.totalBankRevenue = bankRev;
    this.validatedTxCount = this.allTransactions.length;

    this.bankSummaries = Array.from(map.entries())
      .map(([key, val]) => ({
        bankKey: key,
        bankTrackingId: val.bankTrackingId,
        bankName: val.bankName,
        bankCode: val.bankCode,
        transactionCount: val.transactions.length,
        studentCount: val.students.size,
        grossVolume: val.grossVolume,
        totalCommission: val.totalCommission,
        bankCommission: val.bankCommission,
        gnsCommission: val.gnsCommission,
        transactions: val.transactions
      }))
      .sort((a, b) => b.totalCommission - a.totalCommission || a.bankName.localeCompare(b.bankName));
  }

  get filteredBankSummaries(): BankRevenueSummary[] {
    if (!this.searchBankQuery || !this.searchBankQuery.trim()) {
      return this.bankSummaries;
    }
    const q = this.searchBankQuery.trim().toLowerCase();
    return this.bankSummaries.filter(b =>
      b.bankName.toLowerCase().includes(q) ||
      b.bankCode.toLowerCase().includes(q)
    );
  }

  openBankTransactionsModal(summary: BankRevenueSummary): void {
    this.selectedBankSummary = summary;
    this.modalSearchQuery = '';
  }

  closeBankTransactionsModal(): void {
    this.selectedBankSummary = null;
    this.modalSearchQuery = '';
  }

  get filteredModalTransactions(): TransactionResponse[] {
    if (!this.selectedBankSummary) return [];
    const list = this.selectedBankSummary.transactions || [];
    if (!this.modalSearchQuery || !this.modalSearchQuery.trim()) {
      return list;
    }
    const q = this.modalSearchQuery.trim().toLowerCase();
    return list.filter(t =>
      (t.senderName || '').toLowerCase().includes(q) ||
      (t.studentMatricule || '').toLowerCase().includes(q) ||
      (t.receiverName || '').toLowerCase().includes(q) ||
      (t.trackingId || '').toLowerCase().includes(q)
    );
  }

  formatNumber(val: number): string {
    if (!val && val !== 0) return '0';
    return new Intl.NumberFormat('fr-FR').format(Math.round(val));
  }

  getShortId(id: string): string {
    if (!id) return '';
    return id.substring(0, 8).toUpperCase();
  }
}

