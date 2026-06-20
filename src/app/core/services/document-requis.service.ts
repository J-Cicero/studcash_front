import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentRequisRequest {
  typeDocument: string;
  studentNiveau: string;
  required: boolean;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentRequisService {
  private apiUrl = `${environment.apiUrl}/documents-requis`;

  constructor(private http: HttpClient) {
    console.log('DocumentRequisService apiUrl:', this.apiUrl);
    console.log('DocumentRequisService environment.apiUrl:', environment.apiUrl);
    console.log('DocumentRequisService apiUrl:', this.apiUrl);
  }

  findAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  create(data: DocumentRequisRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  delete(trackingId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${trackingId}`);
  }


  getDocumentRequisByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  getDocumentRequisByType(typeDocument: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/type/${typeDocument}`);
  }

  deleteDocumentRequis(trackingId: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${trackingId}`);
  }
}
