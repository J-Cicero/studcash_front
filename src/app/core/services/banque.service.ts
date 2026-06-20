import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CompteBancaire {
  trackingId?: string;
  bankTrackingId: string;
  bankName?: string;
  ribDocumentTrackingId?: string;
  proprietaireTrackingId?: string;
  typeProprietaire: string;
  accountNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class BanqueService {
  private apiUrl = `${environment.apiUrl}/banques`;

  constructor(private http: HttpClient) {
    console.log('BanqueService apiUrl:', this.apiUrl);
  }

  getComptesGns(): Observable<CompteBancaire[]> {
    return this.http.get<CompteBancaire[]>(`${this.apiUrl}/comptes-gns`);
  }

  getAllBanques(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}`);
  }

  createBanque(banque: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, banque);
  }

  saveCompteGns(compte: CompteBancaire): Observable<CompteBancaire> {
    return this.http.post<CompteBancaire>(`${this.apiUrl}/comptes-gns`, compte);
  }

  deleteCompteGns(trackingId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comptes-gns/${trackingId}`);
  }

  uploadRib(file: File): Observable<{ trackingId: string; urlFichier: string; message: string }> {
    const formData = new FormData();
    formData.append('fichier', file);
    return this.http.post<{ trackingId: string; urlFichier: string; message: string }>(
      `${this.apiUrl}/upload-rib`,
      formData
    );
  }


  uploadRibDocument(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload-rib`, data);
  }
}
