import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BoutiqueResponse {
  trackingId: string;
  merchantTrackingId: string;
  walletTrackingId: string;
  nomBoutique: string;
  categorieShop: string;
  cheminCarteEDJ: string;
  statutKYC: string;
  latitude: number | null;
  longitude: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {
  private apiUrl = `${environment.apiUrl}/boutiques`;

  constructor(private http: HttpClient) {}

  getAllBoutiques(page: number = 0, size: number = 100): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<any>(this.apiUrl, { params });
  }

  getBoutiqueById(trackingId: string): Observable<BoutiqueResponse> {
    return this.http.get<BoutiqueResponse>(`${this.apiUrl}/${trackingId}`);
  }
}
