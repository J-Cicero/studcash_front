import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScolariteYearService } from '../../../../core/services/scolarite-year.service';
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
export class GnsAdminScolariteYearsComponent implements OnInit {
  isCreationPanelOpen = signal(false);
  scolariteForm: FormGroup;
  scolariteYears = signal<any[]>([]);
  private fb = inject(FormBuilder);
  private scolariteService = inject(ScolariteYearService);

  ngOnInit() {
    this.loadScolariteYears();
  }

  loadScolariteYears() {
    this.scolariteService.getAll().subscribe({
      next: (res: any[]) => {
        this.scolariteYears.set(res || []);
      },
      error: (err: any) => console.error('Erreur chargement années scolaires', err)
    });
  }

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
      this.scolariteService.create(this.scolariteForm.value).subscribe({
        next: (res: any) => {
          console.log('Scolarite Year created successfully:', res);
          this.loadScolariteYears();
          this.closeCreationPanel();
        },
        error: (err: any) => {
          console.error('Failed to create Scolarite Year:', err);
        }
      });
    }
  }
}
