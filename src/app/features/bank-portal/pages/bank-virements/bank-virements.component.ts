import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { BankPortalService } from '../../../../core/services/bank-portal.service';
import { StudentLiquidationInfo } from '../../../../core/models/bank-portal.model';

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
        this.processedStudents.set(data.filter(s => s.virementEffectue));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching history', err);
        this.isLoading.set(false);
      }
    });
  }
}
