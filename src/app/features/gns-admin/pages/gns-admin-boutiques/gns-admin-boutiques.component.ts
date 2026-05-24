import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-gns-admin-boutiques',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, FloatLabelModule],
  templateUrl: './gns-admin-boutiques.component.html',
  styleUrl: './gns-admin-boutiques.component.scss'
})
export class GnsAdminBoutiquesComponent {
  isCreationPanelOpen = signal(false);
  boutiqueForm: FormGroup;
  private fb = inject(FormBuilder);

  constructor() {
    this.boutiqueForm = this.fb.group({
      nomBoutique: ['', Validators.required],
      categorieShop: ['', Validators.required],
      latitude: [null],
      longitude: [null],
      initialQuota: [1000000, Validators.required]
    });
  }

  openCreationPanel() {
    this.boutiqueForm.reset({ initialQuota: 1000000 });
    this.isCreationPanelOpen.set(true);
  }

  closeCreationPanel() {
    this.isCreationPanelOpen.set(false);
  }

  submitForm() {
    if (this.boutiqueForm.valid) {
      console.log('Boutique created:', this.boutiqueForm.value);
      this.closeCreationPanel();
    }
  }
}
