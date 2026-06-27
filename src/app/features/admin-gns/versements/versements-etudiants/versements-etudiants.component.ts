import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { VersementService } from '../../../../core/services/versement.service';
import { WalletService, WalletResponse } from '../../../../core/services/wallet.service';
import { ScolariteYearService } from '../../../../core/services/scolarite-year.service';
import { InscriptionAnnuelleService } from '../../../../core/services/inscription-annuelle.service';

import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-versements-etudiants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './versements-etudiants.component.html',
  styleUrls: ['./versements-etudiants.component.scss']
})
export class VersementsEtudiantsComponent implements OnInit {
  wallets: WalletResponse[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  filterNiveau: string = 'ALL';
  
  showManualVersementModal = false;
  selectedWalletForManual: WalletResponse | null = null;
  manualVersementForm: FormGroup;
  isProcessingManual = false;

  showMassVersementModal = false;
  massVersementForm: FormGroup;
  massStep: 1 | 2 = 1;
  massPreviewCount = 0;
  massPreviewNames: string[] = [];
  isProcessingMass = false;
  
  scolariteYears: any[] = [];

  // Custom Confirmation Dialog state
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  onConfirmCallback: (() => void) | null = null;

  constructor(
    private fb: FormBuilder, 
    private versementService: VersementService,
    private walletService: WalletService,
    private scolariteYearService: ScolariteYearService,
    private inscriptionAnnuelleService: InscriptionAnnuelleService
  ) {
    this.manualVersementForm = this.fb.group({
      montant: [null, [Validators.required, Validators.min(1)]]
    });

    this.massVersementForm = this.fb.group({
      scolariteYearTrackingId: ['', Validators.required],
      montantFixe: [null]
    });
  }

  ngOnInit(): void {
    this.loadScolariteYears();
    this.loadWallets();
  }

  loadScolariteYears() {
    this.scolariteYearService.getAll().subscribe({
      next: (res) => this.scolariteYears = res.content || [],
      error: (err) => console.error('Erreur chargement années', err)
    });
  }

  loadWallets() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Instead of wallets, we fetch inscriptions to get student names and filter only fully enrolled students.
    this.inscriptionAnnuelleService.findAll(0, 100).subscribe({
      next: (res) => {
        // Filter those who are fully enrolled and match the study level
        const allInscriptions = res.content || [];
        const filtered = allInscriptions.filter((ins: any) => {
           const matchLevel = this.filterNiveau === 'ALL' || ins.studyLevel === this.filterNiveau;
           return matchLevel && ins.status === 'ACTIVE';
        });
        
        // Map to a structure similar to WalletResponse so the HTML doesn't break, 
        // but with added student names!
        this.wallets = filtered.map((ins: any) => ({
          trackingId: ins.walletTrackingId, // Important: use the walletTrackingId we just added to backend!
          statutWallet: 'VALIDE', // Fake status just for display
          solde: ins.walletBalance || 0, // Now coming from backend
          studentTrackingId: ins.studentTrackingId,
          ownerName: `${ins.studentFirstName || 'Inconnu'} ${ins.studentLastName || ''}`,
          selected: false // Added for specific mass versement
        }));
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement inscriptions:', err);
        this.wallets = [];
        this.isLoading = false;
      }
    });
  }

  setFilterNiveau(niveau: string) {
    this.filterNiveau = niveau;
    this.loadWallets();
  }

  getShortId(id: string): string {
    return id ? id.substring(0, 8).toUpperCase() : '';
  }

