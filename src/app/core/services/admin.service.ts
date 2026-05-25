import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminGlobalStats, FluxMensuelStat } from '../models/gns-admin.model';

export type { AdminGlobalStats, FluxMensuelStat } from '../models/gns-admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admins`;

  constructor(private http: HttpClient) {}

  getGlobalStats(): Observable<AdminGlobalStats> {
    return this.http.get<AdminGlobalStats>(`${this.apiUrl}/global-stats`);
  }

  getFluxMensuel(): Observable<FluxMensuelStat[]> {
    return this.http.get<FluxMensuelStat[]>(`${this.apiUrl}/flux-mensuel`);
  }
}
