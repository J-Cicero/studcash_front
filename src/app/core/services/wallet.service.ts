import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WalletResponse } from '../models/gns-admin.model';

export type { WalletResponse } from '../models/gns-admin.model';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = `${environment.apiUrl}/wallets`;

  constructor(private http: HttpClient) {}

  getById(trackingId: string): Observable<WalletResponse> {
    return this.http.get<WalletResponse>(`${this.apiUrl}/${trackingId}`);
  }
}
