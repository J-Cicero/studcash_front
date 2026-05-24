import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PretScolariteResponse {
  trackingId: string;
  studentTrackingId: string;
  studentNom: string;
  universiteTrackingId: string;
  universiteNom: string;
  montant: number;
  estRembourse: boolean;
  description: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScolariteService {
  private apiUrl = `${environment.apiUrl}/scolarite`;
  private http = inject(HttpClient);

  getByUniversite(univId: string): Observable<PretScolariteResponse[]> {
    return this.http.get<PretScolariteResponse[]>(`${this.apiUrl}/universite/${univId}`);
  }
}
