import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParametreGnsService {
  private apiUrl = `${environment.apiUrl}/parametres-gns`;

  constructor(private http: HttpClient) {}

  update(trackingId: any, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${trackingId}`, data);
  }

  findByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  findByNom(type: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/type/${type}`);
  }
}
