import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { RegleBourseService, RegleBourseDbsResponse } from '../../../../core/services/regle-bourse.service';
import { ScolariteYearService } from '../../../../core/services/scolarite-year.service';

@Component({
  selector: 'app-dbs-ia-rules',
  standalone: true,
  imports: [CommonModule, TableModule, SkeletonModule, ButtonModule, InputTextModule, FormsModule, ReactiveFormsModule, DialogModule, DropdownModule],
  templateUrl: './dbs-ia-rules.component.html',
  styleUrls: ['./dbs-ia-rules.component.scss']
})
export class DbsIaRulesComponent implements OnInit {
  isLoading = signal(true);
  rules = signal<RegleBourseDbsResponse[]>([]);
  isYearActive = signal(false);
  isRuleDialogOpen = signal(false);
  ruleForm: FormGroup;
  
  ruleTypes = [
    { label: 'Âge Maximum', value: 'AGE_MAX' },
    { label: 'Moyenne Minimale', value: 'MOYENNE_MIN' },
    { label: 'Crédits Requis', value: 'CREDITS_REQUIS' },
    { label: 'Niveau Atteint', value: 'NIVEAU_ATTEINT' }
  ];

  private regleService = inject(RegleBourseService);
  private yearService = inject(ScolariteYearService);
  private fb = inject(FormBuilder);

  constructor() {
    this.ruleForm = this.fb.group({
      codeRegle: ['', Validators.required],
      typeRegle: ['', Validators.required],
      valeurCritere: [null, [Validators.required, Validators.min(0)]],
      montantBourse: [null, [Validators.required, Validators.min(0)]],
      anneeApplication: [''],
      description: ['', Validators.required],
      estActif: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.yearService.getActive().subscribe({
        next: (year) => {
            this.isYearActive.set(year !== null && year.estOuverte);
        },
        error: () => this.isYearActive.set(false)
    });

    this.regleService.getAll().subscribe({
      next: (data) => {
        this.rules.set(data.content);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching rules', err);
        this.isLoading.set(false);
      }
    });
  }

  saveRule(rule: RegleBourseDbsResponse) {
    if (this.isYearActive()) return;
    
    this.regleService.saveOrUpdate({
        codeRegle: rule.codeRegle,
        typeRegle: rule.typeRegle,
        valeurCritere: rule.valeurCritere,
        montantBourse: rule.montantBourse,
        anneeApplication: rule.anneeApplication,
        estActif: rule.estActif,
        description: rule.description
    }).subscribe(() => this.loadData());
  }

  openNewRuleDialog() {
    this.ruleForm.reset({ estActif: true });
    this.isRuleDialogOpen.set(true);
  }

  hideDialog() {
    this.isRuleDialogOpen.set(false);
  }

  submitRule() {
    if (this.ruleForm.valid) {
      this.regleService.saveOrUpdate(this.ruleForm.value).subscribe({
        next: () => {
          this.loadData();
          this.hideDialog();
        },
        error: (err) => console.error('Error creating rule', err)
      });
    }
  }
}
