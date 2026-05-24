import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UniversiteService } from '../../../../core/services/universite.service';
import { Universite } from '../../../../core/models/universite.model';
import { forkJoin } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-gns-admin-universities',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TagModule, ButtonModule, InputTextModule, DialogModule, FloatLabelModule, InputSwitchModule],
  templateUrl: './gns-admin-universities.component.html',
  styleUrls: ['./gns-admin-universities.component.scss']
})
export class GnsAdminUniversitiesComponent implements OnInit {
  isSidePanelOpen = signal(false);
  isCreationPanelOpen = signal(false);
  isLoading = signal(false);

  universities = signal<Universite[]>([]);
  selectedUniv = signal<any>(null);
  universityForm: FormGroup;

  private universiteService = inject(UniversiteService);
  private fb = inject(FormBuilder);

  constructor() {
    this.universityForm = this.fb.group({
      nom: ['', Validators.required],
      code: ['', Validators.required],
      ville: ['', Validators.required],
      estActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadUniversities();
  }

  loadUniversities() {
    this.isLoading.set(true);
    forkJoin({
        all: this.universiteService.getAll(0, 50),
        stats: this.universiteService.getSummaryStats()
    }).subscribe({
      next: (res) => {
        const mapped = res.all.content.map((u, index) => {
          const s = res.stats.find(st => st['trackingId'] === u.trackingId);
          return {
            ...u,
            type: u.estActive ? 'Active' : 'Inactive',
            location: u.ville || 'Togo',
            students: s ? s['nbEtudiants'] : 0,
            wallets: 0,
            bourses: 'Calcul...',
            bgColor: ['bg-primary-container', 'bg-tertiary-fixed', 'bg-secondary-fixed'][index % 3],
            textColor: ['text-on-primary-container', 'text-on-tertiary-fixed', 'text-on-secondary-fixed'][index % 3]
          };
        });
        this.universities.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching universities', err);
        this.isLoading.set(false);
      }
    });
  }

  selectUniversity(univ: any) {
    this.selectedUniv.set(univ);
    this.isSidePanelOpen.set(true);
  }

  toggleSidePanel() {
    this.isSidePanelOpen.update(val => !val);
  }

  openCreationPanel() {
    this.universityForm.reset({ estActive: true });
    this.isCreationPanelOpen.set(true);
  }

  closeCreationPanel() {
    this.isCreationPanelOpen.set(false);
  }

  submitForm() {
    if (this.universityForm.valid) {
      this.isLoading.set(true);
      this.universiteService.create(this.universityForm.value).subscribe({
        next: (newUniv) => {
          this.loadUniversities();
          this.closeCreationPanel();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error creating university', err);
          this.isLoading.set(false);
        }
      });
    }
  }
}
