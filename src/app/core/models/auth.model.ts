export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  userId: string;
  trackingId: string;
  token: string;
  type: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roles: string;
  rolesList: string[];
  country: string;
  active: boolean;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  role: string;
}
