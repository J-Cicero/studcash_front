import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { CheckboxModule } from 'primeng/checkbox';
import { InscriptionService, InscriptionAnnuelleResponse } from '../../../../core/services/inscription.service';
import { DocumentEtudiantService } from '../../../../core/services/document-etudiant.service';
import { DocumentEtudiantResponse } from '../../../../core/models/document-etudiant.model';
import { AuthService } from '../../../../core/services/auth.service';

type DocumentWithParsed = DocumentEtudiantResponse & { parsedData?: any };

@Component({
  selector: 'app-dbs-dossiers',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule, SkeletonModule, ButtonModule, ImageModule, CheckboxModule],
  templateUrl: './dbs-dossiers.component.html',
  styleUrls: ['./dbs-dossiers.component.scss']
})
export class DbsDossiersComponent implements OnInit {
  isLoading = signal(true);
  dossiers = signal<InscriptionAnnuelleResponse[]>([]);
  
  selectedDossier = signal<InscriptionAnnuelleResponse | null>(null);
  documents = signal<DocumentWithParsed[]>([]);
  forceValidation = signal<boolean>(false);

  private inscriptionService = inject(InscriptionService);
  private docService = inject(DocumentEtudiantService);
  public authService = inject(AuthService);

  ngOnInit(): void {
    this.loadDossiers();
  }

  loadDossiers() {
    this.isLoading.set(true);
    this.inscriptionService.getByStatut('EN_ATTENTE', 0, 50).subscribe({
      next: (data) => {
        this.dossiers.set(data.content);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching dossiers', err);
        this.isLoading.set(false);
      }
    });
  }

  viewDossier(dossier: InscriptionAnnuelleResponse) {
    this.selectedDossier.set(dossier);
    this.forceValidation.set(false);
    this.docService.getByInscription(dossier.trackingId).subscribe({
      next: (docs) => {
        this.documents.set(docs.map((d: DocumentEtudiantResponse) => ({
          ...d,
          parsedData: d.donneesExtraites ? JSON.parse(d.donneesExtraites) : null
        })));
      }
    });
  }

  hasLowScore(): boolean {
    return this.documents().some(d => d.scoreFiabilite < 50);
  }

  canValidate(): boolean {
    if (this.hasLowScore() && !this.forceValidation()) {
        return false;
    }
    // Only DBS admins or GNS admins can validate dossiers
    return this.authService.hasRole(['ADMIN_DBS', 'ADMIN_GNS']);
  }

  getReliabilitySeverity(score: number): "success" | "warn" | "danger" {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warn';
    return 'danger';
  }

  getReliabilityLabel(score: number): string {
    if (score >= 80) return 'FIABLE';
    if (score >= 50) return 'À VÉRIFIER';
    return 'SUSPECT';
  }

  validateDossier() {
    const dossier = this.selectedDossier();
    if (dossier) {
      if (!this.authService.hasRole(['ADMIN_DBS', 'ADMIN_GNS'])) return;
      this.inscriptionService.updateStatus(dossier.trackingId, 'ACTIVE').subscribe({
        next: () => {
          this.selectedDossier.set(null);
          this.loadDossiers();
        },
        error: (err) => console.error('Error validating dossier', err)
      });
    }
  }

  rejectDossier() {
    const dossier = this.selectedDossier();
    if (dossier) {
      if (!this.authService.hasRole(['ADMIN_DBS', 'ADMIN_GNS'])) return;
      this.inscriptionService.updateStatus(dossier.trackingId, 'REJETEE').subscribe({
        next: () => {
          this.selectedDossier.set(null);
          this.loadDossiers();
        },
        error: (err) => console.error('Error rejecting dossier', err)
      });
    }
  }
}
