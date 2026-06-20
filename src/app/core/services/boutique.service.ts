import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BoutiqueResponse {
  trackingId: string;
  merchantTrackingId: string;
  walletTrackingId: string;
  name: string;
  description: string;
  kycStatus: string;
  latitude: number | null;
  longitude: number | null;
  balance: number;
  limitAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {
  private apiUrl = `${environment.apiUrl}/boutiques`;

  constructor(private http: HttpClient) {
    console.log('BoutiqueService apiUrl:', this.apiUrl);
  }

  getAllBoutiques(page: number = 0, size: number = 100): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<any>(this.apiUrl, { params });
  }

  getBoutiqueById(trackingId: string): Observable<BoutiqueResponse> {
    return this.http.get<BoutiqueResponse>(`${this.apiUrl}/${trackingId}`);
  }

  getLowQuotaCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/low-quota-count`);
  }


  findByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  updateTrackingid(trackingId: any, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${trackingId}`, data);
  }

  delete(trackingId: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${trackingId}`);
  }

  getMerchantMerchanttrackingid(merchantTrackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/merchant/${merchantTrackingId}`);
  }

  getWalletWallettrackingid(walletTrackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/wallet/${walletTrackingId}`);
  }

  getKycStatutkyc(statutKYC: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/kyc/${statutKYC}`);
  }

  getBoutiquesEnAlerte(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/alertes-quota`);
  }
}
