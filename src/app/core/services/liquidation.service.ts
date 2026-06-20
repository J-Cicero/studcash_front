import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Liquidation {
  trackingId: string;
  boutiqueName: string;
  montantALiquider: number;
  dateCreation: Date;
  statut: 'EN_ATTENTE' | 'PAYE';
  referenceVirement?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LiquidationService {
  private apiUrl = `${environment.apiUrl}/liquidations`;

  constructor(private http: HttpClient) {
    console.log('LiquidationService apiUrl:', this.apiUrl);
  }

  findAll(): Observable<Liquidation[]> {
    return this.http.get<Liquidation[]>(this.apiUrl);
  }

  validerLiquidation(trackingId: string, referenceVirement: string): Observable<Liquidation> {
    return this.http.patch<Liquidation>(`${this.apiUrl}/${trackingId}/valider?referenceVirement=${referenceVirement}`, {});
  }

  getPendingTotal(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/pending-total`);
  }


  findByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  findByBoutiqueId(boutiqueId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/boutique/${boutiqueId}`);
  }
}
