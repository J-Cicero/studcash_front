import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentRequisRequest {
  niveau: string;
  typeDocument: string;
  obligatoire: boolean;
  estActif: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentRequisService {
  private apiUrl = `${environment.apiUrl}/documents-requis`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  create(data: DocumentRequisRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  delete(trackingId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${trackingId}`);
  }
}
