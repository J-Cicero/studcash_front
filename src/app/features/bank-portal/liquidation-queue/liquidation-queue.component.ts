import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { 
  BankPortalService, 
  BoutiqueLiquidationInfo,
  VenteNonLiquidee
} from '../../../core/services/bank-portal.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

export interface PendingStudentLiquidation {
  trackingId: string;
  studentName: string;
  studentTrackingId: string;
  amountDeducted: number;
  createdAt: string;
  status: string;
}

@Component({
  selector: 'app-liquidation-queue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './liquidation-queue.component.html',
  styleUrls: ['./liquidation-queue.component.scss']
})
export class LiquidationQueueComponent implements OnInit {
  activeTab: 'BOUTIQUE' | 'ETUDIANT' = 'BOUTIQUE';

  boutiques: BoutiqueLiquidationInfo[] = [];
  studentLiquidations: PendingStudentLiquidation[] = [];

  isLoading = false;
  searchQuery = '';
  
  // Boutique Modal Details
  selectedBoutique: BoutiqueLiquidationInfo | null = null;
  ventesDetails: VenteNonLiquidee[] = [];
  isLoadingDetails = false;
  
  // Student Modal Details
  selectedStudentLiquidation: PendingStudentLiquidation | null = null;
  studentTransactions: any[] = [];

  referenceVirement = '';
  isValidating = false;
  validationSuccess = false;

  constructor(
    private bankPortalService: BankPortalService,
    private authService: AuthService,
    private http: HttpClient,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadBoutiques();
    this.loadStudentLiquidations();
  }

  setTab(tab: 'BOUTIQUE' | 'ETUDIANT') {
    this.activeTab = tab;
    this.searchQuery = '';
  }

  loadBoutiques(): void {
    this.isLoading = true;
    this.bankPortalService.getBoutiquesPendingLiquidation().subscribe({
      next: (data) => {
        this.boutiques = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  loadStudentLiquidations(): void {
    this.http.get<PendingStudentLiquidation[]>(`${environment.apiUrl}/student-liquidations/pending`).subscribe({
      next: (data) => {
        this.studentLiquidations = data || [];
      },
      error: (err) => {
        console.error('Erreur chargement liquidations étudiants:', err);
      }
    });
  }

  get filteredBoutiques(): BoutiqueLiquidationInfo[] {
    if (!this.searchQuery) return this.boutiques;
    const q = this.searchQuery.toLowerCase();
    return this.boutiques.filter(b => 
      b.boutiqueName.toLowerCase().includes(q) || 
      (b.merchantName && b.merchantName.toLowerCase().includes(q))
    );
  }

  get filteredStudentLiquidations(): PendingStudentLiquidation[] {
    if (!this.searchQuery) return this.studentLiquidations;
    const q = this.searchQuery.toLowerCase();
    return this.studentLiquidations.filter(s => 
      s.studentName.toLowerCase().includes(q)
    );
  }

  get totalPendingBoutiques(): number {
    return this.boutiques.reduce((sum, b) => sum + b.totalAmount, 0);
  }

  get totalPendingStudents(): number {
    return this.studentLiquidations.reduce((sum, s) => sum + s.amountDeducted, 0);
  }

  openBoutiqueDetails(boutique: BoutiqueLiquidationInfo): void {
    this.selectedBoutique = boutique;
    this.selectedStudentLiquidation = null;
    this.isLoadingDetails = true;
    this.referenceVirement = '';
    this.validationSuccess = false;

    this.bankPortalService.getVentesNonLiquidees(boutique.boutiqueId).subscribe({
      next: (ventes) => {
        this.ventesDetails = ventes;
        this.isLoadingDetails = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingDetails = false;
      }
    });
  }

  openStudentDetails(studentLiq: PendingStudentLiquidation): void {
    this.selectedStudentLiquidation = studentLiq;
    this.selectedBoutique = null;
    this.isLoadingDetails = true;
    this.referenceVirement = '';
    this.validationSuccess = false;

    if (studentLiq.studentTrackingId) {
      this.http.get<any>(`${environment.apiUrl}/transactions/student/${studentLiq.studentTrackingId}?page=0&size=50`).subscribe({
        next: (res) => {
          const content = res.content || res || [];
          this.studentTransactions = content.filter((t: any) => t.status === 'VALIDE');
          this.isLoadingDetails = false;
        },
        error: (err) => {
          console.error(err);
          this.studentTransactions = [];
          this.isLoadingDetails = false;
        }
      });
    } else {
      this.studentTransactions = [];
      this.isLoadingDetails = false;
    }
  }

  closeDetails(): void {
    this.selectedBoutique = null;
    this.selectedStudentLiquidation = null;
    this.ventesDetails = [];
    this.studentTransactions = [];
    this.referenceVirement = '';
    this.validationSuccess = false;
  }

  validerLiquidation(): void {
    if (!this.referenceVirement || !this.referenceVirement.trim()) return;

    this.isValidating = true;

    if (this.selectedBoutique) {
      this.bankPortalService.validerLiquidation(this.selectedBoutique.boutiqueId, this.referenceVirement).subscribe({
        next: () => {
          this.isValidating = false;
          this.validationSuccess = true;
          this.loadBoutiques();
          setTimeout(() => this.closeDetails(), 1800);
        },
        error: (err: any) => {
          console.error(err);
          this.isValidating = false;
          this.confirmService.alert("Erreur lors de la validation de la liquidation marchand.", "Erreur", "danger");
        }
      });
    } else if (this.selectedStudentLiquidation) {
      const trackingId = this.selectedStudentLiquidation.trackingId;
      this.http.patch(`${environment.apiUrl}/student-liquidations/${trackingId}/valider?referenceVirement=${this.referenceVirement}`, {}).subscribe({
        next: () => {
          this.isValidating = false;
          this.validationSuccess = true;
          this.studentLiquidations = this.studentLiquidations.filter(s => s.trackingId !== trackingId);
          setTimeout(() => this.closeDetails(), 1800);
        },
        error: (err: any) => {
          console.error(err);
          this.isValidating = false;
          this.confirmService.alert("Erreur lors de la validation du prélèvement étudiant.", "Erreur", "danger");
        }
      });
    }
  }
}
