import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StudentLiquidationInfo {
  studentTrackingId: string;
  nom: string;
  prenom: string;
  numEtudiant: string;
  bourseTotale: number;
  depensesStudCash: number;
  resteAPayer: number;
  virementEffectue: boolean;
  typeBourse: string;
  urlSoucheTamponnee: string;
}

export interface UniversityReversementInfo {
  universityTrackingId: string;
  nomUniversite: string;
  codeUniversite: string;
  montantTotalScolarite: number;
}

export interface BanqueInfo {
  trackingId: string;
  code: string;
  nom: string;
}

export interface BankFinancialSummary {
  totalScolariteUniversites: number;
  totalDepensesAchats: number;
  totalCommissionsAchats: number;
  totalNetCommercants: number;
}

@Injectable({
  providedIn: 'root'
})
export class BankPortalService {
  private apiUrl = `${environment.apiUrl}/bank-portal`;

  constructor(private http: HttpClient) {}

  getStudents(bankOperatorTrackingId: string): Observable<StudentLiquidationInfo[]> {
    const params = new HttpParams().set('bankOperatorTrackingId', bankOperatorTrackingId);
    return this.http.get<StudentLiquidationInfo[]>(`${this.apiUrl}/students`, { params });
  }

  validerMandat(studentTrackingId: string, valide: boolean): Observable<any> {
    const params = new HttpParams().set('valide', valide.toString());
    return this.http.post(`${this.apiUrl}/students/${studentTrackingId}/valider-mandat`, null, { params });
  }

  marquerTraite(studentTrackingId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/students/${studentTrackingId}/marquer-traite`, null);
  }

  areWalletsFrozen(): Observable<{ walletsFrozen: boolean }> {
    return this.http.get<{ walletsFrozen: boolean }>(`${this.apiUrl}/are-wallets-frozen`);
  }

  getUniversityReversements(bankOperatorTrackingId: string): Observable<UniversityReversementInfo[]> {
    const params = new HttpParams().set('bankOperatorTrackingId', bankOperatorTrackingId);
    return this.http.get<UniversityReversementInfo[]>(`${this.apiUrl}/reversements`, { params });
  }

  getBanqueInfo(bankOperatorTrackingId: string): Observable<BanqueInfo> {
    const params = new HttpParams().set('bankOperatorTrackingId', bankOperatorTrackingId);
    return this.http.get<BanqueInfo>(`${this.apiUrl}/info`, { params });
  }

  getFinancialSummary(bankOperatorTrackingId: string): Observable<BankFinancialSummary> {
    const params = new HttpParams().set('bankOperatorTrackingId', bankOperatorTrackingId);
    return this.http.get<BankFinancialSummary>(`${this.apiUrl}/summary`, { params });
  }
}
