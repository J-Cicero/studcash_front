import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Configured correctly with backend API
  private apiUrl = 'http://localhost:8081/api/users';
  
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  public get currentUserValue(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('currentUser', JSON.stringify(response));
            localStorage.setItem('token', response.token);
            this.currentUserSubject.next(response);
          }
        })
      );
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, request);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUserSubject.next(JSON.parse(userJson));
    }
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public hasRole(role: string): boolean {
    const user = this.currentUserValue;
    if (!user || !user.rolesList) return false;
    return user.rolesList.includes(role) || user.rolesList.includes(`ROLE_${role}`);
  }
}
