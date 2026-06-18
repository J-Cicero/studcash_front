import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  roles = [
    { value: 'ETUDIANT', label: 'Étudiant' },
    { value: 'ADMIN_GNS', label: 'Administrateur GNS' },
    { value: 'ADMIN_DBS', label: 'Administrateur DBS' },
    { value: 'ADMIN_BANQUE', label: 'Banque' },
    { value: 'COMMERCANT', label: 'Commerçant' },
    { value: 'UNIVERSITY_ADMIN', label: 'Université' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern('^(\\+?[0-9]{8,15})$')]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ETUDIANT', [Validators.required]]
    });
  }

  // onSubmit(): void {
  //   if (this.registerForm.invalid) {
  //     this.registerForm.markAllAsTouched();
  //     return;
  //   }

  //   this.isLoading = true;
  //   this.errorMessage = '';
  //   this.successMessage = '';

  //   this.authService.register(this.registerForm.value).subscribe({
  //     next: () => {
  //       this.isLoading = false;
  //       this.successMessage = 'Compte créé avec succès ! Redirection...';
  //       setTimeout(() => this.router.navigate(['/login']), 2000);
  //     },
  //     error: (err) => {
  //       this.isLoading = false;
  //       this.errorMessage = err.error?.message || 'Erreur lors de la création du compte.';
  //       console.error('Registration error', err);
  //     }
  //   });
  // }
}
