import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CardRequest, CardResponse } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = `${environment.apiUrl}/cards`; // Base URL for card operations

  constructor(private http: HttpClient) {}

  createCard(studentTrackingId: string, request: CardRequest): Observable<CardResponse> {
    // The backend actually maps to /cards without studentTrackingId in the URL
    return this.http.post<CardResponse>(this.apiUrl, request);
  }

  getCardsByStudent(studentTrackingId: string): Observable<CardResponse[]> {
    return this.http.get<CardResponse[]>(`${this.apiUrl}/student/${studentTrackingId}`);
  }

  getCards(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  findByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  update(trackingId: any, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${trackingId}`, data);
  }

  delete(trackingId: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${trackingId}`);
  }

  getStatutCardstatus(cardStatus: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statut/${cardStatus}`);
  }

  declareLost(trackingId: any, data?: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${trackingId}/declare-lost`, data || {});
  }
}
