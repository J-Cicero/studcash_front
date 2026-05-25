import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoutiqueService } from '../../../../core/services/boutique.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-gns-admin-boutiques',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, FloatLabelModule, TableModule],
  templateUrl: './gns-admin-boutiques.component.html',
  styleUrl: './gns-admin-boutiques.component.scss'
})
export class GnsAdminBoutiquesComponent implements OnInit {
  isCreationPanelOpen = signal(false);
  boutiqueForm: FormGroup;
  boutiques = signal<any[]>([]);
  private fb = inject(FormBuilder);
  private boutiqueService = inject(BoutiqueService);

  ngOnInit() {
    this.loadBoutiques();
  }

  loadBoutiques() {
    this.boutiqueService.getAll(0, 100).subscribe({
      next: (res: any) => {
        this.boutiques.set(res.content || []);
      },
      error: (err: any) => console.error('Erreur chargement boutiques', err)
    });
  }

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
      const payload = {
        ...this.boutiqueForm.value,
        statutKYC: 'EN_ATTENTE',
        cheminCarteEDJ: 'default/path.pdf',
        // Optional: you can generate or assign merchant tracking ID here later.
      };
      this.boutiqueService.create(payload).subscribe({
        next: (res: any) => {
          console.log('Boutique created successfully:', res);
          this.loadBoutiques();
          this.closeCreationPanel();
        },
        error: (err: any) => {
          console.error('Failed to create boutique:', err);
        }
      });
    }
  }
}
