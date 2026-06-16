import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ScolariteYear {
  trackingId?: string;
  label: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  isClosed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ScolariteYearService {
  private apiUrl = `${environment.apiUrl}/scolarite-years`;

  constructor(private http: HttpClient) {
    console.log('ScolariteYearService apiUrl:', this.apiUrl);
  }

  getAll(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getActiveYear(): Observable<ScolariteYear> {
    return this.http.get<ScolariteYear>(`${this.apiUrl}/active`);
  }

  create(data: ScolariteYear): Observable<ScolariteYear> {
    return this.http.post<ScolariteYear>(this.apiUrl, data);
  }

  cloturer(trackingId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${trackingId}/cloturer`, {});
  }

  cloturerEtOuvrirNouvelle(oldTrackingId: string, data: ScolariteYear): Observable<ScolariteYear> {
    return this.http.post<ScolariteYear>(`${this.apiUrl}/${oldTrackingId}/cloturer`, data);
  }
}
