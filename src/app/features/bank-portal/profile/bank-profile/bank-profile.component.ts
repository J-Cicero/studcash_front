import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { BankPortalService, BanqueInfo } from '../../../../core/services/bank-portal.service';

@Component({
  selector: 'app-bank-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bank-profile.component.html',
  styleUrls: ['./bank-profile.component.scss']
})
export class BankProfileComponent implements OnInit {
  banqueInfo: BanqueInfo | null = null;
  isLoading = true;
  isUpdating = false;
  updateSuccess = false;
  errorMessage = '';
  isEditMode = false;
  profileForm: FormGroup;
  originalValues: any = {};

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private bankPortalService: BankPortalService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: [{value: '', disabled: true}, [Validators.required, Validators.minLength(2)]],
      lastName: [{value: '', disabled: true}, [Validators.required, Validators.minLength(2)]],
      email: [{value: '', disabled: true}],
      password: ['']
    });
  }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      this.originalValues = {
        firstName: user.firstName,
        lastName: user.lastName
      };
    }

    const operatorId = user?.trackingId;
    if (!operatorId) {
      this.isLoading = false;
      return;
    }

    this.bankPortalService.getBanqueInfo(operatorId).subscribe({
      next: (bank) => {
        this.banqueInfo = bank;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur Info Banque:", err);
        this.isLoading = false;
      }
    });
  }

  toggleEditMode() {
    this.isEditMode = true;
    this.profileForm.get('firstName')?.enable();
    this.profileForm.get('lastName')?.enable();
    this.errorMessage = '';
    this.updateSuccess = false;
  }

  cancelEditMode() {
    this.isEditMode = false;
    this.profileForm.get('firstName')?.disable();
    this.profileForm.get('lastName')?.disable();
    this.profileForm.get('password')?.setValue('');
    if (this.originalValues) {
      this.profileForm.patchValue(this.originalValues);
    }
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    const user = this.authService.currentUserValue;
    const operatorId = user?.trackingId;
    if (!operatorId) {
      this.errorMessage = "Impossible d'identifier l'utilisateur connecté.";
      return;
    }

    this.isUpdating = true;
    this.updateSuccess = false;
    this.errorMessage = '';

    const formValues = this.profileForm.getRawValue();
    const updatePayload: any = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '00000000',
      role: (user.rolesList && user.rolesList.length > 0) ? user.rolesList[0] : 'ADMIN_BANQUE'
    };

    if (formValues.password && formValues.password.trim().length >= 6) {
      updatePayload.password = formValues.password.trim();
    }

    this.userService.updateUser(operatorId, updatePayload).subscribe({
      next: (response) => {
        this.isUpdating = false;
        this.updateSuccess = true;
        this.originalValues = {
          firstName: response.firstName || formValues.firstName,
          lastName: response.lastName || formValues.lastName
        };
        this.cancelEditMode();

        // Update local session
        const updatedUser = {
          ...user,
          firstName: this.originalValues.firstName,
          lastName: this.originalValues.lastName
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        if (this.authService['currentUserSubject']) {
          this.authService['currentUserSubject'].next(updatedUser);
        }

        setTimeout(() => this.updateSuccess = false, 5000);
      },
      error: (err) => {
        this.isUpdating = false;
        console.error("Erreur mise à jour profil:", err);
        this.errorMessage = err.error?.message || "Erreur lors de la mise à jour du profil. Veuillez réessayer.";
      }
    });
  }
}
