import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParametresService, Parametre } from '../../../core/services/parametres.service';
import { DocumentRequisService } from '../../../core/services/document-requis.service';
import { ScolariteYearService, ScolariteYear } from '../../../core/services/scolarite-year.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/auth.model';
import { SystemStatusService } from '../../../core/services/system-status.service';
import { BanqueService, CompteBancaire } from '../../../core/services/banque.service';

@Component({
  selector: 'app-parametres-gns',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.scss']
})
export class ParametresGnsComponent implements OnInit {
  activeTab: 'global' | 'kyc' | 'bancaire' | 'banques' = 'global';

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

  // Bancaire
  comptesBancaires: CompteBancaire[] = [];
  banques: any[] = [];
  isLoadingBank = false;
  isBanqueModalOpen = false;
  isCompteGnsModalOpen = false;
  banqueForm: FormGroup;
  compteGnsForm: FormGroup;
  // RIB Upload state
  ribCompteStep: 'upload' | 'details' = 'upload';
  ribUploadedFile: File | null = null;
  ribUploadedTrackingId: string | null = null;
  ribUploadedUrl: string | null = null;
  isUploadingRib = false;
  isSavingCompte = false;

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
      targetType: ['STUDENT', Validators.required],
      typeDocument: ['RELEVE_BAC', Validators.required],
      obligatoire: [true],
      estActif: [true]
    });
    this.paramForm = this.fb.group({
      nomParametre: ['TAUX_COMMISSION_PAIEMENT', Validators.required],
      valeurParametre: ['', Validators.required],
      description: ['']
    });
    this.banqueForm = this.fb.group({
      nom: ['', Validators.required],
      code: ['', Validators.required],
      logoUrl: ['']
    });
    this.compteGnsForm = this.fb.group({
      banqueTrackingId: ['', Validators.required],
      numeroCompte: ['', Validators.required],
      typeProprietaire: ['GNS', Validators.required],
      ribDocumentTrackingId: [''] // Optionnel pour les comptes GNS
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.checkSystemStatus();
    this.loadTabData(this.activeTab);
  }

  loadTabData(tab: 'global' | 'kyc' | 'scolarite' | 'bancaire' | 'banques') {
    if (tab === 'global') {
      this.loadParametres();
      this.loadActiveYearOnly();
    } else if (tab === 'bancaire') {
      this.loadComptesBancaires();
    } else if (tab === 'banques') {
      this.loadBanques();
    } else if (tab === 'kyc') {
      this.loadDocumentsRequis();
    }
  }

  loadBanques() {
    this.banqueService.getAllBanques().subscribe(res => this.banques = res);
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
        this.banqueForm.disable();
      }
    });
  }

  setTab(tab: 'global' | 'kyc' | 'bancaire' | 'banques') {
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
      next: (res: any) => {
        this.documentsRequis = res.content ? res.content : res;
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
    this.docCreateForm.reset({ niveau: 'L1_ANNEE', targetType: 'STUDENT', typeDocument: 'RELEVE_BAC', obligatoire: true, estActif: true });
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
    this.banqueService.getAllBanques().subscribe(res => this.banques = res);
  }

  openBanqueModal() {
    this.banqueForm.reset();
    this.isBanqueModalOpen = true;
  }

  closeBanqueModal() {
    this.isBanqueModalOpen = false;
  }

  saveBanque() {
    if (this.banqueForm.invalid) return;
    this.banqueService.createBanque(this.banqueForm.value).subscribe({
      next: () => {
        this.successMessage = 'Banque ajoutée.';
        this.closeBanqueModal();
        this.loadComptesBancaires();
      }
    });
  }

  openCompteGnsModal() {
    this.compteGnsForm.reset({ typeProprietaire: 'GNS' });
    this.ribCompteStep = 'upload';
    this.ribUploadedFile = null;
    this.ribUploadedTrackingId = null;
    this.ribUploadedUrl = null;
    this.isUploadingRib = false;
    this.isSavingCompte = false;
    this.isCompteGnsModalOpen = true;
  }

  closeCompteGnsModal() {
    this.isCompteGnsModalOpen = false;
  }

  onRibFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.ribUploadedFile = input.files[0];
    }
  }

  uploadRibAndNext() {
    if (!this.ribUploadedFile) return;
    this.isUploadingRib = true;
    this.errorMessage = '';
    this.banqueService.uploadRib(this.ribUploadedFile).subscribe({
      next: (res) => {
        this.ribUploadedTrackingId = res.trackingId;
        this.ribUploadedUrl = res.urlFichier;
        this.compteGnsForm.patchValue({ ribDocumentTrackingId: res.trackingId });
        this.ribCompteStep = 'details';
        this.isUploadingRib = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Erreur lors de l'upload du document RIB.";
        this.isUploadingRib = false;
      }
    });
  }

  saveCompteGns() {
    if (this.compteGnsForm.invalid || !this.ribUploadedTrackingId) return;
    this.isSavingCompte = true;
    this.errorMessage = '';
    this.banqueService.saveCompteGns(this.compteGnsForm.value).subscribe({
      next: () => {
        this.successMessage = 'Compte GNS ajouté avec succès.';
        this.isSavingCompte = false;
        this.closeCompteGnsModal();
        this.loadComptesBancaires();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la création du compte.';
        this.isSavingCompte = false;
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
