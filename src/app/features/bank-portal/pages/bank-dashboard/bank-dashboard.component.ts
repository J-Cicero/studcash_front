import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { BankPortalService } from '../../../../core/services/bank-portal.service';
import { StudentLiquidationInfo } from '../../../../core/models/bank-portal.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';


@Component({
  selector: 'app-bank-dashboard',
  standalone: true,
  imports: [CommonModule, SkeletonModule, ButtonModule],
  templateUrl: './bank-dashboard.component.html',
  styleUrls: ['./bank-dashboard.component.scss']
})
export class BankDashboardComponent implements OnInit {
  isLoading = signal(true);
  stats = signal({
    totalLiquidations: 0,
    mandatsAttente: 0,
    tauxLiquidation: 0
  });


  private bankService = inject(BankPortalService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  // expose authService to template
  public readonly auth = this.authService;

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    // Try to resolve the bank operator id from the current user profile
    this.userService.getProfile().subscribe({
      next: (user: User) => {
        const operatorId = user?.trackingId || '';
        this.fetchStudents(operatorId);
      },
      error: () => {
        // fallback: try empty id (service should handle)
        this.fetchStudents('');
      }
    });
  }

  private fetchStudents(operatorId: string) {
    this.bankService.getStudents(operatorId).subscribe({
      next: (students: StudentLiquidationInfo[]) => {
        const total = students.reduce((acc, s) => acc + (s.resteAPayer || 0), 0);
        this.stats.set({
            totalLiquidations: total,
            mandatsAttente: students.filter(s => s.resteAPayer > 0).length,
            tauxLiquidation: 100
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Bank Dashboard Error', err);
        this.isLoading.set(false);
      }
    });
  }

}
