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
import { Banque } from '../../../core/models/banque.model';
import { StudentService } from '../../../core/services/student.service';

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
    'FRAIS_CREATION_CARTE',
    'MAJORATION_MONTANT_BOUTIQUE'
  ];

  // KYC Documents
  documentsRequis: any[] = [];
  isLoadingDocs = false;
  isCreatingDoc = false;
  docCreateForm: FormGroup;
  isDocModalOpen = false;

  // Confirmation suppression doc
  isDeleteDocModalOpen = false;
  docToDeleteId: string | null = null;

  niveaux = ['L1_ANNEE', 'L2_ANNEE', 'L3_ANNEE', 'L4_ANNEE', 'L5_ANNEE'];
  typesDocument = ['RELEVE_BAC', 'SOUCHE_TAMPONNEE', 'RELEVE_NOTES', 'FICHE_UE', 'PIECE_IDENTITE', 'RIB', 'MANDAT'];

  // Scolarite Year
  activeYear: ScolariteYear | null = null;

  // Bancaire
  comptesBancaires: CompteBancaire[] = [];
  banques: Banque[] = [];
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

  // RIB Preview Modal
  selectedRibUrl: string | null = null;
  isPreviewModalOpen = false;

  currentUser: LoginResponse | null = null;

  constructor(
    private parametresService: ParametresService,
    private documentRequisService: DocumentRequisService,
    private scolariteYearService: ScolariteYearService,
    private banqueService: BanqueService,
    private studentService: StudentService,
    private authService: AuthService,
    private systemStatusService: SystemStatusService,
    private fb: FormBuilder
  ) {
    this.docCreateForm = this.fb.group({
      niveau: ['L1_ANNEE', Validators.required],
      targetType: ['STUDENT', Validators.required],
      typeDocument: ['RELEVE_BAC', Validators.required],
      obligatoire: [true],
      estActif: [true],
      description: ['']
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
      ownerType: ['GNS', Validators.required],
      ribDocumentTrackingId: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.checkSystemStatus();
    this.loadTabData(this.activeTab);
  }

  loadTabData(tab: 'global' | 'kyc' | 'bancaire' | 'banques') {
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
    this.banqueService.getAllBanques().subscribe(res => {
      this.banques = res;
    });
  }

  loadActiveYearOnly() {
    this.scolariteYearService.getActiveYear().subscribe({
      next: (res) => {
        this.activeYear = res;
        // Si une année scolaire est active, on ne peut plus modifier les paramètres
        if (this.activeYear) {
          this.paramForm.disable();
          this.docCreateForm.disable();
        } else {
          this.paramForm.enable();
          this.docCreateForm.enable();
        }
      },
      error: (err) => {
        if(err.status === 404) {
          this.activeYear = null;
          this.paramForm.enable();
          this.docCreateForm.enable();
        }
      }
    });
  }

  checkSystemStatus() {
    this.systemStatusService.getStatus().subscribe(status => {
      if (status.currentStatus === 'ACTIVE') {
        this.paramForm.disable();
        this.docCreateForm.disable();
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
    this.paramForm.enable();
    if (param) {
      this.editingParam = param;
      this.paramForm.patchValue({
        nomParametre: param.nomParametre,
        valeurParametre: param.valeurParametre,
        description: param.description || ''
      });
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
    const formVal = this.paramForm.getRawValue();
    const updatedParam: Parametre = {
      ...(this.editingParam || {}),
      nomParametre: formVal.nomParametre,
      valeurParametre: formVal.valeurParametre,
      description: formVal.description,
      estActif: true
    };
    this.parametresService.saveParametreGns(updatedParam).subscribe({
      next: () => {
        this.successMessage = this.editingParam ? 'Paramètre mis à jour.' : 'Paramètre ajouté.';
        this.closeParamModal();
        this.loadParametres();
      },
      error: () => {
        this.errorMessage = 'Erreur sauvegarde.';
        this.isLoading = false;
      }
    });
  }

  loadDocumentsRequis() {
    this.isLoadingDocs = true;
    this.documentRequisService.findAll().subscribe({
      next: (res: any) => {
        this.documentsRequis = res.content || res;
        this.isLoadingDocs = false;
      },
      error: () => {
        this.errorMessage = 'Erreur chargement KYC.';
        this.isLoadingDocs = false;
      }
    });
  }

  openDocModal() {
    this.docCreateForm.reset({ niveau: 'L1_ANNEE', targetType: 'STUDENT', typeDocument: 'RELEVE_BAC', obligatoire: true, estActif: true, description: '' });
    this.isDocModalOpen = true;
  }

  closeDocModal() {
    this.isDocModalOpen = false;
  }

  onSubmitDoc() {
    if (this.docCreateForm.invalid) return;
    this.isCreatingDoc = true;

    const formVal = this.docCreateForm.value;
    const payload = {
      typeDocument: formVal.typeDocument,
      studentNiveau: formVal.niveau,
      required: formVal.obligatoire,
      description: formVal.description || ''
    };

    this.documentRequisService.create(payload).subscribe({
      next: () => {
        this.successMessage = 'Règle ajoutée.';
        this.isCreatingDoc = false;
        this.closeDocModal();
        this.loadDocumentsRequis();
      },
      error: () => {
        this.errorMessage = 'Erreur ajout règle.';
        this.isCreatingDoc = false;
      }
    });
  }

  openDeleteDocModal(trackingId: string) {
    this.docToDeleteId = trackingId;
    this.isDeleteDocModalOpen = true;
  }

  cancelDeleteDoc() {
    this.docToDeleteId = null;
    this.isDeleteDocModalOpen = false;
  }

  confirmDeleteDoc() {
    if (!this.docToDeleteId) return;
    this.documentRequisService.delete(this.docToDeleteId).subscribe({
      next: () => {
        this.successMessage = 'Règle supprimée.';
        this.cancelDeleteDoc();
        this.loadDocumentsRequis();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
        this.cancelDeleteDoc();
      }
    });
  }

  deleteDoc(trackingId: string) {
    this.openDeleteDocModal(trackingId);
  }

  loadComptesBancaires() {
    this.isLoadingBank = true;
    this.banqueService.getComptesGns().subscribe({
      next: (res) => {
        this.comptesBancaires = res || [];
        this.isLoadingBank = false;
      },
      error: () => {
        this.errorMessage = 'Erreur chargement comptes.';
        this.isLoadingBank = false;
      }
    });
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
    const banqueData = {
      name: this.banqueForm.value.nom,
      code: this.banqueForm.value.code,
      logoUrl: this.banqueForm.value.logoUrl
    };
    this.banqueService.createBanque(banqueData).subscribe({
      next: () => {
        this.successMessage = 'Banque ajoutée.';
        this.closeBanqueModal();
        this.loadBanques();
      },
      error: () => {
        this.errorMessage = 'Erreur ajout banque.';
      }
    });
  }

  openCompteGnsModal() {
    this.loadBanques();
    this.compteGnsForm.reset({ ownerType: 'GNS' });
    this.ribCompteStep = 'upload';
    this.ribUploadedFile = null;
    this.ribUploadedTrackingId = null;
    this.isCompteGnsModalOpen = true;
  }

  closeCompteGnsModal() {
    this.isCompteGnsModalOpen = false;
  }

  onRibFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.ribUploadedFile = file;
  }

  uploadRibAndNext() {
    if (!this.ribUploadedFile) return;
    this.isUploadingRib = true;
    this.banqueService.uploadRib(this.ribUploadedFile).subscribe({
      next: (res) => {
        this.ribUploadedTrackingId = res.trackingId;
        this.ribUploadedUrl = res.urlFichier;
        this.compteGnsForm.patchValue({ ribDocumentTrackingId: res.trackingId });
        this.ribCompteStep = 'details';
        this.isUploadingRib = false;
      },
      error: () => {
        this.errorMessage = "Erreur upload RIB.";
        this.isUploadingRib = false;
      }
    });
  }

  saveCompteGns() {
    if (this.compteGnsForm.invalid || !this.ribUploadedTrackingId) return;
    this.isSavingCompte = true;
    const data: CompteBancaire = {
      bankTrackingId: this.compteGnsForm.value.banqueTrackingId,
      accountNumber: this.compteGnsForm.value.numeroCompte,
      typeProprietaire: 'GNS',
      ribDocumentTrackingId: this.ribUploadedTrackingId
    };
    this.banqueService.saveCompteGns(data).subscribe({
      next: () => {
        this.successMessage = 'Compte ajouté.';
        this.isSavingCompte = false;
        this.closeCompteGnsModal();
        this.loadComptesBancaires();
      },
      error: () => {
        this.errorMessage = 'Erreur création compte.';
        this.isSavingCompte = false;
      }
    });
  }

  deleteCompteBancaire(trackingId: string) {
    if (confirm('Supprimer ce compte ?')) {
      this.banqueService.deleteCompteGns(trackingId).subscribe({
        next: () => {
          this.successMessage = 'Supprimé.';
          this.loadComptesBancaires();
        },
        error: () => {
          this.errorMessage = 'Erreur suppression.';
        }
      });
    }
  }

  viewRib(compte: CompteBancaire) {
    if (!compte.ribDocumentTrackingId) {
      alert("Aucun document RIB.");
      return;
    }
    this.studentService.getDocumentById(compte.ribDocumentTrackingId).subscribe({
      next: (doc: any) => {
        this.selectedRibUrl = doc.urlDocument || doc.fileUrl;
        this.isPreviewModalOpen = true;
      },
      error: () => {
        alert("Erreur récupération document.");
      }
    });
  }

  closePreviewModal() {
    this.isPreviewModalOpen = false;
    this.selectedRibUrl = null;
  }
}
