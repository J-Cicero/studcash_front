import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { ScolariteYearService } from '../../core/services/scolarite-year.service';
import { AcademicYearContextService, ScolariteYear } from '../../core/services/academic-year-context.service';

@Component({
  selector: 'app-bank-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationBellComponent],
  templateUrl: './bank-layout.component.html',
  styleUrls: ['./bank-layout.component.scss']
})
export class BankLayoutComponent implements OnInit {
  allYears: ScolariteYear[] = [];
  selectedYearTrackingId: string = '';
  
  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private scolariteYearService: ScolariteYearService,
    public yearContext: AcademicYearContextService
  ) {}

  ngOnInit(): void {
    this.loadYears();
  }

  loadYears(): void {
    this.scolariteYearService.getAll().subscribe({
      next: (years: any[]) => {
        this.allYears = years;
        const active = years.find((y: any) => y.isOpen);
        if (active) {
          this.selectedYearTrackingId = active.trackingId;
          this.yearContext.setSelectedYear(active);
        } else if (years.length > 0) {
          this.selectedYearTrackingId = years[0].trackingId;
          this.yearContext.setSelectedYear(years[0]);
        }
      },
      error: (err: any) => console.error('Erreur chargement années', err)
    });
  }

  onYearChange(): void {
    const found = this.allYears.find(y => y.trackingId === this.selectedYearTrackingId) ?? null;
    this.yearContext.setSelectedYear(found);
  }

  get isReadOnly(): boolean {
    return this.yearContext.isReadOnly;
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
