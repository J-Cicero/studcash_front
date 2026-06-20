import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page.model';
import { UserResponse, AdminBanqueRequest } from '../models/user.model'; // Import UserResponse and AdminBanqueRequest

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {
    console.log('UserService apiUrl:', this.apiUrl);
  }

  getAllUsers(page: number = 0, size: number = 20): Observable<Page<UserResponse>> { // Updated return type
    return this.http.get<Page<UserResponse>>(`${this.apiUrl}/all`, { params: { page: page.toString(), size: size.toString() } });
  }

  searchUsers(query: string): Observable<UserResponse[]> { // Updated return type
    return this.http.get<UserResponse[]>(`${this.apiUrl}/search`, { params: { query } });
  }

  deleteUser(trackingId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${trackingId}`);
  }

  updateUserEtat(trackingId: string, etat: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/etat/${trackingId}`, null, { params: { etat: etat.toString() } });
  }

  // register(userData: any): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/register`, userData);
  // }

  createAdminBanque(userData: AdminBanqueRequest): Observable<any> { // Updated parameter type
    return this.http.post<any>(`${environment.apiUrl}/admins/gns/create-banque-admin`, userData);
  }

  // getMerchantDocuments(trackingId: string): Observable<any> {
  //   // This endpoint is currently missing in the backend
  //   return this.http.get<any>(`${environment.apiUrl}/merchants/documents/merchant/${trackingId}`);
  // }


  createUser(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }

  getGetTrackingid(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/${trackingId}`);
  }

  patchEtatTrackingid(trackingId: any, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/etat/${trackingId}`, data);
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  getSearch(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search`);
  }
}

