import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GlobalStats {
  totalBourses: number;
  totalStudents: number;
  totalBoutiques: number;
  totalUniversities: number;
  totalTransactions: number;
  totalEligibles: number;
  totalPending: number;
  verificationRate: number;
  volumeToday: number;
  failedTxns: number;
  successRate: number;
}

export interface FluxMensuel {
  mois: string;
  bourses: number;
  remboursements: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getGlobalStats(): Observable<GlobalStats> {
    return forkJoin({
      achats: this.http.get<any>(`${this.apiUrl}/paiements/type/ACHAT`),
      scolarite: this.http.get<any>(`${this.apiUrl}/paiements/type/SCOLARITE`),
      users: this.http.get<any>(`${this.apiUrl}/users/all`),
      boutiques: this.http.get<any>(`${this.apiUrl}/boutiques`),
      universites: this.http.get<any>(`${this.apiUrl}/universites`)
    }).pipe(
      map(results => {
        // Extraction sécurisée du contenu (format Page Spring Data)
        const achatsContent = results.achats?.content || results.achats || [];
        const scolariteContent = results.scolarite?.content || results.scolarite || [];
        const usersContent = results.users?.content || results.users || [];
        
        const etudiants = usersContent.filter((u: any) => u.role === 'ETUDIANT');
        const totalAchats = achatsContent.reduce((sum: number, p: any) => sum + (p.montantDebite || 0), 0);
        const totalScolarite = scolariteContent.reduce((sum: number, p: any) => sum + (p.montantDebite || 0), 0);

        return {
          totalBourses: totalAchats,
          totalStudents: etudiants.length, 
          totalBoutiques: results.boutiques.totalElements || results.boutiques.length || 0,
          totalUniversities: results.universites.totalElements || results.universites.length || 0,
          totalTransactions: achatsContent.length + scolariteContent.length,
          totalEligibles: etudiants.filter((e: any) => e.active).length,
          totalPending: 0,
          verificationRate: 100,
          volumeToday: totalAchats + totalScolarite,
          failedTxns: 0,
          successRate: 100
        };
      })
    );
  }

  getFluxMensuel(): Observable<FluxMensuel[]> {
    return forkJoin({
      achats: this.http.get<any>(`${this.apiUrl}/paiements/type/ACHAT`),
      scolarite: this.http.get<any>(`${this.apiUrl}/paiements/type/SCOLARITE`)
    }).pipe(
      map(results => {
        const tousLesPaiements = [
          ...(results.achats?.content || results.achats || []),
          ...(results.scolarite?.content || results.scolarite || [])
        ];

        const fluxParMois: { [key: string]: FluxMensuel } = {};

        tousLesPaiements.forEach(p => {
          const date = new Date(p.date);
          const mois = date.toLocaleString('fr-FR', { month: 'short' });
          if (!fluxParMois[mois]) {
            fluxParMois[mois] = { mois, bourses: 0, remboursements: 0 };
          }
          if (p.typePaiement === 'SCOLARITE') {
            fluxParMois[mois].bourses += (p.montantDebite || 0);
          } else {
            fluxParMois[mois].remboursements += (p.montantDebite || 0);
          }
        });

        return Object.values(fluxParMois);
      })
    );
  }
}
