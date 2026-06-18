export interface LoginRequest {
  email: string;
  password: string; // Assuming password is always required for login
}

export interface LoginResponse {
  trackingId: string;
  token: string;
  type: string;
  firstName: string;
  lastName: string;
  phoneNumber: string; // Renamed from 'phone'
  email: string;
  rolesList: string[]; // Kept, as 'roles' was redundant
}

// export interface RegisterRequest { // Commented out as this is for a generic register endpoint which is no longer used
//   nom: string;
//   prenom: string;
//   email: string;
//   telephone: string;
//   motDePasse: string;
//   role: string;
// }
