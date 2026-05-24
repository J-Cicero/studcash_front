import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VersementService {
  private apiUrl = `${environment.apiUrl}/versements`;

  constructor(private http: HttpClient) {}

  disburseMassStudents(yearTrackingId: string, montantFixe?: number): Observable<any> {
    let params = new HttpParams().set('scolariteYearTrackingId', yearTrackingId);
    if (montantFixe) {
      params = params.set('montantFixe', montantFixe.toString());
    }
    return this.http.post(`${this.apiUrl}/masse/etudiants`, null, { params });
  }

  rechargeMassBoutiques(seuil: number, montantQuota: number): Observable<any> {
    const params = new HttpParams()
      .set('seuil', seuil.toString())
      .set('montantQuota', montantQuota.toString());
    return this.http.post(`${this.apiUrl}/masse/boutiques`, null, { params });
  }

  getAll(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(this.apiUrl, { params });
  }

  getByWallet(walletId: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/wallet/${walletId}`, { params });
  }
}
