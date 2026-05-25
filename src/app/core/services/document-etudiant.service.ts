import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentEtudiantResponse } from '../models/document-etudiant.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentEtudiantService {
  private apiUrl = `${environment.apiUrl}/documents`;
  private http = inject(HttpClient);

  getByInscription(inscriptionId: string): Observable<DocumentEtudiantResponse[]> {
    return this.http.get<{ content?: DocumentEtudiantResponse[] }>(`${this.apiUrl}/inscription/${inscriptionId}`).pipe(
        map(res => res.content || []) // Handle Page object from backend
    );
  }

    valider(trackingId: string): Observable<DocumentEtudiantResponse> {
      return this.http.put<DocumentEtudiantResponse>(`${this.apiUrl}/${trackingId}`, { statut: 'VALIDE' });
    }

    rejeter(trackingId: string, commentaire: string): Observable<DocumentEtudiantResponse> {
      return this.http.put<DocumentEtudiantResponse>(`${this.apiUrl}/${trackingId}`, { statut: 'REJETE', commentaireRejet: commentaire });
    }
}
