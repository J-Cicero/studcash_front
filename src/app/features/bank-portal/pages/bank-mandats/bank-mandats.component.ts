import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { BankPortalService } from '../../../../core/services/bank-portal.service';
import { DocumentEtudiantService } from '../../../../core/services/document-etudiant.service';
import { AuthService } from '../../../../core/services/auth.service';
import { StudentLiquidationInfo } from '../../../../core/models/bank-portal.model';
import { DocumentEtudiantResponse } from '../../../../core/models/document-etudiant.model';

@Component({
  selector: 'app-bank-mandats',
  standalone: true,
  imports: [CommonModule, TableModule, SkeletonModule, ButtonModule, TagModule, ImageModule],
  templateUrl: './bank-mandats.component.html',
  styleUrls: ['./bank-mandats.component.scss']
})
export class BankMandatsComponent implements OnInit {
  isLoading = signal(true);
  mandats = signal<StudentLiquidationInfo[]>([]);
  
  selectedMandat = signal<StudentLiquidationInfo | null>(null);
  documentImage = signal<string | null>(null);

  private bankService = inject(BankPortalService);
  private docService = inject(DocumentEtudiantService);
  public authService = inject(AuthService);

  ngOnInit(): void {
    this.loadMandats();
  }

  loadMandats() {
    this.isLoading.set(true);
    const operatorId = "79633e9d-72e7-4953-b295-5853507d3913"; // Simulation

    this.bankService.getStudents(operatorId).subscribe({
      next: (students) => {
        this.mandats.set(students);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching mandats', err);
        this.isLoading.set(false);
      }
    });
  }

  viewMandat(mandat: StudentLiquidationInfo) {
    this.selectedMandat.set(mandat);
    this.docService.getByInscription(mandat.studentTrackingId).subscribe({
        next: (docs) => {
            const doc = docs.find((d: DocumentEtudiantResponse) => d.type === 'SOUCHE_TAMPONNEE');
            this.documentImage.set(doc ? doc.cheminFichier : null);
        }
    });
  }

  validate(valide: boolean) {
    const selectedMandat = this.selectedMandat();
    if (!selectedMandat) return;

    // Only bank operators may validate/reject mandats
    if (!this.authService.hasRole(['ADMIN_BANQUE'])) return;

    this.bankService.validerMandat(selectedMandat.studentTrackingId, valide).subscribe({
      next: () => {
        this.loadMandats();
        this.selectedMandat.set(null);
      }
    });
  }
}
