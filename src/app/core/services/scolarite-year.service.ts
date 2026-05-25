import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ScolariteYear, ScolariteYearRequest } from '../models/gns-admin.model';

export type { ScolariteYear, ScolariteYearRequest } from '../models/gns-admin.model';

@Injectable({
  providedIn: 'root'
})
export class ScolariteYearService {
  private apiUrl = `${environment.apiUrl}/scolarite-years`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ScolariteYear[]> {
    return this.http.get<ScolariteYear[]>(this.apiUrl);
  }

  getActive(): Observable<ScolariteYear> {
    return this.http.get<ScolariteYear>(`${this.apiUrl}/active`);
  }

  create(scolariteYear: ScolariteYearRequest): Observable<ScolariteYear> {
    return this.http.post<ScolariteYear>(this.apiUrl, scolariteYear);
  }
}
