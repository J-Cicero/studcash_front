import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { BankPortalService, StudentLiquidationInfo } from '../../../../core/services/bank-portal.service';

@Component({
  selector: 'app-bank-virements',
  standalone: true,
  imports: [CommonModule, TableModule, SkeletonModule, TagModule],
  templateUrl: './bank-virements.component.html',
  styleUrls: ['./bank-virements.component.scss']
})
export class BankVirementsComponent implements OnInit {
  isLoading = signal(true);
  processedStudents = signal<StudentLiquidationInfo[]>([]);

  private bankService = inject(BankPortalService);

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading.set(true);
    const operatorId = "79633e9d-72e7-4953-b295-5853507d3913"; // Simulation
    
    this.bankService.getStudents(operatorId).subscribe({
      next: (data) => {
        // In a real app we'd have a separate endpoint for history
        // For now we show all but label them as processed for UI simulation
        this.processedStudents.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching history', err);
        this.isLoading.set(false);
      }
    });
  }
}
