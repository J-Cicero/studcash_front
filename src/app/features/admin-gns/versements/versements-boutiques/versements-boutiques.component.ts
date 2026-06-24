import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { VersementService } from '../../../../core/services/versement.service';
import { BoutiqueService, BoutiqueResponse } from '../../../../core/services/boutique.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-versements-boutiques',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './versements-boutiques.component.html',
  styleUrls: ['./versements-boutiques.component.scss']
})
export class VersementsBoutiquesComponent implements OnInit {
  wallets: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  showManualVersementModal = false;
  selectedWalletForManual: any | null = null;
  manualVersementForm: FormGroup;
  isProcessingManual = false;

  showMassVersementModal = false;
  massVersementForm: FormGroup;
  massStep: 1 | 2 = 1;
  massPreviewCount = 0;
  massPreviewNames: string[] = [];
  isProcessingMass = false;

  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  onConfirmCallback: (() => void) | null = null;

  constructor(
    private fb: FormBuilder, 
    private versementService: VersementService,
    private boutiqueService: BoutiqueService
  ) {
    this.manualVersementForm = this.fb.group({
      montant: [null, [Validators.required, Validators.min(1)]]
    });

    this.massVersementForm = this.fb.group({
      seuil: [null, [Validators.required, Validators.min(0)]],
      montantQuota: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadWallets();
  }

  loadWallets() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.boutiqueService.getAllBoutiques(0, 100).subscribe({
      next: (res) => {
        const allBoutiques = res.content || [];
        this.wallets = allBoutiques.map((b: any) => ({
          trackingId: b.walletTrackingId,
          statutWallet: (b.balance > 0 && b.walletStatus === 'INACTIF') ? 'ACTIF' : (b.walletStatus === 'INACTIF' ? 'EN_ATTENTE' : (b.walletStatus || 'EN_ATTENTE')),
          solde: b.balance || 0,
          proprietaireTrackingId: b.name, // Displayed as name in UI
          limitAmount: b.limitAmount || 0
        }));
        this.isLoading = false;
      },
      error: (err) => {
        if(err.status === 404) this.wallets = [];
        else this.errorMessage = 'Erreur lors du chargement des portefeuilles boutiques.';
        this.isLoading = false;
      }
    });
  }

  getShortId(id: string): string {
    return id ? id.substring(0, 8).toUpperCase() : '';
  }

  formatNumber(value: number): string {
    if (!value && value !== 0) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  // Manual
  openManualVersement(wallet: any) {
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
      paymentType: 'RECHARGE_QUOTA_BOUTIQUE',
      paymentDate: new Date().toISOString(),
      status: 'VALIDEE'
    };

    this.versementService.create(payload).subscribe({
      next: () => {
        this.isProcessingManual = false;
        this.closeManualVersement();
        this.loadWallets();
        this.errorMessage = '';
        this.successMessage = "Recharge individuelle effectuée avec succès !";
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: () => {
        this.isProcessingManual = false;
        alert("Erreur lors de la recharge individuelle.");
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
    this.versementService.previewMasseBoutiques(val.seuil).subscribe({
      next: (res) => {
        this.massPreviewCount = res.count;
        this.massPreviewNames = res.names || [];
        this.massStep = 2;
        this.isProcessingMass = false;
      },
      error: () => {
        this.isProcessingMass = false;
        alert("Erreur lors de la prévisualisation.");
      }
    });
  }

  submitMassVersement() {
    this.isProcessingMass = true;
    const val = this.massVersementForm.value;
    
    this.versementService.masseBoutiques({
      seuil: val.seuil,
      montantQuota: val.montantQuota
    }).subscribe({
      next: () => {
        this.isProcessingMass = false;
        this.closeMassVersement();
        this.loadWallets();
        this.errorMessage = '';
        this.successMessage = "Recharge en masse effectuée avec succès !";
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: () => {
        this.isProcessingMass = false;
        alert("Erreur lors de la recharge en masse des boutiques.");
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

  handleRemiseAZeroBoutiques() {
    this.confirmAction(
      'Remise à zéro des portefeuilles',
      'Êtes-vous sûr de vouloir remettre à zéro les portefeuilles des boutiques ? Cette action est irréversible.',
      () => {
        this.isProcessingMass = true;
        this.versementService.resetMasseBoutiques({
          scolariteYearTrackingId: ''
        }).subscribe({
          next: () => {
            this.isProcessingMass = false;
            this.errorMessage = '';
            this.successMessage = "Remise à zéro des boutiques effectuée avec succès.";
            setTimeout(() => this.successMessage = '', 5000);
            this.loadWallets();
          },
          error: () => {
            this.isProcessingMass = false;
            this.errorMessage = "Erreur lors de la remise à zéro des boutiques.";
            setTimeout(() => this.errorMessage = '', 5000);
          }
        });
      }
    );
  }
}
