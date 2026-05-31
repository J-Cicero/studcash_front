import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Parametre {
  nomParametre: string;
  valeurParametre: string;
  description: string;
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
  
  constructor(private http: HttpClient) {}

  getParametresGns(): Observable<PaginatedResponse<Parametre>> {
    return this.http.get<PaginatedResponse<Parametre>>(`${environment.apiUrl}/parametres-gns?size=100`);
  }

  saveParametreGns(nomParametre: string, valeurParametre: string): Observable<Parametre> {
    return this.http.post<Parametre>(`${environment.apiUrl}/parametres-gns`, { nomParametre, valeurParametre });
  }

  getParametresDbs(): Observable<PaginatedResponse<Parametre>> {
    return this.http.get<PaginatedResponse<Parametre>>(`${environment.apiUrl}/parametres-dbs?size=100`);
  }

  saveParametreDbs(nomParametre: string, valeurParametre: string): Observable<Parametre> {
    return this.http.post<Parametre>(`${environment.apiUrl}/parametres-dbs`, { nomParametre, valeurParametre });
  }
}
