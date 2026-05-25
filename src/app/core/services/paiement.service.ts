import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaiementResponse, Page } from '../models/gns-admin.model';

export type { PaiementResponse, Page } from '../models/gns-admin.model';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private apiUrl = `${environment.apiUrl}/paiements`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 20): Observable<Page<PaiementResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<PaiementResponse>>(this.apiUrl, { params });
  }

  getByStatut(statut: string, page: number = 0, size: number = 20): Observable<Page<PaiementResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<PaiementResponse>>(`${this.apiUrl}/statut/${statut}`, { params });
  }

  getByUniversite(univId: string, page: number = 0, size: number = 20): Observable<Page<PaiementResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<PaiementResponse>>(`${this.apiUrl}/universite/${univId}`, { params });
  }
}
