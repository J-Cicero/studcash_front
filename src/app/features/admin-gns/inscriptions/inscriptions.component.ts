import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InscriptionAnnuelleService } from '../../../core/services/inscription-annuelle.service';
import { StudentService, DocumentResponse } from '../../../core/services/student.service';
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
  studentDocuments: DocumentResponse[] = [];
  isLoadingDocs = false;
  hasMandatoryDocs = false;

  constructor(
    private inscriptionService: InscriptionAnnuelleService,
    private studentService: StudentService,
    private scolariteYearService: ScolariteYearService
  ) {}

  ngOnInit(): void {
    this.loadActiveYear();
  }

  loadActiveYear() {
    this.scolariteYearService.getActiveYear().subscribe({
      next: (year) => {
        this.activeYear = year ? year.libelle : null;
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
          this.inscriptions = all.filter((i: any) => i.anneeAcademique === this.activeYear);
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
      (i.studentNom && i.studentNom.toLowerCase().includes(q)) || 
      (i.studentPrenom && i.studentPrenom.toLowerCase().includes(q))
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
    
    // Fix: Backend expects UUID (trackingId) for documents
    const inscriptionId = ins.trackingId;
    
    this.studentService.getInscriptionDocuments(inscriptionId).subscribe({
      next: (res) => {
        // Handle both pagination format and simple array
        this.studentDocuments = res.content || res || [];
        this.hasMandatoryDocs = this.studentDocuments.some(doc => doc.typeDocument === 'MANDAT_BANCAIRE');
        this.isLoadingDocs = false;
      },
      error: () => {
        this.studentDocuments = [];
        this.hasMandatoryDocs = false;
        this.isLoadingDocs = false;
      }
    });
  }

  updateDefinitif(estInscritDefinitif: boolean) {
    if (!this.selectedInscription) return;

    this.inscriptionService.updateDefinitif(this.selectedInscription.trackingId, estInscritDefinitif).subscribe({
      next: () => {
        this.loadInscriptions(); // Recharger la liste
        this.closeDetails();
      },
      error: (err) => {
        console.error("Erreur mise à jour définitif", err);
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
