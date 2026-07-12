export interface CardRequest {
  cardNumber?: string;
  qrCodeData?: string;
  status?: CardStatus;
  walletTrackingId: string;
}

export interface CardResponse {
  trackingId: string;
  cardNumber: string;
  qrCodeData: string;
  statutCarte: CardStatus;
  emissionDate: string;
  dateExpiration: string;
  walletTrackingId: string;
  studentNom?: string;
  studentPrenom?: string;
}

export enum CardStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}
