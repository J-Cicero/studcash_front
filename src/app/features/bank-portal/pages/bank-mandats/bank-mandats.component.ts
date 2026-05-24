import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BankPortalService } from '../../../../core/services/bank-portal.service';
import { DocumentEtudiantService } from '../../../../core/services/document-etudiant.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-bank-mandats',
  standalone: true,
  imports: [CommonModule, TableModule, SkeletonModule, ButtonModule, TagModule],
  templateUrl: './bank-mandats.component.html',
  styleUrls: ['./bank-mandats.component.scss']
})
export class BankMandatsComponent implements OnInit {
  isLoading = signal(true);
  mandats = signal<any[]>([]);
  
  selectedMandat = signal<any>(null);
  documentImage = signal<string | null>(null);

  private bankService = inject(BankPortalService);
  private docService = inject(DocumentEtudiantService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadMandats();
  }

  loadMandats() {
    this.isLoading.set(true);
    const operatorId = "79633e9d-72e7-4953-b295-5853507d3913"; // Simulation

    this.bankService.getStudents(operatorId).subscribe({
      next: (students) => {
        // Here we map students to mandats for simulation as we lack a direct mandat endpoint
        this.mandats.set(students.map(s => ({
            ...s,
            status: 'PENDING',
            date: '23 Mai 2026'
        })));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching mandats', err);
        this.isLoading.set(false);
      }
    });
  }

  viewMandat(mandat: any) {
    this.selectedMandat.set(mandat);
    this.docService.getByInscription(mandat.studentTrackingId).subscribe({
        next: (docs) => {
            const doc = docs.find(d => d.type === 'SOUCHE_TAMPONNEE');
            this.documentImage.set(doc ? doc.cheminFichier : null);
        }
    });
  }

  validate(valide: boolean) {
    if (!this.selectedMandat()) return;
    
    this.bankService.validerMandat(this.selectedMandat().studentTrackingId, valide).subscribe({
        next: () => {
            this.loadMandats();
            this.selectedMandat.set(null);
        }
    });
  }
}
