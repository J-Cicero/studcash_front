import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.scss'
})
export class LoginAdminComponent {
  loginData = {
    email: 'admin@gns-global.com',
    password: 'admin-password'
  };
  showPassword = false;

  constructor(private router: Router) {}

  onLogin() {
    this.router.navigate(['/admin/dashboard']);
  }
}
