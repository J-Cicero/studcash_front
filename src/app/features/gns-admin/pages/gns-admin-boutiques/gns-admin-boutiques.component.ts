import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoutiqueService, BoutiqueResponse } from '../../../../core/services/boutique.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-gns-admin-boutiques',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, FloatLabelModule, TableModule, DialogModule],
  templateUrl: './gns-admin-boutiques.component.html',
  styleUrl: './gns-admin-boutiques.component.scss'
})
export class GnsAdminBoutiquesComponent implements OnInit {
  boutiques = signal<BoutiqueResponse[]>([]);
  isCreateBoutiquePanelOpen = signal(false);
  isLoading = signal(false);
  boutiqueForm: FormGroup;

  private boutiqueService = inject(BoutiqueService);
  private fb = inject(FormBuilder);

  constructor() {
    this.boutiqueForm = this.fb.group({
      nomBoutique: ['', Validators.required],
      categorieShop: ['', Validators.required],
      initialQuota: [100000, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadBoutiques();
  }

  loadBoutiques() {
    this.isLoading.set(true);
    this.boutiqueService.getAll(0, 100).subscribe({
      next: (res) => {
        this.boutiques.set(res.content || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement boutiques', err);
        this.isLoading.set(false);
      }
    });
  }

  openCreatePanel() {
    this.isCreateBoutiquePanelOpen.set(true);
    this.boutiqueForm.reset({ initialQuota: 100000 });
  }

  closeCreatePanel() {
    this.isCreateBoutiquePanelOpen.set(false);
  }

  submitForm() {
    if (this.boutiqueForm.valid) {
      this.isLoading.set(true);
      const payload = { 
          ...this.boutiqueForm.value,
          statutKYC: 'VALIDE' // Par défaut lors d'un ajout manuel GNS
      };

      this.boutiqueService.create(payload).subscribe({
        next: (res) => {
          this.loadBoutiques();
          this.closeCreatePanel();
        },
        error: (err) => {
          console.error('Erreur lors de la création', err);
          this.isLoading.set(false);
        }
      });
    }
  }
}
