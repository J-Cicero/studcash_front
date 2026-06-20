import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admins/gns`;

  constructor(private http: HttpClient) {}

  createBanqueAdmin(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-banque-admin`, data);
  }

  createGnsAdmin(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-gns-admin`, data);
  }
}
