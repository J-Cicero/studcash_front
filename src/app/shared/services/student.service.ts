import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StudentResponse {
  trackingId: string;
  email: string;
  nom: string;
  prenom: string;
  estActif: boolean;
  telephone: string;
  dateNaissance: string;
  numEtudiantUniv: string;
  statutKYC: string;
  walletTrackingId: string;
  solde: number;
  banqueEtudiantTrackingId: string;
  universiteTrackingId: string;
  universiteNom: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getStudents(page: number = 0, size: number = 10): Observable<Page<StudentResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<StudentResponse>>(this.apiUrl, { params });
  }

  getStudentByTrackingId(trackingId: string): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.apiUrl}/${trackingId}`);
  }

  deleteStudent(trackingId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${trackingId}`);
  }

  getStudentsByUniversite(univId: string, page: number = 0, size: number = 10): Observable<Page<StudentResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<StudentResponse>>(`${this.apiUrl}/universite/${univId}`, { params });
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  createStudent(studentData: any): Observable<StudentResponse> {
    return this.http.post<StudentResponse>(this.apiUrl, studentData);
  }
}
