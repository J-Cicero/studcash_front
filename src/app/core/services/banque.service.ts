import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CompteBancaireGns {
  trackingId?: string;
  nomBanque: string;
  codeBanque: string;
  rib: string;
  estActif?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BanqueService {
  private apiUrl = `${environment.apiUrl}/banques`;

  constructor(private http: HttpClient) {
    console.log('BanqueService apiUrl:', this.apiUrl);
  }

  getComptesGns(): Observable<CompteBancaireGns[]> {
    return this.http.get<CompteBancaireGns[]>(`${this.apiUrl}/comptes-gns`);
  }

  getAllBanques(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}`);
  }

  saveCompteGns(compte: CompteBancaireGns): Observable<CompteBancaireGns> {
    return this.http.post<CompteBancaireGns>(`${this.apiUrl}/comptes-gns`, compte);
  }

  deleteCompteGns(trackingId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comptes-gns/${trackingId}`);
  }
}
