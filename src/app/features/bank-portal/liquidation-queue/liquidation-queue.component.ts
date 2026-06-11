import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiquidationService, Liquidation } from '../../../core/services/liquidation.service';

@Component({
  selector: 'app-liquidation-queue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './liquidation-queue.component.html'
})
export class LiquidationQueueComponent implements OnInit {
  liquidations: Liquidation[] = [];
  isLoading = false;
  referenceVirement: string = '';
  selectedLiquidation: Liquidation | null = null;

  constructor(private liquidationService: LiquidationService) {}

  ngOnInit(): void {
    this.loadLiquidations();
  }

  loadLiquidations() {
    this.isLoading = true;
    this.liquidationService.findAll().subscribe({
      next: (data) => {
        this.liquidations = data.filter(l => l.statut === 'EN_ATTENTE');
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openValidationModal(liquidation: Liquidation) {
    this.selectedLiquidation = liquidation;
    this.referenceVirement = '';
  }

  valider() {
    if (!this.selectedLiquidation || !this.referenceVirement) return;
    
    this.liquidationService.validerLiquidation(this.selectedLiquidation.trackingId, this.referenceVirement).subscribe({
      next: () => {
        this.selectedLiquidation = null;
        this.loadLiquidations();
      }
    });
  }
}
