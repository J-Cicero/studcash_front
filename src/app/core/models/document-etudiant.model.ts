export interface DocumentEtudiantResponse {
  trackingId: string;
  type: string;
  cheminFichier: string;
  statut: string;
  commentaireRejet: string;
  dateDepot: string;
  dateValidation: string;
  donneesExtraites: string;
  scoreFiabilite: number;
}
