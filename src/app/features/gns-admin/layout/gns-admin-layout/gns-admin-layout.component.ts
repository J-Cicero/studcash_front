import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle.component';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-gns-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, ThemeToggleComponent],
  templateUrl: './gns-admin-layout.component.html',
  styleUrls: ['./gns-admin-layout.component.scss']
})
export class GnsAdminLayoutComponent implements OnInit, OnDestroy {
  isDarkMode = signal(false);

  private subs: Subscription | null = null;
  private theme = inject(ThemeService);

  ngOnInit(): void {
    // initialize and subscribe to theme changes for admin key
    this.theme.init('gns-admin-theme', 'gns-admin-dark');
    this.subs = this.theme.changes().subscribe(evt => {
      if (evt.key === 'gns-admin-theme') this.isDarkMode.set(evt.isDark);
    });
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }
}
