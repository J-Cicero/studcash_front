import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WalletResponse {
  trackingId: string;
  typeWallet: string;
  statutWallet: string;
  solde: number;
  plafond: number;
  dateCreation: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = `${environment.apiUrl}/wallets`;

  constructor(private http: HttpClient) {}

  getById(trackingId: string): Observable<WalletResponse> {
    return this.http.get<WalletResponse>(`${this.apiUrl}/${trackingId}`);
  }
}
