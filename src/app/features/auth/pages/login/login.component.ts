import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  handleLogin() {
    this.isLoading = true;
    
    // Simulate API delay
    setTimeout(() => {
      let role: UserRole = 'ADMIN_GNS'; // Default
      let targetPath = '/admin/dashboard';
      let univId: string | undefined = undefined;

      if (this.email.includes('@gns.sn')) {
        role = 'ADMIN_GNS';
        targetPath = '/admin/dashboard';
      } else if (this.email.includes('@utb.tg') || this.email.includes('@studcash.com')) {
        role = 'ADMIN_BANQUE';
        targetPath = '/bank/dashboard';
      } else if (this.email.includes('@ucad.sn') || this.email.includes('@ul.tg')) {
        role = 'UNIVERSITY_ADMIN';
        targetPath = '/univ/dashboard';
        univId = 'default-univ-id'; // To be replaced by actual data later
      } else if (this.email.includes('@dbs.sn')) {
        role = 'ADMIN_DBS';
        targetPath = '/dbs/dossiers';
      }

      this.authService.login(role, univId);
      this.router.navigate([targetPath]);
      this.isLoading = false;
    }, 1500);
  }
}
