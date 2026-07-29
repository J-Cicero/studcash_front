import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentEtudiantService {
  private apiUrl = `${environment.apiUrl}/students/documents`;

  constructor(private http: HttpClient) {}

  uploadDocument(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload`, data);
  }

  findByInscriptionId(inscriptionId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inscription/${inscriptionId}`);
  }

  findByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  findByStudentId(studentId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/student/${studentId}`);
  }

  updateDocumentStatus(trackingId: string, status: 'VALIDE' | 'REJETE', rejectionReason?: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/api/admin-banque/documents/students/${trackingId}/status`, {
      status,
      rejectionReason
    });
  }
}
