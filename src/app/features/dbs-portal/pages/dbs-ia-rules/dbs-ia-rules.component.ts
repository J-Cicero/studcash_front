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
  ruleTypes = [
    { type: 'AGE_MAX_LICENCE', label: 'Âge Max Licence', desc: 'Âge maximum pour être éligible en Licence' },
    { type: 'MONTANT_TRANCHE_STANDARD', label: 'Tranche Standard', desc: 'Montant de base de la bourse' },
    { type: 'MONTANT_TRANCHE_SUPERIEURE', label: 'Tranche Supérieure', desc: 'Montant majoré (excellence)' },
    { type: 'L1_MOYENNE_MIN_PASSABLE', label: 'L1: Moyenne Passable', desc: 'Moyenne minimale pour conserver la bourse en L1' },
    { type: 'L1_MOYENNE_MIN_MENTION_SUP', label: 'L1: Mention Sup.', desc: 'Moyenne pour bourse de mérite L1' },
    { type: 'L2_CREDITS_MIN_STANDARD', label: 'L2: Crédits Standard', desc: 'Crédits minimum requis en L2' },
    { type: 'L2_CREDITS_MIN_SUPERIEUR', label: 'L2: Crédits Excellence', desc: 'Crédits pour mérite en L2' },
    { type: 'L3_CREDITS_MIN_STANDARD', label: 'L3: Crédits Standard', desc: 'Crédits minimum requis en L3' },
    { type: 'L3_CREDITS_MIN_SUPERIEUR', label: 'L3: Crédits Excellence', desc: 'Crédits pour mérite en L3' },
    { type: 'L4_CREDITS_MIN_STANDARD', label: 'L4 (Recyclage): Crédits', desc: 'Crédits minimum requis pour la 4ème année de Licence' },
    { type: 'L5_CREDITS_MIN_STANDARD', label: 'L5 (Recyclage): Crédits', desc: 'Crédits minimum requis pour la 5ème année de Licence' }
  ];

  // We map them so the UI can iterate over our predefined types
  displayRules = signal<any[]>([]);

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
        const backendRules: RegleBourseDbsResponse[] = data.content || [];
        
        // Merge backend rules with our predefined structure
        const merged = this.ruleTypes.map(rt => {
            const existing = backendRules.find(b => b.typeRegle === rt.type);
            return {
                trackingId: existing?.trackingId,
                typeRegle: rt.type,
                label: rt.label,
                description: existing?.description || rt.desc,
                valeurCritere: existing ? existing.valeurCritere : null,
                estActif: existing ? existing.estActif : false
            };
        });
        
        this.displayRules.set(merged);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching rules', err);
        // Even on error (like 404 or empty db), we show the available fields to the user
        const emptyRules = this.ruleTypes.map(rt => ({
            typeRegle: rt.type,
            label: rt.label,
            description: rt.desc,
            valeurCritere: null,
            estActif: false
        }));
        this.displayRules.set(emptyRules);
        this.isLoading.set(false);
      }
    });
  }

  saveRule(rule: any) {
    if (this.isYearActive()) return;
    
    if (rule.valeurCritere === null || rule.valeurCritere === undefined || rule.valeurCritere < 0) {
        return;
    }
    
    this.isLoading.set(true);
    this.regleService.saveOrUpdate({
        typeRegle: rule.typeRegle,
        valeurCritere: rule.valeurCritere,
        estActif: rule.estActif,
        description: rule.description
    }).subscribe({
        next: () => this.loadData(),
        error: (err) => {
            console.error('Error saving rule', err);
            this.isLoading.set(false);
        }
    });
  }
}
