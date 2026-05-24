export interface Universite {
  trackingId?: string;
  code: string;
  nom: string;
  ville: string;
  estActive: boolean;
  walletTrackingId?: string;
  soldeWallet?: number;
  
  // Frontend specific UI fields
  type?: string;
  location?: string;
  students?: number;
  wallets?: number;
  bourses?: string;
  bgColor?: string;
  textColor?: string;
}

export interface UniversiteRequest {
  code: string;
  nom: string;
  ville: string;
  estActive: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
