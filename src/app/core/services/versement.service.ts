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

  create(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  masseEtudiants(request: MassVersementEtudiantRequest): Observable<any> {
    const params: any = { scolariteYearTrackingId: request.scolariteYearTrackingId };
    if (request.montantFixe) params.montantFixe = request.montantFixe;
    return this.http.post(`${this.apiUrl}/masse/etudiants`, null, { params });
  }

  masseBoutiques(request: MassVersementBoutiqueRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/masse/boutiques`, null, { params: request as any });
  }

  previewMasseEtudiants(scolariteYearTrackingId: string): Observable<any> {
    const params = { scolariteYearTrackingId };
    return this.http.get<any>(`${this.apiUrl}/masse/preview/etudiants`, { params });
  }

  previewMasseBoutiques(seuil: number): Observable<any> {
    const params = { seuil: seuil.toString() };
    return this.http.get<any>(`${this.apiUrl}/masse/preview/boutiques`, { params });
  }

  resetMasseEtudiants(request: MassResetEtudiantRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/masse/reset/etudiants`, null, { params: request as any });
  }

  resetMasseBoutiques(request: MassResetBoutiqueRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/masse/reset/boutiques`, null, { params: request as any });
  }
}
