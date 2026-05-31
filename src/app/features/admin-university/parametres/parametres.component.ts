import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UniversityPortalService } from '../../../core/services/university-portal.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.scss'
})
export class ParametresComponent implements OnInit {
  profile: any = null;
  universite: any = null;
  activeYear: any = null;
  allYears: any[] = [];
  paiements: any[] = [];

  selectedYear: string = '';
  isLoading = true;

  constructor(private universityPortalService: UniversityPortalService) {}

  ngOnInit(): void {
    this.universityPortalService.getMyProfile().pipe(
      switchMap(profile => {
        this.profile = profile;
        return forkJoin({
          universite: this.universityPortalService.getUniversite(profile.universiteTrackingId),
          activeYear: this.universityPortalService.getActiveScolariteYear(),
          allYears: this.universityPortalService.getScolariteYears(0, 50),
          paiements: this.universityPortalService.getPaiementsScolarite(profile.universiteTrackingId, 0, 1000)
        });
      })
    ).subscribe({
      next: (data) => {
        this.universite = data.universite;
        this.activeYear = data.activeYear;
        this.allYears = data.allYears.content || [];
        this.paiements = data.paiements.content || [];
        this.selectedYear = data.activeYear?.libelle || (this.allYears[0]?.libelle || '');
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getYearPaiements(annee: string): any[] {
    // Filter paiements by scolariteYear libelle approximation via date range
    const year = this.allYears.find(y => y.libelle === annee);
    if (!year) return [];

    const debut = new Date(year.dateDebut);
    const fin = new Date(year.dateFin);

    return this.paiements.filter(p => {
      const d = new Date(p.date);
      return d >= debut && d <= fin && p.statutPaiement === 'VALIDE';
    });
  }

  getYearTotal(annee: string): number {
    return this.getYearPaiements(annee).reduce((s, p) => s + (p.montantNetBoutique || 0), 0);
  }

  getYearCount(annee: string): number {
    return this.getYearPaiements(annee).length;
  }
}
