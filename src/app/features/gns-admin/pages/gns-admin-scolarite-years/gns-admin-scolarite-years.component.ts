import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScolariteYearService } from '../../../../core/services/scolarite-year.service';
import { ParametreGnsService } from '../../../../core/services/parametre-gns.service';
import { TypeParametreGns } from '../../../../core/models/gns-admin.model';
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
  currentStep = signal<1 | 2 | 3>(1); // 1: Info, 2: Commission, 3: Success
  scolariteForm: FormGroup;
  commissionForm: FormGroup;
  scolariteYears = signal<any[]>([]);
  currentCommission = signal<string>('5');
  
  private fb = inject(FormBuilder);
  private scolariteService = inject(ScolariteYearService);
  private parametreService = inject(ParametreGnsService);

  ngOnInit() {
    this.loadScolariteYears();
    this.loadCurrentCommission();
  }

  loadCurrentCommission() {
    this.parametreService.getByType(TypeParametreGns.TAUX_COMMISSION_PAIEMENT).subscribe({
      next: (param) => {
        if(param) {
          this.currentCommission.set(param.valeurParametre);
        }
      },
      error: () => console.log('Aucun paramètre de commission trouvé.')
    });
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

    this.commissionForm = this.fb.group({
      valeurParametre: ['5', Validators.required],
      description: ['Commission GNS sur les paiements marchands', Validators.required]
    });
  }

  openCreationPanel() {
    this.scolariteForm.reset({ estOuverte: true });
    this.currentStep.set(1);
    this.isCreationPanelOpen.set(true);
  }

  closeCreationPanel() {
    this.isCreationPanelOpen.set(false);
    this.currentStep.set(1);
  }

  goToStep2() {
    if (this.scolariteForm.valid) {
      // Fetch current commission value
      this.parametreService.getByType(TypeParametreGns.TAUX_COMMISSION_PAIEMENT).subscribe({
        next: (param) => {
          if(param) {
            this.commissionForm.patchValue({
              valeurParametre: param.valeurParametre,
              description: param.description
            });
          }
        },
        error: () => console.log('Aucun paramètre trouvé, on garde la valeur par défaut.')
      });
      this.currentStep.set(2);
    }
  }

  goBackToStep1() {
    this.currentStep.set(1);
  }

  submitAll() {
    if (this.scolariteForm.valid && this.commissionForm.valid) {
      // 1. Save ScolariteYear
      this.scolariteService.create(this.scolariteForm.value).subscribe({
        next: (res: any) => {
          console.log('Scolarite Year created successfully:', res);
          
          // 2. Save Commission
          this.parametreService.saveOrUpdate({
            nomParametre: TypeParametreGns.TAUX_COMMISSION_PAIEMENT,
            valeurParametre: this.commissionForm.value.valeurParametre,
            description: this.commissionForm.value.description,
            estActif: true
          }).subscribe({
            next: () => {
               this.loadScolariteYears();
               this.loadCurrentCommission();
               this.currentStep.set(3); // Step 3: Success & Notification
            },
            error: (err) => console.error('Erreur sauvegarde commission', err)
          });
        },
        error: (err: any) => {
          console.error('Failed to create Scolarite Year:', err);
        }
      });
    }
  }
}
