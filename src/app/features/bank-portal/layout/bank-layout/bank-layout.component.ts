import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-bank-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bank-layout.component.html',
  styleUrls: ['./bank-layout.component.scss']
})
export class BankLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
