import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { 
  BankPortalService, 
  StudentLiquidationInfo, 
  UniversityReversementInfo, 
  BanqueInfo,
  BankFinancialSummary
} from '../../../core/services/bank-portal.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  activeTab: 'liquidation' | 'reversements' | 'resume' | 'banque' = 'liquidation';
  
  // States
  students: StudentLiquidationInfo[] = [];
  reversements: UniversityReversementInfo[] = [];
  banqueInfo: BanqueInfo | null = null;
  financialSummary: BankFinancialSummary | null = null;
  walletsFrozen = false;
  
  isLoading = true;
  isActionLoading = false;
  errorMessage = '';
  successMessage = '';
  
  searchTerm = '';

  constructor(
    private authService: AuthService,
    private bankPortalService: BankPortalService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const operatorId = this.authService.currentUserValue?.trackingId;
    if (!operatorId) {
      this.errorMessage = "Opérateur non identifié. Veuillez vous reconnecter.";
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    // Load bank info
    this.bankPortalService.getBanqueInfo(operatorId).subscribe({
      next: (bank) => {
        this.banqueInfo = bank;
        
        // Load wallets status
        this.bankPortalService.areWalletsFrozen().subscribe({
          next: (res) => {
            this.walletsFrozen = res.walletsFrozen;
          },
          error: (err) => console.error("Erreur statut wallets", err)
        });

        // Load students list
        this.loadStudents(operatorId);

        // Load reversements
        this.loadReversements(operatorId);

        // Load financial summary
        this.loadFinancialSummary(operatorId);
      },
      error: (err) => {
        this.errorMessage = "Impossible de récupérer les informations de votre banque partenaire.";
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadStudents(operatorId: string): void {
    this.bankPortalService.getStudents(operatorId).subscribe({
      next: (data) => {
        this.students = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Erreur lors du chargement de la liste des étudiants.";
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadReversements(operatorId: string): void {
    this.bankPortalService.getUniversityReversements(operatorId).subscribe({
      next: (data) => {
        this.reversements = data;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des reversements universités.", err);
      }
    });
  }

  loadFinancialSummary(operatorId: string): void {
    this.bankPortalService.getFinancialSummary(operatorId).subscribe({
      next: (data) => {
        this.financialSummary = data;
      },
      error: (err) => {
        console.error("Erreur lors du chargement du résumé financier.", err);
      }
    });
  }

  get filteredStudents(): StudentLiquidationInfo[] {
    if (!this.searchTerm.trim()) {
      return this.students;
    }
    const term = this.searchTerm.toLowerCase();
    return this.students.filter(s => 
      s.nom.toLowerCase().includes(term) || 
      s.prenom.toLowerCase().includes(term) || 
      s.numEtudiant.toLowerCase().includes(term)
    );
  }

  liquidateReliquat(studentTrackingId: string, studentName: string): void {
    this.isActionLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.bankPortalService.marquerTraite(studentTrackingId).subscribe({
      next: () => {
        this.successMessage = `Le reliquat de l'étudiant ${studentName} a été liquidé avec succès.`;
        this.isActionLoading = false;
        // Refresh student list
        const operatorId = this.authService.currentUserValue?.trackingId;
        if (operatorId) {
          this.loadStudents(operatorId);
          this.loadFinancialSummary(operatorId);
        }
      },
      error: (err) => {
        this.errorMessage = "Échec de la liquidation du reliquat. Veuillez réessayer.";
        this.isActionLoading = false;
        console.error(err);
      }
    });
  }

  validateMandate(studentTrackingId: string, valide: boolean, studentName: string): void {
    this.isActionLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.bankPortalService.validerMandat(studentTrackingId, valide).subscribe({
      next: () => {
        this.successMessage = `Le mandat de prélèvement de l'étudiant ${studentName} a été ${valide ? 'validé' : 'rejeté'} avec succès.`;
        this.isActionLoading = false;
        // Refresh student list
        const operatorId = this.authService.currentUserValue?.trackingId;
        if (operatorId) {
          this.loadStudents(operatorId);
        }
      },
      error: (err) => {
        this.errorMessage = "Échec de la validation du mandat. Veuillez réessayer.";
        this.isActionLoading = false;
        console.error(err);
      }
    });
  }

  get totalBourses(): number {
    return this.students.reduce((acc, curr) => acc + curr.bourseTotale, 0);
  }

  get totalDepenses(): number {
    return this.students.reduce((acc, curr) => acc + curr.depensesStudCash, 0);
  }

  get totalReliquats(): number {
    return this.students.reduce((acc, curr) => acc + curr.resteAPayer, 0);
  }

  get totalReversements(): number {
    return this.reversements.reduce((acc, curr) => acc + curr.montantTotalScolarite, 0);
  }
}
