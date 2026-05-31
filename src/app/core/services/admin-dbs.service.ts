import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StudentDbsStatsResponse {
  trackingId: string;
  nom: string;
  prenom: string;
  numEtudiantUniv: string;
  universiteNom: string;
  typeBourse: string;
  argentDepense: number;
  paiementScolariteFait: boolean;
  montantScolarite: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDbsService {
  private apiUrl = `${environment.apiUrl}/admin-dbs`;

  constructor(private http: HttpClient) {}

  getStudentStats(page: number = 0, size: number = 50): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/students/stats`, { params });
  }
}
