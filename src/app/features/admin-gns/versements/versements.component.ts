import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { VersementService } from '../../../core/services/versement.service';
import { WalletService, WalletResponse } from '../../../core/services/wallet.service';
import { ScolariteYearService } from '../../../core/services/scolarite-year.service';

@Component({
  selector: 'app-versements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './versements.component.html',
  styleUrls: ['./versements.component.scss']
})
export class VersementsComponent implements OnInit {
  // Table state
  wallets: WalletResponse[] = [];
  isLoading = false;
  errorMessage = '';

  // Filters
  filterType: string = 'ALL';
  filterNiveau: string = 'ALL';

  // Manual Versement state
  showManualVersementModal = false;
  selectedWalletForManual: WalletResponse | null = null;
  manualVersementForm: FormGroup;
  isProcessingManual = false;

  // Mass Versement state
  showMassVersementModal = false;
  massVersementForm: FormGroup;
  massStep: 1 | 2 = 1;
  massPreviewCount = 0;
  massPreviewNames: string[] = [];
  isProcessingMass = false;
  
  // Data for forms
  scolariteYears: any[] = [];

  constructor(
    private fb: FormBuilder, 
    private versementService: VersementService,
    private walletService: WalletService,
    private scolariteYearService: ScolariteYearService
  ) {
    this.manualVersementForm = this.fb.group({
      montant: [null, [Validators.required, Validators.min(1)]]
    });

    this.massVersementForm = this.fb.group({
      target: ['BOUTIQUE', Validators.required],
      scolariteYearTrackingId: [''],
      seuil: [null],
      montantQuota: [null],
      montantFixe: [null]
    });
  }

  ngOnInit(): void {
    this.loadScolariteYears();
    this.loadWallets();
  }

  loadScolariteYears() {
    this.scolariteYearService.getAll().subscribe({
      next: (res) => {
        this.scolariteYears = res.content || [];
      },
      error: (err) => console.error('Erreur chargement années scolaires', err)
    });
  }

  loadWallets() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.walletService.filterWallets(this.filterType, this.filterNiveau, 0, 50).subscribe({
      next: (res) => {
        // Filtrer OPÉRATEUR_BANCAIRE
        this.wallets = (res.content || []).filter((w: WalletResponse) => w.typeWallet !== 'OPÉRATEUR_BANCAIRE');
        this.isLoading = false;
      },
      error: (err) => {
        if(err.status === 404) this.wallets = [];
        else this.errorMessage = 'Erreur lors du chargement des portefeuilles.';
        this.isLoading = false;
      }
    });
  }

  setFilterType(type: string) {
    this.filterType = type;
    this.loadWallets();
  }

  setFilterNiveau(niveau: string) {
    this.filterNiveau = niveau;
    this.loadWallets();
  }

  getShortId(id: string): string {
    if (!id) return '';
    return id.substring(0, 8).toUpperCase();
  }

  formatNumber(value: number): string {
    if (!value && value !== 0) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  updateStatus(wallet: WalletResponse, statut: string) {
    this.walletService.updateStatus(wallet.trackingId, statut).subscribe({
      next: () => {
        this.loadWallets();
      },
      error: (err) => {
        console.error("Détails erreur wallet:", err);
        alert("Erreur: " + (err.error?.message || "Mise à jour impossible"));
      }
    });
  }

  onStatusChange(wallet: WalletResponse, event: Event) {
    const select = event.target as HTMLSelectElement;
    this.updateStatus(wallet, select.value);
  }

  // --- Manual Versement ---
  openManualVersement(wallet: WalletResponse) {
    if (wallet.typeWallet !== 'BOUTIQUE') return;
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
    const montant = this.manualVersementForm.value.montant;

    const payload = {
      trackingWalletId: this.selectedWalletForManual.trackingId,
      montantVerse: montant,
      typeVersement: 'RECHARGE_QUOTA_BOUTIQUE',
      statut: 'VALIDEE'
    };

    this.versementService.create(payload).subscribe({
      next: () => {
        this.isProcessingManual = false;
        this.closeManualVersement();
        this.loadWallets(); // Refresh table
      },
      error: () => {
        this.isProcessingManual = false;
        alert("Erreur lors du versement.");
      }
    });
  }

  // --- Mass Versement ---
  openMassVersement() {
    console.log("Tentative d'ouverture du modal de versement en masse");
    this.massVersementForm.reset({ target: 'BOUTIQUE' });
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

    if (val.target === 'BOUTIQUE') {
      if (!val.seuil) {
        alert("Veuillez définir un seuil.");
        this.isProcessingMass = false;
        return;
      }
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
    } else if (val.target === 'ETUDIANT') {
      if (!val.scolariteYearTrackingId) {
        alert("Veuillez sélectionner une année académique.");
        this.isProcessingMass = false;
        return;
      }
      this.versementService.previewMasseEtudiants(val.scolariteYearTrackingId).subscribe({
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
  }

  submitMassVersement() {
    const val = this.massVersementForm.value;
    this.isProcessingMass = true;

    if (val.target === 'BOUTIQUE') {
      if (!val.montantQuota) {
        alert("Montant requis.");
        this.isProcessingMass = false;
        return;
      }
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
          alert("Erreur lors du versement en masse.");
        }
      });
    } else {
      // ETUDIANT
      if (!val.montantFixe && val.montantFixe !== 0) {
        // Optionnel : montantFixe peut être vide si on veut utiliser le plafond
      }
      this.versementService.masseEtudiants({
        scolariteYearTrackingId: val.scolariteYearTrackingId,
        montantFixe: val.montantFixe || 0
      }).subscribe({
        next: () => {
          this.isProcessingMass = false;
          this.closeMassVersement();
          this.loadWallets();
        },
        error: () => {
          this.isProcessingMass = false;
          alert("Erreur lors du versement en masse.");
        }
      });
    }
  }
}
