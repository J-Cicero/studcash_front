import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StudentLiquidationInfo {
    studentTrackingId: string;
    nom: string;
    prenom: string;
    numEtudiant: string;
    bourseTotale: number;
    depensesStudCash: number;
    resteAPayer: number;
}

@Injectable({
  providedIn: 'root'
})
export class BankPortalService {
  private apiUrl = `${environment.apiUrl}/bank-portal`;
  private http = inject(HttpClient);

  getStudents(operatorId: string): Observable<StudentLiquidationInfo[]> {
    const params = new HttpParams().set('bankOperatorTrackingId', operatorId);
    return this.http.get<StudentLiquidationInfo[]>(`${this.apiUrl}/students`, { params });
  }

  validerMandat(studentId: string, valide: boolean): Observable<any> {
    const params = new HttpParams().set('valide', valide.toString());
    return this.http.post(`${this.apiUrl}/students/${studentId}/valider-mandat`, null, { params });
  }

  marquerTraite(studentId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/students/${studentId}/marquer-traite`, {});
  }
}
