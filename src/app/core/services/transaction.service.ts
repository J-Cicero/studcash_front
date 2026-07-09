import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TransactionResponse {
  trackingId: string;
  senderTrackingId: string;
  receiverTrackingId: string;
  senderName: string;
  receiverName: string;
  amount: number;
  amountDebited: number;
  amountCredited: number;
  totalCommission: number;
  gnsCommission: number;
  bankCommission: number;
  isCommissionPaid: boolean;
  status: string; 
  createdAt: string; 
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {
    console.log('TransactionService apiUrl:', this.apiUrl);
  }

  findAll(page: number = 0, size: number = 50): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  getGlobalStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/global`);
  }

  getChartStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/chart`);
  }

  getVolumeValide(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/volume-valide`);
  }


  findByTrackingId(trackingId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${trackingId}`);
  }

  findByBoutiqueId(boutiqueId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/boutique/${boutiqueId}`);
  }

  findByStudentId(studentId: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/student/${studentId}`);
  }
}
