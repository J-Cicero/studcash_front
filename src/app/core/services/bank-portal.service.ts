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
  inscritAnnuel: boolean;
  inscritDefinitif: boolean;
  walletTrackingId?: string;
  walletStatus?: string;
  numeroCompte: string;
}

export interface UniversityReversementInfo {
  universityTrackingId: string;
  nomUniversite: string;
  codeUniversite: string;
  montantTotalScolarite: number;
  numeroCompteVirement: string;
}

export interface BanqueInfo {
  trackingId: string;
  code: string;
  nom: string;
  logoUrl?: string;
  compteCentralGns?: string;
}

export interface BoutiqueLiquidationInfo {
  boutiqueTrackingId: string;
  nomBoutique: string;
  categorieShop: string;
  numeroCompte: string;
  soldeWallet: number;
  proprietaireNom: string;
  walletTrackingId?: string;
  walletStatus?: string;
  merchantTrackingId?: string;
}

export interface BankFinancialSummary {
  totalScolariteUniversites: number;
  totalDepensesAchats: number;
  totalCommissionsAchats: number;
  totalNetCommercants: number;
  totalCommissionsBanque?: number;
  monthlyProfits?: number[];
}

export interface VenteNonLiquidee {
  trackingId: string;
  date: string;
  montant: number;
  etudiantNom: string;
  etudiantPrenom: string;
}

export interface StudentDepense {
  trackingId: string;
  date: string;
  montant: number;
  boutiqueNom: string;
}

@Injectable({
  providedIn: 'root'
})
export class BankPortalService {
  private apiUrl = `${environment.apiUrl}/bank-portal`;

  constructor(private http: HttpClient) {
    console.log('BankPortalService apiUrl:', this.apiUrl);
  }

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

  getBoutiques(bankOperatorTrackingId: string): Observable<BoutiqueLiquidationInfo[]> {
    const params = new HttpParams().set('bankOperatorTrackingId', bankOperatorTrackingId);
    return this.http.get<BoutiqueLiquidationInfo[]>(`${this.apiUrl}/boutiques`, { params });
  }

  liquidateBoutique(boutiqueTrackingId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/boutiques/${boutiqueTrackingId}/liquidate`, null);
  }

  updateBoutiqueAccountNumber(boutiqueTrackingId: string, numeroCompte: string): Observable<any> {
    const params = new HttpParams().set('numeroCompte', numeroCompte);
    return this.http.post(`${this.apiUrl}/boutiques/${boutiqueTrackingId}/account-number`, null, { params });
  }

  updateBanqueLogo(bankOperatorTrackingId: string, logoUrl: string): Observable<any> {
    const params = new HttpParams().set('bankOperatorTrackingId', bankOperatorTrackingId).set('logoUrl', logoUrl);
    return this.http.post(`${this.apiUrl}/info/logo`, null, { params });
  }

  getBoutiqueVersements(bankOperatorTrackingId: string): Observable<BoutiqueVersementInfo[]> {
    const params = new HttpParams().set('bankOperatorTrackingId', bankOperatorTrackingId);
    return this.http.get<BoutiqueVersementInfo[]>(`${this.apiUrl}/boutiques/versements`, { params });
  }

  getVentesNonLiquidees(boutiqueTrackingId: string): Observable<VenteNonLiquidee[]> {
    return this.http.get<VenteNonLiquidee[]>(`${this.apiUrl}/boutiques/${boutiqueTrackingId}/ventes-non-liquidees`);
  }

  validerLiquidation(trackingId: string, referenceVirement: string): Observable<any> {
    const params = new HttpParams().set('referenceVirement', referenceVirement);
    return this.http.patch(`${environment.apiUrl}/liquidations/${trackingId}/valider`, null, { params });
  }

  getStudentDepenses(studentTrackingId: string): Observable<StudentDepense[]> {
    return this.http.get<StudentDepense[]>(`${this.apiUrl}/students/${studentTrackingId}/depenses`);
  }
}

export interface BoutiqueVersementInfo {
  versementTrackingId: string;
  nomBoutique: string;
  proprietaireNom: string;
  numeroCompte: string;
  montantVerse: number;
  dateVersement: string;
  typeVersement: string;
  statut: string;
}