  formatNumber(value: number): string {
    if (!value && value !== 0) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  // Manual
  openManualVersement(wallet: WalletResponse) {
    this.selectedWalletForManual = wallet;
    this.manualVersementForm.reset();
    this.showManualVersementModal = true;
  }

  closeManualVersement() {
    this.showManualVersementModal = false;
    this.selectedWalletForManual = null;
  }

  submitManualVersement() {
    if (this.manualVersementForm.invalid || !this.selectedWalletForManual) return;
    
    this.isProcessingManual = true;
    const payload = {
      walletTrackingId: this.selectedWalletForManual.trackingId,
      amount: this.manualVersementForm.value.montant,
      paymentType: 'BOURSE_INITIALE',
      paymentDate: new Date().toISOString(),
      status: 'VALIDEE'
    };

    this.versementService.create(payload).subscribe({
      next: () => {
        this.isProcessingManual = false;
        this.closeManualVersement();
        this.loadWallets();
        this.errorMessage = '';
        this.successMessage = "Versement individuel effectué avec succès !";
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err: any) => {
        this.isProcessingManual = false;
        const msg = err?.error?.message || err?.message || "Erreur inconnue";
        this.errorMessage = "Erreur lors du versement individuel: " + msg;
      }
    });
  }

  // Mass
  openMassVersement() {
    this.massVersementForm.reset();
    this.massStep = 1;
    this.showMassVersementModal = true;
  }

  closeMassVersement() {
    this.showMassVersementModal = false;
    this.massStep = 1;
  }

  previewMassVersement() {
    if (this.massVersementForm.invalid) return;
    this.isProcessingMass = true;
    
    const val = this.massVersementForm.value;
    this.versementService.previewMasseEtudiants(val.scolariteYearTrackingId).subscribe({
      next: (res) => {
        this.massPreviewCount = res.count;
        this.massPreviewNames = res.names || [];
        this.massStep = 2;
        this.isProcessingMass = false;
      },
      error: (err: any) => {
        this.isProcessingMass = false;
        const msg = err?.error?.message || err?.message || "Erreur inconnue";
        this.errorMessage = "Erreur lors de la prévisualisation: " + msg;
      }
    });
  }

  submitMassVersement() {
    this.isProcessingMass = true;
    const val = this.massVersementForm.value;
    
    this.versementService.masseEtudiants({
      scolariteYearTrackingId: val.scolariteYearTrackingId,
      montantFixe: val.montantFixe || 0
    }).subscribe({
      next: () => {
        this.isProcessingMass = false;
        this.closeMassVersement();
        this.loadWallets();
        this.errorMessage = '';
        this.successMessage = "Versement en masse effectué avec succès !";
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err: any) => {
        this.isProcessingMass = false;
        const msg = err?.error?.message || err?.message || "Erreur inconnue";
        this.errorMessage = "Erreur lors du versement en masse: " + msg;
      }
    });
  }

  // Select Specific logic
  toggleSelection(wallet: any) {
    wallet.selected = !wallet.selected;
  }

  selectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.wallets.forEach((w: any) => w.selected = checked);
  }

  get hasSelectedWallets(): boolean {
    return this.wallets.some((w: any) => w.selected);
  }

  getSelectedWalletIds(): string[] {
    return this.wallets.filter((w: any) => w.selected).map((w: any) => w.trackingId);
  }

  openSpecificMassVersement() {
    this.massVersementForm.reset();
    this.massStep = 1;
    this.showMassVersementModal = true;
    // We repurpose the mass versement modal, but we tell it we have a specific selection
    this.massPreviewCount = this.getSelectedWalletIds().length;
    this.massPreviewNames = this.wallets.filter((w: any) => w.selected).map((w: any) => w.ownerName);
    this.massStep = 2; // Skip to step 2 since we already have the selection
  }

  submitSpecificMassVersement() {
    this.isProcessingMass = true;
    const val = this.massVersementForm.value;
    const selectedIds = this.getSelectedWalletIds();
    
    this.versementService.masseEtudiantsSpecifiques({
      walletTrackingIds: selectedIds,
      montantFixe: val.montantFixe || 0
    }).subscribe({
      next: () => {
        this.isProcessingMass = false;
        this.closeMassVersement();
        this.loadWallets();
        this.errorMessage = '';
        this.successMessage = "Versement effectué avec succès pour la sélection !";
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err: any) => {
        this.isProcessingMass = false;
        const msg = err?.error?.message || err?.message || "Erreur inconnue";
        this.errorMessage = "Erreur lors du versement: " + msg;
      }
    });
  }

  confirmAction(title: string, message: string, callback: () => void) {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.onConfirmCallback = callback;
    this.showConfirmModal = true;
  }

  onModalConfirm() {
    if (this.onConfirmCallback) {
      this.onConfirmCallback();
    }
    this.showConfirmModal = false;
    this.onConfirmCallback = null;
  }

  onModalCancel() {
    this.showConfirmModal = false;
    this.onConfirmCallback = null;
  }

  handleRemiseAZeroEtudiants() {
    this.scolariteYearService.getActiveYear().subscribe({
      next: (activeYear) => {
        if (!activeYear || !activeYear.trackingId) {
          this.errorMessage = "Aucune année scolaire active trouvée pour la remise à zéro.";
          setTimeout(() => this.errorMessage = '', 5000);
          return;
        }

        this.confirmAction(
          'Remise à zéro des portefeuilles',
          `Êtes-vous sûr de vouloir remettre à zéro les portefeuilles des étudiants pour l'année ${activeYear.label} ? Cette action est irréversible.`,
          () => {
            this.isProcessingMass = true;
            this.versementService.resetMasseEtudiants({
              scolariteYearTrackingId: activeYear.trackingId as string
            }).subscribe({
              next: () => {
                this.isProcessingMass = false;
                this.errorMessage = '';
                this.successMessage = "Remise à zéro effectuée avec succès !";
                setTimeout(() => this.successMessage = '', 5000);
                this.loadWallets();
              },
              error: (err: any) => {
                this.isProcessingMass = false;
                const msg = err?.error?.message || err?.message || "Erreur inconnue";
                this.errorMessage = "Erreur lors de la remise à zéro: " + msg;
              }
            });
          }
        );
      },
      error: () => {
        this.errorMessage = "Impossible de récupérer l'année scolaire active.";
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }
}
