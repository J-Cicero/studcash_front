import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaiementResponse {
  trackingId: string;
  commandeTrackingId: string;
  walletTrackingId: string;
  commission: number;
  montantDebite: number;
  montantNetBoutique: number;
  date: string;
  typePaiement: string;
  statutPaiement: string;
  senderName?: string;
  receiverName?: string;
  receiverType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private apiUrl = `${environment.apiUrl}/paiements`;

  constructor(private http: HttpClient) {
    console.log('PaiementService apiUrl:', this.apiUrl);
  }

  create(data: any): Observable<PaiementResponse> {
    return this.http.post<PaiementResponse>(this.apiUrl, data);
  }

  processQrPayment(data: any): Observable<PaiementResponse> {
    return this.http.post<PaiementResponse>(`${this.apiUrl}/qr-payment`, data);
  }

  findAll(page: number = 0, size: number = 50): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  findByType(typePaiement: string, page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/type/${typePaiement}`, { params });
  }

  findByStatut(statut: string, page: number = 0, size: number = 50): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/statut/${statut}`, { params });
  }

  getVolumeValideJour(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/transactions/stats/volume-valide`);
  }

  getEvolutionTransactions(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/transactions/stats/evolution`);
  }
}
