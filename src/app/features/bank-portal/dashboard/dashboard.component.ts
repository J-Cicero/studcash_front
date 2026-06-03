import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { 
  BankPortalService, 
  StudentLiquidationInfo, 
  UniversityReversementInfo, 
  BanqueInfo,
  BankFinancialSummary,
  BoutiqueLiquidationInfo,
  BoutiqueVersementInfo
} from '../../../core/services/bank-portal.service';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeTab: 'liquidation' | 'boutiques' | 'reversements' | 'resume' | 'banque' = 'liquidation';
  private routerSub: Subscription | null = null;
  
  // States
  students: StudentLiquidationInfo[] = [];
  reversements: UniversityReversementInfo[] = [];
  boutiques: BoutiqueLiquidationInfo[] = [];
  boutiqueVersements: BoutiqueVersementInfo[] = [];
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
    private bankPortalService: BankPortalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.determineActiveTab();
    this.loadData();

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.determineActiveTab();
      // Reload stats and graphs if switching back to Vue Globale
      if (this.activeTab === 'resume') {
        setTimeout(() => this.initCharts(), 50);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  determineActiveTab(): void {
    const url = this.router.url;
    if (url.includes('/liquidations')) {
      this.activeTab = 'liquidation';
    } else if (url.includes('/boutiques')) {
      this.activeTab = 'boutiques';
    } else if (url.includes('/reversements')) {
      this.activeTab = 'reversements';
    } else if (url.includes('/info')) {
      this.activeTab = 'banque';
    } else {
      this.activeTab = 'resume'; // Vue Globale (Résumé)
    }
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

        // Load boutiques list
        this.loadBoutiques(operatorId);

        // Load boutique versements history
        this.loadBoutiqueVersements(operatorId);

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

  loadBoutiques(operatorId: string): void {
    this.isLoading = true;
    this.bankPortalService.getBoutiques(operatorId).subscribe({
      next: (data) => {
        this.boutiques = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Erreur lors du chargement de la liste des boutiques.";
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadBoutiqueVersements(operatorId: string): void {
    this.bankPortalService.getBoutiqueVersements(operatorId).subscribe({
      next: (data) => {
        this.boutiqueVersements = data;
      },
      error: (err) => {
        console.error("Erreur lors du chargement de l'historique des versements boutique", err);
      }
    });
  }

  get filteredBoutiques(): BoutiqueLiquidationInfo[] {
    if (!this.searchTerm.trim()) {
      return this.boutiques;
    }
    const term = this.searchTerm.toLowerCase();
    return this.boutiques.filter(b => 
      b.nomBoutique.toLowerCase().includes(term) || 
      b.proprietaireNom.toLowerCase().includes(term) || 
      (b.numeroCompte && b.numeroCompte.toLowerCase().includes(term))
    );
  }

  saveBoutiqueAccountNumber(boutique: BoutiqueLiquidationInfo, numCompte: string): void {
    if (!numCompte.trim()) return;
    this.isActionLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.bankPortalService.updateBoutiqueAccountNumber(boutique.boutiqueTrackingId, numCompte).subscribe({
      next: () => {
        this.successMessage = `Le numéro de compte de la boutique "${boutique.nomBoutique}" a été mis à jour avec succès.`;
        this.isActionLoading = false;
        boutique.numeroCompte = numCompte;
      },
      error: (err) => {
        this.errorMessage = "Échec de l'enregistrement du numéro de compte.";
        this.isActionLoading = false;
        console.error(err);
      }
    });
  }

  liquidateBoutique(boutique: BoutiqueLiquidationInfo): void {
    if (!boutique.numeroCompte || boutique.numeroCompte === 'Non renseigné' || boutique.numeroCompte.trim() === '') {
      this.errorMessage = "Impossible de liquider : le numéro de compte bancaire de la boutique doit être valide.";
      return;
    }
    this.isActionLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.bankPortalService.liquidateBoutique(boutique.boutiqueTrackingId).subscribe({
      next: () => {
        this.successMessage = `Le versement réel de ${boutique.soldeWallet.toLocaleString('fr-FR')} FCFA vers le compte bancaire "${boutique.numeroCompte}" de la boutique "${boutique.nomBoutique}" a été validé.`;
        this.isActionLoading = false;
        
        // Generate presentable receipt for the boutique
        this.downloadBoutiqueReceipt(boutique);

        // Refresh data
        const operatorId = this.authService.currentUserValue?.trackingId;
        if (operatorId) {
          this.loadBoutiques(operatorId);
          this.loadBoutiqueVersements(operatorId);
          this.loadFinancialSummary(operatorId);
        }
      },
      error: (err) => {
        this.errorMessage = "Échec de la liquidation du portefeuille boutique. Veuillez réessayer.";
        this.isActionLoading = false;
        console.error(err);
      }
    });
  }

  downloadBoutiqueReceipt(boutique: BoutiqueLiquidationInfo): void {
    const doc = new jsPDF() as any;
    
    // Header styling
    doc.setFillColor(15, 23, 42); // dark slate bg
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(this.banqueInfo?.nom || 'REÇU DE VIREMENT COMMERÇANT', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Réseau national GNS - Virement réel boutique (Compensation StudCash)`, 15, 30);
    
    // Metadata block
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAILS DU COMMERÇANT & DU TRANSFERT', 15, 55);
    doc.line(15, 57, 195, 57);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Boutique bénéficiaire : ${boutique.nomBoutique}`, 15, 65);
    doc.text(`Catégorie d'activité : ${boutique.categorieShop}`, 15, 72);
    doc.text(`Gérant / Propriétaire : ${boutique.proprietaireNom}`, 15, 79);
    doc.text(`Banque émettrice : ${this.banqueInfo?.nom} (${this.banqueInfo?.code})`, 15, 86);
    doc.text(`N° Compte Bancaire de Destination : ${boutique.numeroCompte}`, 15, 93);
    doc.text(`Date du transfert réel : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}`, 15, 100);
    
    // Financial details table
    doc.autoTable({
      startY: 110,
      head: [['Désignation du flux', 'Détails réglementaires', 'Montant transféré']],
      body: [
        ['Volume compensé de la période', 'Transactions marchandes StudCash cumulées', `${boutique.soldeWallet.toLocaleString('fr-FR')} FCFA`],
        ['Frais de traitement bancaire', 'Exonération GNS', '0 FCFA'],
        ['NET VIRÉ SUR COMPTE BANCAIRE', `Compte crédité : ${boutique.numeroCompte}`, `${boutique.soldeWallet.toLocaleString('fr-FR')} FCFA`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [51, 65, 85] },
        1: { textColor: [100, 116, 139] },
        2: { halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] }
      }
    });
    
    // Signature block
    const finalY = doc.lastAutoTable.finalY + 25;
    doc.setFillColor(248, 250, 252);
    doc.rect(15, finalY, 180, 35, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Signature et cachet du fondé de pouvoirs (Banque)', 20, finalY + 10);
    doc.text('Signature du commerçant (pour acquit)', 115, finalY + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Document officiel certifié généré par le portail de compensation interbancaire StudCash.', 15, 280);
    
    doc.save(`Recu_Virement_Boutique_${boutique.nomBoutique.replace(/\s+/g, '_')}.pdf`);
  }

  @ViewChild('repartitionChartCanvas') repartitionChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('universitiesChartCanvas') universitiesChartCanvas!: ElementRef<HTMLCanvasElement>;

  repartitionChart: Chart | null = null;
  universitiesChart: Chart | null = null;

  switchTab(tab: 'liquidation' | 'boutiques' | 'reversements' | 'resume' | 'banque'): void {
    this.activeTab = tab;
    if (tab === 'resume') {
      setTimeout(() => {
        this.initCharts();
      }, 50);
    }
  }

  initCharts(): void {
    if (this.repartitionChart) this.repartitionChart.destroy();
    if (this.universitiesChart) this.universitiesChart.destroy();

    // 1. Repartition Chart (Doughnut)
    if (this.repartitionChartCanvas) {
      const ctx = this.repartitionChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.repartitionChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Dépenses GNS', 'Reliquats à envoyer'],
            datasets: [{
              data: [this.totalDepenses, this.totalReliquats],
              backgroundColor: ['#f59e0b', '#6366f1'],
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#334155',
                  font: {
                    weight: 'bold'
                  }
                }
              }
            }
          }
        });
      }
    }

    // 2. Universities Chart (Bar)
    if (this.universitiesChartCanvas && this.reversements.length > 0) {
      const ctx = this.universitiesChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const labels = this.reversements.map(r => r.codeUniversite);
        const data = this.reversements.map(r => r.montantTotalScolarite);
        this.universitiesChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Montant Scolarités (FCFA)',
              data: data,
              backgroundColor: '#4f46e5',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: '#e2e8f0'
                },
                ticks: {
                  color: '#64748b'
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: '#64748b'
                }
              }
            }
          }
        });
      }
    }
  }

  downloadStudentReceipt(student: StudentLiquidationInfo): void {
    const doc = new jsPDF() as any;
    
    // Header styling
    doc.setFillColor(15, 23, 42); // dark slate bg
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(this.banqueInfo?.nom || 'REÇU DE LIQUIDATION BANCAIRE', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Réseau national GNS - Virement de bourse d'études`, 15, 30);
    
    // Metadata block
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAILS DU BÉNÉFICIAIRE', 15, 55);
    doc.line(15, 57, 195, 57);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nom complet : ${student.nom} ${student.prenom}`, 15, 65);
    doc.text(`N° Matricule Univ : ${student.numEtudiant}`, 15, 72);
    doc.text(`Institution Financière : ${this.banqueInfo?.nom} (${this.banqueInfo?.code})`, 15, 79);
    doc.text(`Date du transfert : ${new Date().toLocaleDateString('fr-FR')}`, 15, 86);
    
    // Financial details header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('RÉCONCILIATION COMPTABLE DE LA BOURSE', 15, 105);
    doc.line(15, 107, 195, 107);
    
    // Table
    doc.autoTable({
      startY: 112,
      head: [['Poste budgétaire', 'Montant comptabilisé (FCFA)']],
      body: [
        ['Total bourse d\'études allouée (DBS)', `${student.bourseTotale.toLocaleString('fr-FR')} FCFA`],
        ['Total des dépenses de subsistance StudCash', `- ${student.depensesStudCash.toLocaleString('fr-FR')} FCFA`],
        ['Solde restant à liquider (Reliquat versé)', `${student.resteAPayer.toLocaleString('fr-FR')} FCFA`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [51, 65, 85] },
        1: { halign: 'right', fontStyle: 'bold' }
      }
    });
    
    // Signature block
    const finalY = doc.lastAutoTable.finalY + 25;
    doc.setFillColor(248, 250, 252);
    doc.rect(15, finalY, 180, 35, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Signature et cachet du fondé de pouvoirs', 25, finalY + 10);
    doc.text('Virement exécuté et validé par l\'opérateur', 115, finalY + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Document officiel généré en direct par le portail de compensation studCASH.', 15, 280);
    
    doc.save(`Recu_Liquidation_${student.numEtudiant}.pdf`);
  }

  downloadGlobalUniversityWireOrder(): void {
    if (this.reversements.length === 0) return;
    
    const doc = new jsPDF() as any;
    
    // Letterhead
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(this.banqueInfo?.nom || 'INSTITUTION BANCAIRE PARTENAIRE', 15, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Code Banque : ${this.banqueInfo?.code}`, 15, 31);
    doc.text(`Adresse réseau GNS : ${this.banqueInfo?.trackingId}`, 15, 37);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 150, 25);
    
    doc.line(15, 42, 195, 42);
    
    // Subject
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('OBJET : ORDRE GLOBAL DE TRANSFERT DES DROITS DE SCOLARITÉ', 15, 55);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const introText = `Par la présente, notre établissement financier certifie avoir gelé les portefeuilles de paiement des étudiants de notre réseau de compensation studCASH, stabilisant le calcul comptable des frais académiques. Nous ordonnons par ce document le virement des fonds de scolarités collectés vers les comptes respectifs des universités bénéficiaires :`;
    
    const splitIntro = doc.splitTextToSize(introText, 180);
    doc.text(splitIntro, 15, 63);
    
    // Table of reversements
    const tableBody = this.reversements.map(r => [
      r.codeUniversite,
      r.nomUniversite,
      `${r.montantTotalScolarite.toLocaleString('fr-FR')} FCFA`
    ]);
    
    doc.autoTable({
      startY: 85,
      head: [['Code Univ', 'Université bénéficiaire', 'Montant à transférer']],
      body: [
        ...tableBody,
        ['', 'TOTAL DES REVERSEMENTS ACADÉMIQUES', `${this.totalReversements.toLocaleString('fr-FR')} FCFA`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [51, 65, 85] },
        2: { halign: 'right', fontStyle: 'bold', textColor: [79, 70, 229] }
      },
      didParseCell: (data: any) => {
        if (data.row.index === this.reversements.length) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
    
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Pour ordre et mandat du Conseil d\'Administration,', 15, finalY);
    doc.text('Visa de l\'Auditeur GNS,', 120, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Le Directeur des Opérations Financières', 15, finalY + 7);
    doc.text('(Signé et certifié électroniquement)', 120, finalY + 7);
    
    doc.setFontSize(8);
    doc.text('Ce virement est irrévocable à compter de l\'apposition de la signature et du cachet réglementaire.', 15, 280);
    
    doc.save(`Ordre_Virement_Universites_${this.banqueInfo?.code}.pdf`);
  }

  downloadUniversityWireOrder(univ: UniversityReversementInfo): void {
    const doc = new jsPDF() as any;
    
    // Header styling
    doc.setFillColor(15, 23, 42); // dark slate bg
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(this.banqueInfo?.nom || 'REÇU DE VIREMENT SCOLAIRE', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Réseau national GNS - Ordre de Virement Universitaire`, 15, 30);
    
    // Metadata block
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAILS DU VIREMENT SCOLARITÉ', 15, 55);
    doc.line(15, 57, 195, 57);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Université bénéficiaire : ${univ.nomUniversite} (${univ.codeUniversite})`, 15, 65);
    doc.text(`Banque émettrice : ${this.banqueInfo?.nom} (${this.banqueInfo?.code})`, 15, 72);
    doc.text(`Compte de virement crédité : ${univ.numeroCompteVirement}`, 15, 79);
    doc.text(`Date d'exécution : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}`, 15, 86);
    
    // Financial details table
    doc.autoTable({
      startY: 95,
      head: [['Désignation', 'Description réglementaire', 'Montant versé']],
      body: [
        ['Compensation Frais Scolarité', `Frais académiques StudCash stabilisés`, `${univ.montantTotalScolarite.toLocaleString('fr-FR')} FCFA`],
        ['Frais de transfert interbancaire', 'Exonération conventionnelle GNS', '0 FCFA'],
        ['TOTAL RETRANSMIS À L\'ÉTABLISSEMENT', `Compte crédité : ${univ.numeroCompteVirement}`, `${univ.montantTotalScolarite.toLocaleString('fr-FR')} FCFA`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [51, 65, 85] },
        1: { textColor: [100, 116, 139] },
        2: { halign: 'right', fontStyle: 'bold', textColor: [79, 70, 229] }
      }
    });
    
    // Signature block
    const finalY = doc.lastAutoTable.finalY + 25;
    doc.setFillColor(248, 250, 252);
    doc.rect(15, finalY, 180, 35, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Signature et cachet du fondé de pouvoirs (Banque)', 20, finalY + 10);
    doc.text('Visa de l\'Auditeur GNS (pour certification)', 115, finalY + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Ce virement est irrévocable après validation par le système central StudCash.', 15, 280);
    
    doc.save(`Ordre_Virement_${univ.codeUniversite}.pdf`);
  }

  downloadGlobalFinancialSummary(): void {
    if (!this.financialSummary) return;
    
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFillColor(79, 70, 229); // Indigo bg
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT FINANCIER GLOBAL DE COMPENSATION', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Banque Partenaire : ${this.banqueInfo?.nom} (${this.banqueInfo?.code}) • Date : ${new Date().toLocaleDateString('fr-FR')}`, 15, 30);
    
    // Section 1: Scolarités
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. SCOLARITÉS ET FRAIS D\'INSCRIPTION (ACADÉMIQUE)', 15, 55);
    doc.line(15, 57, 195, 57);
    
    doc.autoTable({
      startY: 62,
      head: [['Indicateur', 'Valeur cumulée (FCFA)']],
      body: [
        ['Cumul scolarités dues aux universités', `${this.financialSummary.totalScolariteUniversites.toLocaleString('fr-FR')} FCFA`],
        ['Statut des fonds de scolarité', this.walletsFrozen ? 'Définitif (Comptes figés)' : 'Provisoire (Transactions en cours)']
      ],
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [51, 65, 85] },
        1: { halign: 'right', fontStyle: 'bold' }
      }
    });
    
    // Section 2: GNS Purchases & Commissions
    const nextY = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.text('2. TRANSACTION MARCHANDE STUDCASH (ACHATS & SERVICES)', 15, nextY);
    doc.line(15, nextY + 2, 195, nextY + 2);
    
    doc.autoTable({
      startY: nextY + 7,
      head: [['Indicateur', 'Valeur cumulée (FCFA)']],
      body: [
        ['Volume total dépensé par les étudiants', `${this.financialSummary.totalDepensesAchats.toLocaleString('fr-FR')} FCFA`],
        ['Commissions acquises GNS (1% du volume)', `${this.financialSummary.totalCommissionsAchats.toLocaleString('fr-FR')} FCFA`],
        ['Net reversé aux boutiques / commerçants', `${this.financialSummary.totalNetCommercants.toLocaleString('fr-FR')} FCFA`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }, // Emerald bg
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [51, 65, 85] },
        1: { halign: 'right', fontStyle: 'bold' }
      }
    });
    
    // General totals
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.text('3. SYNTHÈSE DES ENGAGEMENTS INSTITUTIONNELS', 15, finalY);
    doc.line(15, finalY + 2, 195, finalY + 2);
    
    const totalEngagement = this.financialSummary.totalScolariteUniversites + this.financialSummary.totalDepensesAchats;
      
    doc.autoTable({
      startY: finalY + 7,
      head: [['Bénéficiaire institutionnel', 'Flux sortant à exécuter']],
      body: [
        ['Compte central de virement Universités', `${this.financialSummary.totalScolariteUniversites.toLocaleString('fr-FR')} FCFA`],
        ['Compte de compensation GNS (Achats + Commission)', `${this.financialSummary.totalDepensesAchats.toLocaleString('fr-FR')} FCFA`],
        ['VOLUME TOTAL COMPENSÉ', `${totalEngagement.toLocaleString('fr-FR')} FCFA`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // Blue bg
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [51, 65, 85] },
        1: { halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] }
      },
      didParseCell: (data: any) => {
        if (data.row.index === 2) {
          data.cell.styles.fillColor = [254, 226, 226];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Certifié conforme par les systèmes d\'audit central studCASH.', 15, 280);
    
    doc.save(`Rapport_Financier_${this.banqueInfo?.code}.pdf`);
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

  saveBanqueLogo(logoUrl: string): void {
    const operatorId = this.authService.currentUserValue?.trackingId;
    if (!operatorId || !logoUrl.trim()) return;

    this.isActionLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.bankPortalService.updateBanqueLogo(operatorId, logoUrl).subscribe({
      next: () => {
        this.successMessage = "Le logo de la banque a été mis à jour avec succès.";
        this.isActionLoading = false;
        if (this.banqueInfo) {
          this.banqueInfo.logoUrl = logoUrl;
        }
      },
      error: (err) => {
        this.errorMessage = "Échec de la mise à jour du logo de la banque.";
        this.isActionLoading = false;
        console.error(err);
      }
    });
  }

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (file.size > 1024 * 1024) {
        this.errorMessage = "Le fichier image est trop volumineux. La taille maximale autorisée est de 1 Mo.";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.saveBanqueLogo(base64String);
      };
      reader.onerror = (error) => {
        console.error("Erreur lors de la lecture du fichier logo:", error);
        this.errorMessage = "Impossible de lire le fichier image.";
      };
      reader.readAsDataURL(file);
    }
  }
}
