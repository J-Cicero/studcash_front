import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRequest } from '../models/user.model';
import { Page } from '../models/universite.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 20): Observable<Page<User>> {
    return this.http.get<Page<User>>(`${this.apiUrl}/all?page=${page}&size=${size}`);
  }

  getById(trackingId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/get/${trackingId}`);
  }

  register(user: UserRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  registerUniversityAdmin(admin: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin-university`, admin);
  }

  registerBankOperator(operator: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/bank-operator`, operator);
  }

  updateEtat(trackingId: string, etat: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/etat/${trackingId}?etat=${etat}`, {});
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
}
