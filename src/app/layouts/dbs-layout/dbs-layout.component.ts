import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-dbs-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dbs-layout.component.html',
  styleUrls: ['./dbs-layout.component.scss']
})
export class DbsLayoutComponent {
  constructor(
    public authService: AuthService,
    public themeService: ThemeService
  ) {}

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
