import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GlobalStats {
  totalVolume: number;
  totalCommission: number;
  totalStudents: number;
  totalBoutiques: number;
  totalUniversities: number;
  totalTransactions: number;
}

export interface FluxMensuel {
  mois: string;
  volume: number;
  commissions: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('DashboardService apiUrl:', this.apiUrl);
  }

  getGlobalStats(): Observable<GlobalStats> {
    return forkJoin({
      statsPaiements: this.http.get<any>(`${this.apiUrl}/paiements/stats`).pipe(catchError(() => of({ totalVolume: 0, totalCommission: 0, totalCount: 0 }))),
      users: this.http.get<any>(`${this.apiUrl}/users/all`).pipe(catchError(() => of({ content: [] }))),
      boutiques: this.http.get<any>(`${this.apiUrl}/boutiques`).pipe(catchError(() => of({ totalElements: 0 }))),
      universites: this.http.get<any>(`${this.apiUrl}/universites`).pipe(catchError(() => of({ totalElements: 0 })))
    }).pipe(
      map(results => {
        const usersContent = results.users?.content || [];
        const etudiants = usersContent.filter((u: any) => u.role === 'ETUDIANT');

        return {
          totalVolume: results.statsPaiements?.totalVolume || 0,
          totalCommission: results.statsPaiements?.totalCommission || 0,
          totalStudents: etudiants.length, 
          totalBoutiques: results.boutiques?.totalElements || results.boutiques?.length || 0,
          totalUniversities: results.universites?.totalElements || results.universites?.length || 0,
          totalTransactions: results.statsPaiements?.totalCount || 0
        };
      })
    );
  }

  getFluxMensuel(): Observable<FluxMensuel[]> {
    return this.http.get<any>(`${this.apiUrl}/paiements/type/ACHAT`).pipe(
      catchError(() => of({ content: [] })),
      map(results => {
        const paiements = results.content || [];
        const fluxParMois: { [key: string]: FluxMensuel } = {};

        paiements.forEach((p: any) => {
          const date = new Date(p.date);
          const mois = date.toLocaleString('fr-FR', { month: 'short' });
          if (!fluxParMois[mois]) {
            fluxParMois[mois] = { mois, volume: 0, commissions: 0 };
          }
          fluxParMois[mois].volume += (p.montantDebite || 0);
          fluxParMois[mois].commissions += (p.commission || 0);
        });

        return Object.values(fluxParMois);
      })
    );
  }
}
