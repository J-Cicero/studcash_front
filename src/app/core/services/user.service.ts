import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {
    console.log('UserService apiUrl:', this.apiUrl);
  }

  getAllUsers(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`, { params: { page: page.toString(), size: size.toString() } });
  }

  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params: { query } });
  }

  deleteUser(trackingId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${trackingId}`);
  }

  updateUserEtat(trackingId: string, etat: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/etat/${trackingId}`, null, { params: { etat: etat.toString() } });
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  createAdminBanque(userData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admins/gns/create-banque-admin`, userData);
  }
}
