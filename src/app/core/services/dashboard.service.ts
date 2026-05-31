import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private apiUrl = `${environment.apiUrl}/admins`;

  constructor(private http: HttpClient) {}

  getGlobalStats(): Observable<GlobalStats> {
    return this.http.get<GlobalStats>(`${this.apiUrl}/global-stats`);
  }

  getFluxMensuel(): Observable<FluxMensuel[]> {
    return this.http.get<FluxMensuel[]>(`${this.apiUrl}/flux-mensuel`);
  }
}
