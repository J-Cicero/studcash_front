import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ParametresService, Parametre } from '../../../core/services/parametres.service';
import { DocumentRequisService } from '../../../core/services/document-requis.service';
import { ScolariteYearService, ScolariteYear } from '../../../core/services/scolarite-year.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/auth.model';
import { SystemStatusService } from '../../../core/services/system-status.service';
import { BanqueService, CompteBancaire } from '../../../core/services/banque.service';
import { Banque } from '../../../core/models/banque.model';
import { StudentService } from '../../../core/services/student.service';

import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

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
  typesDocument = ['PIECE_IDENTITE', 'RIB', 'MANDAT', 'RELEVE_NOTES'];

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
  sanitizedRibPdfUrl: SafeResourceUrl | null = null;
  isPreviewModalOpen = false;

  currentUser: LoginResponse | null = null;
  openRowMenuId: string | null = null;

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openRowMenuId = null;
  }

  toggleRowMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openRowMenuId = this.openRowMenuId === id ? null : id;
  }

  getParamNumber(name: string, fallback: number): number {
    const found = (this.parametres || []).find(p => p.nomParametre === name);
    if (!found || found.valeurParametre === undefined || found.valeurParametre === null) return fallback;
    const n = Number(found.valeurParametre);
    return isNaN(n) ? fallback : n;
  }

  get tauxCommissionPct(): number {
    const raw = this.getParamNumber('TAUX_COMMISSION_PAIEMENT', 0.02);
    return raw <= 1 ? +(raw * 100).toFixed(2) : raw;
  }

  get partGnsPct(): number {
    const raw = this.getParamNumber('PART_COMMISSION_GNS', 0.6);
    return raw <= 1 ? +(raw * 100).toFixed(2) : raw;
  }

  get partBanquePct(): number {
    return Math.max(0, +(100 - this.partGnsPct).toFixed(2));
  }

  getParamLabel(name: string): string {
    const labels: Record<string, string> = {
      'MONTANT_BOURSE_BASE': 'Montant de base prévisionnel de la bourse étudiante',
      'MONTANT_BOURSE_MAJORATION': 'Majoration / Bonus prévisionnel sur bourse',
      'TAUX_COMMISSION_PAIEMENT': 'Pourcentage de commission sur chaque paiement',
      'PART_COMMISSION_GNS': 'Part de commission revenant à GNS',
      'FRAIS_CREATION_CARTE': 'Coût d\'émission d\'une carte StudCash',
      'MAJORATION_MONTANT_BOUTIQUE': 'Plafond journalier d\'achat autorisé en boutique'
    };
    return labels[name] || name;
  }

  getParamUnit(name: string): string {
    if (name === 'TAUX_COMMISSION_PAIEMENT' || name === 'PART_COMMISSION_GNS') {
      return '%';
    }
    return 'FCFA';
  }

  getParamFormattedValue(param: Parametre): string {
    const val = Number(param.valeurParametre);
    if (isNaN(val)) return String(param.valeurParametre);
    if (param.nomParametre === 'TAUX_COMMISSION_PAIEMENT' || param.nomParametre === 'PART_COMMISSION_GNS') {
      const pct = val <= 1 ? +(val * 100).toFixed(2) : val;
      return `${pct} %`;
    }
    return `${new Intl.NumberFormat('fr-FR').format(val)} FCFA`;
  }

  // Édition inline rapide directe dans le tableau
  editingInlineParamId: string | null = null;
  inlineValueInput: string = '';
  isSavingInline: boolean = false;

  startInlineEdit(param: Parametre) {
    if (!param.trackingId) return;
    this.editingInlineParamId = param.trackingId;
    const val = Number(param.valeurParametre);
    if ((param.nomParametre === 'TAUX_COMMISSION_PAIEMENT' || param.nomParametre === 'PART_COMMISSION_GNS') && !isNaN(val) && val <= 1) {
      this.inlineValueInput = String(+(val * 100).toFixed(2));
    } else {
      this.inlineValueInput = String(param.valeurParametre);
    }
  }

  cancelInlineEdit() {
    this.editingInlineParamId = null;
    this.inlineValueInput = '';
  }

  saveInlineEdit(param: Parametre) {
    if (!param.trackingId || this.isSavingInline) return;
    const rawVal = this.inlineValueInput.trim();
    if (!rawVal) return;

    let backendValue = rawVal;
    const num = Number(rawVal);
    if ((param.nomParametre === 'TAUX_COMMISSION_PAIEMENT' || param.nomParametre === 'PART_COMMISSION_GNS') && !isNaN(num) && num > 1) {
      backendValue = (num / 100).toString();
    }

    this.isSavingInline = true;
    const updatedParam: Parametre = {
      ...param,
      valeurParametre: backendValue
    };

    this.parametresService.saveParametreGns(updatedParam).subscribe({
      next: () => {
        this.isSavingInline = false;
        param.valeurParametre = backendValue;
        this.editingInlineParamId = null;
        this.successMessage = `Paramètre « ${this.getParamLabel(param.nomParametre)} » mis à jour.`;
        setTimeout(() => this.successMessage = '', 3500);
      },
      error: (err) => {
        this.isSavingInline = false;
        this.errorMessage = 'Erreur lors de la mise à jour directe.';
        setTimeout(() => this.errorMessage = '', 3500);
      }
    });
  }

  hasGnsAccountForBank(bankNameOrId?: string): boolean {
    if (!bankNameOrId) return false;
    return (this.comptesBancaires || []).some(c =>
      c.bankTrackingId === bankNameOrId ||
      (c.bankName && c.bankName.toLowerCase() === bankNameOrId.toLowerCase())
    );
  }

  constructor(
    private parametresService: ParametresService,
    private documentRequisService: DocumentRequisService,
    private scolariteYearService: ScolariteYearService,
    private banqueService: BanqueService,
    private studentService: StudentService,
    private authService: AuthService,
    private systemStatusService: SystemStatusService,
    private confirmService: ConfirmDialogService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {
    this.docCreateForm = this.fb.group({
      niveau: ['L1_ANNEE', Validators.required],
      targetType: ['STUDENT', Validators.required],
      typeDocument: ['PIECE_IDENTITE', Validators.required],
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
      this.loadComptesBancaires();
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
      },
      error: () => {
        this.activeYear = null;
      }
    });
  }

  checkSystemStatus() {
    // Statut consultatif
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
    this.docCreateForm.reset({ niveau: 'L1_ANNEE', targetType: 'STUDENT', typeDocument: 'PIECE_IDENTITE', obligatoire: true, estActif: true, description: '' });
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

  async deleteCompteBancaire(trackingId: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Suppression du compte bancaire',
      message: 'Voulez-vous vraiment supprimer ce compte bancaire ?',
      confirmText: 'Supprimer',
      type: 'danger'
    });

    if (confirmed) {
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

  private setRibPreviewUrl(url: string | null) {
    this.selectedRibUrl = url;
    if (url) {
      const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
      if (cleanUrl.endsWith('.pdf') || url.startsWith('data:application/pdf')) {
        this.sanitizedRibPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      } else {
        this.sanitizedRibPdfUrl = null;
      }
    } else {
      this.sanitizedRibPdfUrl = null;
    }
  }

  viewRib(compte: CompteBancaire) {
    if ((compte as any).ribUrl) {
      this.setRibPreviewUrl((compte as any).ribUrl);
      this.isPreviewModalOpen = true;
      return;
    }
    if (!compte.ribDocumentTrackingId) {
      this.confirmService.alert("Aucun document RIB n'est associé à ce compte.", "Document RIB", "info");
      return;
    }
    this.studentService.getDocumentById(compte.ribDocumentTrackingId).subscribe({
      next: (doc: any) => {
        this.setRibPreviewUrl(doc.urlDocument || doc.fileUrl);
        this.isPreviewModalOpen = true;
      },
      error: () => {
        this.confirmService.alert("Erreur lors de la récupération du document RIB.", "Erreur", "danger");
      }
    });
  }

  closePreviewModal() {
    this.isPreviewModalOpen = false;
    this.selectedRibUrl = null;
    this.sanitizedRibPdfUrl = null;
  }
}
