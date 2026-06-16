import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ScolariteYearService } from '../../core/services/scolarite-year.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {
  activeYear: any = null;

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private scolariteYearService: ScolariteYearService
  ) {
    this.loadActiveYear();
  }

  loadActiveYear(): void {
    this.scolariteYearService.getActiveYear().subscribe({
      next: (year: any) => { // You might want to replace 'any' with a ScolariteYear interface if you have one
        this.activeYear = year;
      },
      error: (err: any) => {
        console.error('Erreur chargement annee active', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
