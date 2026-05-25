// Modèle représentant une université (frontend)
export interface Universite {
  // Identifiants
  trackingId?: string; // UUID côté backend
  code: string; // code interne / abréviation

  // Informations principales
  nom: string;
  ville: string;
  adresse?: string;
  emailContact?: string;
  telephone?: string;

  // Statut
  estActive: boolean;

  // Wallet lié (si présent)
  walletTrackingId?: string;
  soldeWallet?: number;

  // Métadonnées (timestamps éventuels renvoyés par l'API)
  createdAt?: string; // ISO date
  updatedAt?: string; // ISO date

  // Champs d'affichage côté UI (optionnels)
  type?: 'public' | 'prive' | 'partenaire' | string;
  students?: number;
  wallets?: number;
  bgColor?: string;
  textColor?: string;
}

// Contrat pour la création / mise à jour côté API
export interface UniversiteRequest {
  code: string;
  nom: string;
  ville: string;
  adresse?: string;
  emailContact?: string;
  telephone?: string;
  estActive: boolean;
  walletTrackingId?: string;
}

// Page générique renvoyée par l'API
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
