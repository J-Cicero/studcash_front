import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { RegleBourseService, RegleBourseDbsResponse } from '../../../../core/services/regle-bourse.service';
import { ScolariteYearService } from '../../../../core/services/scolarite-year.service';

@Component({
  selector: 'app-dbs-ia-rules',
  standalone: true,
  imports: [CommonModule, TableModule, SkeletonModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './dbs-ia-rules.component.html',
  styleUrls: ['./dbs-ia-rules.component.scss']
})
export class DbsIaRulesComponent implements OnInit {
  isLoading = signal(true);
  rules = signal<RegleBourseDbsResponse[]>([]);
  isYearActive = signal(false);

  private regleService = inject(RegleBourseService);
  private yearService = inject(ScolariteYearService);

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
        typeRegle: rule.typeRegle,
        valeurCritere: rule.valeurCritere,
        estActif: rule.estActif,
        description: rule.description
    }).subscribe(() => this.loadData());
  }
}
