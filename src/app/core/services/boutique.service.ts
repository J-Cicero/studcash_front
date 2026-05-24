import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BoutiqueResponse {
  trackingId: string;
  nomBoutique: string;
  contactEmail: string;
  telephone: string;
  adresse: string;
  statutKYC: string;
  walletTrackingId: string;
  merchantTrackingId: string;
  
  // Flattened for easy UI access if needed
  solde?: number;
  plafond?: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {
  private apiUrl = `${environment.apiUrl}/boutiques`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 10): Observable<Page<BoutiqueResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<BoutiqueResponse>>(this.apiUrl, { params });
  }

  getAlertesQuota(seuil: number = 0.10, page: number = 0, size: number = 10): Observable<Page<BoutiqueResponse>> {
    const params = new HttpParams()
      .set('seuil', seuil.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<BoutiqueResponse>>(`${this.apiUrl}/alertes-quota`, { params });
  }

  getById(trackingId: string): Observable<BoutiqueResponse> {
    return this.http.get<BoutiqueResponse>(`${this.apiUrl}/${trackingId}`);
  }
}
