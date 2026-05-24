import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InscriptionAnnuelleResponse {
  trackingId: string;
  studentTrackingId: string;
  studentNom: string;
  studentPrenom: string;
  numEtudiantUniv: string;
  anneeAcademique: string;
  niveau: string;
  creditsTotalValides: number;
  moyenneBac: number;
  estBoursier: boolean;
  typeBourse: string;
  statut: string;
  source: string;
  dateActivation: string;
  plafondAccorde: number;
  estInscritDefinitif: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = `${environment.apiUrl}/inscriptions`;
  private http = inject(HttpClient);

  getByUniversite(univId: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/universite/${univId}`, { params });
  }

  getByStatut(statut: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/statut/${statut}`, { params });
  }
}
