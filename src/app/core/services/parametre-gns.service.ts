import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ParametreGnsResponse, ParametreGnsRequest, TypeParametreGns } from '../models/gns-admin.model';
import { Page } from '../models/gns-admin.model';

@Injectable({
  providedIn: 'root'
})
export class ParametreGnsService {
  private apiUrl = `${environment.apiUrl}/parametres-gns`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 20): Observable<Page<ParametreGnsResponse>> {
    return this.http.get<Page<ParametreGnsResponse>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getByType(type: TypeParametreGns): Observable<ParametreGnsResponse> {
    return this.http.get<ParametreGnsResponse>(`${this.apiUrl}/type/${type}`);
  }

  saveOrUpdate(request: ParametreGnsRequest): Observable<ParametreGnsResponse> {
    return this.http.post<ParametreGnsResponse>(this.apiUrl, request);
  }
}
