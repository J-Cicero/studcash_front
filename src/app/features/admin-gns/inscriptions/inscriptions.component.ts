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

  constructor(
    private inscriptionService: InscriptionAnnuelleService,
    private studentService: StudentService,
    private scolariteYearService: ScolariteYearService
  ) {}

  ngOnInit(): void {
    this.loadActiveYear();
  }

  loadActiveYear() {
    this.scolariteYearService.getActiveYear().subscribe(year => {
      this.activeYear = year ? year.libelle : null;
      this.loadInscriptions();
    });
  }

  loadInscriptions() {
    this.isLoading = true;
    this.inscriptionService.findAll().subscribe({
      next: (res) => {
        const all = res.content || [];
        this.inscriptions = all.filter((i: any) => i.anneeAcademique === this.activeYear);
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
    
    this.studentService.getDocuments(ins.studentTrackingId).subscribe({
      next: (res) => {
        this.studentDocuments = res.content || [];
        this.isLoadingDocs = false;
      },
      error: () => {
        this.isLoadingDocs = false;
      }
    });
  }

  updateStatus(statut: string) {
    if (!this.selectedInscription) return;

    this.inscriptionService.updateStatus(this.selectedInscription.trackingId, statut).subscribe({
      next: () => {
        this.loadInscriptions(); // Recharger la liste
        this.closeDetails();
      },
      error: (err) => {
        console.error("Erreur mise à jour statut", err);
      }
    });
  }

  closeDetails() {
    this.selectedInscription = null;
    this.studentDocuments = [];
  }
}
