import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentAdminService {
  private apiUrl = `${environment.apiUrl}/api/admin/students`;

  constructor(private http: HttpClient) {}

  getDocumentsByStudent(studentTrackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${studentTrackingId}/documents`);
  }
}
