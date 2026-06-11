import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UniversiteRequest {
  code: string;
  nom: string;
  ville?: string;
  estActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UniversiteService {
  private apiUrl = `${environment.apiUrl}/universites`;

  constructor(private http: HttpClient) {}

  findAll(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  create(data: UniversiteRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateEtat(trackingId: string, etat: boolean): Observable<any> {
    const params = new HttpParams().set('etat', etat.toString());
    return this.http.patch<any>(`${this.apiUrl}/etat/${trackingId}`, {}, { params });
  }

  getSummaryStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/summary-stats`);
  }
}
