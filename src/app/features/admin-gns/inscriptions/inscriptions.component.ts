import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InscriptionAnnuelleService } from '../../../core/services/inscription-annuelle.service';
import { StudentService, DocumentResponse } from '../../../core/services/student.service';
import { DocumentEtudiantService } from '../../../core/services/document-etudiant.service';
import { ScolariteYearService } from '../../../core/services/scolarite-year.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscriptions.component.html',
  styleUrls: ['./inscriptions.component.scss']
})
export class InscriptionsComponent implements OnInit {
  inscriptions: any[] = [];
  filteredInscriptions: any[] = [];
  
  isLoading = true;
  errorMessage = '';
  searchQuery = '';
  filterKyc: string = 'ALL';
  activeYear: string | null = null;

  selectedInscription: any | null = null;
  studentDocuments: any[] = [];
  isLoadingDocs = false;
  hasMandatoryDocs = false;

  selectedDocumentForPreview: any = null;
  sanitizedPdfUrl: SafeResourceUrl | null = null;

  showRejectModal = false;
  rejectionReasonInput = '';

  constructor(
    private inscriptionService: InscriptionAnnuelleService,
    private studentService: StudentService,
    private documentEtudiantService: DocumentEtudiantService,
    private scolariteYearService: ScolariteYearService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadActiveYear();
  }

  loadActiveYear() {
    this.scolariteYearService.getActiveYear().subscribe({
      next: (year) => {
        this.activeYear = year ? year.label : null;
        this.loadInscriptions();
      },
      error: (err) => {
        console.log("Aucune année scolaire active trouvée.");
        this.activeYear = null;
        this.loadInscriptions(); // On continue même sans année active
      }
    });
  }

  loadInscriptions() {
    this.isLoading = true;
    this.inscriptionService.findAll().subscribe({
      next: (res) => {
        const all = res.content || [];
        // Si pas d'année active, on peut soit tout afficher, soit rien
        if (this.activeYear) {
          this.inscriptions = all.filter((i: any) => i.academicYearLabel === this.activeYear);
        } else {
          this.inscriptions = all; // Option: Afficher tout s'il n'y a pas d'année active
        }
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des inscriptions';
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    if (!this.searchQuery) {
      this.filteredInscriptions = this.inscriptions;
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredInscriptions = this.inscriptions.filter(i => 
      (i.studentLastName && i.studentLastName.toLowerCase().includes(q)) || 
      (i.studentFirstName && i.studentFirstName.toLowerCase().includes(q))
    );
  }

  setKycFilter(statut: string) {
    this.filterKyc = statut;
    this.loadInscriptions(); 
  }

  viewDetails(ins: any) {
    this.selectedInscription = ins;
    this.studentDocuments = [];
    this.isLoadingDocs = true;
    this.hasMandatoryDocs = false;
    
    // Fetch documents attached to this specific inscription
    const inscriptionTrackingId = ins.trackingId;
    
    this.documentEtudiantService.findByInscriptionId(inscriptionTrackingId).subscribe({
      next: (res) => {
        let docs = res.content || res || [];
        this.studentDocuments = docs;
        this.hasMandatoryDocs = true;
        if (this.studentDocuments.length > 0) this.selectDocument(this.studentDocuments[0]);
        this.isLoadingDocs = false;
      },
      error: () => {
        this.studentDocuments = [];
        this.hasMandatoryDocs = false;
        this.isLoadingDocs = false;
      }
    });
  }

  selectDocument(doc: any) {
    this.selectedDocumentForPreview = doc;
    if (doc.documentType === 'MANDAT_BANCAIRE' || (doc.fileUrl && doc.fileUrl.endsWith('.pdf'))) {
      this.sanitizedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc.fileUrl);
    } else {
      this.sanitizedPdfUrl = null;
    }
  }

  openRejectModal() {
    this.rejectionReasonInput = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.rejectionReasonInput = '';
  }

  confirmReject() {
    if (!this.rejectionReasonInput.trim()) {
      alert('Veuillez saisir le motif du rejet.');
      return;
    }
    this.showRejectModal = false;
    this.executeStatusUpdate('REJETEE', this.rejectionReasonInput.trim());
  }

  updateStatus(statut: string) {
    if (!this.selectedInscription) return;

    if (statut === 'REJETEE') {
      this.openRejectModal();
      return;
    }
    
    this.executeStatusUpdate(statut);
  }

  private executeStatusUpdate(statut: string, motif?: string) {
    this.inscriptionService.updateStatus(this.selectedInscription.trackingId, statut, motif).subscribe({
      next: () => {
        this.loadInscriptions(); // Recharger la liste
        this.closeDetails();
      },
      error: (err) => {
        console.error("Erreur mise à jour statut", err);
      }
    });
  }

  synchronizeInscription() {
    if (!this.selectedInscription) return;

    this.inscriptionService.synchroniser(this.selectedInscription.trackingId).subscribe({
      next: () => {
        this.loadInscriptions();
        this.closeDetails();
      },
      error: (err) => {
        console.error("Erreur synchronisation", err);
      }
    });
  }

  closeDetails() {
    this.selectedInscription = null;
    this.studentDocuments = [];
  }
}
