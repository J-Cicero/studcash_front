import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../../../core/services/auth.service';
import { UniversiteService } from '../../../../core/services/universite.service';
import { VersementService } from '../../../../core/services/versement.service';

@Component({
  selector: 'app-univ-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, SkeletonModule, TagModule, ButtonModule, DialogModule],
  templateUrl: './univ-portfolio.component.html',
  styleUrls: ['./univ-portfolio.component.scss']
})
export class UnivPortfolioComponent implements OnInit {
  isLoading = signal(true);
  univDetails = signal<any>(null);
  movements = signal<any[]>([]);

  private authService = inject(AuthService);
  private univService = inject(UniversiteService);
  private versementService = inject(VersementService);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const univId = this.authService.universityId();
    if (!univId) return;

    this.isLoading.set(true);
    this.univService.getByTrackingId(univId).subscribe({
      next: (details) => {
        this.univDetails.set(details);
        if (details.walletTrackingId) {
          this.loadHistory(details.walletTrackingId);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Error fetching university details', err);
        this.isLoading.set(false);
      }
    });
  }

  loadHistory(walletId: string) {
    this.versementService.getByWallet(walletId, 0, 10).subscribe({
      next: (data) => {
        this.movements.set(data.content);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching versement history', err);
        this.isLoading.set(false);
      }
    });
  }

  isTransferModalOpen = signal(false);

  openTransferModal() {
    this.isTransferModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeTransferModal() {
    this.isTransferModalOpen.set(false);
    document.body.style.overflow = 'auto';
  }
}
