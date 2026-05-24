import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentEtudiantResponse {
    trackingId: string;
    type: string;
    cheminFichier: string;
    statut: string;
    commentaireRejet: string;
    dateDepot: string;
    dateValidation: string;
    donneesExtraites: string;
    scoreFiabilite: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentEtudiantService {
  private apiUrl = `${environment.apiUrl}/documents`;
  private http = inject(HttpClient);

  getByInscription(inscriptionId: string): Observable<DocumentEtudiantResponse[]> {
    return this.http.get<any>(`${this.apiUrl}/inscription/${inscriptionId}`).pipe(
        map(res => res.content || []) // Handle Page object from backend
    );
  }

  valider(trackingId: string): Observable<any> {
      return this.http.put(`${this.apiUrl}/${trackingId}`, { statut: 'VALIDE' });
  }

  rejeter(trackingId: string, commentaire: string): Observable<any> {
      return this.http.put(`${this.apiUrl}/${trackingId}`, { statut: 'REJETE', commentaireRejet: commentaire });
  }
}
