import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-univ-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  templateUrl: './univ-layout.component.html',
  styleUrls: ['./univ-layout.component.scss']
})
export class UnivLayoutComponent implements OnInit, OnDestroy {
  isDarkMode = signal(false);
  currentRole = signal<string | null>(null);

  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private sub: Subscription | null = null;

  ngOnInit(): void {
    this.currentRole.set(this.authService.currentUserRole());
    this.themeService.init('univ-portal-theme', 'univ-portal-dark');
    this.sub = this.themeService.changes().subscribe(evt => {
      if (evt.key === 'univ-portal-theme') {
        this.isDarkMode.set(evt.isDark);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
