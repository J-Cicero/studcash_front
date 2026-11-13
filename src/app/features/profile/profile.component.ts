import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ScolariteYearService, ScolariteYear } from '../../core/services/scolarite-year.service';
import { LoginResponse } from '../../core/models/auth.model';
import { UserResponse } from '../../core/models/user.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: LoginResponse | null = null;
  fullUserDetails: UserResponse | null = null;
  activeYear: ScolariteYear | null = null;
  profileForm: FormGroup;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private scolariteYearService: ScolariteYearService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          email: user.email
        });
        if (user.trackingId) {
          this.loadFullUserDetails(user.trackingId);
        }
      }
    });

    this.scolariteYearService.getActiveYear().subscribe({
      next: (yr) => this.activeYear = yr,
      error: () => this.activeYear = null
    });
  }

  loadFullUserDetails(trackingId: string): void {
    this.userService.getGetTrackingid(trackingId).subscribe({
      next: (res: UserResponse) => {
        this.fullUserDetails = res;
        this.profileForm.patchValue({
          firstName: res.firstName || this.user?.firstName,
          lastName: res.lastName || this.user?.lastName,
          phoneNumber: res.phoneNumber || this.user?.phoneNumber,
          email: res.email || this.user?.email
        });
      },
      error: () => {}
    });
  }

  resetForm(): void {
    const source = this.fullUserDetails || this.user;
    if (source) {
      this.profileForm.patchValue({
        firstName: source.firstName,
        lastName: source.lastName,
        phoneNumber: source.phoneNumber,
        email: source.email
      });
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.user?.trackingId) {
      this.profileForm.markAllAsTouched();
      return;
    }
    
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      phoneNumber: this.profileForm.value.phoneNumber,
      email: this.profileForm.value.email
    };

    this.userService.updateUser(this.user.trackingId, payload).subscribe({
      next: (updated: UserResponse) => {
        this.isSaving = false;
        this.fullUserDetails = updated;
        this.authService.updateCurrentUser({
          firstName: updated.firstName,
          lastName: updated.lastName,
          phoneNumber: updated.phoneNumber,
          email: updated.email
        });
        this.successMessage = 'Vos informations de profil ont été enregistrées avec succès.';
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du profil.';
      }
    });
  }
}
