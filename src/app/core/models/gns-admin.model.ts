export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ScolariteYear {
  trackingId: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  estOuverte: boolean;
  estCloturee?: boolean;
}

export interface ScolariteYearRequest {
  libelle: string;
  dateDebut: string;
  dateFin: string;
  estOuverte: boolean;
}

export interface ConfigurationGns {
  trackingId: string;
  cle: string;
  valeur: string;
  description: string;
  estModifiable: boolean;
}

export interface BoutiqueResponse {
  trackingId: string;
  nomBoutique: string;
  contactEmail?: string;
  telephone?: string;
  adresse?: string;
  statutKYC: string;
  walletTrackingId: string;
  merchantTrackingId: string;
  solde?: number;
  plafond?: number;
}

export interface BoutiqueRequest {
  nomBoutique: string;
  categorieShop: string;
  latitude?: number | null;
  longitude?: number | null;
  initialQuota: number;
  statutKYC?: string;
  cheminCarteEDJ?: string;
}

export interface WalletResponse {
  trackingId: string;
  typeWallet: string;
  statutWallet: string;
  solde: number;
  plafond: number;
  dateCreation: string;
}

export interface VersementResponse {
  trackingId: string;
  trackingWalletId: string;
  montantVerse: number;
  typeVersement: string;
  dateVersement: string;
  statut: string;
}

export interface VersementRequest {
  trackingWalletId: string;
  montantVerse: number;
  typeVersement: string;
  dateVersement: string;
  statut: string;
}

export interface PaiementResponse {
  trackingId: string;
  reference: string;
  typePaiement: string;
  statutPaiement: string;
  montantTotal: number;
  frais: number;
  montantNet: number;
  datePaiement: string;
  studentName?: string;
  boutiqueName?: string;
}

export interface AdminGlobalStats {
  totalBourses: number;
  totalStudents: number;
  totalBoutiques: number;
  totalTransactions: number;
  [key: string]: number;
}

export interface FluxMensuelStat {
  mois: string;
  bourses: number;
  remboursements: number;
}

export interface UniversiteSummaryStat {
  code: string;
  nbEtudiants: number;
}
