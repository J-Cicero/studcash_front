import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GlobalStats {
  totalStudents: number;
  totalBoutiques: number;
  totalUniversities: number;
  totalGnsCommission: number;
  totalBankCommission: number;
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
      users: this.http.get<any>(`${this.apiUrl}/users/all`).pipe(catchError(() => of({ content: [] }))),
      boutiques: this.http.get<any>(`${this.apiUrl}/boutiques`).pipe(catchError(() => of({ totalElements: 0 }))),
      universites: this.http.get<any>(`${this.apiUrl}/universites`).pipe(catchError(() => of({ totalElements: 0 }))),
      transactions: this.http.get<any>(`${this.apiUrl}/transactions/stats/global`).pipe(catchError(() => of(null)))
    }).pipe(
      map(results => {
        const usersContent = results.users?.content || [];
        const etudiants = usersContent.filter((u: any) => u.role === 'ETUDIANT');

        return {
          totalStudents: etudiants.length, 
          totalBoutiques: results.boutiques?.totalElements || results.boutiques?.length || 0,
          totalUniversities: results.universites?.totalElements || results.universites?.length || 0,
          totalGnsCommission: results.transactions?.totalGnsCommission || 0,
          totalBankCommission: results.transactions?.totalBankCommission || 0
        };
      })
    );
  }

  // getFluxMensuel() removed as its backend endpoint is no longer compatible or available
}
