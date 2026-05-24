import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { UniversiteService } from '../../../../core/services/universite.service';
import { User } from '../../../../core/models/user.model';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-gns-admin-users',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableModule, 
    DropdownModule, 
    SkeletonModule, 
    ButtonModule, 
    InputTextModule, 
    PasswordModule,
    TagModule,
    DialogModule,
    FloatLabelModule
  ],
  templateUrl: './gns-admin-users.component.html',
  styleUrls: ['./gns-admin-users.component.scss']
})
export class GnsAdminUsersComponent implements OnInit {
  isCreationPanelOpen = signal(false);
  isLoading = signal(true);

  users = signal<any[]>([]);
  universities = signal<any[]>([]);
  
  userForm: FormGroup;
  roles = [
    { label: 'GNS Admin', value: 'ADMIN_GNS' },
    { label: 'DBS Admin', value: 'ADMIN_DBS' },
    { label: 'Manager Banque', value: 'ADMIN_BANQUE' },
    { label: 'Université Admin', value: 'UNIVERSITY_ADMIN' }
  ];

  private userService = inject(UserService);
  private univService = inject(UniversiteService);
  private fb = inject(FormBuilder);

  constructor() {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ADMIN_GNS', Validators.required],
      universiteTrackingId: [null]
    });

    // Handle conditional university requirement
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      const univControl = this.userForm.get('universiteTrackingId');
      if (role === 'UNIVERSITY_ADMIN') {
        univControl?.setValidators([Validators.required]);
      } else {
        univControl?.clearValidators();
      }
      univControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.userService.getAll(0, 100).subscribe({
      next: (data) => {
        this.users.set(data.content);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.isLoading.set(false);
      }
    });

    this.univService.getAll(0, 100).subscribe(data => {
      this.universities.set(data.content.map(u => ({ label: u.nom, value: u.trackingId })));
    });
  }

  openCreationPanel() {
    this.userForm.reset({ role: 'ADMIN_GNS' });
    this.isCreationPanelOpen.set(true);
  }

  closeCreationPanel() {
    this.isCreationPanelOpen.set(false);
  }

  submitForm() {
    if (this.userForm.valid) {
      this.isLoading.set(true);
      const role = this.userForm.value.role;
      let request;

      if (role === 'UNIVERSITY_ADMIN') {
        request = this.userService.registerUniversityAdmin(this.userForm.value);
      } else if (role === 'ADMIN_BANQUE') {
        request = this.userService.registerBankOperator(this.userForm.value);
      } else {
        request = this.userService.register(this.userForm.value);
      }

      request.subscribe({
        next: () => {
          this.loadData();
          this.closeCreationPanel();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error creating user', err);
          this.isLoading.set(false);
        }
      });
    }
  }

  getSeverity(role: string): "danger" | "info" | "warn" | "success" | "secondary" | "contrast" | undefined {
    if (!role) return 'secondary';
    if (role.includes('ADMIN_GNS')) return 'danger';
    if (role.includes('BANQUE')) return 'info';
    if (role.includes('DBS')) return 'warn';
    if (role.includes('UNIVERSITY')) return 'success';
    return 'secondary';
  }
}
