import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentLiquidationInfo } from '../models/bank-portal.model';

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

  validerMandat(studentId: string, valide: boolean): Observable<void> {
    const params = new HttpParams().set('valide', valide.toString());
    return this.http.post<void>(`${this.apiUrl}/students/${studentId}/valider-mandat`, null, { params });
  }

  marquerTraite(studentId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/students/${studentId}/marquer-traite`, {});
  }
}
