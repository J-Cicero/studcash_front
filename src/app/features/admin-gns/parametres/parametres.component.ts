import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParametresService, Parametre } from '../../../core/services/parametres.service';
import { DocumentRequisService } from '../../../core/services/document-requis.service';
import { ScolariteYearService, ScolariteYear } from '../../../core/services/scolarite-year.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/auth.model';
import { SystemStatusService } from '../../../core/services/system-status.service';
import { BanqueService, CompteBancaireGns } from '../../../core/services/banque.service';

@Component({
  selector: 'app-parametres-gns',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.scss']
})
export class ParametresGnsComponent implements OnInit {
  activeTab: 'global' | 'kyc' | 'scolarite' | 'bancaire' = 'global';

  // Global Parameters
  parametres: Parametre[] = [];
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  editingParam: Parametre | null = null;
  paramForm: FormGroup;
  isParamModalOpen = false;
  paramOptions = [
    'MONTANT_BOURSE_BASE',
    'MONTANT_BOURSE_MAJORATION',
    'TAUX_COMMISSION_PAIEMENT',
    'PART_COMMISSION_GNS',
    'FRAIS_CREATION_CARTE'
  ];

  // KYC Documents
  documentsRequis: any[] = [];
  isLoadingDocs = false;
  isCreatingDoc = false;
  docCreateForm: FormGroup;
  isDocModalOpen = false;

  niveaux = ['L1_ANNEE', 'L2_ANNEE', 'L3_ANNEE', 'L4_ANNEE', 'L5_ANNEE', 'M1_ANNEE', 'M2_ANNEE', 'M3_ANNEE'];
  typesDocument = ['RELEVE_BAC', 'SOUCHE_TAMPONNEE', 'RELEVE_NOTES', 'FICHE_UE', 'PIECE_IDENTITE'];

  // Scolarite Year
  activeYear: ScolariteYear | null = null;
  scolariteYears: ScolariteYear[] = [];
  isLoadingYear = false;
  isCreatingYear = false;
  scolariteForm: FormGroup;
  isYearModalOpen = false;

  // Bancaire
  comptesBancaires: CompteBancaireGns[] = [];
  isLoadingBank = false;
  isBankModalOpen = false;
  bankForm: FormGroup;
  editingCompte: CompteBancaireGns | null = null;

  currentUser: LoginResponse | null = null;

