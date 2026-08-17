import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, TransactionResponse } from '../../../core/services/transaction.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

export interface StudentUnliquidatedAggregate {
  studentTrackingId: string;
  studentName: string;
  totalExpenses: number;
  transactionCount: number;
}

export interface StudentLiquidationItem {
  trackingId: string;
  studentName: string;
  amountDeducted: number;
  createdAt: string;
  status: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  transactions: TransactionResponse[] = [];
  unliquidatedStudents: StudentUnliquidatedAggregate[] = [];
  studentLiquidations: StudentLiquidationItem[] = [];
  
  volumeValide: number = 0;
  
  isLoading = false;
  isLoadingStats = false;
  errorMessage = '';

  filterStatut: string = 'ALL';

  // Details modal state
  selectedStudent: StudentUnliquidatedAggregate | null = null;
  studentTransactions: TransactionResponse[] = [];
  isLoadingStudentDetails = false;
  isCreatingLiquidation = false;
  liquidationSuccessMessage = '';

  constructor(
    private transactionService: TransactionService,
    private http: HttpClient,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadTransactions();
    this.loadStudentLiquidations();
  }

  loadStats() {
    this.isLoadingStats = true;
    this.transactionService.getVolumeValide().subscribe({
      next: (val: number) => {
        this.volumeValide = val || 0;
        this.isLoadingStats = false;
      },
      error: () => {
        this.volumeValide = 0;
        this.isLoadingStats = false;
      }
    });
  }

  loadTransactions() {
    this.isLoading = true;
    this.errorMessage = '';

    this.transactionService.findAll(0, 500).subscribe({
      next: (res) => {
        let list: TransactionResponse[] = res.content || res || [];
        this.transactions = list;

        // Group unliquidated student expenses (deductedFromStudentBourse == false or null)
        const unliquidatedMap = new Map<string, { name: string; sum: number; count: number }>();

        list.forEach((t: any) => {
          if (t.status === 'VALIDEE' && !t.deductedFromStudentBourse && t.senderTrackingId) {
            const studentId = t.senderTrackingId;
            const current = unliquidatedMap.get(studentId) || { name: t.senderName || 'Étudiant', sum: 0, count: 0 };
            current.sum += (t.amount || 0);
            current.count += 1;
            unliquidatedMap.set(studentId, current);
          }
        });

        this.unliquidatedStudents = Array.from(unliquidatedMap.entries()).map(([id, data]) => ({
          studentTrackingId: id,
          studentName: data.name,
          totalExpenses: data.sum,
          transactionCount: data.count
        }));

        this.isLoading = false;
      },
      error: (err) => {
        this.transactions = [];
        this.isLoading = false;
        this.errorMessage = 'Erreur de chargement des transactions';
      }
    });
  }

  loadStudentLiquidations() {
    this.http.get<any[]>(`${environment.apiUrl}/student-liquidations/all`).subscribe({
      next: (res) => {
        this.studentLiquidations = res || [];
      },
      error: () => {
        // Mock / Fallback safe if endpoint not yet available
        this.studentLiquidations = [];
      }
    });
  }

  openStudentDetails(student: StudentUnliquidatedAggregate) {
    this.selectedStudent = student;
    this.isLoadingStudentDetails = true;
    this.liquidationSuccessMessage = '';

    this.studentTransactions = this.transactions.filter(t => 
      t.senderTrackingId === student.studentTrackingId && 
      t.status === 'VALIDEE' && 
      !(t as any).deductedFromStudentBourse
    );
    this.isLoadingStudentDetails = false;
  }

  closeStudentDetails() {
    this.selectedStudent = null;
    this.studentTransactions = [];
    this.liquidationSuccessMessage = '';
  }

  createStudentLiquidation() {
    if (!this.selectedStudent) return;

    this.isCreatingLiquidation = true;
    const body = {
      studentTrackingId: this.selectedStudent.studentTrackingId,
      amountToDeduct: this.selectedStudent.totalExpenses
    };

    this.http.post<any>(`${environment.apiUrl}/student-liquidations`, body).subscribe({
      next: (res) => {
        this.isCreatingLiquidation = false;
        this.liquidationSuccessMessage = 'Liquidation Étudiant créée avec succès (statut EN_ATTENTE).';
        
        // Refresh list
        this.loadTransactions();
        this.loadStudentLiquidations();

        setTimeout(() => {
          this.closeStudentDetails();
        }, 1800);
      },
      error: (err) => {
        this.isCreatingLiquidation = false;
        this.confirmService.alert(err.error?.message || 'Erreur lors de la création de la liquidation étudiant', 'Erreur', 'danger');
      }
    });
  }

  get filteredTransactions(): TransactionResponse[] {
    if (this.filterStatut === 'ALL') return this.transactions;
    return this.transactions.filter(t => t.status === this.filterStatut);
  }

  setFilterStatut(statut: string) {
    this.filterStatut = statut;
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
