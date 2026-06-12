import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { VersementService } from '../../../../core/services/versement.service';
import { WalletService, WalletResponse } from '../../../../core/services/wallet.service';

@Component({
  selector: 'app-versements-boutiques',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './versements-boutiques.component.html',
  styleUrls: ['./versements-boutiques.component.scss']
})
export class VersementsBoutiquesComponent implements OnInit {
  wallets: WalletResponse[] = [];
  isLoading = false;
  errorMessage = '';
  
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

  constructor(
    private fb: FormBuilder, 
    private versementService: VersementService,
    private walletService: WalletService
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
    
    this.walletService.filterWallets('BOUTIQUE', 'ALL', 0, 50).subscribe({
      next: (res) => {
        this.wallets = res.content || [];
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
      trackingWalletId: this.selectedWalletForManual.trackingId,
      montantVerse: this.manualVersementForm.value.montant,
      typeVersement: 'RECHARGE_QUOTA_BOUTIQUE',
      statut: 'VALIDEE'
    };

    this.versementService.create(payload).subscribe({
      next: () => {
        this.isProcessingManual = false;
        this.closeManualVersement();
        this.loadWallets();
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
      },
      error: () => {
        this.isProcessingMass = false;
        alert("Erreur lors de la recharge en masse des boutiques.");
      }
    });
  }
}
