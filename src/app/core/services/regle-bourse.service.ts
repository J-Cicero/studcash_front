import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegleBourseDbsRequest {
    codeRegle: string;
    typeRegle: string;
    valeurCritere: number;
    montantBourse: number;
    anneeApplication?: string;
    estActif: boolean;
    description: string;
}

export interface RegleBourseDbsResponse {
    trackingId: string;
    codeRegle: string;
    typeRegle: string;
    valeurCritere: number;
    montantBourse: number;
    anneeApplication?: string;
    estActif: boolean;
    description: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegleBourseService {
  private apiUrl = `${environment.apiUrl}/regles-bourse-dbs`;
  private http = inject(HttpClient);

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  saveOrUpdate(request: RegleBourseDbsRequest): Observable<RegleBourseDbsResponse> {
    return this.http.post<RegleBourseDbsResponse>(this.apiUrl, request);
  }
}
