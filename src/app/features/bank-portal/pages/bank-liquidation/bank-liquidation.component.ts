import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { BankPortalService } from '../../../../core/services/bank-portal.service';
import { StudentLiquidationInfo } from '../../../../core/models/bank-portal.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-bank-liquidation',
  standalone: true,
  imports: [CommonModule, TableModule, SkeletonModule, ButtonModule],
  templateUrl: './bank-liquidation.component.html',
  styleUrls: ['./bank-liquidation.component.scss']
})
export class BankLiquidationComponent implements OnInit {
  isLoading = signal(true);
  students = signal<StudentLiquidationInfo[]>([]);

  private bankService = inject(BankPortalService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadStudents();
  }

  loadData() { this.loadStudents(); }

  loadStudents() {
    this.isLoading.set(true);
    const operatorId = this.authService.userTrackingId() || "79633e9d-72e7-4953-b295-5853507d3913";
    
    this.bankService.getStudents(operatorId).subscribe({
      next: (data) => {
        this.students.set(data.filter(s => !s.virementEffectue));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching liquidation data', err);
        this.isLoading.set(false);
      }
    });
  }

  marquerCommeTraite(studentId: string) {
    this.bankService.marquerTraite(studentId).subscribe({
        next: () => {
            // Recharger ou retirer de la liste locale
            this.students.update(list => list.filter(s => s.studentTrackingId !== studentId));
        }
    });
  }
}
