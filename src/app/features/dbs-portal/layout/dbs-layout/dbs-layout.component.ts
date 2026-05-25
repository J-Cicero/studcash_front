import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dbs-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  templateUrl: './dbs-layout.component.html',
  styleUrls: ['./dbs-layout.component.scss']
})
export class DbsLayoutComponent implements OnInit, OnDestroy {
  isDarkMode = signal(false);
  private theme = inject(ThemeService);
  private sub: Subscription | null = null;

  ngOnInit(): void {
    this.theme.init('dbs-theme', 'dbs-dark');
    this.sub = this.theme.changes().subscribe(evt => {
      if (evt.key === 'dbs-theme') this.isDarkMode.set(evt.isDark);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
