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
  status: CardStatus;
  emissionDate: string;
  expirationDate: string;
  walletTrackingId: string;
}

export enum CardStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}