  constructor(
    private parametresService: ParametresService,
    private documentRequisService: DocumentRequisService,
    private scolariteYearService: ScolariteYearService,
    private banqueService: BanqueService,
    private authService: AuthService,
    private systemStatusService: SystemStatusService,
    private fb: FormBuilder
  ) {
    this.docCreateForm = this.fb.group({
      niveau: ['L1_ANNEE', Validators.required],
      typeDocument: ['RELEVE_BAC', Validators.required],
      obligatoire: [true],
      estActif: [true]
    });
    this.scolariteForm = this.fb.group({
      libelle: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required]
    });
    this.paramForm = this.fb.group({
      nomParametre: ['TAUX_COMMISSION_PAIEMENT', Validators.required],
      valeurParametre: ['', Validators.required],
      description: ['']
    });
    this.bankForm = this.fb.group({
      nomBanque: ['', Validators.required],
      codeBanque: ['', Validators.required],
      rib: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.checkSystemStatus();
    this.loadTabData(this.activeTab);
  }

  loadTabData(tab: 'global' | 'kyc' | 'scolarite' | 'bancaire') {
    if (tab === 'global') {
      this.loadParametres();
      this.loadActiveYearOnly();
    } else if (tab === 'scolarite') {
      this.loadScolariteYear();
    } else if (tab === 'bancaire') {
      this.loadComptesBancaires();
    } else if (tab === 'kyc') {
      this.loadDocumentsRequis();
    }
  }

  loadActiveYearOnly() {
    this.scolariteYearService.getActiveYear().subscribe({
      next: (res) => {
        this.activeYear = res;
      },
      error: (err) => {
        if(err.status === 404) {
          this.activeYear = null;
        }
      }
    });
  }

  checkSystemStatus() {
    this.systemStatusService.getStatus().subscribe(status => {
      if (status.currentStatus === 'ACTIVE') {
        this.paramForm.disable();
        this.docCreateForm.disable();
        this.bankForm.disable();
      }
    });
  }

  setTab(tab: 'global' | 'kyc' | 'scolarite' | 'bancaire') {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
    this.loadTabData(tab);
  }

  loadParametres() {
    this.isLoading = true;
    this.parametresService.getParametresGns().subscribe({
      next: (res) => {
        const hiddenParams = ['MONTANT_DEFAUT_WALLET', 'QUOTA_DEFAUT_BOUTIQUE'];
        this.parametres = (res.content || []).filter((p: Parametre) => !hiddenParams.includes(p.nomParametre));
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des paramètres.';
        this.isLoading = false;
      }
    });
  }

  openParamModal(param?: Parametre) {
    this.successMessage = '';
    this.errorMessage = '';
    
    // On s'assure que le formulaire est actif avant de faire quoi que ce soit
    this.paramForm.enable();

    if (param) {
      this.editingParam = param;
      this.paramForm.patchValue({
        nomParametre: param.nomParametre,
        valeurParametre: param.valeurParametre,
        description: param.description || ''
      });
      // Disable editing name if it's an update
      this.paramForm.get('nomParametre')?.disable();
    } else {
      this.editingParam = null;
      this.paramForm.reset({ nomParametre: 'TAUX_COMMISSION_PAIEMENT' });
    }
    this.isParamModalOpen = true;
  }

  closeParamModal() {
    this.isParamModalOpen = false;
    this.editingParam = null;
    this.paramForm.reset();
  }

  saveParam() {
    if (this.paramForm.invalid) return;
    this.isLoading = true;
    
    // Get raw value in case nomParametre is disabled
    const formVal = this.paramForm.getRawValue();
    
    const updatedParam: Parametre = {
      ...(this.editingParam || {}),
      nomParametre: formVal.nomParametre,
      valeurParametre: formVal.valeurParametre,
      description: formVal.description,
      estActif: true
    };

    this.parametresService.saveParametreGns(updatedParam).subscribe({
      next: (res) => {
        this.successMessage = this.editingParam ? 'Paramètre mis à jour avec succès.' : 'Paramètre ajouté avec succès.';
        this.closeParamModal();
        this.loadParametres();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la sauvegarde.';
        this.isLoading = false;
      }
    });
  }

  // --- KYC Documents ---

  loadDocumentsRequis() {
    this.isLoadingDocs = true;
    this.documentRequisService.findAll().subscribe({
      next: (res) => {
        this.documentsRequis = res;
        this.isLoadingDocs = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des exigences KYC.';
        this.isLoadingDocs = false;
      }
    });
  }

  openDocModal() {
    this.successMessage = '';
    this.errorMessage = '';
    this.docCreateForm.enable(); // Force l'activation des champs
    this.docCreateForm.reset({ niveau: 'L1_ANNEE', typeDocument: 'RELEVE_BAC', obligatoire: true, estActif: true });
    this.isDocModalOpen = true;
  }

  closeDocModal() {
    this.isDocModalOpen = false;
  }

  onSubmitDoc() {
    if (this.docCreateForm.invalid) return;
    
    this.isCreatingDoc = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.documentRequisService.create(this.docCreateForm.value).subscribe({
      next: (res) => {
        this.successMessage = 'Règle de document ajoutée avec succès.';
        this.isCreatingDoc = false;
        this.closeDocModal();
        this.loadDocumentsRequis();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l\'ajout de la règle.';
        this.isCreatingDoc = false;
      }
    });
  }

  deleteDoc(trackingId: string) {
    if(confirm('Voulez-vous vraiment supprimer cette exigence ?')) {
      this.documentRequisService.delete(trackingId).subscribe({
        next: () => {
          this.successMessage = 'Règle supprimée.';
          this.loadDocumentsRequis();
        },
        error: () => {
          this.errorMessage = 'Erreur lors de la suppression.';
        }
      });
    }
  }

  // --- Scolarite Year ---
  loadScolariteYear() {
    this.isLoadingYear = true;
    
    // Get active year
    this.scolariteYearService.getActiveYear().subscribe({
      next: (res) => {
        this.activeYear = res;
      },
      error: (err) => {
        if(err.status === 404) {
          this.activeYear = null;
        }
      }
    });

    // Get all years for history
    this.scolariteYearService.getAll().subscribe({
      next: (res) => {
        this.scolariteYears = res.content || [];
        this.isLoadingYear = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des années scolaires.';
        this.isLoadingYear = false;
      }
    });
  }

  openYearModal() {
    this.successMessage = '';
    this.errorMessage = '';
    this.scolariteForm.reset();
    this.isYearModalOpen = true;
  }

  closeYearModal() {
    this.isYearModalOpen = false;
  }

  onSubmitYear() {
    if (this.scolariteForm.invalid) return;
    
    const confirmMsg = 'Voulez-vous créer cette année scolaire ?';
    if (!confirm(confirmMsg)) return;

    this.isCreatingYear = true;
    this.successMessage = '';
    this.errorMessage = '';

    const req = { ...this.scolariteForm.value, estOuverte: true };

    this.scolariteYearService.create(req).subscribe({
      next: (res) => {
        this.successMessage = 'Nouvelle année scolaire créée avec succès.';
        this.isCreatingYear = false;
        this.closeYearModal();
        this.loadScolariteYear();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la création de l\'année.';
        this.isCreatingYear = false;
      }
    });
  }

  cloturerActiveYear() {
    if (!this.activeYear || !this.activeYear.trackingId) return;
    if (confirm(`Êtes-vous sûr de vouloir clôturer l'année scolaire "${this.activeYear.libelle}" ?`)) {
      this.isLoadingYear = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      this.scolariteYearService.cloturer(this.activeYear.trackingId).subscribe({
        next: () => {
          this.successMessage = "Année scolaire clôturée avec succès.";
          this.loadScolariteYear();
        },
        error: (err) => {
          this.errorMessage = "Erreur lors de la clôture de l'année scolaire.";
          this.isLoadingYear = false;
        }
      });
    }
  }

  // --- Bancaire ---
  loadComptesBancaires() {
    this.isLoadingBank = true;
    this.banqueService.getComptesGns().subscribe({
      next: (res) => {
        this.comptesBancaires = res || [];
        this.isLoadingBank = false;
      },
      error: () => {
        this.errorMessage = 'Erreur chargement des comptes bancaires.';
        this.isLoadingBank = false;
      }
    });
  }

  openBankModal(compte?: CompteBancaireGns) {
    this.successMessage = '';
    this.errorMessage = '';
    this.bankForm.enable();

    if (compte) {
      this.editingCompte = compte;
      this.bankForm.patchValue({
        nomBanque: compte.nomBanque,
        codeBanque: compte.codeBanque,
        rib: compte.rib
      });
    } else {
      this.editingCompte = null;
      this.bankForm.reset();
    }
    this.isBankModalOpen = true;
  }

  closeBankModal() {
    this.isBankModalOpen = false;
    this.editingCompte = null;
    this.bankForm.reset();
  }

  saveCompteBancaire() {
    if (this.bankForm.invalid) return;

    this.isLoadingBank = true;
    const formVal = this.bankForm.value;

    const payload: CompteBancaireGns = {
      ...(this.editingCompte || {}),
      nomBanque: formVal.nomBanque,
      codeBanque: formVal.codeBanque,
      rib: formVal.rib
    };

    this.banqueService.saveCompteGns(payload).subscribe({
      next: () => {
        this.successMessage = this.editingCompte ? 'Compte bancaire mis à jour.' : 'Compte bancaire ajouté.';
        this.closeBankModal();
        this.loadComptesBancaires();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la sauvegarde du compte bancaire.';
        this.isLoadingBank = false;
      }
    });
  }

  deleteCompteBancaire(trackingId: string) {
    if (confirm('Voulez-vous vraiment supprimer ce compte bancaire ?')) {
      this.banqueService.deleteCompteGns(trackingId).subscribe({
        next: () => {
          this.successMessage = 'Compte bancaire supprimé.';
          this.loadComptesBancaires();
        },
        error: () => {
          this.errorMessage = 'Erreur lors de la suppression.';
        }
      });
    }
  }
}
