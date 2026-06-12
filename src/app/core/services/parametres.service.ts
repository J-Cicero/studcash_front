import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Parametre {
  trackingId?: string;
  nomParametre: string;
  valeurParametre: string;
  description: string;
  estActif?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class ParametresService {
  
  constructor(private http: HttpClient) {
    console.log('ParametresService environment.apiUrl:', environment.apiUrl);
  }

  getParametresGns(): Observable<PaginatedResponse<Parametre>> {
    return this.http.get<PaginatedResponse<Parametre>>(`${environment.apiUrl}/parametres-gns?size=100`);
  }

  saveParametreGns(param: Parametre): Observable<Parametre> {
    return this.http.post<Parametre>(`${environment.apiUrl}/parametres-gns`, param);
  }
}
