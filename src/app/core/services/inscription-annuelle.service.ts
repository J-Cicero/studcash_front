import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InscriptionAnnuelleService {
  private apiUrl = `${environment.apiUrl}/inscriptions`;

  constructor(private http: HttpClient) {}

  findAll(page: number = 0, size: number = 100): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  updateStatus(trackingId: string, statut: string): Observable<any> {
    let params = new HttpParams().set('statut', statut);
    return this.http.patch<any>(`${this.apiUrl}/${trackingId}/statut`, null, { params });
  }
}
