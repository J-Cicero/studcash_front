import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Redirection logic based on roles
        if (this.authService.hasRole('ADMIN_GNS')) {
          this.router.navigate(['/admin-gns/dashboard']);
        } else if (this.authService.hasRole('ADMIN_BANQUE')) {
          this.router.navigate(['/bank-portal/dashboard']);
        } else if (this.authService.hasRole('UNIVERSITY_ADMIN')) {
          this.router.navigate(['/admin-university/dashboard']);
        } else {
          // Default fallback if role doesn't have a dashboard yet
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Email ou mot de passe incorrect.';
        console.error('Login error', err);
      }
    });
  }
}
