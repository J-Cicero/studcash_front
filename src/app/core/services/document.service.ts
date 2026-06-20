import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentResponse } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getDocumentsByOwner(ownerTrackingId: string): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.apiUrl}/owner/${ownerTrackingId}`);
  }


  uploadDocument(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload`, data);
  }

  getDocumentByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  deleteDocument(trackingId: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${trackingId}`);
  }
}
