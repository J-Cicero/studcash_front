import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ConfigurationGns {
  trackingId: string;
  cle: string;
  valeur: string;
  description: string;
  estModifiable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private apiUrl = `${environment.apiUrl}/configurations`; // Check backend mapping

  constructor(private http: HttpClient) {}

  getAll(): Observable<ConfigurationGns[]> {
    return this.http.get<ConfigurationGns[]>(this.apiUrl);
  }

  update(cle: string, valeur: string): Observable<ConfigurationGns> {
    return this.http.put<ConfigurationGns>(`${this.apiUrl}/${cle}`, { valeur });
  }
}
