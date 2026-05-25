import { Component, OnInit, OnDestroy, Renderer2, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-gns-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './gns-admin-layout.component.html',
  styleUrls: ['./gns-admin-layout.component.scss']
})
export class GnsAdminLayoutComponent implements OnInit, OnDestroy {
  isDarkMode = signal(false);

  private renderer = inject(Renderer2);

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('gns-admin-theme');
    this.isDarkMode.set(savedTheme === 'dark');
    this.syncBodyTheme();
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'gns-admin-dark');
  }

  toggleTheme(): void {
    const nextTheme = this.isDarkMode() ? 'light' : 'dark';
    this.isDarkMode.set(!this.isDarkMode());
    localStorage.setItem('gns-admin-theme', nextTheme);
    this.syncBodyTheme();
  }

  private syncBodyTheme(): void {
    if (this.isDarkMode()) {
      this.renderer.addClass(document.body, 'gns-admin-dark');
    } else {
      this.renderer.removeClass(document.body, 'gns-admin-dark');
    }
  }
}
