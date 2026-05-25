import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { DocumentEtudiantService } from '../../../../core/services/document-etudiant.service';
import { InscriptionService } from '../../../../core/services/inscription.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DocumentEtudiantResponse } from '../../../../core/models/document-etudiant.model';
import { InscriptionAnnuelleResponse } from '../../../../core/services/inscription.service';

@Component({
  selector: 'app-univ-registrations',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, SkeletonModule, ButtonModule, DropdownModule, InputSwitchModule, FormsModule],
  templateUrl: './univ-registrations.component.html',
  styleUrls: ['./univ-registrations.component.scss']
})
export class UnivRegistrationsComponent implements OnInit {
  isLoading = signal(false);
  inscriptions = signal<InscriptionAnnuelleResponse[]>([]);
  allInscriptions: InscriptionAnnuelleResponse[] = [];
  totalElements = signal(0);
  selectedInscriptions: InscriptionAnnuelleResponse[] = [];
  
  selectedDossier = signal<InscriptionAnnuelleResponse | null>(null);
  documents = signal<DocumentEtudiantResponse[]>([]);

  niveaux = [
    { label: 'Tous les niveaux', value: null },
    { label: 'LICENCE 1', value: 'L1' },
    { label: 'LICENCE 2', value: 'L2' },
    { label: 'LICENCE 3', value: 'L3' },
    { label: 'MASTER 1', value: 'M1' },
    { label: 'MASTER 2', value: 'M2' }
  ];
  selectedNiveau: string | null = null;

  typesBourse = [
    { label: 'Toutes les bourses', value: null },
    { label: 'ENTIERE', value: 'ENTIERE' },
    { label: 'DEMI', value: 'DEMI' }
  ];
  selectedBourse: string | null = null;

  private inscriptionService = inject(InscriptionService);
  private authService = inject(AuthService);
  private docService = inject(DocumentEtudiantService);

  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(page: number = 0, size: number = 50) {
    const univId = this.authService.universityId();
    if (!univId) return;

    this.isLoading.set(true);
    this.inscriptionService.getByUniversite(univId, page, size).subscribe({
      next: (data) => {
        this.allInscriptions = data.content;
        this.inscriptions.set([...this.allInscriptions]);
        this.totalElements.set(data.totalElements);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading inscriptions', err);
        this.isLoading.set(false);
      }
    });
  }

  filter() {
    let filtered = this.allInscriptions;
    if (this.selectedNiveau) {
        filtered = filtered.filter(i => i.niveau === this.selectedNiveau);
    }
    if (this.selectedBourse) {
        filtered = filtered.filter(i => i.typeBourse === this.selectedBourse);
    }
    this.inscriptions.set(filtered);
  }

  toggleDefinitif(ins: InscriptionAnnuelleResponse) {
    // Dans une app réelle, appeler this.inscriptionService.markDefinitive(ins.trackingId, ins.estInscritDefinitif)
    console.log(`Statut définitif pour ${ins.studentPrenom} changé à ${ins.estInscritDefinitif}`);
  }

  viewDetails(ins: InscriptionAnnuelleResponse) {
    this.selectedDossier.set(ins);
    this.docService.getByInscription(ins.trackingId).subscribe({
        next: (docs) => this.documents.set(docs)
    });
  }

  markDefinitivePanel() {
    const dossier = this.selectedDossier();
    if (dossier) {
        dossier.estInscritDefinitif = true;
        this.toggleDefinitif(dossier);
        this.selectedDossier.set(null);
    }
  }

  getSeverity(statut: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (statut) {
      case 'VALIDEE': return 'success';
      case 'EN_ATTENTE': return 'warn';
      case 'REJETEE': return 'danger';
      default: return 'secondary';
    }
  }

  validateSelection() {
    const selected = this.selectedInscriptions;
    if (selected.length === 0) return;
    
    // Simulate mass update
    selected.forEach(ins => {
        ins.estInscritDefinitif = true;
        this.toggleDefinitif(ins);
    });
    
    this.selectedInscriptions = [];
    // Reload or refresh UI
    this.inscriptions.update(ins => [...ins]);
  }
}
