import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SystemStatusResponse {
  currentStatus: 'INITIALISATION' | 'ACTIVE' | 'CLOSURE_PENDING' | 'CLOSED';
  paymentEnabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SystemStatusService {
  private apiUrl = `${environment.apiUrl}/public/system-status`;

  constructor(private http: HttpClient) {
    console.log('SystemStatusService apiUrl:', this.apiUrl);
  }

  getStatus(): Observable<SystemStatusResponse> {
    return this.http.get<SystemStatusResponse>(this.apiUrl);
  }
}
