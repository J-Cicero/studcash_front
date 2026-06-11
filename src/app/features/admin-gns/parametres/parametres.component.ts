import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParametresService, Parametre } from '../../../core/services/parametres.service';
import { DocumentRequisService } from '../../../core/services/document-requis.service';
import { ScolariteYearService, ScolariteYear } from '../../../core/services/scolarite-year.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/auth.model';
import { SystemStatusService } from '../../../core/services/system-status.service';

@Component({
  selector: 'app-parametres-gns',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.scss']
})
export class ParametresGnsComponent implements OnInit {
  activeTab: 'global' | 'kyc' | 'scolarite' = 'global';

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

  currentUser: LoginResponse | null = null;

  constructor(
    private parametresService: ParametresService,
    private documentRequisService: DocumentRequisService,
    private scolariteYearService: ScolariteYearService,
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
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadParametres();
    this.loadDocumentsRequis();
    this.loadScolariteYear();
    this.checkSystemStatus();
  }

  checkSystemStatus() {
    this.systemStatusService.getStatus().subscribe(status => {
      if (status.currentStatus === 'ACTIVE') {
        this.paramForm.disable();
        this.docCreateForm.disable();
      }
    });
  }

  setTab(tab: 'global' | 'kyc' | 'scolarite') {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
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
    
    const confirmMsg = this.activeYear ? 'Voulez-vous vraiment clôturer l\'année en cours et en démarrer une nouvelle ?' : 'Voulez-vous créer cette première année scolaire ?';
    if (!confirm(confirmMsg)) return;

    this.isCreatingYear = true;
    this.successMessage = '';
    this.errorMessage = '';

    const req = { ...this.scolariteForm.value, estOuverte: true };

    if (this.activeYear && this.activeYear.trackingId) {
      this.scolariteYearService.cloturerEtOuvrirNouvelle(this.activeYear.trackingId, req).subscribe({
        next: (res) => {
          this.successMessage = 'Année scolaire précédente clôturée et nouvelle année créée.';
          this.isCreatingYear = false;
          this.closeYearModal();
          this.loadScolariteYear();
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la création de la nouvelle année.';
          this.isCreatingYear = false;
        }
      });
    } else {
      this.scolariteYearService.create(req).subscribe({
        next: (res) => {
          this.successMessage = 'Première année scolaire créée avec succès.';
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
  }
}


