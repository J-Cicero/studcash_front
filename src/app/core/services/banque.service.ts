import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Banque } from '../models/banque.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BanqueService {
  private apiUrl = `${environment.apiUrl}/api/banques`;

  constructor(private http: HttpClient) {}

  getAllBanques(): Observable<Banque[]> {
    return this.http.get<Banque[]>(this.apiUrl);
  }
}
