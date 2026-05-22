import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  isSuccess = false;

  constructor(private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  handleLogin() {
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.isSuccess = true;
      
      setTimeout(() => {
        // Simulate Redirection based on email alias
        if (this.email.includes('@gns.sn')) {
          this.router.navigate(['/admin/dashboard']);
        } else if (this.email.includes('@utb.tg') || this.email.includes('@studcash.com')) {
          this.router.navigate(['/bank/dashboard']);
        } else if (this.email.includes('@ucad.sn') || this.email.includes('@ul.tg')) {
          this.router.navigate(['/univ/dashboard']);
        } else if (this.email.includes('@dbs.sn')) {
          this.router.navigate(['/dbs/dashboard']);
        } else {
          this.router.navigate(['/admin/dashboard']);
        }
      }, 1000);
    }, 1500);
  }
}
