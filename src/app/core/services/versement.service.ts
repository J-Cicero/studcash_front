import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MassVersementEtudiantRequest {
  scolariteYearTrackingId: string;
  montantFixe?: number;
}

export interface MassVersementBoutiqueRequest {
  seuil: number;
  montantQuota: number;
}

export interface MassResetEtudiantRequest {
  scolariteYearTrackingId: string;
}

export interface MassResetBoutiqueRequest {
  scolariteYearTrackingId: string;
}

@Injectable({
  providedIn: 'root'
})
export class VersementService {
  private apiUrl = `${environment.apiUrl}/versements`;

  constructor(private http: HttpClient) {}

  masseEtudiants(request: MassVersementEtudiantRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/masse/etudiants`, request, { responseType: 'text' });
  }

  masseBoutiques(request: MassVersementBoutiqueRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/masse/boutiques`, request, { responseType: 'text' });
  }

  resetMasseEtudiants(request: MassResetEtudiantRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/masse/reset/etudiants`, request, { responseType: 'text' });
  }

  resetMasseBoutiques(request: MassResetBoutiqueRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/masse/reset/boutiques`, request, { responseType: 'text' });
  }
}
