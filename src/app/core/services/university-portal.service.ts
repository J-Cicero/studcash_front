import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { WalletService } from './wallet.service';

export interface UniversityAdminProfile {
  trackingId: string;
  email: string;
  nom: string;
  prenom: string;
  estActif: boolean;
  telephone: string;
  numeroCompte: string;
  walletTrackingId: string;
  universiteTrackingId: string;
}

@Injectable({
  providedIn: 'root'
})
export class UniversityPortalService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private walletService: WalletService
  ) {}

  /** Get the university admin profile (gives universiteTrackingId + walletTrackingId) */
  getMyProfile(): Observable<UniversityAdminProfile> {
    const user = this.authService.currentUserValue;
    return this.http.get<UniversityAdminProfile>(`${this.baseUrl}/admin-university/${user?.trackingId}`);
  }

  /** Get university details */
  getUniversite(universiteTrackingId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/universites/${universiteTrackingId}`);
  }

  /** Get wallet of university */
  getWallet(walletTrackingId: string): Observable<any> {
    return this.walletService.getByTrackingId(walletTrackingId);
  }

  /** Get students of university */
  getStudents(universiteTrackingId: string, page = 0, size = 200): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.baseUrl}/students/universite/${universiteTrackingId}`, { params });
  }

  /** Get annual inscriptions of university */
  getInscriptions(universiteTrackingId: string, page = 0, size = 200): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.baseUrl}/inscriptions/universite/${universiteTrackingId}`, { params });
  }

  /** Get scolarite payments for this university */
  getPaiementsScolarite(universiteTrackingId: string, page = 0, size = 100): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.baseUrl}/paiements/universite/${universiteTrackingId}`, { params });
  }

  /** Get banque info for a student via their banqueEtudiantTrackingId */
  getBanqueEtudiant(banqueEtudiantTrackingId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/banque-etudiants/${banqueEtudiantTrackingId}`);
  }

  /** Get all scolarite years */
  getScolariteYears(page = 0, size = 20): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.baseUrl}/scolarite-years`, { params });
  }

  /** Get active scolarite year */
  getActiveScolariteYear(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/scolarite-years/active`);
  }
}
