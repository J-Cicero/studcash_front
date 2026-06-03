import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-bank-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './bank-layout.component.html',
  styleUrls: ['./bank-layout.component.scss']
}
)
export class BankLayoutComponent {
  
  constructor(
    public authService: AuthService,
    public themeService: ThemeService
  ) {}

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
