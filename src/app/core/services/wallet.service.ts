import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WalletResponse {
  trackingId: string;
  typeWallet: string;
  statutWallet: string;
  niveauSolde: string;
  solde: number;
  plafond: number;
  estVerrouille: boolean;
  dateCreation: string;
  ownerName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = `${environment.apiUrl}/wallets`;

  constructor(private http: HttpClient) {}

  filterWallets(typeWallet?: string, niveauSolde?: string, page: number = 0, size: number = 50): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (typeWallet && typeWallet !== 'ALL') {
      params = params.set('typeWallet', typeWallet);
    }
    if (niveauSolde && niveauSolde !== 'ALL') {
      params = params.set('niveauSolde', niveauSolde);
    }

    return this.http.get<any>(`${this.apiUrl}/filter`, { params });
  }

  getByTrackingId(trackingId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  updateWallet(trackingId: string, request: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${trackingId}`, request);
  }
}
