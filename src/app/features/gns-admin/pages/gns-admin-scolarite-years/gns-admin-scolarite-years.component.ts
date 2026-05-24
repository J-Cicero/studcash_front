import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-gns-admin-scolarite-years',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, FloatLabelModule, InputSwitchModule],
  templateUrl: './gns-admin-scolarite-years.component.html',
  styleUrl: './gns-admin-scolarite-years.component.scss'
})
export class GnsAdminScolariteYearsComponent {
  isCreationPanelOpen = signal(false);
  scolariteForm: FormGroup;
  private fb = inject(FormBuilder);

  constructor() {
    this.scolariteForm = this.fb.group({
      libelle: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      estOuverte: [true]
    });
  }

  openCreationPanel() {
    this.scolariteForm.reset({ estOuverte: true });
    this.isCreationPanelOpen.set(true);
  }

  closeCreationPanel() {
    this.isCreationPanelOpen.set(false);
  }

  submitForm() {
    if (this.scolariteForm.valid) {
      console.log('Scolarite Year created:', this.scolariteForm.value);
      this.closeCreationPanel();
    }
  }
}
