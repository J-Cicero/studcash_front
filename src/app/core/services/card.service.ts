import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CardRequest, CardResponse } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = `${environment.apiUrl}/students`; // Base URL for student-related card operations

  constructor(private http: HttpClient) {}

  createCard(studentTrackingId: string, request: CardRequest): Observable<CardResponse> {
    return this.http.post<CardResponse>(`${this.apiUrl}/${studentTrackingId}/cards`, request);
  }

  getCardsByStudent(studentTrackingId: string): Observable<CardResponse[]> {
    return this.http.get<CardResponse[]>(`${this.apiUrl}/${studentTrackingId}/cards`);
  }
}
