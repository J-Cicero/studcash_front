import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TransactionResponse {
  trackingId: string;
  studentName: string;
  boutiqueName: string;
  montantDebite: number;
  montantNetBoutique: number;
  commissionTotale: number;
  commissionGns: number;
  commissionBanque: number;
  date: string;
  statut: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {
    console.log('TransactionService apiUrl:', this.apiUrl);
  }

  findAll(page: number = 0, size: number = 50): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  getVolumeValide(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/volume-valide`);
  }

  getCommissionsTotales(): Observable<number> {
    // Assuming this endpoint exists or will exist as requested
    return this.http.get<number>(`${this.apiUrl}/stats/commissions-totales`);
  }

  // Fallback for getting stats if needed (from older PaiementService)
  getStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/paiements/stats`);
  }

  getEvolutionTransactions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/evolution`);
  }
}
