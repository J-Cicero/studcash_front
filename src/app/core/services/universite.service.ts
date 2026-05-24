import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Universite, UniversiteRequest, Page } from '../models/universite.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UniversiteService {
  private apiUrl = `${environment.apiUrl}/universites`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 20): Observable<Page<Universite>> {
    return this.http.get<Page<Universite>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getById(trackingId: string): Observable<Universite> {
    return this.http.get<Universite>(`${this.apiUrl}/${trackingId}`);
  }

  create(universite: UniversiteRequest): Observable<Universite> {
    return this.http.post<Universite>(this.apiUrl, universite);
  }

  getSummaryStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/summary-stats`);
  }

  getByTrackingId(id: string): Observable<Universite> {
    return this.http.get<Universite>(`${this.apiUrl}/${id}`);
  }
}
