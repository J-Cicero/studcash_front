import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StudentResponse {
  id: number;
  trackingId: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  statutKYC: string;
  niveauEtude: string;
  estActif: boolean;
  universiteTrackingId: string;
  walletTrackingId: string;
}

export interface DocumentResponse {
  id: number;
  typeDocument: string;
  urlDocument: string;
  cloudinaryId: string;
  valide: boolean;
  dateUpload: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {
    console.log('StudentService apiUrl:', this.apiUrl);
  }

  findAll(page: number = 0, size: number = 20): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  findByStatutKYC(statut: string, page: number = 0, size: number = 20): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/kyc/${statut}`, { params });
  }

  getInscriptionDocuments(inscriptionId: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/documents/inscription/${inscriptionId}`);
  }

  getDocumentById(trackingId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/documents/${trackingId}`);
  }

  getStudentDocuments(trackingId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/admin/students/${trackingId}/documents`);
  }

  verifyPin(trackingId: string, pinCode: string): Observable<any> {
    let params = new HttpParams().set('pinCode', pinCode);
    return this.http.post<any>(`${this.apiUrl}/${trackingId}/verify-pin`, null, { params });
  }



  getTotalStudents(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/total`);
  }


  uploadDocument(trackingId: any, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${trackingId}/documents/upload`, data);
  }

  getDocuments(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}/documents`);
  }

  findByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  update(trackingId: any, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${trackingId}`, data);
  }

  assignerMatricule(trackingId: any, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${trackingId}/matricule`, data);
  }

  delete(trackingId: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${trackingId}`);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getCard(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}/card`);
  }
}
