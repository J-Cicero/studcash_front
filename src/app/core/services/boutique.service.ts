import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BoutiqueRequest, BoutiqueResponse, Page } from '../models/gns-admin.model';

export type { BoutiqueResponse, BoutiqueRequest, Page } from '../models/gns-admin.model';

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

  create(boutique: BoutiqueRequest): Observable<BoutiqueResponse> {
    return this.http.post<BoutiqueResponse>(this.apiUrl, boutique);
  }
}
