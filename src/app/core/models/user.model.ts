import { Page } from './universite.model';

export interface User {
  trackingId: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  role: string;
  dateInscription: string;
  estActif: boolean;
}

export interface UserRequest {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  motDePasse: string;
}
