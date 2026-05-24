import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { InscriptionService } from '../../../../core/services/inscription.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-univ-registrations',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, SkeletonModule, ButtonModule],
  templateUrl: './univ-registrations.component.html',
  styleUrls: ['./univ-registrations.component.scss']
})
export class UnivRegistrationsComponent implements OnInit {
  isLoading = signal(false);
  inscriptions = signal<any[]>([]);
  totalElements = signal(0);

  private inscriptionService = inject(InscriptionService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(page: number = 0, size: number = 10) {
    const univId = this.authService.universityId();
    if (!univId) return;

    this.isLoading.set(true);
    this.inscriptionService.getByUniversite(univId, page, size).subscribe({
      next: (data) => {
        this.inscriptions.set(data.content);
        this.totalElements.set(data.totalElements);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading inscriptions', err);
        this.isLoading.set(false);
      }
    });
  }

  getSeverity(statut: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (statut) {
      case 'VALIDEE': return 'success';
      case 'EN_ATTENTE': return 'warn';
      case 'REJETEE': return 'danger';
      default: return 'secondary';
    }
  }
}
