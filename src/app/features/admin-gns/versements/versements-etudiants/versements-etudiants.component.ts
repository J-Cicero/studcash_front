import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { VersementService } from '../../../../core/services/versement.service';
import { WalletService, WalletResponse } from '../../../../core/services/wallet.service';
import { ScolariteYearService } from '../../../../core/services/scolarite-year.service';

@Component({
  selector: 'app-versements-etudiants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './versements-etudiants.component.html',
  styleUrls: ['./versements-etudiants.component.scss']
})
export class VersementsEtudiantsComponent implements OnInit {
  wallets: WalletResponse[] = [];
  isLoading = false;
  errorMessage = '';

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
    // filterType = 'ETUDIANT'
    this.walletService.filterWallets('ETUDIANT', this.filterNiveau, 0, 50).subscribe({
      next: (res) => {
        this.wallets = res.content || [];
        this.isLoading = false;
      },
      error: (err) => {
        if(err.status === 404 || err.status === 204) this.wallets = [];
        else console.error('Erreur chargement portefeuilles:', err);
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
      trackingWalletId: this.selectedWalletForManual.trackingId,
      montantVerse: this.manualVersementForm.value.montant,
      typeVersement: 'DOTATION_BOURSE_INITIALE',
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
        alert("Erreur lors du versement individuel.");
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
      error: () => {
        this.isProcessingMass = false;
        alert("Erreur lors de la prévisualisation.");
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
      },
      error: () => {
        this.isProcessingMass = false;
        alert("Erreur lors du versement en masse des bourses.");
      }
    });
  }

  handleRemiseAZeroEtudiants() {
    if (!this.massVersementForm.value.scolariteYearTrackingId) {
      alert("Veuillez sélectionner une année scolaire.");
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir remettre à zéro les portefeuilles des étudiants pour cette année ? Cette action est irréversible.')) {
      this.isProcessingMass = true;
      this.versementService.resetMasseEtudiants({
        scolariteYearTrackingId: this.massVersementForm.value.scolariteYearTrackingId
      }).subscribe({
        next: () => {
          this.isProcessingMass = false;
          alert("Remise à zéro effectuée avec succès.");
          this.loadWallets();
        },
        error: () => {
          this.isProcessingMass = false;
          alert("Erreur lors de la remise à zéro.");
        }
      });
    }
  }
}
